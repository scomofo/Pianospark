(function(){
  var PerformanceInput = {
    heldMidiNotes:{},
    recentMidiNoteOns:[],
    latestPitchClasses:[],

    start:function(){
      this.reset();
    },
    stop:function(){
      this.reset();
    },
    reset:function(){
      this.heldMidiNotes = {};
      this.recentMidiNoteOns = [];
      this.latestPitchClasses = [];
    },
    onMidiMessage:function(event){
      if(!event || !event.data) return;
      var status = event.data[0] & 0xF0;
      var note = event.data[1];
      var velocity = event.data[2] || 0;
      var nowSec = PerformanceTransport.now();

      if(status===0x90 && velocity>0){
        this.heldMidiNotes[note] = true;
        this.recentMidiNoteOns.push({ note:note, tSec:nowSec });
      }else if(status===0x80 || (status===0x90 && velocity===0)){
        delete this.heldMidiNotes[note];
      }

      var pcs = [];
      for(var k in this.heldMidiNotes){
        pcs.push(midiToNote(parseInt(k,10)));
      }
      this.latestPitchClasses = dedupe(pcs);

      this.recentMidiNoteOns = this.recentMidiNoteOns.filter(function(n){
        return nowSec - n.tSec <= 2;
      });
    },
    getSnapshot:function(nowSec){
      return {
        pitchClasses:this.latestPitchClasses.slice(),
        heldMidiNotes:Object.keys(this.heldMidiNotes).map(function(n){ return parseInt(n,10); }),
        recentAttacks:this.recentMidiNoteOns.filter(function(n){ return nowSec - n.tSec <= 0.22; })
      };
    }
  };

  function dedupe(arr){
    var out = [];
    for(var i=0;i<arr.length;i++){
      if(out.indexOf(arr[i])<0) out.push(arr[i]);
    }
    return out;
  }

  window.PerformanceInput = PerformanceInput;
})();
