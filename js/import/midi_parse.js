/* ───────── PianoSpark – import/midi_parse.js ───────── */
/* MIDI file parser: reads .mid/.midi files into raw parsed structure */
(function(){

  async function parseMidiFile(file){
    var buffer = await file.arrayBuffer();
    var parsed = parseMidiBuffer(buffer);
    return parsed;
  }

  /* Lightweight MIDI parser — handles Format 0 and 1 files */
  function parseMidiBuffer(buffer){
    var data = new Uint8Array(buffer);
    var pos = 0;

    function readStr(len){ var s=""; for(var i=0;i<len;i++) s+=String.fromCharCode(data[pos++]); return s; }
    function readU16(){ var v=(data[pos]<<8)|data[pos+1]; pos+=2; return v; }
    function readU32(){ var v=(data[pos]<<24)|(data[pos+1]<<16)|(data[pos+2]<<8)|data[pos+3]; pos+=4; return v>>>0; }
    function readVarLen(){ var v=0; var b; do{ b=data[pos++]; v=(v<<7)|(b&0x7f); }while(b&0x80); return v; }

    // Header
    var hdrTag = readStr(4);
    if(hdrTag !== "MThd") throw new Error("Not a MIDI file");
    var hdrLen = readU32();
    var format = readU16();
    var numTracks = readU16();
    var ppq = readU16();

    var header = { ppq: ppq, tempos: [], timeSignatures: [] };
    var tracks = [];

    for(var t=0; t<numTracks; t++){
      var trkTag = readStr(4);
      if(trkTag !== "MTrk"){ pos += readU32(); continue; }
      var trkLen = readU32();
      var trkEnd = pos + trkLen;
      var tick = 0;
      var status = 0;
      var notes = [];
      var pendingNotes = {}; // pitch -> { tick, velocity }
      var trackName = "";
      var trackChannel = null;

      while(pos < trkEnd){
        var delta = readVarLen();
        tick += delta;
        var b = data[pos];

        if(b & 0x80){ status = b; pos++; }
        // else running status

        var cmd = status & 0xf0;
        var ch = status & 0x0f;

        if(cmd === 0x90){ // Note On
          var pitch = data[pos++];
          var vel = data[pos++];
          if(trackChannel === null) trackChannel = ch;
          if(vel > 0){
            pendingNotes[pitch] = { tick: tick, velocity: vel/127 };
          } else {
            // vel=0 is Note Off
            if(pendingNotes[pitch]){
              notes.push({ midi: pitch, ticks: pendingNotes[pitch].tick, durationTicks: tick - pendingNotes[pitch].tick, velocity: pendingNotes[pitch].velocity, time:0, duration:0 });
              delete pendingNotes[pitch];
            }
          }
        } else if(cmd === 0x80){ // Note Off
          var pitch2 = data[pos++]; pos++; // velocity ignored
          if(pendingNotes[pitch2]){
            notes.push({ midi: pitch2, ticks: pendingNotes[pitch2].tick, durationTicks: tick - pendingNotes[pitch2].tick, velocity: pendingNotes[pitch2].velocity, time:0, duration:0 });
            delete pendingNotes[pitch2];
          }
        } else if(cmd === 0xA0 || cmd === 0xB0 || cmd === 0xE0){
          pos += 2;
        } else if(cmd === 0xC0 || cmd === 0xD0){
          pos += 1;
        } else if(status === 0xFF){ // Meta event
          var metaType = data[pos++];
          var metaLen = readVarLen();
          if(metaType === 0x03){ // Track name
            trackName = "";
            for(var mi=0;mi<metaLen;mi++) trackName += String.fromCharCode(data[pos+mi]);
          }
          if(metaType === 0x51 && metaLen === 3){ // Tempo
            var usPerBeat = (data[pos]<<16)|(data[pos+1]<<8)|data[pos+2];
            header.tempos.push({ ticks: tick, bpm: Math.round(60000000/usPerBeat) });
          }
          if(metaType === 0x58 && metaLen >= 2){ // Time signature
            header.timeSignatures.push({ ticks: tick, timeSignature: [data[pos], Math.pow(2, data[pos+1])] });
          }
          pos += metaLen;
        } else if(status === 0xF0 || status === 0xF7){ // SysEx
          var sysLen = readVarLen();
          pos += sysLen;
        } else {
          // Unknown, skip
          break;
        }
      }
      pos = trkEnd;

      // Resolve time in seconds using tempo map
      resolveNoteTimes(notes, header.tempos, ppq);

      tracks.push({
        name: trackName,
        channel: trackChannel,
        notes: notes
      });
    }

    return { header: header, tracks: tracks };
  }

  function resolveNoteTimes(notes, tempos, ppq){
    var bpm = 120;
    var tempoIdx = 0;
    var secPerTick = 60 / (bpm * ppq);
    var lastTick = 0;
    var lastSec = 0;

    // Sort notes by tick
    notes.sort(function(a,b){ return a.ticks - b.ticks; });

    // Build tempo timeline
    var tempoList = (tempos && tempos.length) ? tempos.slice().sort(function(a,b){ return a.ticks - b.ticks; }) : [{ ticks:0, bpm:120 }];

    function tickToSec(tick){
      var sec = 0;
      var prevTick = 0;
      var curBpm = 120;
      for(var i=0; i<tempoList.length; i++){
        if(tempoList[i].ticks >= tick) break;
        sec += (Math.min(tempoList[i].ticks, tick) - prevTick) * (60 / (curBpm * ppq));
        prevTick = tempoList[i].ticks;
        curBpm = tempoList[i].bpm;
      }
      sec += (tick - prevTick) * (60 / (curBpm * ppq));
      return sec;
    }

    for(var i=0; i<notes.length; i++){
      notes[i].time = tickToSec(notes[i].ticks);
      notes[i].duration = tickToSec(notes[i].ticks + notes[i].durationTicks) - notes[i].time;
    }
  }

  window.parseMidiFile = parseMidiFile;

})();
