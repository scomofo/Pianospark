/* ───────── PianoSpark – state.js ───────── */
/* Expanded: curriculum tracking, stickiness, onboarding, reward engine */

var PERSIST = [
  "xp","streak","lastPractice","sessions","chordProg",
  "earned","level","history","dailyGoal","dailyPracticed",
  "quizCorrect","drillsDone","dailiesDone","songsDone",
  "darkMode","volume","customSets","practiceLen","tone",
  // New curriculum fields
  "currentSession","lhLevel","keyboardSize","stylePrefs",
  "onboardingComplete","practiceIntention","transitionStats",
  "focusMode","adaptiveBpm","personalBests","completedSessions",
  // Reward engine persistent fields
  "rewardPhase","totalActions","jackpotsHit",
  "actionsSinceReward","nextRewardAt",
  // Finger exercise fields
  "fingerStats","fingerExercisesDone","fingerDaysLogged","fingerBadges",
  // Settings that were previously missing
  "bpm","quizTotal",
  // MIDI
  "midiEnabled",
  // Audio
  "reverbAmount","metronomeSound","a4Tuning","pitchDetectionMode"
];

// Consolidated timer object (like ChordSpark's T)
var T = {
  session: null, drill: null, daily: null, song: null,
  metro: null, rhythm: null, runner: null, build: null,
  undo: null, reward: null, feedback: null, watch: null,
  shadow: null, sessionStep: null, prog: null,
  chordChange: null
};

