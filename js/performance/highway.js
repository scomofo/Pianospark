(function(){

  var _sparkHighway = null;

  function ensureSparkHighway(canvasEl) {
    if (_sparkHighway && _sparkHighway.canvas === canvasEl) return _sparkHighway;
    if (_sparkHighway) _sparkHighway.destroy();
    _sparkHighway = new SparkHighway(canvasEl, SparkHighway.PIANO_SKIN);
    return _sparkHighway;
  }

  function renderPerformanceHighway(chart, nowSec) {
    return '<div class="perform-highway" style="padding:0;border:none;background:transparent">' +
      '<canvas id="spark-highway-canvas" style="width:100%;height:100%;display:block"></canvas>' +
      '</div>';
  }

  window.renderPerformanceHighway = renderPerformanceHighway;
  window._ensurePianoHighway = ensureSparkHighway;
  window._destroyPianoHighway = function() {
    if (_sparkHighway) { _sparkHighway.destroy(); _sparkHighway = null; }
  };

})();
