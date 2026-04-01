(function(){
  var _performAnim = null;

  function startPerformance(chartOrSong, opts){
    opts = opts || {};
    var chart = chartOrSong && chartOrSong.events ? normalizePerformanceChart(chartOrSong) : null;
    if(!chart) return;

    applyPerformanceDifficultyToState(opts.difficulty || S.performDifficulty || "normal");

    S.performChart = chart;
    S.performSongId = chart.songId || chart.id;
    S.performPlaying = true;
    S.performPaused = false;
    S.performCurrentSec = 0;
    S.performScore = 0;
    S.performCombo = 0;
    S.performMaxCombo = 0;
    S.performAccuracy = 0;
    S.performPhraseIdx = 0;
    S.performResults = null;
    S.performStarRating = 0;
    S.performPhraseStats = createEmptyPhraseStats(chart);
    S.performScrollSpeed = PERFORMANCE_CONFIG.highway.scrollSpeed;

    PerformanceInput.start();
    PerformanceTransport.start(0, opts.speed || S.performSpeed || 1);

    S.screen = SCR.PERFORM;
    render();
    updatePerformanceFrame();
  }

  function stopPerformance(){
    if(typeof _destroyPianoHighway==='function') _destroyPianoHighway();
    if(_performAnim) cancelAnimationFrame(_performAnim);
    _performAnim = null;
    PerformanceTransport.pause();
    PerformanceInput.stop();
    S.performPlaying = false;
    S.performPaused = false;
  }

  function pausePerformance(){
    PerformanceTransport.pause();
    S.performPaused = true;
    S.performPlaying = false;
    if(_performAnim) cancelAnimationFrame(_performAnim);
    _performAnim = null;
    render();
  }

  function resumePerformance(){
    PerformanceTransport.resume();
    S.performPaused = false;
    S.performPlaying = true;
    updatePerformanceFrame();
  }

  function updatePerformanceFrame(){
    if(S.screen!==SCR.PERFORM || !S.performChart || !PerformanceTransport.isPlaying()) return;

    var nowSec = PerformanceTransport.now();
    S.performCurrentSec = nowSec;
    S.performPhraseIdx = getPerformancePhraseIndexForTime(S.performChart, nowSec);
    maybeScorePendingEvents(nowSec);
    markMissedEvents(nowSec);

    if(nowSec >= (S.performChart._durationSec + 0.25)){
      finishPerformance();
      return;
    }

    if(typeof updatePerformanceDOM === 'function') updatePerformanceDOM();
    else render();
    _performAnim = requestAnimationFrame(updatePerformanceFrame);
  }

  function maybeScorePendingEvents(nowSec){
    var chart = S.performChart;
    var snap = PerformanceInput.getSnapshot(nowSec);
    S.performInputMidi = snap.heldMidiNotes.slice();
    S.performInputNotes = snap.pitchClasses.slice();

    for(var i=0;i<chart.events.length;i++){
      var evt = chart.events[i];
      if(evt._scored) continue;

      var deltaMs = (nowSec - evt.t) * 1000;
      if(Math.abs(deltaMs) > S.performWindowGoodMs) continue;

      var result = scorePerformanceEvent(evt, snap, deltaMs, S.performDifficulty);
      if(result.grade==="miss" || result.noteScore<=0) continue;

      evt._scored = true;
      evt._hit = true;
      evt._result = result.grade;
      evt._score = result.score;

      S.performCombo++;
      S.performMaxCombo = Math.max(S.performMaxCombo, S.performCombo);
      S.performScore += Math.round(result.score * 100);

      updatePhraseStats(S.performPhraseStats, evt, result, S.performCombo);
    }
  }

  function markMissedEvents(nowSec){
    var chart = S.performChart;
    for(var i=0;i<chart.events.length;i++){
      var evt = chart.events[i];
      if(evt._scored) continue;

      var deltaMs = (nowSec - evt.t) * 1000;
      if(deltaMs <= S.performWindowMissMs) continue;

      evt._scored = true;
      evt._miss = true;
      evt._result = "miss";
      evt._score = 0;
      S.performCombo = 0;
      updatePhraseStats(S.performPhraseStats, evt, { grade:"miss", score:0 }, S.performCombo);
    }
  }

  function finishPerformance(){
    stopPerformance();
    S.performResults = finalizePerformanceResults(S.performChart, S.performPhraseStats);
    S.performAccuracy = S.performResults.accuracy;
    S.performStarRating = S.performResults.stars;

    if(!Array.isArray(S.performanceHistory)) S.performanceHistory = [];
    S.performanceHistory.push({
      songId:S.performResults.songId,
      title:S.performResults.title,
      accuracy:S.performResults.accuracy,
      stars:S.performResults.stars,
      score:S.performResults.score,
      date:Date.now()
    });
    if(S.performanceHistory.length > 50) S.performanceHistory.shift();

    updatePerformanceProgression(S.performResults);
    saveState();
    S.screen = SCR.PERFORM_DONE;
    render();
  }

  window.startPerformance = startPerformance;
  window.stopPerformance = stopPerformance;
  window.pausePerformance = pausePerformance;
  window.resumePerformance = resumePerformance;
  window.updatePerformanceFrame = updatePerformanceFrame;

})();
