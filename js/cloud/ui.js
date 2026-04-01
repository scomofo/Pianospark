/* ───────── PianoSpark – cloud/ui.js ───────── */
/* Cloud sync settings page */
(function(){

  function cloudSettingsPage(){
    var h = '<div class="card">';
    h += '<div><b>Cloud Sync</b></div>';
    if(isLoggedInSpark()){
      h += '<div>Signed in as: ' + String(S.cloudAuth.email || "").replace(/</g,"&lt;") + '</div>';
      h += '<div>Status: ' + String(S.cloudSync.lastSyncStatus || "idle").replace(/</g,"&lt;") + '</div>';
      if(S.cloudSync.lastSyncAt){
        h += '<div>Last sync: ' + new Date(S.cloudSync.lastSyncAt).toLocaleString() + '</div>';
      }
      h += '<button onclick="act(\'cloudPull\')">Pull Cloud Save</button> ';
      h += '<button onclick="act(\'cloudSync\')">Sync Now</button> ';
      h += '<button onclick="act(\'cloudLogout\')">Logout</button>';
    }else{
      h += '<div>Not signed in</div>';
      h += '<button onclick="act(\'cloudLoginPrompt\')">Login</button>';
    }
    h += '</div>';
    return h;
  }

  window.cloudSettingsPage = cloudSettingsPage;

})();
