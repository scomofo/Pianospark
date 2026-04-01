/* ───────── PianoSpark – performance/retry.js ───────── */
/* Phrase retry + weakest phrase retry logic */

(function(){

  function retryPhrase(phraseId){
    S.performanceRetryTarget = phraseId;
    S.screen = SCR.PERFORM;
    render();
  }

  function retryWeakestPhrase(){
    var weakest = getWeakestPhraseFromLastPerformance();
    if(weakest) retryPhrase(weakest.id);
  }

  function getRetryTarget(){
    return S.performanceRetryTarget || null;
  }

  function clearRetryTarget(){
    S.performanceRetryTarget = null;
  }

  window.retryPhrase = retryPhrase;
  window.retryWeakestPhrase = retryWeakestPhrase;
  window.getRetryTarget = getRetryTarget;
  window.clearRetryTarget = clearRetryTarget;

})();
