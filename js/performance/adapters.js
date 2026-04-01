(function(){

  function buildPerformanceChartFromSong(song, arrangementType){
    arrangementType = arrangementType || "block_chords";
    if(arrangementType==="left_hand_patterns"){
      return buildLeftHandPatternChartFromSong(song);
    }
    if(arrangementType==="melody"){
      return buildMelodyChartFromSong(song);
    }
    return buildBlockChordChartFromSong(song);
  }

  function buildBlockChordChartFromSong(song){
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

  // ── LH Pattern builder ──

  function getCurrentLHPattern(){
    if(typeof LH_PATTERNS==="undefined" || !Array.isArray(LH_PATTERNS) || !LH_PATTERNS.length) return null;
    var targetId = "R" + (S.lhLevel || 1);
    for(var i=0;i<LH_PATTERNS.length;i++){
      if(LH_PATTERNS[i].id===targetId) return LH_PATTERNS[i];
    }
    return LH_PATTERNS[0];
  }

  function resolveLHPatternMidi(chord, role){
    if(!chord) return null;

    var root = chord.bassMidi || null;
    var rootPos = chord.rootPosition && chord.rootPosition.midi ? chord.rootPosition.midi.slice() : [];
    if(!rootPos.length && root==null) return null;

    var fifth = rootPos.length >= 3 ? rootPos[2] - 12 : null;
    var third = rootPos.length >= 2 ? rootPos[1] - 12 : null;

    if(role==="root") return root;
    if(role==="fifth") return fifth!=null ? fifth : root;
    if(role==="third") return third!=null ? third : root;
    if(role==="octave") return root!=null ? root + 12 : null;
    if(role==="step2" || role==="step3" || role==="step4") return root;

    return root;
  }

  function buildLeftHandPatternChartFromSong(song, patternId){
    if(!song) return null;

    var pattern = null;
    if(patternId){
      for(var i=0;i<LH_PATTERNS.length;i++){
        if(LH_PATTERNS[i].id===patternId){ pattern = LH_PATTERNS[i]; break; }
      }
    }
    if(!pattern) pattern = getCurrentLHPattern();
    if(!pattern) return null;

    var bpm = song.bpm || 80;
    var beatDur = 60 / bpm;
    var barDur = beatDur * 4;
    var phraseBars = 4;
    var events = [];
    var phrases = [];

    for(var bar=0; bar<(song.progression||[]).length; bar++){
      var shortName = song.progression[bar];
      var chord = findChord(shortName);
      if(!chord) continue;

      var barStart = bar * barDur;
      var phraseId = Math.floor(bar / phraseBars);

      for(var p=0; p<pattern.pattern.length; p++){
        var step = pattern.pattern[p];
        var midi = resolveLHPatternMidi(chord, step.note);
        if(midi==null) continue;

        events.push({
          id: events.length + 1,
          t: barStart + ((step.beat - 1) * beatDur),
          dur: (step.hold || 1) * beatDur,
          type: "lh_note",
          target: {
            midi: midi,
            note: midiToNote(midi) + midiToOctave(midi),
            pitchClass: midiToNote(midi),
            chordShort: chord.short,
            patternId: pattern.id,
            role: step.note
          },
          hand: "LH",
          performance: {
            laneLabel: chord.short + " " + step.note,
            phraseId: phraseId
          }
        });
      }
    }

    for(var phrase=0; phrase<Math.ceil((song.progression||[]).length / phraseBars); phrase++){
      phrases.push({
        id: phrase,
        name: "Phrase " + (phrase + 1),
        startSec: phrase * phraseBars * barDur,
        endSec: Math.min((phrase + 1) * phraseBars * barDur, (song.progression||[]).length * barDur)
      });
    }

    return {
      id: "song_" + normalizeSongId(song) + "_lh_" + pattern.id,
      songId: normalizeSongId(song),
      title: song.title || "Song",
      artist: song.artist || "",
      bpm: bpm,
      arrangementType: "left_hand_patterns",
      patternId: pattern.id,
      phrases: phrases,
      events: events
    };
  }

  function normalizeSongId(song){
    return (song.title || "song").toLowerCase().replace(/\s+/g,"_");
  }

  // ── Melody / single-note builder ──
  // Generates a simplified melody line from chord top notes.
  // If the song has a .melody array, use that directly;
  // otherwise derive from the chord's highest note (top-note line).

  function buildMelodyChartFromSong(song){
    if(!song) return null;

    var bpm = song.bpm || 80;
    var beatDur = 60 / bpm;
    var barDur = beatDur * 2;
    var events = [];
    var phrases = [];
    var phraseBars = 4;

    // If song has explicit melody data, use it
    if(Array.isArray(song.melody) && song.melody.length){
      for(var i=0;i<song.melody.length;i++){
        var m = song.melody[i];
        var midi = typeof m.midi === "number" ? m.midi : (typeof m.note === "string" ? noteNameToMidi(m.note) : 60);
        events.push({
          id: i+1,
          t: m.t != null ? m.t : i * (beatDur * (m.beats || 1)),
          dur: m.dur != null ? m.dur : beatDur * (m.beats || 1),
          type: "single_note",
          target: {
            midi: midi,
            note: midiToNote(midi) + midiToOctave(midi),
            pitchClass: midiToNote(midi)
          },
          hand: "RH",
          performance: {
            laneLabel: midiToNote(midi) + midiToOctave(midi),
            phraseId: Math.floor(i / (phraseBars * 2))
          }
        });
      }
    } else {
      // Derive melody from chord top notes (simplified top-note line)
      for(var j=0;j<(song.progression||[]).length;j++){
        var shortName = song.progression[j];
        var chord = findChord(shortName);
        if(!chord) continue;

        var rootPos = (chord.rootPosition && chord.rootPosition.midi) ? chord.rootPosition.midi : [];
        if(!rootPos.length) continue;

        // Use highest note of chord as melody note
        var topMidi = rootPos[rootPos.length - 1];

        // Two melody notes per bar (on beats 1 and 2)
        for(var beat=0; beat<2; beat++){
          var noteMidi = beat === 0 ? topMidi : rootPos[Math.max(0, rootPos.length - 2)];
          events.push({
            id: events.length + 1,
            t: j * barDur + beat * beatDur,
            dur: beatDur,
            type: "single_note",
            target: {
              midi: noteMidi,
              note: midiToNote(noteMidi) + midiToOctave(noteMidi),
              pitchClass: midiToNote(noteMidi)
            },
            hand: "RH",
            performance: {
              laneLabel: midiToNote(noteMidi) + midiToOctave(noteMidi),
              phraseId: Math.floor(j / phraseBars)
            }
          });
        }
      }
    }

    // Build phrases
    var totalBars = Array.isArray(song.melody) ? Math.ceil(events.length / (phraseBars * 2)) : (song.progression||[]).length;
    var totalPhrases = Math.ceil(totalBars / phraseBars);
    for(var p=0; p<totalPhrases; p++){
      phrases.push({
        id: p,
        name: "Phrase " + (p + 1),
        startSec: p * phraseBars * barDur,
        endSec: Math.min((p + 1) * phraseBars * barDur, events.length ? (events[events.length-1].t + (events[events.length-1].dur||0)) : 0)
      });
    }

    return {
      id: "song_" + normalizeSongId(song) + "_melody",
      songId: normalizeSongId(song),
      title: song.title || "Song",
      artist: song.artist || "",
      bpm: bpm,
      arrangementType: "melody",
      phrases: phrases,
      events: events
    };
  }

  // Helper: convert note name like "C4" to MIDI number
  function noteNameToMidi(name){
    if(!name || typeof name !== "string") return 60;
    var match = name.match(/^([A-Ga-g][#b]?)(\d+)$/);
    if(!match) return 60;
    var note = match[1].toUpperCase();
    var octave = parseInt(match[2], 10);
    var idx = NOTE_NAMES.indexOf(note);
    if(idx < 0) idx = FLAT_NAMES.indexOf(note);
    if(idx < 0) return 60;
    return (octave + 1) * 12 + idx;
  }

  window.buildPerformanceChartFromSong = buildPerformanceChartFromSong;
  window.buildBlockChordChartFromSong = buildBlockChordChartFromSong;
  window.buildLeftHandPatternChartFromSong = buildLeftHandPatternChartFromSong;
  window.buildMelodyChartFromSong = buildMelodyChartFromSong;
  window.getCurrentLHPattern = getCurrentLHPattern;
  window.resolveLHPatternMidi = resolveLHPatternMidi;
  window.normalizeSongId = normalizeSongId;
  window.noteNameToMidi = noteNameToMidi;

})();
