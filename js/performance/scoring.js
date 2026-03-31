(function(){

  function scorePerformanceEvent(event, snapshot, hitDeltaMs, difficultyId){
    var diff = getPerformanceDifficulty(difficultyId);
    if(event.type==="block_chord"){
      return scoreBlockChordEvent(event, snapshot, hitDeltaMs, diff);
    }
    return { score:0, grade:"miss", noteScore:0, timingScore:0, hitDeltaMs:hitDeltaMs };
  }

  function scoreBlockChordEvent(event, snapshot, hitDeltaMs, diff){
    var target = (event.target && event.target.midi) ? event.target.midi : [];
    var input = snapshot.heldMidiNotes || [];
    var noteScore = overlapMidiSet(target, input, !!diff.allowPartialChord);

    var abs = Math.abs(hitDeltaMs);
    var timingScore = 0;
    if(abs <= diff.perfectMs) timingScore = 1;
    else if(abs <= diff.goodMs) timingScore = 0.7;
    else if(abs <= diff.missMs) timingScore = 0.35;

    var total = noteScore * diff.noteWeight + timingScore * diff.timingWeight;
    return {
      score: total,
      grade: gradePerformanceScore(total),
      noteScore: noteScore,
      timingScore: timingScore,
      hitDeltaMs: hitDeltaMs
    };
  }

  function overlapMidiSet(target, input, allowPartial){
    if(!target || !target.length) return 0;
    var matched = 0;
    for(var i=0;i<target.length;i++){
      if(input.indexOf(target[i])!==-1) matched++;
    }
    var ratio = matched / target.length;
    if(allowPartial) return ratio;
    return matched===target.length ? 1 : 0;
  }

  function gradePerformanceScore(score){
    if(score>=0.9) return "perfect";
    if(score>=0.7) return "good";
    if(score>=0.45) return "ok";
    return "miss";
  }

  function createEmptyPhraseStats(chart){
    var arr = [];
    for(var i=0;i<(chart.phrases||[]).length;i++){
      arr.push({
        phraseId:chart.phrases[i].id,
        name:chart.phrases[i].name,
        total:0,
        hits:0,
        misses:0,
        perfects:0,
        goods:0,
        oks:0,
        scoreSum:0,
        maxCombo:0
      });
    }
    return arr;
  }

  function updatePhraseStats(stats,event,result,combo){
    var pid = event.performance && event.performance.phraseId;
    if(pid==null || !stats[pid]) return;
    var row = stats[pid];
    row.total++;
    row.scoreSum += result.score || 0;
    row.maxCombo = Math.max(row.maxCombo, combo);

    if(result.grade==="miss"){
      row.misses++;
    }else{
      row.hits++;
      if(result.grade==="perfect") row.perfects++;
      else if(result.grade==="good") row.goods++;
      else if(result.grade==="ok") row.oks++;
    }
  }

  function finalizePerformanceResults(chart, phraseStats){
    var total=0, hits=0, misses=0, scoreSum=0, maxCombo=0;
    for(var i=0;i<phraseStats.length;i++){
      total += phraseStats[i].total;
      hits += phraseStats[i].hits;
      misses += phraseStats[i].misses;
      scoreSum += phraseStats[i].scoreSum;
      maxCombo = Math.max(maxCombo, phraseStats[i].maxCombo);
    }
    var accuracy = total ? Math.round((hits/total)*100) : 0;
    var stars = accuracy>=95 ? 5 : accuracy>=88 ? 4 : accuracy>=75 ? 3 : accuracy>=60 ? 2 : 1;

    return {
      songId:chart.songId || chart.id || "",
      arrangementType:chart.arrangementType || "block_chords",
      difficultyId:S.performDifficulty || "normal",
      title:chart.title || "Performance",
      accuracy:accuracy,
      totalEvents:total,
      hits:hits,
      misses:misses,
      score:Math.round(scoreSum * 100),
      maxCombo:maxCombo,
      stars:stars,
      phrases:phraseStats
    };
  }

  window.scorePerformanceEvent = scorePerformanceEvent;
  window.createEmptyPhraseStats = createEmptyPhraseStats;
  window.updatePhraseStats = updatePhraseStats;
  window.finalizePerformanceResults = finalizePerformanceResults;

})();
