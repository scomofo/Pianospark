/* PianoSpark – settings/settings_ui.js */
/* Settings page renderer */
function settingsPage(){
  var h = '<div class="card mb16">';
  h += '<div><b>Settings</b></div>';
  h += '</div>';

  // Theme
  h += '<div class="card mb16">';
  h += '<div><b>Display / Theme</b></div>';
  var theme = getSetting("theme") || "dark";
  var themes = ["dark","light","blue","high_contrast"];
  for(var i=0;i<themes.length;i++){
    var sel = theme === themes[i] ? "opacity:1;font-weight:bold" : "opacity:0.6";
    h += '<button style="margin:4px;'+sel+'" onclick="setSetting(\'theme\',\''+themes[i]+'\');render()">'+escHTML(themes[i])+'</button>';
  }
  h += '</div>';

  // Audio
  h += '<div class="card mb16">';
  h += '<div><b>Audio / MIDI</b></div>';
  h += '<div>MIDI: '+(S.midiEnabled ? 'Enabled' : 'Disabled')+'</div>';
  h += '<div>Latency: '+S.audioLatencyMs+'ms</div>';
  h += '<button onclick="act(\'openCalibration\')">Calibrate</button>';
  h += '</div>';

  // Practice
  h += '<div class="card mb16">';
  h += '<div><b>Practice</b></div>';
  h += '<div>Daily goal: '+S.dailyGoal+' min</div>';
  h += '<div>Auto-adjust difficulty: '+(getSetting("difficultyAutoAdjust") !== false ? 'On' : 'Off')+'</div>';
  h += '</div>';

  // Profile / Onboarding
  h += '<div class="card mb16">';
  h += '<div><b>Profile</b></div>';
  h += '<button onclick="act(\'openOnboarding\')">Rerun Setup</button>';
  h += '</div>';

  // About
  h += '<div class="card mb16">';
  h += '<div><b>About</b></div>';
  h += '<div>PianoSpark</div>';
  h += '<div>Version: '+((S.releaseInfo && S.releaseInfo.version) || "dev")+'</div>';
  h += '</div>';

  return h;
}
