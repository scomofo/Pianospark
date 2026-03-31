(function(){

  function renderPerformanceHighway(chart, nowSec){
    if(!chart) return '<div class="card">Loading...</div>';

    var h = '<div class="perform-highway">';
    h += '<div class="perform-hitline"></div>';

    for(var i=0;i<chart.events.length;i++){
      var evt = chart.events[i];
      var y = PERFORMANCE_CONFIG.highway.hitLineTopPx + ((evt.t - nowSec) * S.performScrollSpeed);
      if(y < -80 || y > 700) continue;

      var cls = 'perform-event';
      if(evt.type==="lh_note") cls += ' perform-event-lh';
      else cls += ' perform-event-chord';

      if(evt._result==='miss') cls += ' perform-event-miss';
      else if(evt._result) cls += ' perform-event-hit';

      var label = evt.type==="lh_note"
        ? (evt.target && evt.target.note ? evt.target.note : "LH")
        : (evt.performance && evt.performance.laneLabel || evt.target && evt.target.chordShort || "Chord");

      h += '<div class="'+cls+'" style="top:'+Math.round(y)+'px">';
      h += '<div class="perform-event-label">'+escHTML(label)+'</div>';
      h += '</div>';
    }

    h += '</div>';
    return h;
  }

  window.renderPerformanceHighway = renderPerformanceHighway;

})();