var S = {
  // Navigation
  screen: SCR.HOME,
  tab: TAB.PRACTICE,

  // Progression
  xp: 0,
  streak: 0,
  lastPractice: null,
  sessions: 0,
  chordProg: {},   // { "C": 0..100, ... }
  earned: [],      // badge ids
  level: 1,
  history: [],     // [{ type, chord, ts, dur }]

  // Curriculum tracking (new)
  currentSession: 1,        // 1-50
  lhLevel: 1,               // 1-7 (rhythm level)
  completedSessions: [],     // [1,2,3,...] session nums
  transitionStats: {},       // { "C_F": { attempts:0, clean:0, avgMs:0 } }

  // Onboarding (new)
  onboardingComplete: false,
  onboardingStep: 0,        // 0-4 (5 screens)
  keyboardSize: 61,          // 88/76/61/49/25
  stylePrefs: [],            // ["Pop","Jazz",...]
  practiceIntention: "",     // "When I finish dinner, I will open PianoSpark"

  // Settings
  darkMode: false,
  volume: 0.7,
  practiceLen: 120,
  dailyGoal: 10,   // minutes
  dailyPracticed: 0, // seconds today
  bpm: 80,
  tone: "grand",
  metronomeSound: "sine",  // "sine" | "woodblock" | "clap" | "hihat"
  a4Tuning: 440,           // Hz, 432–446 range
  pitchDetectionMode: "fft", // "fft" | "yin"
  focusMode: false,
  midiEnabled: false,
  reverbAmount: 0.18,  // 0 = dry, 1 = fully wet

  // Adaptive difficulty (new)
  adaptiveBpm: 60,
  personalBests: { bpm:0, streak:0, sessionsInRow:0, longestSession:0 },

  // Reward engine state (new - stickiness #1 + #4)
  rewardPhase: 1,
  totalActions: 0,
  actionsSinceReward: 0,
  nextRewardAt: 1,          // randomized threshold
  jackpotPending: false,
  jackpotsHit: 0,
  surpriseQueue: [],

  // Guided session state (new)
  sessionStep: null,        // "spark"|"review"|"newMove"|"songSlice"|"victoryLap"
  newMovePhase: null,       // "watch"|"shadow"|"try"|"refine"
  sessionPlan: null,        // current SESSION_PLANS entry
  sessionTimer: 0,          // countdown for current step
  interleavedChords: [],    // older chords mixed into current session (stickiness #8)
  lastReviewChords: [],     // track what was reviewed recently

  // Delayed feedback (stickiness #5)
  feedbackDelay: false,
  feedbackTimer: null,
  feedbackMessage: "",

  // Finger exercise tracking
  fingerStats: {},          // { "P-OFF-1": { completions:0, lastDone:null, bestTrillSpeed:0 } }
  fingerExercisesDone: 0,   // total completions
  fingerDaysLogged: 0,      // days with at least one exercise
  fingerBadges: [],         // finger-specific badge ids
  fingerWarmUpDone: false,  // for current session
  chordChangeCount: 0,      // for 60-second challenge
  chordChangeTimer: 0,      // countdown
  chordChangeActive: false,
  chordChangePair: [],      // [chordA, chordB]

  // Legacy session state
  active: false,
  chord: null,
  timer: 0,
  paused: false,

  // Drill
  drillChords: [],
  drillIdx: 0,
  drillTimer: 0,
  drillActive: false,

  // Daily challenge
  dailyType: null,
  dailyTimer: 0,
  dailyActive: false,
  dailyScore: 0,
  dailiesDone: 0,

  // Quiz
  quizQ: null,
  quizAns: null,
  quizCorrect: 0,

  // Ear training
  earChord: null,
  earRevealed: false,

  // Songs
  songIdx: null,
  songPlaying: false,
  songChordIdx: 0,
  songSort: "level",
  songSortAsc: true,
  songFilter: "",
  // Stem Separation
  stemFile: null,
  stemStatus: "idle",
  stemProgress: 0,
  stemError: null,
  stemPaths: null,
  stemPlaying: false,
  stemVolume: 0.8,
  stemCurrentTime: 0,
  stemDuration: 0,
  stemToggles: { vocals:true, drums:true, bass:true, guitar:false, piano:false, other:false },

  // Play styles
  styleIdx: 0,

  // Rhythm game
  rhythmActive: false,
  rhythmScore: 0,
  rhythmCombo: 0,
  rhythmBeat: 0,

  // Runner game
  runnerActive: false,
  runnerScore: 0,
  runnerTarget: null,
  runnerLane: 1,

  // Build mode
  buildChords: [],
  buildPlaying: false,

  // Chord detection
  detecting: false,
  detectedNotes: [],

  // Custom practice sets
  customSets: [],

  // Stats
  drillsDone: 0,
  songsDone: [],
  quizTotal: 0,

  // Practice clips (session-only; object URLs don't survive reload)
  practiceClips: [],
};

// Debounced save — prevents localStorage thrashing on rapid actions
var _saveTimer = null;
function saveState(immediate) {
  if (immediate) { _doSave(); return; }
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(_doSave, 300);
}
function _doSave() {
  var obj = {};
  for (var i = 0; i < PERSIST.length; i++) {
    var k = PERSIST[i];
    obj[k] = S[k];
  }
  // Cap history
  if (obj.history && obj.history.length > 500)
    obj.history = obj.history.slice(-500);
  try { localStorage.setItem("pianospark_state", JSON.stringify(obj)); }
  catch(e) { console.error("PianoSpark: saveState failed", e); }
}

