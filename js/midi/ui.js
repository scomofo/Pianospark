/* ───────── PianoSpark – midi/ui.js ───────── */
/* MIDI settings page / device + profile management UI */
(function(){

  function escHTMLSafe(str){
    return String(str||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }

  function midiSettingsPage(){
    var h = '<div class="card">';
    h += '<div><b>MIDI Settings</b></div>';
    h += '<div>Active Device: ' + escHTMLSafe((getActiveMidiDevice() && getActiveMidiDevice().name) || "None") + '</div>';
    h += '<div>Active Profile: ' + escHTMLSafe((getActiveMidiProfile() && getActiveMidiProfile().name) || "None") + '</div>';
    h += '<button onclick="refreshMidiDevices()">Refresh Devices</button> ';
    h += '<button onclick="act(\'createDefaultPianoProfile\')">New Piano Profile</button> ';
    h += '<button onclick="act(\'createDefaultGuitarProfile\')">New Guitar Profile</button>';
    h += '</div>';

    h += '<div class="card">';
    h += '<div><b>Available Devices</b></div>';
    var devs = S.midiDevices || [];
    for(var i=0;i<devs.length;i++){
      h += '<div>';
      h += escHTMLSafe(devs[i].name) + ' ';
      h += '<button onclick="act(\'setMidiDevice\', \''+escHTMLSafe(devs[i].id)+'\')">Use</button>';
      h += '</div>';
    }
    if(!devs.length) h += '<div>No devices found</div>';
    h += '</div>';

    h += '<div class="card">';
    h += '<div><b>Profiles</b></div>';
    var profiles = S.midiProfiles || {};
    for(var pid in profiles){
      var p = profiles[pid];
      var isActive = pid === S.activeMidiProfileId;
      h += '<div>';
      h += escHTMLSafe(p.name) + ' (' + escHTMLSafe(p.type) + ')';
      if(isActive) h += ' <b>[active]</b>';
      else h += ' <button onclick="act(\'setMidiProfile\', \''+escHTMLSafe(pid)+'\')">Activate</button>';
      h += '</div>';
    }
    h += '</div>';

    return h;
  }

  window.midiSettingsPage = midiSettingsPage;

})();
