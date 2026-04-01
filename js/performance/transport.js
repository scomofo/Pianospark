(function(){
  var PerformanceTransport = {
    _playing:false,
    _startedPerfMs:0,
    _offsetSec:0,
    _pausedSec:0,
    _speed:1,
    _audioSource:null,

    start:function(fromSec,speed){
      this._offsetSec = fromSec || 0;
      this._pausedSec = this._offsetSec;
      this._speed = speed || 1;
      this._startedPerfMs = performance.now();
      this._playing = true;
    },
    pause:function(){
      if(!this._playing) return;
      this._pausedSec = this.now();
      this._playing = false;
    },
    resume:function(){
      this._offsetSec = this._pausedSec || 0;
      this._startedPerfMs = performance.now();
      this._playing = true;
    },
    stop:function(){
      this._playing = false;
      this._pausedSec = 0;
      this._offsetSec = 0;
      this._audioSource = null;
    },
    setSpeed:function(speed){
      var now = this.now();
      this._speed = speed || 1;
      this._offsetSec = now;
      this._startedPerfMs = performance.now();
      if (typeof setStemPlaybackRate === "function") {
        setStemPlaybackRate(speed);
      }
    },
    seek:function(sec){
      this._offsetSec = sec || 0;
      this._pausedSec = this._offsetSec;
      this._startedPerfMs = performance.now();
    },
    setAudioSource:function(audioEl){
      this._audioSource = audioEl;
    },
    now:function(){
      if(this._audioSource && !this._audioSource.paused && !this._audioSource.ended){
        return this._audioSource.currentTime;
      }
      if(this._playing){
        return this._offsetSec + ((performance.now() - this._startedPerfMs)/1000) * this._speed;
      }
      return this._pausedSec || 0;
    },
    isPlaying:function(){ return this._playing; }
  };

  window.PerformanceTransport = PerformanceTransport;
})();
