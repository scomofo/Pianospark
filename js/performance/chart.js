(function(){
  function normalizePerformanceChart(chart){
    var c = JSON.parse(JSON.stringify(chart||{}));
    if(!Array.isArray(c.phrases)) c.phrases = [];
    if(!Array.isArray(c.events)) c.events = [];

    c.events.sort(function(a,b){ return (a.t||0) - (b.t||0); });

    for(var i=0;i<c.events.length;i++){
      var e = c.events[i];
      e._hit = false;
      e._miss = false;
      e._scored = false;
      e._result = null;
      e._score = 0;
    }

    c._durationSec = c.events.length ? (c.events[c.events.length-1].t + (c.events[c.events.length-1].dur||0)) : 0;
    return c;
  }

  function getPerformancePhraseForTime(chart, sec){
    if(!chart || !Array.isArray(chart.phrases)) return null;
    for(var i=0;i<chart.phrases.length;i++){
      var p = chart.phrases[i];
      if(sec >= p.startSec && sec < p.endSec) return p;
    }
    return null;
  }

  function getPerformancePhraseIndexForTime(chart, sec){
    var p = getPerformancePhraseForTime(chart, sec);
    return p ? p.id : -1;
  }

  window.normalizePerformanceChart = normalizePerformanceChart;
  window.getPerformancePhraseForTime = getPerformancePhraseForTime;
  window.getPerformancePhraseIndexForTime = getPerformancePhraseIndexForTime;
})();
