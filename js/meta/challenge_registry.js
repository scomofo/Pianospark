/* PianoSpark – meta/challenge_registry.js */
/* Registry for challenge definitions, seasonal events, and pack rewards */
(function(){
  window.SparkChallenges = {
    definitions: {},
    seasonalEvents: {},
    packRewards: {}
  };

  function registerChallengeDefinitions(items){
    for(var i=0;i<items.length;i++){
      SparkChallenges.definitions[items[i].id] = items[i];
    }
  }

  function registerSeasonalEvents(items){
    for(var i=0;i<items.length;i++){
      SparkChallenges.seasonalEvents[items[i].id] = items[i];
    }
  }

  function registerPackRewards(items){
    for(var i=0;i<items.length;i++){
      SparkChallenges.packRewards[items[i].id] = items[i];
    }
  }

  function getChallengeDefinition(id){
    return SparkChallenges.definitions[id] || null;
  }

  function getSeasonalEvent(id){
    return SparkChallenges.seasonalEvents[id] || null;
  }

  function getPackReward(id){
    return SparkChallenges.packRewards[id] || null;
  }

  // Register default PianoSpark seasonal events
  registerSeasonalEvents([{
    id: "event_spring_practice_2026",
    title: "Spring Practice Event",
    startsAt: 1770000000000,
    endsAt: 1772500000000,
    challenges: [
      { id: "spring_song_1", title: "Clear 3 Songs", category: "seasonal", type: "complete_song", target: 3, rewards: { xp: 100, skillPoints: 0, unlockIds: [] } },
      { id: "spring_practice_1", title: "Practice 60 Minutes", category: "seasonal", type: "practice_minutes", target: 60, rewards: { xp: 80, skillPoints: 0, unlockIds: [] } }
    ],
    rewards: { xp: 300, skillPoints: 1 }
  }]);

  // Register default pack rewards for PianoSpark
  registerPackRewards([
    { id: "pack_beginner_piano_01", xp: 250, skillPoints: 1, achievementId: "complete_beginner_piano_pack" },
    { id: "pack_block_chords_01", xp: 200, skillPoints: 1, achievementId: "complete_block_chords_pack" },
    { id: "pack_left_hand_01", xp: 250, skillPoints: 1, achievementId: "complete_lh_pack" }
  ]);

  window.registerChallengeDefinitions = registerChallengeDefinitions;
  window.registerSeasonalEvents = registerSeasonalEvents;
  window.registerPackRewards = registerPackRewards;
  window.getChallengeDefinition = getChallengeDefinition;
  window.getSeasonalEvent = getSeasonalEvent;
  window.getPackReward = getPackReward;
})();
