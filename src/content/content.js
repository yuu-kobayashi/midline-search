// Constants and variables for state management
const DEFAULT_BREAKPOINT = 1280;

// Search tab detection: maps URL params to stable class names (e.g. midline-search-tab-images)
const TAB_CLASS_PREFIX = "midline-search-tab-";

// udm values from Google search tab links
const UDM_MAP = {
	"2": "images",
	"7": "videos",
	"12": "news",
	"28": "shopping",
	"36": "books",
	"39": "short-videos",
	"50": "ai-mode",
	"14": "web",
	web: "web",
};

// Legacy tbm values (still used by some tabs, e.g. News)
const TBM_MAP = {
	isch: "images",
	vid: "videos",
	nws: "news",
	shop: "shopping",
	bks: "books",
};

// State management object
const state = {
	isCSSEnabled: true,
	styleElement: null,
	breakpoint: DEFAULT_BREAKPOINT,
	mediaQueryList: null,
	setCSSEnabled: (value) => {
		state.isCSSEnabled = value;
		state.isCSSEnabled ? applyCSS() : removeCSS();
	},
	setBreakpoint: (value) => {
		state.breakpoint = value;
		if (state.isCSSEnabled) {
			setupMediaQuery();
		}
	},
};

// Resolve current search tab from URL query parameters
const getSearchTabType = () => {
	const params = new URLSearchParams(location.search);
	const udm = params.get("udm");
	const tbm = params.get("tbm");

	if (udm && UDM_MAP[udm]) return UDM_MAP[udm];
	if (tbm && TBM_MAP[tbm]) return TBM_MAP[tbm];
	return "all";
};

// Apply tab-specific class to <html> for CSS scoping
const updateTabClass = () => {
	const tab = getSearchTabType();
	document.documentElement.classList.forEach((cls) => {
		if (cls.startsWith(TAB_CLASS_PREFIX)) {
			document.documentElement.classList.remove(cls);
		}
	});
	document.documentElement.classList.add(`${TAB_CLASS_PREFIX}${tab}`);
};

// Re-apply tab class on SPA tab switches (Google updates URL without full reload)
const setupTabClassMonitoring = () => {
	updateTabClass();

	window.addEventListener("popstate", updateTabClass);

	const wrapHistoryMethod = (method) => {
		const original = history[method].bind(history);
		history[method] = (...args) => {
			const result = original(...args);
			updateTabClass();
			return result;
		};
	};

	wrapHistoryMethod("pushState");
	wrapHistoryMethod("replaceState");
};

// Load initial state
const initializeState = () => {
	chrome.storage.local.get(["cssEnabled", "breakpoint"], (result) => {
		state.setCSSEnabled(result.cssEnabled ?? true);
		state.setBreakpoint(result.breakpoint ?? DEFAULT_BREAKPOINT);
	});
};

// Set up message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "toggleCSS") {
		state.setCSSEnabled(request.enabled);
	}
});

// Apply CSS
const applyCSS = () => {
	try {
		removeCSS();
		injectStyleElement();
		setupMediaQuery();
	} catch (error) {
		console.error("Failed to apply CSS:", error);
	}
};

// Inject style element
const injectStyleElement = () => {
	state.styleElement = document.createElement("link");
	state.styleElement.id = "midline-search-css";
	state.styleElement.rel = "stylesheet";
	state.styleElement.href = chrome.runtime.getURL("content/search-page.css");
	document.head.appendChild(state.styleElement);
};

// Set up media query
const setupMediaQuery = () => {
	if (state.mediaQueryList) {
		state.mediaQueryList.removeEventListener("change", state.mediaQueryList._handler);
	}

	state.mediaQueryList = window.matchMedia(`(min-width: ${state.breakpoint}px)`);
	const handler = (mql) => {
		document.documentElement.classList.toggle("midline-search-wide", mql.matches);
	};
	state.mediaQueryList._handler = handler;
	state.mediaQueryList.addEventListener("change", handler);
	// Apply initial state
	document.documentElement.classList.toggle("midline-search-wide", state.mediaQueryList.matches);
};

// Remove CSS
const removeCSS = () => {
	try {
		const existingStyle = document.getElementById("midline-search-css");
		existingStyle?.remove();

		if (state.styleElement) {
			state.styleElement.remove();
			state.styleElement = null;
		}

		if (state.mediaQueryList) {
			state.mediaQueryList.removeEventListener("change", state.mediaQueryList._handler);
			state.mediaQueryList = null;
		}

		document.documentElement.classList.remove("midline-search-wide");
	} catch (error) {
		console.error("Failed to remove CSS:", error);
	}
};

// Apply custom CSS
const applyCustomCSS = (css) => {
	try {
		let customStyle = document.getElementById("midline-search-custom-css");
		if (!customStyle) {
			customStyle = document.createElement("style");
			customStyle.id = "midline-search-custom-css";
			document.head.appendChild(customStyle);
		}
		customStyle.textContent = css;
	} catch (error) {
		console.error("Failed to apply custom CSS:", error);
	}
};

// Set up storage listeners and initialization
const setupStorageListeners = () => {
	if (!chrome.storage.local) {
		console.error("Chrome storage API is not available");
		return;
	}

	// Load initial custom CSS
	chrome.storage.local.get(["customCSS"], (result) => {
		if (result.customCSS) {
			applyCustomCSS(result.customCSS);
		}
	});

	// Monitor storage changes
	chrome.storage.onChanged.addListener((changes, namespace) => {
		if (namespace !== "local") return;

		if (changes.customCSS) {
			applyCustomCSS(changes.customCSS.newValue);
		}
		if (changes.breakpoint) {
			state.setBreakpoint(changes.breakpoint.newValue);
		}
	});
};

// Initialize
initializeState();
setupStorageListeners();
setupTabClassMonitoring();
