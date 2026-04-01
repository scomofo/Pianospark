/* ───────── PianoSpark – desktop/bridge.js ───────── */
/* Desktop detection, native file dialogs, update checks, backup/export */
(function(){

  function isDesktopBuild() {
    return typeof window.sparkDesktop !== 'undefined';
  }

  async function exportEditorObjectDesktopAware() {
    if (!S.editorObject) return false;
    if (isDesktopBuild()) {
      var result = await window.sparkDesktop.saveJson(S.editorObject);
      return !!(result && result.ok);
    }
    return typeof exportEditorObject === "function" ? exportEditorObject() : false;
  }

  async function openImportFileDesktopAware() {
    if (!isDesktopBuild()) return false;
    var result = await window.sparkDesktop.openJson();
    if (!result || !result.ok) return false;
    return result;
  }

  async function checkForDesktopUpdates(){
    if(!isDesktopBuild() || !window.sparkDesktop.checkForUpdates) return false;
    S.desktopInfo.updateStatus = "checking";
    if(typeof render === "function") render();
    var result = await window.sparkDesktop.checkForUpdates();
    if(!result || !result.ok){
      S.desktopInfo.updateStatus = "error";
      saveState();
      return false;
    }
    S.desktopInfo.lastUpdateCheckAt = Date.now();
    S.desktopInfo.updateStatus = result.updateAvailable ? "available" : "none";
    S.desktopInfo.version = result.currentVersion || S.desktopInfo.version;
    S.desktopInfo.latestVersion = result.latestVersion || null;
    S.desktopInfo.updateNotes = result.notes || "";
    saveState();
    if(typeof render === "function") render();
    return true;
  }

  function buildFullLocalBackup(){
    return {
      exportedAt: Date.now(),
      app: (S.releaseInfo && S.releaseInfo.appId) || "pianospark",
      version: (S.releaseInfo && S.releaseInfo.version) || "dev",
      state: S
    };
  }

  async function exportFullBackupDesktopAware(){
    var payload = buildFullLocalBackup();
    if(isDesktopBuild()){
      var result = await window.sparkDesktop.saveJson(payload);
      if(result && result.ok){
        S.desktopInfo.lastBackupAt = Date.now();
        saveState();
        return true;
      }
      return false;
    }
    return false;
  }

  function showDebugTools(){
    return typeof isDevChannel === "function" && (isDevChannel() || isBetaChannel());
  }

  async function loadReleaseNotes(){
    try{
      var res = await fetch("release/changelog.json");
      S.releaseNotes = await res.json();
    }catch(e){
      S.releaseNotes = [];
    }
  }

  window.isDesktopBuild = isDesktopBuild;
  window.exportEditorObjectDesktopAware = exportEditorObjectDesktopAware;
  window.openImportFileDesktopAware = openImportFileDesktopAware;
  window.checkForDesktopUpdates = checkForDesktopUpdates;
  window.buildFullLocalBackup = buildFullLocalBackup;
  window.exportFullBackupDesktopAware = exportFullBackupDesktopAware;
  window.showDebugTools = showDebugTools;
  window.loadReleaseNotes = loadReleaseNotes;

})();
