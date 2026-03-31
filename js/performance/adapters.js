(function(){

  function buildPerformanceChartFromSong(song){
    if(!song) return null;

    var beatDur = 60 / (song.bpm || 80);
    var barDur = beatDur * 2;
    var events = [];
    var phrases = [];
    var phraseBars = 4;

    for(var i=0;i<(song.progression||[]).length;i++){
      var shortName = song.progression[i];
      var chord = findChord(shortName);
      if(!chord) continue;

      events.push({
        id:i+1,
        t:i * barDur,
        dur:barDur,
        type:"block_chord",
        target:{
          chordShort:chord.short,
          chordName:chord.name,
          midi:(chord.rootPosition && chord.rootPosition.midi) ? chord.rootPosition.midi.slice() : [],
          notes:(chord.rootPosition && chord.rootPosition.notes) ? chord.rootPosition.notes.slice() : []
        },
        hand:"RH",
        performance:{
          laneLabel:chord.short,
          phraseId:Math.floor(i / phraseBars)
        }
      });
    }

    for(var p=0;p<Math.ceil(events.length / phraseBars);p++){
      phrases.push({
        id:p,
        name:"Phrase " + (p+1),
        startSec:p * phraseBars * barDur,
        endSec:Math.min((p+1) * phraseBars * barDur, events.length * barDur)
      });
    }

    return {
      id:"song_" + normalizeSongId(song),
      songId:normalizeSongId(song),
      title:song.title || "Song",
      artist:song.artist || "",
      bpm:song.bpm || 80,
      arrangementType:"block_chords",
      phrases:phrases,
      events:events
    };
  }

  function normalizeSongId(song){
    return (song.title || "song").toLowerCase().replace(/\s+/g,"_");
  }

  window.buildPerformanceChartFromSong = buildPerformanceChartFromSong;
  window.normalizeSongId = normalizeSongId;

})();
