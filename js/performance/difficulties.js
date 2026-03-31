(function(){
  var PERFORMANCE_DIFFICULTIES = {
    easy: {
      id:"easy",
      label:"Easy",
      perfectMs:100,
      goodMs:180,
      missMs:280,
      noteWeight:0.85,
      timingWeight:0.15,
      allowPartialChord:true
    },
    normal: {
      id:"normal",
      label:"Normal",
      perfectMs:70,
      goodMs:140,
      missMs:220,
      noteWeight:0.75,
      timingWeight:0.25,
      allowPartialChord:false
    },
    pro: {
      id:"pro",
      label:"Pro",
      perfectMs:45,
      goodMs:90,
      missMs:160,
      noteWeight:0.65,
      timingWeight:0.35,
      allowPartialChord:false
    }
  };

  function getPerformanceDifficulty(id){
    return PERFORMANCE_DIFFICULTIES[id] || PERFORMANCE_DIFFICULTIES.normal;
  }

  function applyPerformanceDifficultyToState(id){
    var d = getPerformanceDifficulty(id);
    S.performDifficulty = d.id;
    S.performWindowPerfectMs = d.perfectMs;
    S.performWindowGoodMs = d.goodMs;
    S.performWindowMissMs = d.missMs;
    return d;
  }

  window.PERFORMANCE_DIFFICULTIES = PERFORMANCE_DIFFICULTIES;
  window.getPerformanceDifficulty = getPerformanceDifficulty;
  window.applyPerformanceDifficultyToState = applyPerformanceDifficultyToState;
})();
