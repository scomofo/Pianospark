/* ───────── PianoSpark Desktop – channels.js ───────── */
/* Release channel management (dev/beta/stable) — renderer-side */

(function(){

  function getReleaseChannel(){
    return (S.desktopInfo && S.desktopInfo.channel) || "dev";
  }

  function setReleaseChannel(channel){
    if(!S.desktopInfo) S.desktopInfo = {};
    S.desktopInfo.channel = channel || "dev";
    saveState();
  }

  function isDevChannel(){
    return getReleaseChannel() === "dev";
  }

  function isBetaChannel(){
    return getReleaseChannel() === "beta";
  }

  function isStableChannel(){
    return getReleaseChannel() === "stable";
  }

  window.getReleaseChannel = getReleaseChannel;
  window.setReleaseChannel = setReleaseChannel;
  window.isDevChannel = isDevChannel;
  window.isBetaChannel = isBetaChannel;
  window.isStableChannel = isStableChannel;

})();
