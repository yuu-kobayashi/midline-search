document.addEventListener("DOMContentLoaded", () => {
	const cssEditor = document.getElementById("css-editor");
	const breakpointInput = document.getElementById("breakpoint-input");
	const resetModal = document.getElementById("reset-modal");
	const cancelResetButton = document.getElementById("cancel-reset");
	const confirmResetButton = document.getElementById("confirm-reset");
	const originalCSS = { value: "" };

	// 保存されたCSSとブレークポイントを読み込む
	chrome.storage.local.get(["customCSS", "breakpoint"], (result) => {
		if (result.customCSS) {
			cssEditor.value = result.customCSS;
			originalCSS.value = result.customCSS;
		}
		if (result.breakpoint) {
			breakpointInput.value = result.breakpoint;
		}
	});

	// ブレークポイントの保存
	document.getElementById("save-breakpoint").addEventListener("click", () => {
		const breakpoint = parseInt(breakpointInput.value);
		if (breakpoint >= 320 && breakpoint <= 2560) {
			chrome.storage.local.set({ breakpoint: breakpoint }, () => {
				// 保存完了の通知
				const saveButton = document.getElementById("save-breakpoint");
				const originalText = saveButton.textContent;
				saveButton.textContent = "保存しました！";
				saveButton.style.backgroundColor = "#34a853";

				// 2秒後に元の状態に戻す
				setTimeout(() => {
					saveButton.textContent = originalText;
					saveButton.style.backgroundColor = "#1a73e8";
				}, 2000);
			});
		}
	});

	// 保存ボタンのクリックイベント
	document.getElementById("save-button").addEventListener("click", () => {
		const css = cssEditor.value;
		chrome.storage.local.set({ customCSS: css }, () => {
			originalCSS.value = css;
			// 保存完了の通知
			const saveButton = document.getElementById("save-button");
			const originalText = saveButton.textContent;
			saveButton.textContent = "保存しました！";
			saveButton.style.backgroundColor = "#34a853";

			// 2秒後に元の状態に戻す
			setTimeout(() => {
				saveButton.textContent = originalText;
				saveButton.style.backgroundColor = "#1a73e8";
			}, 2000);
		});
	});

	// リセットボタンのクリックイベント
	document.getElementById("reset-button").addEventListener("click", () => {
		resetModal.style.display = "block";
	});

	// キャンセルボタンのクリックイベント
	cancelResetButton.addEventListener("click", () => {
		resetModal.style.display = "none";
	});

	// 確認ボタンのクリックイベント
	confirmResetButton.addEventListener("click", () => {
		cssEditor.value = originalCSS.value;
		chrome.storage.local.set({ customCSS: originalCSS.value });
		resetModal.style.display = "none";
	});

	// モーダル外クリックで閉じる
	resetModal.addEventListener("click", (e) => {
		if (e.target === resetModal) {
			resetModal.style.display = "none";
		}
	});
});
