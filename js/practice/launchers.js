(function(){

  function launchPracticePlanItem(item){
    if(!item) return;

    if(item.type==="warmup" || item.type==="finger"){
      act("tab", TAB.PRACTICE);
      return;
    }

    if(item.type==="transition"){
      act("tab", TAB.PRACTICE);
      return;
    }

    if(item.type==="performance_song"){
      if(item.meta && item.meta.songId){
        for(var i=0;i<SONGS.length;i++){
          var sid = (SONGS[i].title||"").toLowerCase().replace(/\s+/g,"_");
          if(sid===item.meta.songId){
            act("open_perform_song", ""+i);
            return;
          }
        }
      }
      act("tab", TAB.SONGS);
      return;
    }

    if(item.type==="left_hand_pattern"){
      act("tab", TAB.PRACTICE);
      return;
    }

    act("tab", TAB.PRACTICE);
  }

  window.launchPracticePlanItem = launchPracticePlanItem;

})();
