/* PianoSpark – career/ui.js */
/* Career map / ladder screen */
function careerPage(){
  var h = '<div class="card">';
  h += '<div><b>Piano Career Mode</b></div>';
  var career = getCareerItem("careers", S.activeCareerId);
  if(!career){
    h += '<div>No career loaded.</div></div>';
    return h;
  }
  for(var t=0;t<career.tiers.length;t++){
    var tier = getCareerItem("tiers", career.tiers[t]);
    if(!tier) continue;
    var tierUnlocked = !!S.careerProgress.unlockedTiers[tier.id];
    h += '<div style="margin-top:16px;opacity:'+(tierUnlocked?1:0.5)+'"><b>'+escHTML(tier.title)+'</b></div>';
    for(var s=0;s<tier.stages.length;s++){
      var stage = getCareerItem("stages", tier.stages[s]);
      if(!stage) continue;
      var stageUnlocked = !!S.careerProgress.unlockedStages[stage.id];
      var stageComplete = !!S.careerProgress.stageCompletion[stage.id];
      h += '<div style="margin-left:12px;margin-top:8px">';
      h += '<div>'+escHTML(stage.title)+(stageComplete?' [Complete]':'')+'</div>';
      for(var i=0;i<(stage.songs || []).length;i++){
        var songId = stage.songs[i];
        var unlocked = isCareerSongUnlocked(songId);
        var songDef = getCareerItem("songs", songId);
        var title = songDef ? songDef.title : songId;
        var key = getCareerSongKey(songId, "default");
        var rating = S.careerProgress.songRatings[key];
        var starsStr = rating ? ' ['+rating.bestStars+' stars]' : '';
        h += '<div style="margin-left:12px;opacity:'+(unlocked?1:0.4)+'">';
        h += escHTML(title) + starsStr + ' ';
        if(unlocked){
          h += '<button onclick="act(\'openCareerSong\', \''+songId+'\')">Play</button>';
        }else{
          h += '<span>Locked</span>';
        }
        h += '</div>';
      }
      h += '</div>';
    }
  }
  h += '</div>';
  return h;
}
