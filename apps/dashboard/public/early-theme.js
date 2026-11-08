/* External classic script: compatible with a CSP that disallows inline scripts. */
(function () {
  var root = document.documentElement;
  var preference = { modePreference: 'system', themeId: 'minimalist-nordic' };
  try {
    var saved = JSON.parse(localStorage.getItem('om.theme-preferences.v1') || 'null');
    if (saved && typeof saved.themeId === 'string' && /^(light|dark|system)$/.test(saved.modePreference)) preference = saved;
  } catch (_) { /* The controller reports invalid or unavailable storage. */ }
  var dark = preference.modePreference === 'dark' ||
    (preference.modePreference === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  root.dataset.omTheme = preference.themeId;
  root.dataset.omMode = dark ? 'dark' : 'light';
}());
