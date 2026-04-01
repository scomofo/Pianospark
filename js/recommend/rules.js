/* PianoSpark – recommend/rules.js */
/* Filtering and balancing for recommendation sets */
(function(){
  function filterRecommendationCandidates(candidates){
    var out = [];
    for(var i=0;i<candidates.length;i++){
      if(shouldKeepRecommendationCandidate(candidates[i])){
        out.push(candidates[i]);
      }
    }
    return out;
  }

  function shouldKeepRecommendationCandidate(candidate){
    if(!candidate || !candidate.id) return false;
    return true;
  }

  function balanceRecommendationSet(candidates, maxSuggestions){
    var out = [];
    var seenTypes = {};
    for(var i=0;i<candidates.length;i++){
      if(out.length >= maxSuggestions) break;
      if(!seenTypes[candidates[i].type] || candidates[i].type === "lesson"){
        out.push(candidates[i]);
        seenTypes[candidates[i].type] = true;
      }
    }
    for(var j=0;j<candidates.length && out.length < maxSuggestions;j++){
      if(out.indexOf(candidates[j]) < 0){
        out.push(candidates[j]);
      }
    }
    return out;
  }

  window.filterRecommendationCandidates = filterRecommendationCandidates;
  window.balanceRecommendationSet = balanceRecommendationSet;
})();
