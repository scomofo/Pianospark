/* ───────── PianoSpark – curriculum/curriculum_ui.js ───────── */
/* Curriculum browser and progress UI */
(function(){

  function curriculumPage(){
    var h = '<div class="card">';
    h += '<div><b>Curriculum</b></div>';

    var currs = SparkCurriculum.curriculums || {};
    var currIds = Object.keys(currs);
    if(!currIds.length){
      h += '<div>No curriculum loaded yet.</div>';
      h += '</div>';
      return h;
    }

    for(var ci=0;ci<currIds.length;ci++){
      var curr = currs[currIds[ci]];
      h += '<div style="margin:8px 0"><b>' + (curr.title || curr.id) + '</b></div>';
      var tracks = curr.tracks || [];
      for(var ti=0;ti<tracks.length;ti++){
        var track = getCurriculumItem("tracks", tracks[ti]);
        if(!track) continue;
        h += '<div style="margin-left:16px">';
        h += '<div><b>' + (track.title || track.id) + '</b></div>';
        if(track.description) h += '<div style="font-size:0.9em;opacity:0.7">' + track.description + '</div>';
        var units = track.units || [];
        for(var ui=0;ui<units.length;ui++){
          var unit = getCurriculumItem("units", units[ui]);
          if(!unit) continue;
          h += '<div style="margin-left:16px">';
          h += '<div>' + (unit.title || unit.id) + '</div>';
          var lessons = unit.lessons || [];
          for(var li=0;li<lessons.length;li++){
            var lesson = getCurriculumItem("lessons", lessons[li]);
            var completed = (S.completedCurriculumLessons || []).indexOf(lessons[li]) >= 0;
            h += '<div style="margin-left:16px">';
            h += (completed ? '[done] ' : '[ ] ') + (lesson ? lesson.title : lessons[li]);
            h += '</div>';
          }
          h += '</div>';
        }
        h += '</div>';
      }
    }

    h += '</div>';
    return h;
  }

  window.curriculumPage = curriculumPage;

})();
