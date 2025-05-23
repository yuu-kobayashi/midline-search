document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('open-options').addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });
}); 