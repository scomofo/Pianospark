/* ───────── PianoSpark – curriculum/curriculum_engine.js ───────── */
/* Determines next lesson, unlock checks, difficulty levels */
(function(){

  // PianoSpark difficulty levels
  var DIFFICULTY_LEVELS = [
    { level: 1, name: "Beginner" },
    { level: 2, name: "Early Beginner" },
    { level: 3, name: "Beginner+" },
    { level: 4, name: "Early Intermediate" },
    { level: 5, name: "Intermediate" },
    { level: 6, name: "Intermediate+" },
    { level: 7, name: "Advanced" },
    { level: 8, name: "Expert" }
  ];

  function getNextLessonFromCurriculum(curriculumId, completedLessons){
    var curriculum = getCurriculumItem("curriculums", curriculumId);
    if(!curriculum) return null;
    for(var t=0;t<curriculum.tracks.length;t++){
      var track = getCurriculumItem("tracks", curriculum.tracks[t]);
      if(!track) continue;
      for(var u=0;u<track.units.length;u++){
        var unit = getCurriculumItem("units", track.units[u]);
        if(!unit) continue;
        for(var l=0;l<unit.lessons.length;l++){
          var lessonId = unit.lessons[l];
          if(completedLessons.indexOf(lessonId) < 0){
            return lessonId;
          }
        }
      }
    }
    return null;
  }

  function checkLessonUnlockRules(lesson){
    if(!lesson || !lesson.unlockRules) return true; // No rules = unlocked
    var rules = lesson.unlockRules;

    // Check required completed lessons
    if(rules.lessonsCompleted){
      var completed = S.completedCurriculumLessons || [];
      for(var i=0;i<rules.lessonsCompleted.length;i++){
        if(completed.indexOf(rules.lessonsCompleted[i]) < 0) return false;
      }
    }

    // Check player level
    if(rules.playerLevel && (S.playerLevel || 1) < rules.playerLevel){
      return false;
    }

    // Check mastery requirements
    if(rules.mastery && rules.mastery.chords && S.mastery){
      for(var c=0;c<rules.mastery.chords.length;c++){
        var chordId = rules.mastery.chords[c];
        if(!S.mastery[chordId] || S.mastery[chordId] < 50) return false;
      }
    }

    return true;
  }

  function getDifficultyLabel(level){
    for(var i=0;i<DIFFICULTY_LEVELS.length;i++){
      if(DIFFICULTY_LEVELS[i].level === level) return DIFFICULTY_LEVELS[i].name;
    }
    return "Unknown";
  }

  window.getNextLessonFromCurriculum = getNextLessonFromCurriculum;
  window.checkLessonUnlockRules = checkLessonUnlockRules;
  window.getDifficultyLabel = getDifficultyLabel;
  window.DIFFICULTY_LEVELS = DIFFICULTY_LEVELS;

})();
