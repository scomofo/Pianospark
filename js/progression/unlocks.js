/* PianoSpark – progression/unlocks.js – Content Unlock System */

(function(){

  function unlockContent(type, id){
    if(!S.unlocks[type]) S.unlocks[type] = {};
    S.unlocks[type][id] = true;
    saveState();
  }

  function isUnlocked(type, id){
    return S.unlocks[type] && S.unlocks[type][id];
  }

  function evaluateUnlocks(){
    // PianoSpark chord unlock rules
    // Basic chords unlock intermediate chords
    if(getMastery("chords","C") > 0.7 &&
       getMastery("chords","G") > 0.7){
      unlockContent("chords","F");
      unlockContent("chords","Am");
    }

    if(getMastery("chords","F") > 0.7 &&
       getMastery("chords","Am") > 0.7){
      unlockContent("chords","Dm");
      unlockContent("chords","Em");
    }

    if(getMastery("chords","Dm") > 0.7 &&
       getMastery("chords","Em") > 0.7){
      unlockContent("chords","E");
      unlockContent("chords","A");
    }

    // Rhythm unlocks
    if(getAverageMastery("rhythm") > 0.6){
      unlockContent("lessons","strumming_1");
    }

    // Transition unlocks
    if(getAverageMastery("transitions") > 0.7){
      unlockContent("lessons","transitions_2");
    }

    // Song unlocks
    if(getAverageMastery("songs") > 0.75){
      unlockContent("songs","song_2");
    }

    // PianoSpark: scale unlocks based on finger mastery
    if(getAverageMastery("fingers") > 0.6){
      unlockContent("lessons","scales_intro");
    }

    // PianoSpark: left-hand pattern unlocks
    if(getMastery("chords","C") > 0.6 &&
       getMastery("chords","G") > 0.6){
      unlockContent("lessons","lh_patterns_1");
    }

    // PianoSpark: curriculum session-based unlocks
    if(Array.isArray(S.completedSessions)){
      for(var i=0;i<S.completedSessions.length;i++){
        var sn = S.completedSessions[i];
        unlockContent("lessons","session_" + sn);
        // Unlock next session
        unlockContent("lessons","session_" + (sn + 1));
      }
    }
  }

  window.unlockContent = unlockContent;
  window.isUnlocked = isUnlocked;
  window.evaluateUnlocks = evaluateUnlocks;

})();
