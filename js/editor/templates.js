/* ───────── PianoSpark – editor/templates.js ───────── */
/* Content templates for rhythm, piano LH patterns, and chord progressions */

(function(){

  var Templates = {
    rhythm:[
      { name:"8th Strum", pattern:["D","D","U","U","D","U"] },
      { name:"Waltz", pattern:["D","-","D","U","D","U"] },
      { name:"Ballad", pattern:["D","-","D","-","D","U"] }
    ],
    pianoLH:[
      { name:"1-5-8", notes:["C2","G2","C3"] },
      { name:"Alberti", notes:["C2","G2","E2","G2"] },
      { name:"Broken Chord", notes:["C2","E2","G2","E2"] },
      { name:"Octave Pulse", notes:["C2","C3"] },
      { name:"Walking Bass", notes:["C2","D2","E2","F2"] }
    ],
    chordProgressions:[
      { name:"Pop I-V-vi-IV", chords:["C","G","Am","F"] },
      { name:"12-Bar Blues", chords:["C","C","C","C","F","F","C","C","G","F","C","G"] },
      { name:"Jazz ii-V-I", chords:["Dm7","G7","Cmaj7"] }
    ]
  };

  function findTemplate(type, name){
    var arr = Templates[type] || [];
    for(var i=0;i<arr.length;i++){
      if(arr[i].name === name) return arr[i];
    }
    return null;
  }

  function applyRhythmTemplate(templateName, startBar){
    var t = findTemplate("rhythm", templateName);
    if(!t) return;
    if(typeof generateRhythmEvents === "function"){
      generateRhythmEvents(t.pattern, startBar);
    }
  }

  function applyLHPatternTemplate(templateName, startBar){
    var t = findTemplate("pianoLH", templateName);
    if(!t) return;
    if(typeof generateLHEvents === "function"){
      generateLHEvents(t.notes, startBar);
    }
  }

  function applyChordProgressionTemplate(templateName, startBar){
    var t = findTemplate("chordProgressions", templateName);
    if(!t) return;
    if(typeof generateChordBars === "function"){
      generateChordBars(t.chords, startBar);
    }
  }

  window.Templates = Templates;
  window.applyRhythmTemplate = applyRhythmTemplate;
  window.applyLHPatternTemplate = applyLHPatternTemplate;
  window.applyChordProgressionTemplate = applyChordProgressionTemplate;

})();
