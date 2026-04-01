/* PianoSpark – settings/settings_registry.js */
/* Settings definitions and categories */
(function(){
  window.SparkSettingsCategories = [
    { id: "general", title: "General" },
    { id: "audio", title: "Audio / MIDI" },
    { id: "practice", title: "Practice" },
    { id: "difficulty", title: "Difficulty" },
    { id: "display", title: "Display / Theme" },
    { id: "cloud", title: "Cloud Sync" },
    { id: "about", title: "About" }
  ];

  window.SparkSettingsDefaults = {
    audioLatencyMs: 0,
    metronomeVolume: 0.6,
    noteSpeed: 1.0,
    difficultyAutoAdjust: true,
    theme: "dark",
    showFingerHints: true,
    practiceReminder: true,
    cloudSyncEnabled: false,
    uiVolume: 0.5
  };
})();
