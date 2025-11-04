document.addEventListener("DOMContentLoaded", function () {
	const menuIcon = document.getElementById("menu-icon");
	const cssToggle = document.getElementById("css-toggle");

	// Load initial state (default is true)
	chrome.storage.local.get(["cssEnabled"], function (result) {
		cssToggle.checked = result.cssEnabled ?? true;
	});

	// Handle toggle state changes
	cssToggle.addEventListener("change", function () {
		const isEnabled = cssToggle.checked;

		// Save state
		chrome.storage.local.set({ cssEnabled: isEnabled });

		// Send message to active tab (only if it's a Google search page)
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			if (tabs[0] && tabs[0].url) {
				const url = tabs[0].url;

				if (url.match(/^https:\/\/www\.google\.[^/]+\/search/)) {
					chrome.tabs.sendMessage(tabs[0].id, {
						action: "toggleCSS",
						enabled: isEnabled,
					});
				}
			}
		});
	});

	// Menu icon click event
	if (menuIcon) {
		menuIcon.addEventListener("click", function () {
			chrome.runtime.openOptionsPage();
		});
	}
});
