// Google検索結果ページのコンテンツを中央寄せにするスクリプト
console.log('Content script loaded');

// カスタムCSSを適用する関数
function applyCustomCSS(css) {
    // 既存のスタイル要素を削除
    const existingStyle = document.getElementById('midline-search-custom-css');
    if (existingStyle) {
        existingStyle.remove();
    }

    // 新しいスタイル要素を作成
    const style = document.createElement('style');
    style.id = 'midline-search-custom-css';
    style.textContent = css;
    document.head.appendChild(style);
}

// Chrome拡張機能のAPIが利用可能か確認
if (chrome && chrome.storage && chrome.storage.local) {
    // 保存されたCSSを読み込んで適用
    chrome.storage.local.get(['customCSS'], function(result) {
        if (result.customCSS) {
            applyCustomCSS(result.customCSS);
        }
    });

    // ストレージの変更を監視
    chrome.storage.onChanged.addListener(function(changes, namespace) {
        if (namespace === 'local' && changes.customCSS) {
            applyCustomCSS(changes.customCSS.newValue);
        }
    });
} else {
    console.warn('Chrome storage API is not available');
} 