// Runs synchronously in <head>, before the page paints, so the saved theme
// applies immediately instead of flashing the default Regirock look first.
(function() {
    var VALID_THEMES = ['regirock', 'regice', 'registeel', 'regigigas', 'regieleki', 'regidrago'];
    var saved = localStorage.getItem('regiquiz-theme');
    var theme = VALID_THEMES.includes(saved) ? saved : 'regirock';
    document.documentElement.setAttribute('data-theme', theme);
})();
