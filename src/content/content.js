// Stored settings (STORAGE_KEYS, DEFAULT_BREAKPOINT, resolveBreakpoint) come from
// utils/settings.js, tab definitions (TAB_CLASS_PREFIX, DEFAULT_TAB_KEY,
// getSearchTabType) from utils/search-tabs.js.

// Style element ids. The base stylesheet is injected first and the two user
// elements after it, common before tab-specific, so at equal specificity tab CSS
// beats common CSS and both beat the base stylesheet.
const BASE_CSS_ID = "midline-search-css";
const COMMON_CSS_ID = "midline-search-custom-css";
const TAB_CSS_ID = "midline-search-tab-custom-css";

// Marks <html> while the viewport is at least as wide as the effective breakpoint
const WIDE_CLASS = "midline-search-wide";

// Everything the styles depend on. Nothing is applied until the stored settings
// arrive, so isCSSEnabled starts false whatever the user has saved.
const state = {
	settingsLoaded: false,
	isCSSEnabled: false,
	breakpoint: DEFAULT_BREAKPOINT,
	tabBreakpoints: {},
	commonCSS: "",
	tabCSS: {},
	currentTab: DEFAULT_TAB_KEY,
	mediaQueryList: null,
};

// ------------------------------------------------------------ base stylesheet

const injectBaseCSS = () => {
	if (document.getElementById(BASE_CSS_ID)) return;

	const link = document.createElement("link");
	link.id = BASE_CSS_ID;
	link.rel = "stylesheet";
	link.href = chrome.runtime.getURL("content/search-page.css");
	// document.head does not exist yet at document_start
	(document.head || document.documentElement).appendChild(link);
};

const removeBaseCSS = () => {
	document.getElementById(BASE_CSS_ID)?.remove();
};

// --------------------------------------------------------------- media query

const onViewportChange = (mediaQueryList) => {
	document.documentElement.classList.toggle(WIDE_CLASS, mediaQueryList.matches);
};

// Follow the breakpoint that applies to the tab currently open. A MediaQueryList
// cannot be re-targeted, so a new one replaces the old whenever the width behind
// it changes: on a settings change, and on every tab switch, since a tab can carry
// its own breakpoint.
const watchViewport = () => {
	state.mediaQueryList?.removeEventListener("change", onViewportChange);

	const breakpoint = resolveBreakpoint(state.tabBreakpoints[state.currentTab], state.breakpoint);
	state.mediaQueryList = window.matchMedia(`(min-width: ${breakpoint}px)`);
	state.mediaQueryList.addEventListener("change", onViewportChange);
	onViewportChange(state.mediaQueryList);
};

const unwatchViewport = () => {
	state.mediaQueryList?.removeEventListener("change", onViewportChange);
	state.mediaQueryList = null;
	document.documentElement.classList.remove(WIDE_CLASS);
};

// ------------------------------------------------------------------ user CSS

// Both user style elements, common first so tab rules win at equal specificity.
// Each id is checked separately so a missing element is recreated on its own; when
// only the tab element is left, the common one is inserted before it rather than
// appended after, which would silently invert that precedence.
const ensureUserStyleElements = () => {
	const parent = document.head || document.documentElement;
	[COMMON_CSS_ID, TAB_CSS_ID].forEach((id) => {
		if (document.getElementById(id)) return;

		const element = document.createElement("style");
		element.id = id;
		const tabStyle = id === COMMON_CSS_ID ? document.getElementById(TAB_CSS_ID) : null;
		tabStyle ? tabStyle.before(element) : parent.appendChild(element);
	});
};

// The shared custom CSS plus the CSS of the search tab currently open. Runs only
// once the stored values have arrived, so these elements are never injected ahead
// of the base stylesheet, which would let the base rules override them.
const applyUserCSS = () => {
	if (!state.settingsLoaded) return;

	ensureUserStyleElements();
	// The popup switch turns the extension off as a whole, custom CSS included
	document.getElementById(COMMON_CSS_ID).textContent = state.isCSSEnabled ? state.commonCSS : "";
	document.getElementById(TAB_CSS_ID).textContent = state.isCSSEnabled ? (state.tabCSS[state.currentTab] ?? "") : "";
};

// ------------------------------------------------------------------- on / off

