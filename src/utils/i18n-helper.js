document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const msg = chrome.i18n.getMessage(key);
    if (msg) {
      if (el.tagName === 'TITLE') {
        document.title = msg;
      } else {
        el.textContent = msg;
      }
    }
  });
}); 