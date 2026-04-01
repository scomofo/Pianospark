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

  // Performance mastery — weighted EMA tracking per song and phrase
  function updatePerformanceMastery(result){
    if(!result || !result.songId) return;
    if(!S.performanceMastery) S.performanceMastery = { songs:{}, phrases:{}, leftHand:{}, melody:{} };

    // Song-level mastery (EMA: 70% old + 30% new)
    var songAcc = (result.accuracy || 0) / 100;
    if(!S.performanceMastery.songs[result.songId]){
      S.performanceMastery.songs[result.songId] = 0;
    }
    S.performanceMastery.songs[result.songId] =
      (S.performanceMastery.songs[result.songId] * 0.7) + (songAcc * 0.3);

    // Phrase-level mastery
    if(Array.isArray(result.phrases)){
      for(var i=0;i<result.phrases.length;i++){
        var p = result.phrases[i];
        var pAcc = p.total ? (p.hits / p.total) : 0;
        var pKey = result.songId + "_p" + p.phraseId;
        if(!S.performanceMastery.phrases[pKey]){
          S.performanceMastery.phrases[pKey] = 0;
        }
        S.performanceMastery.phrases[pKey] =
          (S.performanceMastery.phrases[pKey] * 0.7) + (pAcc * 0.3);
      }
    }

    // Track arrangement-specific mastery
    if(result.arrangementType === "left_hand_patterns"){
      if(!S.performanceMastery.leftHand[result.songId]){
        S.performanceMastery.leftHand[result.songId] = 0;
      }
      S.performanceMastery.leftHand[result.songId] =
        (S.performanceMastery.leftHand[result.songId] * 0.7) + (songAcc * 0.3);
    }
    if(result.arrangementType === "melody"){
      if(!S.performanceMastery.melody[result.songId]){
        S.performanceMastery.melody[result.songId] = 0;
      }
      S.performanceMastery.melody[result.songId] =
        (S.performanceMastery.melody[result.songId] * 0.7) + (songAcc * 0.3);
    }

    saveState();
  }

  window.updatePerformanceProgression = updatePerformanceProgression;
  window.updatePerformanceMastery = updatePerformanceMastery;
  window.getPerformanceBest = getPerformanceBest;
  window.getPerformanceMasteryLabel = getPerformanceMasteryLabel;

})();
