// 状態管理のための定数と変数
const DEFAULT_BREAKPOINT = 1280;

// 状態管理オブジェクト
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

// 初期状態の読み込み
const initializeState = () => {
	chrome.storage.local.get(["cssEnabled", "breakpoint"], (result) => {
		state.setCSSEnabled(result.cssEnabled ?? true);
		state.setBreakpoint(result.breakpoint ?? DEFAULT_BREAKPOINT);
	});
};

// メッセージリスナーの設定
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "toggleCSS") {
		state.setCSSEnabled(request.enabled);
	}
});

// CSSの適用
const applyCSS = () => {
	try {
		removeCSS();
		injectStyleElement();
		setupMediaQuery();
	} catch (error) {
		console.error("Failed to apply CSS:", error);
	}
};

// スタイル要素の注入
const injectStyleElement = () => {
	state.styleElement = document.createElement("link");
	state.styleElement.id = "midline-search-css";
	state.styleElement.rel = "stylesheet";
	state.styleElement.href = chrome.runtime.getURL("content/search-page.css");
	document.head.appendChild(state.styleElement);
};

// メディアクエリの設定
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
	// 初期状態の適用
	document.documentElement.classList.toggle("midline-search-wide", state.mediaQueryList.matches);
};

// CSSの削除
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

// カスタムCSSの適用
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

// ストレージの監視と初期化
const setupStorageListeners = () => {
	if (!chrome.storage.local) {
		console.error("Chrome storage API is not available");
		return;
	}

	// 初期カスタムCSSの読み込み
	chrome.storage.local.get(["customCSS"], (result) => {
		if (result.customCSS) {
			applyCustomCSS(result.customCSS);
		}
	});

	// ストレージ変更の監視
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

// 初期化
initializeState();
setupStorageListeners();
