// Replace the contents of every [data-i18n] element under root with its localized
// message. Exposed rather than only run on load, so a page that builds markup of
// its own can localize what it built without depending on script order.
const applyI18n = (root = document) => {
	root.querySelectorAll("[data-i18n]").forEach((element) => {
		const message = chrome.i18n.getMessage(element.dataset.i18n);
		if (!message) return;

		if (element.tagName === "TITLE") {
			document.title = message;
		} else {
			element.textContent = message;
		}
	});
};

// The markup present in the HTML file itself
document.addEventListener("DOMContentLoaded", () => applyI18n());
