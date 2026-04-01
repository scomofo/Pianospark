/* PianoSpark – progression/tree.js – Learning Progression Tree */

(function(){

  function buildProgressionTree(){
    S.progressionTree = {
      // PianoSpark-specific chord progression (matches curriculum)
      chords: ["C","G","Am","F","Dm","Em","E","A","D","Bb","Eb","Ab"],

      // Rhythm skills
      rhythm: ["quarter","eighth","dotted","syncopation","triplets","strum_patterns"],

      // Scales (piano-specific)
      scales: ["C_major","G_major","D_major","F_major","A_minor","E_minor"],

      // Left-hand patterns (piano-specific)
      leftHand: ["whole_notes","half_notes","arpeggios","alberti_bass","walking_bass","octaves","full_accompaniment"],

      // Songs unlock progression
      songs: ["song1","song2","song3","song4","song5"],

      // Lessons / curriculum sessions
      lessons: ["session_1","session_2","session_3","session_4","session_5",
                "session_6","session_7","session_8","session_9","session_10"]
    };
  }

  function getNextRecommendedLesson(){
    if(!S.progressionTree) buildProgressionTree();

    var lessons = S.progressionTree.lessons;
    for(var i=0;i<lessons.length;i++){
      if(!isUnlocked("lessons", lessons[i])){
        return lessons[i];
      }
    }

    return null;
  }

  function getNextRecommendedChord(){
    if(!S.progressionTree) buildProgressionTree();

    var chords = S.progressionTree.chords;
    for(var i=0;i<chords.length;i++){
      if(!isUnlocked("chords", chords[i]) && getMastery("chords", chords[i]) < 0.5){
        return chords[i];
      }
    }

    return null;
  }

  function getNextRecommendedScale(){
    if(!S.progressionTree) buildProgressionTree();

    var scales = S.progressionTree.scales;
    for(var i=0;i<scales.length;i++){
      if(getMastery("scales", scales[i]) < 0.5){
        return scales[i];
      }
    }

    return null;
  }

  window.buildProgressionTree = buildProgressionTree;
  window.getNextRecommendedLesson = getNextRecommendedLesson;
  window.getNextRecommendedChord = getNextRecommendedChord;
  window.getNextRecommendedScale = getNextRecommendedScale;

})();
