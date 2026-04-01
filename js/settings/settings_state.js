/* PianoSpark – settings/settings_state.js */
/* Settings state initialization and persistence */
(function(){
  function initSettings(){
    if(!S.settings || typeof S.settings !== "object"){
      S.settings = {};
    }
    var defaults = window.SparkSettingsDefaults || {};
    for(var k in defaults){
      if(S.settings[k] === undefined){
        S.settings[k] = defaults[k];
      }
    }
  }

  function setSetting(key, value){
    if(!S.settings) S.settings = {};
    S.settings[key] = value;
    saveState();
  }

  function getSetting(key){
    return S.settings ? S.settings[key] : undefined;
  }

  window.initSettings = initSettings;
  window.setSetting = setSetting;
  window.getSetting = getSetting;
})();
