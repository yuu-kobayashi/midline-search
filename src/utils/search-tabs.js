// Google search tab definitions, shared by the content script and the options page.
// Loaded as a plain script before both, so these bindings are visible to each
// without the tab list being written twice.

// Prefix for the tab class applied to <html> (e.g. midline-search-tab-images)
const TAB_CLASS_PREFIX = "midline-search-tab-";

// Key used for the settings shared by every tab
const COMMON_TAB_KEY = "common";

// Tab of a search URL that names no vertical
const DEFAULT_TAB_KEY = "all";

// Every search tab the extension knows about, in options page display order.
// Each one carries the query values Google uses for it, so the URL lookup and the
// options page panels are driven by the same list: adding a tab, or a new spelling
// for an existing one, is a single edit here.
//
// Google is moving "udm" from numbers to names and currently serves both, at times
// for the same tab -- the Short videos pill links to udm=39 while Videos pages open
// as udm=vids -- so a tab may list several. "tbm" is the older parameter, still
// served by some tabs. The All tab lists none: it is the tab a URL names no
// vertical for.
const SEARCH_TABS = [
	{ key: "all", i18nKey: "tab_all" },
	{ key: "ai-mode", i18nKey: "tab_ai_mode", udm: ["50"] },
	{ key: "images", i18nKey: "tab_images", udm: ["2", "imgs"], tbm: ["isch"] },
	{ key: "videos", i18nKey: "tab_videos", udm: ["7", "vids"], tbm: ["vid"] },
	{ key: "short-videos", i18nKey: "tab_short_videos", udm: ["39"] },
	{ key: "news", i18nKey: "tab_news", udm: ["12"], tbm: ["nws"] },
	{ key: "shopping", i18nKey: "tab_shopping", udm: ["28"], tbm: ["shop"] },
	{ key: "books", i18nKey: "tab_books", udm: ["36"], tbm: ["bks"] },
	{ key: "web", i18nKey: "tab_web", udm: ["14", "web"] },
];

// query value -> tab key, derived from the table above so the two cannot drift
const UDM_MAP = {};
const TBM_MAP = {};
SEARCH_TABS.forEach(({ key, udm, tbm }) => {
	udm?.forEach((value) => {
		UDM_MAP[value] = key;
	});
	tbm?.forEach((value) => {
		TBM_MAP[value] = key;
	});
});

// Tab named by a search URL's query string. A query naming no vertical at all is
// the All tab; null means it names one this extension has no key for, which must
// not be read as All or that vertical would take the All tab's settings.
const getTabFromSearch = (search) => {
	const params = new URLSearchParams(search);
	const udm = params.get("udm");
	if (udm) return UDM_MAP[udm] ?? null;

	const tbm = params.get("tbm");
	if (tbm) return TBM_MAP[tbm] ?? null;

	return DEFAULT_TAB_KEY;
};

// Tab on screen now. Always reads the live URL, so it can never be paired with
// the URL of a navigation that has not been committed yet.
const getSearchTabType = () => getTabFromSearch(location.search) ?? DEFAULT_TAB_KEY;
