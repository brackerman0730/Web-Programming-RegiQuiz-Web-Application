const REGI_THEMES = [
    { value: 'regirock', label: 'Regirock (Rock)' },
    { value: 'regice', label: 'Regice (Ice)' },
    { value: 'registeel', label: 'Registeel (Steel)' },
    { value: 'regigigas', label: 'Regigigas (Normal)' },
    { value: 'regieleki', label: 'Regieleki (Electric)' },
    { value: 'regidrago', label: 'Regidrago (Dragon)' }
];

function getSavedTheme() {
    let saved = localStorage.getItem('regiquiz-theme');
    let valid = REGI_THEMES.some(function(t) { return t.value === saved; });
    return valid ? saved : 'regirock';
}

function setTheme(theme) {
    let valid = REGI_THEMES.some(function(t) { return t.value === theme; });
    if (!valid) theme = 'regirock';

    localStorage.setItem('regiquiz-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
}
