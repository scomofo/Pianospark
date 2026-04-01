/* PianoSpark – progression/progress_ui.js – Progression & Mastery UI */

function progressionPage(){
  var h = '<div class="card mb16">';
  h += '<div><b>Progress Overview</b></div>';
  h += '<div>Chord Mastery: '+Math.round(getAverageMastery("chords")*100)+'%</div>';
  h += '<div>Rhythm Mastery: '+Math.round(getAverageMastery("rhythm")*100)+'%</div>';
  h += '<div>Transition Mastery: '+Math.round(getAverageMastery("transitions")*100)+'%</div>';
  h += '<div>Song Mastery: '+Math.round(getAverageMastery("songs")*100)+'%</div>';

  // PianoSpark-specific mastery categories
  h += '<div>Scale Mastery: '+Math.round(getAverageMastery("scales")*100)+'%</div>';
  h += '<div>Finger Control: '+Math.round(getAverageMastery("fingers")*100)+'%</div>';
  h += '<div>Lesson Progress: '+Math.round(getAverageMastery("lessons")*100)+'%</div>';
  h += '</div>';

  // Next recommended content
  var nextLesson = getNextRecommendedLesson();
  var nextChord = getNextRecommendedChord();
  if(nextLesson || nextChord){
    h += '<div class="card mb16">';
    h += '<div><b>Recommended Next</b></div>';
    if(nextLesson) h += '<div>Next lesson: ' + nextLesson + '</div>';
    if(nextChord) h += '<div>Next chord: ' + nextChord + '</div>';
    h += '</div>';
  }

  return h;
}
