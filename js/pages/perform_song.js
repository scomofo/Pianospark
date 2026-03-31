function performSongPage(){
  if(!S.performSongData) return '<div class="card">No song selected</div>';

  var sid = S.performSongId;
  var best = getPerformanceBest(sid, S.performArrangementType, S.performDifficulty);
  var mastery = getPerformanceMasteryLabel(best);

  var h = '<div class="card mb16">';
  h += '<h2>'+escHTML(S.performSongData.title)+'</h2>';
  h += '<div class="muted">'+escHTML(S.performSongData.artist || "")+'</div>';
  h += '<div style="margin-top:8px">Mastery: <b>'+escHTML(mastery)+'</b></div>';
  if(best){
    h += '<div>Best Accuracy: '+Math.round(best.bestAccuracy||0)+'%</div>';
    h += '<div>Best Stars: '+(best.bestStars||0)+'</div>';
  }
  h += '</div>';

  h += '<div class="card mb16">';
  h += '<div><b>Difficulty</b></div>';
  h += '<button class="btn'+(S.performDifficulty==="easy"?" btn-primary":"")+'" onclick="act(\'performDifficulty\',\'easy\')">Easy</button> ';
  h += '<button class="btn'+(S.performDifficulty==="normal"?" btn-primary":"")+'" onclick="act(\'performDifficulty\',\'normal\')">Normal</button> ';
  h += '<button class="btn'+(S.performDifficulty==="pro"?" btn-primary":"")+'" onclick="act(\'performDifficulty\',\'pro\')">Pro</button>';
  h += '</div>';

  h += '<div class="card mb16">';
  h += '<button class="btn btn-primary" onclick="act(\'performStart\')">Start Performance</button> ';
  h += '<button class="btn" onclick="act(\'back\')">Back</button>';
  h += '</div>';

  return h;
}