function loadState() {
  try {
    var raw = localStorage.getItem("pianospark_state");
    if (!raw) return;
    var obj = JSON.parse(raw);

    // Detect old format (level 1-3, no currentSession) and migrate
    if (obj.level !== undefined && obj.currentSession === undefined) {
      migrateOldState(obj);
      return;
    }

    // Type validation
    var typeChecks = {
      xp:"number", streak:"number", sessions:"number", level:"number",
      quizCorrect:"number", drillsDone:"number", dailiesDone:"number",
      darkMode:"boolean", volume:"number", practiceLen:"number",
      dailyGoal:"number", dailyPracticed:"number",
      currentSession:"number", lhLevel:"number", keyboardSize:"number",
      onboardingComplete:"boolean", focusMode:"boolean",
      adaptiveBpm:"number", rewardPhase:"number", totalActions:"number",
      jackpotsHit:"number",
      actionsSinceReward:"number", nextRewardAt:"number",
      bpm:"number", quizTotal:"number",
      fingerExercisesDone:"number", fingerDaysLogged:"number",
      midiEnabled:"boolean",
      reverbAmount:"number", a4Tuning:"number"
    };
    var arrayFields = ["earned","history","customSets","songsDone",
                       "completedSessions","stylePrefs","interleavedChords",
                       "lastReviewChords","surpriseQueue","fingerBadges"];
    var objectFields = ["chordProg","transitionStats","personalBests","fingerStats"];
    var stringFields = ["practiceIntention","tone","lastPractice","metronomeSound","pitchDetectionMode"];

    for (var i = 0; i < PERSIST.length; i++) {
      var k = PERSIST[i];
      if (obj[k] === undefined) continue;
      var val = obj[k];
      if (typeChecks[k] && typeof val !== typeChecks[k]) continue;
      if (arrayFields.indexOf(k) >= 0 && !Array.isArray(val)) continue;
      if (objectFields.indexOf(k) >= 0 && (typeof val !== "object" || val === null || Array.isArray(val))) continue;
      if (stringFields.indexOf(k) >= 0 && typeof val !== "string") continue;
      S[k] = val;
    }
  } catch(e) { console.error("PianoSpark: loadState failed — data may be corrupted", e); }

  // Init chord progress for all chords
  var all = allChords();
  for (var j = 0; j < all.length; j++) {
    if (S.chordProg[all[j].short] === undefined) S.chordProg[all[j].short] = 0;
  }
  // Ensure arrays
  if (!Array.isArray(S.earned)) S.earned = [];
  if (!Array.isArray(S.history)) S.history = [];
  if (!Array.isArray(S.customSets)) S.customSets = [];
  if (!Array.isArray(S.songsDone)) S.songsDone = [];
  if (!Array.isArray(S.completedSessions)) S.completedSessions = [];
  if (!Array.isArray(S.stylePrefs)) S.stylePrefs = [];
  // Ensure objects
  if (typeof S.transitionStats !== "object" || S.transitionStats === null) S.transitionStats = {};
  if (typeof S.personalBests !== "object" || S.personalBests === null) {
    S.personalBests = { bpm:0, streak:0, sessionsInRow:0, longestSession:0 };
  }
  // Ensure finger exercise state
  if (!Array.isArray(S.fingerBadges)) S.fingerBadges = [];
  if (typeof S.fingerStats !== "object" || S.fingerStats === null) S.fingerStats = {};

  checkStreak();
}

