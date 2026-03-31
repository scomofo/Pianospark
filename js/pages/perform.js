function performPage(){
  var chart = S.performChart;
  var phrase = chart ? getPerformancePhraseForTime(chart, S.performCurrentSec) : null;
  var h = '<div class="card mb16">';
  h += '<h2>'+escHTML(chart ? chart.title : "Performance")+'</h2>';
  h += '<div class="muted">'+escHTML(chart ? chart.artist : "")+'</div>';
  h += '<div style="margin-top:8px">Phrase: '+escHTML(phrase ? phrase.name : "-")+'</div>';
  h += '<div>Score: '+S.performScore+' · Combo: '+S.performCombo+' · Accuracy: '+S.performAccuracy+'%</div>';
  h += '<div style="font-size:12px;color:var(--text-muted)">Held MIDI: '+(S.performInputMidi||[]).join(", ")+'</div>';
  h += '</div>';

  h += '<div class="card mb16">';
  h += '<button class="btn" onclick="act(\'pausePerform\')">Pause</button> ';
  h += '<button class="btn" onclick="act(\'resumePerform\')">Resume</button> ';
  h += '<button class="btn" onclick="act(\'stopPerform\')">Exit</button>';
  h += '</div>';

  h += renderPerformanceHighway(chart, S.performCurrentSec);
  return h;
}

function performDonePage(){
  var r = S.performResults || {};
  var best = getPerformanceBest(r.songId, r.arrangementType || "block_chords", r.difficultyId || "normal");
  var mastery = getPerformanceMasteryLabel(best);

  var h = '<div class="card mb16">';
  h += '<h2>Performance Complete</h2>';
  h += '<div class="muted">'+escHTML(r.title || "")+'</div>';
  h += '<div>Score: '+(r.score||0)+'</div>';
  h += '<div>Accuracy: '+(r.accuracy||0)+'%</div>';
  h += '<div>Stars: '+(r.stars||0)+'</div>';
  h += '<div>Max Combo: '+(r.maxCombo||0)+'</div>';
  h += '<div>Mastery: '+escHTML(mastery)+'</div>';
  h += '</div>';

  h += '<div class="card mb16">';
  h += '<button class="btn" onclick="act(\'performRetry\')">Retry</button> ';
  h += '<button class="btn" onclick="act(\'stopPerform\')">Back to Songs</button>';
  h += '</div>';

  return h;
}
