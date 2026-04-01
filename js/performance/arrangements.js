/* ───────── PianoSpark – performance/arrangements.js ───────── */
/* Unified arrangement builder entry point */

(function(){

  function buildArrangement(song, mode){
    if(mode === "block_chords") return buildBlockChordArrangement(song);
    if(mode === "left_hand") return buildLeftHandArrangement(song);
    if(mode === "melody") return buildMelodyArrangement(song);
    return null;
  }

  function buildBlockChordArrangement(song){
    return buildBlockChordChartFromSong(song);
  }

  function buildLeftHandArrangement(song){
    return buildLeftHandPatternChartFromSong(song);
  }

  function buildMelodyArrangement(song){
    return buildMelodyChartFromSong(song);
  }

  window.buildArrangement = buildArrangement;
  window.buildBlockChordArrangement = buildBlockChordArrangement;
  window.buildLeftHandArrangement = buildLeftHandArrangement;
  window.buildMelodyArrangement = buildMelodyArrangement;

})();
