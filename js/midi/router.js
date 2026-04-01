/* ───────── PianoSpark – midi/router.js ───────── */
/* Routes incoming MIDI through profile layer into app systems */
(function(){

  function routeMidiNote(note, isOn, velocity, channel, time){
    var mapped = applyMidiProfileToNote(note, channel, velocity);
    if(!mapped || !mapped.accepted) return;

    // Per-profile latency preference
    var profile = getActiveMidiProfile();
    var latency = profile && profile.inputLatencyMs != null
      ? profile.inputLatencyMs
      : S.inputLatencyMs || 0;

    if(S.screen === SCR.PERFORM && typeof handlePerformanceMidi === "function"){
      handlePerformanceMidi(mapped.mappedNote, isOn, mapped.velocity, time);
    }

    if(S.screen === SCR.CALIBRATION && typeof recordCalibrationHit === "function" && isOn){
      recordCalibrationHit(time || performance.now());
    }

    if(typeof handlePracticeMidi === "function"){
      handlePracticeMidi(mapped, isOn, time);
    }
  }

  window.routeMidiNote = routeMidiNote;

})();
