(function(){

  function ensurePerformanceStatBucket(songId, arrangementType, difficultyId){
    if(!S.performanceStats) S.performanceStats = {};
    if(!S.performanceStats[songId]) S.performanceStats[songId] = {};
    if(!S.performanceStats[songId][arrangementType]) S.performanceStats[songId][arrangementType] = {};
    if(!S.performanceStats[songId][arrangementType][difficultyId]){
      S.performanceStats[songId][arrangementType][difficultyId] = {
        attempts:0,
        completions:0,
        bestScore:0,
        bestAccuracy:0,
        bestStars:0,
        bestCombo:0,
        avgAccuracy:0,
        lastPlayed:0,
        mastered:false,
        phrases:{}
      };
    }
    return S.performanceStats[songId][arrangementType][difficultyId];
  }

  function updatePerformanceProgression(summary){
    var b = ensurePerformanceStatBucket(summary.songId, summary.arrangementType, summary.difficultyId);
    b.attempts++;
    b.completions++;
    b.bestScore = Math.max(b.bestScore, summary.score || 0);
    b.bestAccuracy = Math.max(b.bestAccuracy, summary.accuracy || 0);
    b.bestStars = Math.max(b.bestStars, summary.stars || 0);
    b.bestCombo = Math.max(b.bestCombo, summary.maxCombo || 0);
    b.lastPlayed = Date.now();
    b.avgAccuracy = ((b.avgAccuracy * (b.attempts-1)) + (summary.accuracy || 0)) / b.attempts;
    b.mastered = b.bestAccuracy >= 90 && b.bestStars >= 4 && b.attempts >= 2;
    S.performanceLastSummary = summary;
    return b;
  }

  function getPerformanceBest(songId, arrangementType, difficultyId){
    return S.performanceStats &&
      S.performanceStats[songId] &&
      S.performanceStats[songId][arrangementType] &&
      S.performanceStats[songId][arrangementType][difficultyId] || null;
  }

  function getPerformanceMasteryLabel(bucket){
    if(!bucket) return "New";
    if(bucket.mastered) return "Mastered";
    if(bucket.bestAccuracy >= 85) return "Strong";
    if(bucket.bestAccuracy >= 60) return "Developing";
    return "Learning";
  }

  window.updatePerformanceProgression = updatePerformanceProgression;
  window.getPerformanceBest = getPerformanceBest;
  window.getPerformanceMasteryLabel = getPerformanceMasteryLabel;

})();
