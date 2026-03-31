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
      if(evt._result==='miss') cls += ' perform-event-miss';
      else if(evt._result) cls += ' perform-event-hit';

      h += '<div class="'+cls+'" style="top:'+Math.round(y)+'px">';
      h += '<div class="perform-event-label">'+escHTML(evt.performance && evt.performance.laneLabel || evt.target && evt.target.chordShort || "Chord")+'</div>';
      h += '</div>';
    }

    h += '</div>';
    return h;
  }

  window.renderPerformanceHighway = renderPerformanceHighway;

})();
