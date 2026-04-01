/* ───────── PianoSpark – audio/calibration.js ───────── */
/* Calibration screen and controls */

function calibrationPage(){
  var h = '<div class="card">';
  h += '<div><b>Latency Calibration</b></div>';
  h += '<div>Play a key exactly on each click.</div>';
  h += '<button onclick="startCalibration()">Start Calibration</button> ';
  h += '<button onclick="stopCalibration()">Stop</button>';
  h += '<div>Detected Latency: '+Math.round(S.inputLatencyMs)+' ms</div>';
  h += '<div>Samples: '+(S.calibrationOffsets||[]).length+' / 20</div>';
  h += '</div>';
  return h;
}

function startCalibration(){
  S.calibrationOffsets = [];
  startMetronome(80);
}

function stopCalibration(){
  stopMetronome();
  saveState();
}
