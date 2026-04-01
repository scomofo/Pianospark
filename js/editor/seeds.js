/* editor/seeds.js — Seed workflows (handoff 7) */

/* Shared seed helpers */
(function(){

  function seedChartFromSong(song, arrangementType){
    if(!song || typeof buildPerformanceChartFromSong!=="function") return null;
    return JSON.parse(JSON.stringify(
      buildPerformanceChartFromSong(song, arrangementType || defaultSeedArrangementType())
    ));
  }

  function seedExerciseFromGenerated(type, options){
    if(typeof generateExercise!=="function") return null;
    var ex = generateExercise(type, options || {});
    return ex ? JSON.parse(JSON.stringify(ex)) : null;
  }

  function duplicateEditorObject(obj){
    if(!obj) return null;
    var clone = JSON.parse(JSON.stringify(obj));
    clone.id = (clone.id || "copy") + "_copy_" + Date.now();
    if(clone.title) clone.title = clone.title + " Copy";
    return clone;
  }

  function defaultSeedArrangementType(){
    if(typeof APP_NAME!=="undefined" && /piano/i.test(APP_NAME)) return "block_chords";
    return "chords";
  }

  window.seedChartFromSong = seedChartFromSong;
  window.seedExerciseFromGenerated = seedExerciseFromGenerated;
  window.duplicateEditorObject = duplicateEditorObject;

})();

/* PianoSpark-specific seed workflows */
(function(){

  function seedPianoSparkFingerExercise(exerciseId){
    if(typeof FINGER_EXERCISES==="undefined" || !Array.isArray(FINGER_EXERCISES)) return null;
    for(var i=0;i<FINGER_EXERCISES.length;i++){
      if(String(FINGER_EXERCISES[i].id)===String(exerciseId)){
        var ex = FINGER_EXERCISES[i];
        return {
          id:"exercise_finger_" + Date.now(),
          type:"finger",
          title:ex.name || "Finger Exercise",
          description:ex.desc || "",
          bpm:ex.bpm || 60,
          durationSec:ex.duration || 60,
          steps:[],
          meta:{ sourceExerciseId:exerciseId }
        };
      }
    }
    return null;
  }

  /* PianoSpark seed entry-point helpers */
  function getSongByEditorParam(param){
    var idx = parseInt(param, 10);
    if(!isNaN(idx) && SONGS[idx]) return SONGS[idx];
    return null;
  }

  function getSeedArrangementForEditor(){
    return S.performArrangementType || "block_chords";
  }

  function getExerciseSeedByParam(param){
    if(param && param.indexOf("finger|")===0){
      var exerciseId = param.split("|")[1] || "";
      return seedPianoSparkFingerExercise(exerciseId);
    }
    return null;
  }

  window.seedPianoSparkFingerExercise = seedPianoSparkFingerExercise;
  window.getSongByEditorParam = getSongByEditorParam;
  window.getSeedArrangementForEditor = getSeedArrangementForEditor;
  window.getExerciseSeedByParam = getExerciseSeedByParam;

})();
