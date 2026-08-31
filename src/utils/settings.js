// Stored settings, shared by the content script, the options page and the popup.
// Loaded as a plain script before each of them, so these bindings are visible to
// all three without the storage keys or the breakpoint bounds being written twice.

// chrome.storage.local keys, named in one place so a rename cannot reach only
// some of the code that reads them
const STORAGE_KEYS = {
	cssEnabled: "cssEnabled",
	breakpoint: "breakpoint",
	tabBreakpoints: "tabBreakpoints",
	customCSS: "customCSS",
	tabCustomCSS: "tabCustomCSS",
};

// Screen width at which the centered layout starts, and the range the options
// page offers for it
const DEFAULT_BREAKPOINT = 1280;
const MIN_BREAKPOINT = 320;
const MAX_BREAKPOINT = 2560;

const clampBreakpoint = (value) => Math.min(MAX_BREAKPOINT, Math.max(MIN_BREAKPOINT, value));

// A stored breakpoint, or the fallback when nothing usable is stored. Clamped on
// read as well as on save, so a value left by an older version or edited by hand
// cannot put the media query outside the range the options page can show.
const resolveBreakpoint = (value, fallback = DEFAULT_BREAKPOINT) =>
	typeof value === "number" && Number.isFinite(value) ? clampBreakpoint(value) : fallback;