// Migrate from old 3-level format to new 8-level curriculum
function migrateOldState(obj) {
  // Map old level (1-3) to approximate session number
  var oldLevel = obj.level || 1;
  var sessionMap = { 1: 1, 2: 9, 3: 15 };
  S.currentSession = sessionMap[oldLevel] || 1;
  S.level = oldLevel <= 2 ? oldLevel : Math.min(oldLevel + 1, 4);

  // Carry over what we can
  if (typeof obj.xp === "number") S.xp = obj.xp;
  if (typeof obj.streak === "number") S.streak = obj.streak;
  if (typeof obj.sessions === "number") S.sessions = obj.sessions;
  if (typeof obj.volume === "number") S.volume = obj.volume;
  if (typeof obj.darkMode === "boolean") S.darkMode = obj.darkMode;
  if (typeof obj.dailyGoal === "number") S.dailyGoal = obj.dailyGoal;
  if (typeof obj.dailyPracticed === "number") S.dailyPracticed = obj.dailyPracticed;
  if (typeof obj.quizCorrect === "number") S.quizCorrect = obj.quizCorrect;
  if (typeof obj.drillsDone === "number") S.drillsDone = obj.drillsDone;
  if (typeof obj.dailiesDone === "number") S.dailiesDone = obj.dailiesDone;
  if (typeof obj.practiceLen === "number") S.practiceLen = obj.practiceLen;
  if (obj.lastPractice) S.lastPractice = obj.lastPractice;
  if (Array.isArray(obj.earned)) S.earned = obj.earned;
  if (Array.isArray(obj.history)) S.history = obj.history;
  if (Array.isArray(obj.customSets)) S.customSets = obj.customSets;
  if (Array.isArray(obj.songsDone)) S.songsDone = obj.songsDone;
  if (obj.tone) S.tone = obj.tone;

  // Map old chord progress (old format used numeric level keys)
  if (obj.chordProg && typeof obj.chordProg === "object") {
    S.chordProg = obj.chordProg;
  }

  // Mark completed sessions based on old session count
  S.completedSessions = [];
  for (var i = 1; i < S.currentSession; i++) {
    S.completedSessions.push(i);
  }

  // Set onboarding as complete for migrated users
  S.onboardingComplete = true;

  // Set adaptive BPM from old BPM or default
  S.adaptiveBpm = 70;

  saveState();
}

function resetProgress() {
  var backup = {};
  for (var i = 0; i < PERSIST.length; i++) {
    var k = PERSIST[i];
    backup[k] = JSON.parse(JSON.stringify(S[k]));
  }
  try { localStorage.setItem("pianospark_undo", JSON.stringify(backup)); }
  catch(e) { console.error("PianoSpark: undo backup failed", e); }

  S.xp = 0; S.streak = 0; S.sessions = 0; S.level = 1;
  S.chordProg = {}; S.earned = []; S.history = [];
  S.quizCorrect = 0; S.drillsDone = 0; S.dailiesDone = 0;
  S.songsDone = []; S.dailyPracticed = 0;
  S.currentSession = 1; S.lhLevel = 1;
  S.completedSessions = []; S.transitionStats = {};
  S.onboardingComplete = false; S.onboardingStep = 0;
  S.practiceIntention = ""; S.stylePrefs = [];
  S.focusMode = false; S.adaptiveBpm = 60;
  S.personalBests = { bpm:0, streak:0, sessionsInRow:0, longestSession:0 };
  S.rewardPhase = 1; S.totalActions = 0;
  S.actionsSinceReward = 0; S.nextRewardAt = 1;
  S.jackpotsHit = 0; S.surpriseQueue = [];
  S.fingerStats = {}; S.fingerExercisesDone = 0;
  S.fingerDaysLogged = 0; S.fingerBadges = [];

  var all = allChords();
  for (var j = 0; j < all.length; j++) S.chordProg[all[j].short] = 0;

  // 5-second undo window
  S._undoBackup = backup;
  S._undoTimer = setTimeout(function() {
    S._undoBackup = null;
    try { localStorage.removeItem("pianospark_undo"); } catch(e) {}
    saveState();
  }, 5000);
}

function recoverFromCrash() {
  try {
    var raw = localStorage.getItem("pianospark_crash");
    if (!raw) return;
    var backup = JSON.parse(raw);
    for (var i = 0; i < PERSIST.length; i++) {
      var k = PERSIST[i];
      if (backup[k] !== undefined) S[k] = backup[k];
    }
    localStorage.removeItem("pianospark_crash");
    saveState(true);
  } catch(e) { console.error("PianoSpark: recoverFromCrash failed", e); }
}

function undoReset() {
  if (!S._undoBackup) return false;
  clearTimeout(S._undoTimer);
  for (var i = 0; i < PERSIST.length; i++) {
    var k = PERSIST[i];
    if (S._undoBackup[k] !== undefined) S[k] = S._undoBackup[k];
  }
  S._undoBackup = null;
  try { localStorage.removeItem("pianospark_undo"); } catch(e) {}
  saveState(true);
  return true;
}

