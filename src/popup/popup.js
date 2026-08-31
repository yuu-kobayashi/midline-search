// Storage keys (STORAGE_KEYS) come from utils/settings.js
document.addEventListener("DOMContentLoaded", () => {
	const menuIcon = document.getElementById("menu-icon");
	const cssToggle = document.getElementById("css-toggle");

	// Default is on
	chrome.storage.local.get([STORAGE_KEYS.cssEnabled], (result) => {
		cssToggle.checked = result[STORAGE_KEYS.cssEnabled] ?? true;
	});

	// Storing the value is the whole job: every open search page follows it through
	// chrome.storage.onChanged, so tabs behind this one switch over as well
	cssToggle.addEventListener("change", () => {
		chrome.storage.local.set({ [STORAGE_KEYS.cssEnabled]: cssToggle.checked });
	});

	menuIcon.addEventListener("click", () => chrome.runtime.openOptionsPage());
});
