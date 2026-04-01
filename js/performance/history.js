/* ───────── PianoSpark – performance/history.js ───────── */
/* Phrase-level statistics tracking */

(function(){

  function recordPhraseResult(phraseId, accuracy){
    if(!S.performancePhraseStats) S.performancePhraseStats = {};
    if(!S.performancePhraseStats[phraseId]){
      S.performancePhraseStats[phraseId] = {
        attempts: 0,
        avgAccuracy: 0
      };
    }
    var p = S.performancePhraseStats[phraseId];
    p.avgAccuracy = (p.avgAccuracy * p.attempts + accuracy) / (p.attempts + 1);
    p.attempts++;
  }

  function getWeakestPhraseFromLastPerformance(){
    var stats = S.performancePhraseStats;
    if(!stats) return null;
    var weakest = null;
    for(var id in stats){
      var p = stats[id];
      if(!weakest || p.avgAccuracy < weakest.avgAccuracy){
        weakest = { id: id, avgAccuracy: p.avgAccuracy };
      }
    }
    return weakest;
  }

  function getPhraseStats(){
    return S.performancePhraseStats || {};
  }

  window.recordPhraseResult = recordPhraseResult;
  window.getWeakestPhraseFromLastPerformance = getWeakestPhraseFromLastPerformance;
  window.getPhraseStats = getPhraseStats;

})();