const setCSSEnabled = (enabled) => {
	state.isCSSEnabled = enabled;
	if (enabled) {
		injectBaseCSS();
		watchViewport();
	} else {
		removeBaseCSS();
		unwatchViewport();
	}
	applyUserCSS();
};

// ------------------------------------------------------------------ tab class

// Scope the CSS to the tab on screen, and move the tab-specific settings with it
const updateTabClass = () => {
	const tab = getSearchTabType();

	// Snapshot the list: classList is live, so removing while iterating skips entries
	Array.from(document.documentElement.classList).forEach((cls) => {
		if (cls.startsWith(TAB_CLASS_PREFIX)) {
			document.documentElement.classList.remove(cls);
		}
	});
	document.documentElement.classList.add(`${TAB_CLASS_PREFIX}${tab}`);

	if (tab === state.currentTab) return;

	// Switching tabs swaps both the tab-specific CSS and its breakpoint
	state.currentTab = tab;
	applyUserCSS();
	if (state.isCSSEnabled) {
		watchViewport();
	}
};

// Re-apply the tab class on the tab switches Google performs without a reload.
// Patching history.pushState from here cannot work: a content script runs in an
// isolated world, so the patch lands on that world's own History wrapper and never
// sees the calls Google makes from the page. Watch the navigation instead.
const watchTabSwitches = () => {
	updateTabClass();

	// A real DOM event, so it does cross worlds. Covers back/forward.
	window.addEventListener("popstate", () => updateTabClass());

	if (!window.navigation) return;

	// Only ever re-read once a navigation has been committed. Acting on the "navigate"
	// event instead would restyle the page the user is still looking at: a tab pill is
	// an ordinary link, so the browser keeps the old results on screen until the new
	// page arrives, and the incoming tab's rules would visibly land on them first.
	// Nothing is lost by waiting -- a page loaded from the network gets its class at
	// document_start, before it paints. addEventListener ignores event types the
	// browser does not know, so neither of these needs a feature check.
	navigation.addEventListener("navigatesuccess", () => updateTabClass());
	navigation.addEventListener("currententrychange", () => updateTabClass());
};

// -------------------------------------------------------------------- storage

// One read for every setting, so the base stylesheet is always in place before the
// user CSS elements are appended after it
const loadSettings = () => {
	chrome.storage.local.get(Object.values(STORAGE_KEYS), (result) => {
		state.breakpoint = resolveBreakpoint(result[STORAGE_KEYS.breakpoint]);
		state.tabBreakpoints = result[STORAGE_KEYS.tabBreakpoints] ?? {};
		state.commonCSS = result[STORAGE_KEYS.customCSS] ?? "";
		state.tabCSS = result[STORAGE_KEYS.tabCustomCSS] ?? {};
		state.settingsLoaded = true;
		setCSSEnabled(result[STORAGE_KEYS.cssEnabled] ?? true);
	});
};

// Every setting lives in storage, the popup switch included, so a change reaches
// every open search tab rather than only the one in front of the user.
const watchSettings = () => {
	chrome.storage.onChanged.addListener((changes, areaName) => {
		if (areaName !== "local" || !state.settingsLoaded) return;

		const { cssEnabled, breakpoint, tabBreakpoints, customCSS, tabCustomCSS } = STORAGE_KEYS;

		if (customCSS in changes) state.commonCSS = changes[customCSS].newValue ?? "";
		if (tabCustomCSS in changes) state.tabCSS = changes[tabCustomCSS].newValue ?? {};
		if (breakpoint in changes) state.breakpoint = resolveBreakpoint(changes[breakpoint].newValue);
		if (tabBreakpoints in changes) state.tabBreakpoints = changes[tabBreakpoints].newValue ?? {};

		// The switch re-applies everything above it, so it stands in for the rest
		if (cssEnabled in changes) {
			setCSSEnabled(changes[cssEnabled].newValue ?? true);
			return;
		}

		if (customCSS in changes || tabCustomCSS in changes) applyUserCSS();
		if (state.isCSSEnabled && (breakpoint in changes || tabBreakpoints in changes)) watchViewport();
	});
};

// Initialize. The tab class first: it is what scopes the CSS, and setting it here
// means a page loaded from the network carries it before it paints.
watchTabSwitches();
loadSettings();
watchSettings();
