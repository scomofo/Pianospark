/* PianoSpark – settings/settings_actions.js */
/* Sound effects manager and theme application */
(function(){
  function playUISound(name){
    try {
      var audio = new Audio('audio/ui/' + name + '.wav');
      audio.volume = (S.settings && S.settings.uiVolume) || 0.5;
      audio.play().catch(function(){});
    } catch(e){}
  }

  function applyTheme(themeName){
    var themes = {
      dark: { bg:"#0f1115", card:"#1a1d24", text:"#e6e6e6", accent:"#4ea1ff" },
      light: { bg:"#f5f5f5", card:"#ffffff", text:"#222222", accent:"#2962ff" },
      blue: { bg:"#0d1b2a", card:"#1b2838", text:"#e0e0e0", accent:"#00bcd4" },
      high_contrast: { bg:"#000000", card:"#111111", text:"#ffffff", accent:"#ffff00" }
    };
    var t = themes[themeName] || themes.dark;
    var root = document.documentElement;
    root.style.setProperty("--bg", t.bg);
    root.style.setProperty("--card", t.card);
    root.style.setProperty("--text", t.text);
    root.style.setProperty("--accent", t.accent);
  }

  window.playUISound = playUISound;
  window.applyTheme = applyTheme;
})();
