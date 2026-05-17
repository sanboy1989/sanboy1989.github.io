/* ── Language persistence across all pages ── */
(function () {
    /* The <head> FOUC-prevention script already set the class on <html> if needed.
       Here we just sync the button label to match the current state. */
    if (document.documentElement.classList.contains('lang-zh')) {
        const btn = document.getElementById('langBtn');
        if (btn) { btn.textContent = 'English'; btn.setAttribute('aria-pressed', 'true'); }
    }
})();

function toggleLang() {
    const isZh = document.documentElement.classList.toggle('lang-zh');
    localStorage.setItem('lang', isZh ? 'zh' : 'en');
    const btn = document.getElementById('langBtn');
    if (btn) {
        btn.textContent = isZh ? 'English' : '中文';
        btn.setAttribute('aria-pressed', String(isZh));
    }
}