function exportState() {
  var obj = {};
  for (var i = 0; i < PERSIST.length; i++) obj[PERSIST[i]] = S[PERSIST[i]];
  var json = JSON.stringify(obj, null, 2);
  var blob = new Blob([json], { type: "application/json" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = "pianospark_export.json";
  a.click();
  URL.revokeObjectURL(url);
}

function autoExportForJeeves() {
  var obj = {};
  for (var i = 0; i < PERSIST.length; i++) obj[PERSIST[i]] = S[PERSIST[i]];
  try {
    localStorage.setItem("pianospark_jeeves_export", JSON.stringify(obj));
  } catch(e) { console.error("PianoSpark: Jeeves export failed", e); }
}

function checkStreak() {
  if (!S.lastPractice) return;
  var last = new Date(S.lastPractice);
  var now = new Date();
  var diffDays = Math.floor((now - last) / 86400000);
  if (diffDays > 1) S.streak = 0;
}

function checkPracticeDate() {
  var today = new Date().toDateString();
  if (S.lastPractice !== today) {
    var yesterday = new Date(Date.now() - 86400000).toDateString();
    if (S.lastPractice === yesterday) {
      S.streak++;
    } else if (S.lastPractice) {
      // Returning after absence - check for comeback badge
      var last = new Date(S.lastPractice);
      var now = new Date();
      var daysSince = Math.floor((now - last) / 86400000);
      if (daysSince >= 3 && S.earned.indexOf("comeback") < 0) {
        S.earned.push("comeback");
      }
      S.streak = 1;
    } else {
      S.streak = 1;
    }
    S.dailyPracticed = 0;
  }
  S.lastPractice = today;
  // Update personal best streak
  if (S.streak > S.personalBests.streak) {
    S.personalBests.streak = S.streak;
  }
  saveState();
}

function addPracticeSecond() {
  S.dailyPracticed++;
  if (S.dailyPracticed % 60 === 0) saveState();
}

function addXP(n) {
  S.xp += n;
  saveState();
}

function addHistory(type, detail) {
  var entry = { type: type, ts: Date.now() };
  if (detail.chord !== undefined) entry.chord = detail.chord;
  if (detail.dur !== undefined) entry.dur = detail.dur;
  if (detail.chords !== undefined) entry.chords = detail.chords;
  if (detail.score !== undefined) entry.score = detail.score;
  if (detail.session !== undefined) entry.session = detail.session;
  S.history.push(entry);
  saveState();
}

// Get current session plan
function getCurrentSessionPlan() {
  if (S.currentSession < 1 || S.currentSession > SESSION_PLANS.length) return null;
  return SESSION_PLANS[S.currentSession - 1];
}

// Get current curriculum level object
function getCurrentLevel() {
  for (var i = 0; i < CURRICULUM.length; i++) {
    if (CURRICULUM[i].num === S.level) return CURRICULUM[i];
  }
  return CURRICULUM[0];
}

// Calculate level from session number
function levelForSession(sessionNum) {
  for (var i = 0; i < CURRICULUM.length; i++) {
    var parts = CURRICULUM[i].sessions.split("-");
    var start = parseInt(parts[0]);
    var end = parseInt(parts[1]);
    if (sessionNum >= start && sessionNum <= end) return CURRICULUM[i].num;
  }
  return 8;
}

// Update transition stats
function recordTransition(fromChord, toChord, wasClean, timeMs) {
  var key = fromChord + "_" + toChord;
  if (!S.transitionStats[key]) {
    S.transitionStats[key] = { attempts: 0, clean: 0, avgMs: 0 };
  }
  var stat = S.transitionStats[key];
  stat.attempts++;
  if (wasClean) stat.clean++;
  stat.avgMs = Math.round((stat.avgMs * (stat.attempts - 1) + timeMs) / stat.attempts);
  saveState();
}
