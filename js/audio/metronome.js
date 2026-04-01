/* ───────── PianoSpark – audio/metronome.js ───────── */
/* Metronome for calibration and practice */

(function(){

  var metroInterval = null;
  var audioCtx = null;

  function getAudioContext(){
    if(!audioCtx){
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  function startMetronome(bpm){
    stopMetronome();
    var interval = (60 / bpm) * 1000;
    metroInterval = setInterval(playClick, interval);
  }

  function stopMetronome(){
    if(metroInterval){
      clearInterval(metroInterval);
      metroInterval = null;
    }
  }

  function playClick(){
    var ctx = getAudioContext();
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 1000;
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    osc.start(ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
    osc.stop(ctx.currentTime + 0.1);

    // Register click time for calibration
    if(typeof registerMetronomeClick === "function"){
      registerMetronomeClick();
    }
  }

  window.startMetronome = startMetronome;
  window.stopMetronome = stopMetronome;

})();
