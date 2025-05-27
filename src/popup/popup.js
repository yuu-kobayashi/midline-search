document.addEventListener("DOMContentLoaded", function () {
	const menuIcon = document.getElementById("menu-icon");
	const cssToggle = document.getElementById("css-toggle");

	// 初期状態を読み込む（デフォルトはtrue）
	chrome.storage.local.get(["cssEnabled"], function (result) {
		cssToggle.checked = result.cssEnabled ?? true;
	});

	// トグル状態が変更されたときの処理
	cssToggle.addEventListener("change", function () {
		const isEnabled = cssToggle.checked;

		// 状態を保存
		chrome.storage.local.set({ cssEnabled: isEnabled });

		// アクティブなタブにメッセージを送信
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			if (tabs[0]) {
				chrome.tabs.sendMessage(tabs[0].id, {
					action: "toggleCSS",
					enabled: isEnabled,
				});
			}
		});
	});

	// メニューアイコンのクリックイベント
	if (menuIcon) {
		menuIcon.addEventListener("click", function () {
			chrome.runtime.openOptionsPage();
		});
	}
});
