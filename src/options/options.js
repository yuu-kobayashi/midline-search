document.addEventListener("DOMContentLoaded", () => {
	const cssEditor = document.getElementById("css-editor");
	const breakpointInput = document.getElementById("breakpoint-input");
	const resetModal = document.getElementById("reset-modal");
	const cancelResetButton = document.getElementById("cancel-reset");
	const confirmResetButton = document.getElementById("confirm-reset");
	const originalCSS = { value: "" };

	// Load saved CSS and breakpoint
	chrome.storage.local.get(["customCSS", "breakpoint"], (result) => {
		if (result.customCSS) {
			cssEditor.value = result.customCSS;
			originalCSS.value = result.customCSS;
		}
		if (result.breakpoint) {
			breakpointInput.value = result.breakpoint;
		}
	});

	// Save breakpoint
	document.getElementById("save-breakpoint").addEventListener("click", () => {
		const breakpoint = parseInt(breakpointInput.value);
		if (breakpoint >= 320 && breakpoint <= 2560) {
			chrome.storage.local.set({ breakpoint: breakpoint }, () => {
				// Show save completion notification
				const saveButton = document.getElementById("save-breakpoint");
				const originalText = saveButton.textContent;
				saveButton.textContent = chrome.i18n.getMessage("save_completed");
				saveButton.style.backgroundColor = "#34a853";

				// Restore original state after 2 seconds
				setTimeout(() => {
					saveButton.textContent = originalText;
					saveButton.style.backgroundColor = "#1a73e8";
				}, 2000);
			});
		}
	});

	// Save button click event
	document.getElementById("save-button").addEventListener("click", () => {
		const css = cssEditor.value;
		chrome.storage.local.set({ customCSS: css }, () => {
			originalCSS.value = css;
			// Show save completion notification
			const saveButton = document.getElementById("save-button");
			const originalText = saveButton.textContent;
			saveButton.textContent = chrome.i18n.getMessage("save_completed");
			saveButton.style.backgroundColor = "#34a853";

			// Restore original state after 2 seconds
			setTimeout(() => {
				saveButton.textContent = originalText;
				saveButton.style.backgroundColor = "#1a73e8";
			}, 2000);
		});
	});

	// Reset button click event
	document.getElementById("reset-button").addEventListener("click", () => {
		resetModal.style.display = "block";
	});

	// Cancel button click event
	cancelResetButton.addEventListener("click", () => {
		resetModal.style.display = "none";
	});

	// Confirm button click event
	confirmResetButton.addEventListener("click", () => {
		cssEditor.value = originalCSS.value;
		chrome.storage.local.set({ customCSS: originalCSS.value });
		resetModal.style.display = "none";
	});

	// Close modal when clicking outside
	resetModal.addEventListener("click", (e) => {
		if (e.target === resetModal) {
			resetModal.style.display = "none";
		}
	});
});
