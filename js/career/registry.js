/* PianoSpark – career/registry.js */
/* Career content registry for tiers, stages, songs */
(function(){
  window.SparkCareer = {
    careers: {},
    tiers: {},
    stages: {},
    songs: {}
  };

  function registerCareerContent(type, items){
    if(!SparkCareer[type]) SparkCareer[type] = {};
    for(var i=0;i<items.length;i++){
      SparkCareer[type][items[i].id] = items[i];
    }
  }

  function getCareerItem(type, id){
    return SparkCareer[type] ? SparkCareer[type][id] : null;
  }

  // Register default PianoSpark career
  registerCareerContent("careers", [{
    id: "career_main",
    title: "Piano Career",
    tiers: ["tier_block_chords","tier_lh_basics","tier_melody","tier_two_hand","tier_progressions","tier_song_performance"]
  }]);

  registerCareerContent("tiers", [
    { id: "tier_block_chords", title: "Block Chords", stages: ["stage_block_intro"] },
    { id: "tier_lh_basics", title: "Left Hand Basics", stages: ["stage_lh_patterns"] },
    { id: "tier_melody", title: "Melody Basics", stages: ["stage_melody_intro"] },
    { id: "tier_two_hand", title: "Two Hand Coordination", stages: ["stage_two_hand_intro"] },
    { id: "tier_progressions", title: "Chord Progressions", stages: ["stage_prog_intro"] },
    { id: "tier_song_performance", title: "Song Performance", stages: ["stage_songs_intro"] }
  ]);

  registerCareerContent("stages", [
    { id: "stage_block_intro", title: "Block Chords Introduction", songs: ["song_block_easy_1","song_block_easy_2"], unlockRequirement: { previousStageCompleted: false } },
    { id: "stage_lh_patterns", title: "Left Hand Patterns", songs: ["song_lh_easy_1"], unlockRequirement: { previousStageCompleted: true } },
    { id: "stage_melody_intro", title: "Melody Introduction", songs: ["song_melody_easy_1"], unlockRequirement: { previousStageCompleted: true } },
    { id: "stage_two_hand_intro", title: "Two Hands Together", songs: ["song_twohand_1"], unlockRequirement: { previousStageCompleted: true } },
    { id: "stage_prog_intro", title: "Progressions Introduction", songs: ["song_prog_1"], unlockRequirement: { previousStageCompleted: true } },
    { id: "stage_songs_intro", title: "Song Performance", songs: ["song_perform_1"], unlockRequirement: { previousStageCompleted: true } }
  ]);

  registerCareerContent("songs", [
    { id: "song_block_easy_1", title: "Block Chord Basics", arrangements: ["block_chords"], minimumStarsToClear: 2, rewards: { xp: 60, unlockSongs: ["song_block_easy_2"] } },
    { id: "song_block_easy_2", title: "Block Chord Flow", arrangements: ["block_chords"], minimumStarsToClear: 2, rewards: { xp: 80, unlockSongs: [] } },
    { id: "song_lh_easy_1", title: "Left Hand Groove", arrangements: ["left_hand"], minimumStarsToClear: 2, rewards: { xp: 80, unlockSongs: [] } },
    { id: "song_melody_easy_1", title: "Simple Melody", arrangements: ["melody"], minimumStarsToClear: 2, rewards: { xp: 80, unlockSongs: [] } },
    { id: "song_twohand_1", title: "Two Hands Together", arrangements: ["full"], minimumStarsToClear: 2, rewards: { xp: 100, unlockSongs: [] } },
    { id: "song_prog_1", title: "Progression Practice", arrangements: ["block_chords"], minimumStarsToClear: 2, rewards: { xp: 100, unlockSongs: [] } },
    { id: "song_perform_1", title: "First Performance", arrangements: ["full"], minimumStarsToClear: 2, rewards: { xp: 120, unlockSongs: [] } }
  ]);

  window.registerCareerContent = registerCareerContent;
  window.getCareerItem = getCareerItem;
})();
