document.addEventListener('DOMContentLoaded', () => {
    const cssEditor = document.getElementById('css-editor');
    const resetModal = document.getElementById('reset-modal');
    const cancelResetButton = document.getElementById('cancel-reset');
    const confirmResetButton = document.getElementById('confirm-reset');

    // 保存されたCSSを読み込む
    chrome.storage.local.get(['customCSS'], function(result) {
        if (result.customCSS) {
            cssEditor.value = result.customCSS;
        }
    });

    // 保存ボタンのクリックイベント
    document.getElementById('save-button').addEventListener('click', function() {
        const css = cssEditor.value;
        chrome.storage.local.set({ customCSS: css }, function() {
            // 保存完了の通知
            const saveButton = document.getElementById('save-button');
            const originalText = saveButton.textContent;
            saveButton.textContent = '保存しました！';
            saveButton.style.backgroundColor = '#34a853';

            // 2秒後に元の状態に戻す
            setTimeout(() => {
                saveButton.textContent = originalText;
                saveButton.style.backgroundColor = '#1a73e8';
            }, 2000);
        });
    });

    // リセットボタンのクリックイベント
    document.getElementById('reset-button').addEventListener('click', function() {
        resetModal.style.display = 'block';
    });

    // キャンセルボタンのクリックイベント
    cancelResetButton.addEventListener('click', function() {
        resetModal.style.display = 'none';
    });

    // 確認ボタンのクリックイベント
    confirmResetButton.addEventListener('click', function() {
        const defaultCSS = `/* ここにカスタムCSSを入力してください */`;
        cssEditor.value = defaultCSS;
        chrome.storage.local.set({ customCSS: defaultCSS });
        resetModal.style.display = 'none';
    });

    // モーダル外クリックで閉じる
    resetModal.addEventListener('click', function(e) {
        if (e.target === resetModal) {
            resetModal.style.display = 'none';
        }
    });
}); 