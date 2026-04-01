/* ───────── PianoSpark Desktop – feedback.js ───────── */
/* Beta tester feedback collection — renderer-side */

(function(){

  function feedbackPage(){
    var h = '<div class="card">';
    h += '<div><b>Send Feedback</b></div>';
    h += '<textarea oninput="S.feedbackDraft.text=this.value" placeholder="What worked? What broke?"></textarea>';
    h += '<button onclick="act(\'exportFeedback\')">Export Feedback</button>';
    h += '</div>';
    return h;
  }

  async function exportFeedbackDesktopAware(){
    var payload = {
      exportedAt: Date.now(),
      version: typeof getReleaseVersion === "function" ? getReleaseVersion() : "dev",
      channel: typeof getReleaseChannel === "function" ? getReleaseChannel() : "dev",
      feedback: S.feedbackDraft || {}
    };
    if(isDesktopBuild()){
      return await window.sparkDesktop.saveJson(payload);
    }
    return false;
  }

  window.feedbackPage = feedbackPage;
  window.exportFeedbackDesktopAware = exportFeedbackDesktopAware;

})();
