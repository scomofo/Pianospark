/* PianoSpark – practice/plan.js – Daily & Weekly Practice Plan Generator */

(function(){

  function generateDailyPracticePlan(){
    var weak = getTopWeakSpots();

    var items = [];

    // Warmup
    items.push({
      id:"warmup",
      type:"warmup",
      duration:5
    });

    // Weak transitions
    for(var i=0;i<weak.transitions.length;i++){
      items.push({
        id:"transition_"+weak.transitions[i].key,
        type:"transition",
        target:weak.transitions[i].key,
        bpm:70
      });
    }

    // Weak rhythm
    for(var r=0;r<weak.rhythm.length;r++){
      items.push({
        id:"rhythm_"+weak.rhythm[r].key,
        type:"rhythm",
        target:weak.rhythm[r].key,
        bpm:80
      });
    }

    // Weak phrases
    for(var p=0;p<weak.phrases.length;p++){
      items.push({
        id:"phrase_"+weak.phrases[p].key,
        type:"phrase",
        target:weak.phrases[p].key,
        speed:0.7
      });
    }

    // PianoSpark: left-hand pattern slot based on current LH level
    var lhLevel = S.lhLevel || 1;
    items.push({
      id:"lh_pattern_" + lhLevel,
      type:"left_hand_pattern",
      target:"lh_level_" + lhLevel,
      bpm:70
    });

    // Curriculum session slot
    var sessionPlan = getCurrentSessionPlan ? getCurrentSessionPlan() : null;
    if(sessionPlan){
      items.push({
        id:"session_" + sessionPlan.num,
        type:"guided_session",
        target:"session_" + sessionPlan.num,
        difficulty:"normal"
      });
    }

    // Song slot
    items.push({
      id:"song_slot",
      type:"song",
      difficulty:"normal"
    });

    // Apply adaptive
    for(var j=0;j<items.length;j++){
      items[j] = applyAdaptiveToExercise(items[j]);
    }

    S.practicePlan = {
      date: new Date().toISOString().slice(0,10),
      items: items
    };

    return S.practicePlan;
  }

  function getNextPracticeItem(){
    if(!S.practicePlan) generateDailyPracticePlan();

    for(var i=0;i<S.practicePlan.items.length;i++){
      if(!S.practicePlan.items[i].completed){
        return S.practicePlan.items[i];
      }
    }

    return null;
  }

  function completePracticeItem(id, result){
    if(!S.practicePlan) return;

    for(var i=0;i<S.practicePlan.items.length;i++){
      if(S.practicePlan.items[i].id===id){
        S.practicePlan.items[i].completed = true;
        break;
      }
    }

    if(result){
      updateWeakSpotsFromPerformance(result);
      updateAdaptiveFromResult(result);
      S.practiceHistory.push(result);
    }

    saveState();
  }

  function generateWeeklyPracticePlan(){
    var days = [];

    for(var i=0;i<7;i++){
      days.push(generateDailyPracticePlan());
    }

    S.weeklyPracticePlan = {
      weekStart: new Date().toISOString().slice(0,10),
      days: days
    };

    return S.weeklyPracticePlan;
  }

  function startPracticeItem(id){
    var plan = S.practicePlan;
    if(!plan) return;

    for(var i=0;i<plan.items.length;i++){
      if(plan.items[i].id === id){
        launchPracticeItem(plan.items[i]);
        return;
      }
    }
  }

  window.generateDailyPracticePlan = generateDailyPracticePlan;
  window.getNextPracticeItem = getNextPracticeItem;
  window.completePracticeItem = completePracticeItem;
  window.generateWeeklyPracticePlan = generateWeeklyPracticePlan;
  window.startPracticeItem = startPracticeItem;

})();
