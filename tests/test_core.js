// ===== PianoSpark Core Tests =====
// Run: node tests/test_core.js

var assert = require('assert');
var passed = 0;
var failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('  PASS: ' + name);
  } catch (e) {
    failed++;
    console.error('  FAIL: ' + name);
    console.error('    ' + e.message);
  }
}

// ===== Load source files =====
var fs = require('fs');
var path = require('path');

function loadJS(file) {
  var code = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  code = code.replace(/\bconst\b/g, 'var');
  code = code.replace(/\blet\b/g, 'var');
  code = code.replace(/window\.\w+/g, '({})');
  code = code.replace(/navigator\.\w+/g, 'undefined');
  code = code.replace(/localStorage\.\w+/g, '""');
  return code;
}

// Minimal globals
global.AudioContext = null;
global.webkitAudioContext = null;
global.performance = { now: function() { return Date.now(); } };
global.document = {
  createElement: function(tag) {
    var _text = '';
    return {
      set textContent(v) { _text = String(v); },
      get innerHTML() {
        return _text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      }
    };
  }
};
global.setTimeout = setTimeout;
global.clearTimeout = clearTimeout;
global.setInterval = setInterval;
global.clearInterval = clearInterval;
global.speechSynthesis = null;
global.fetch = function() { return Promise.reject('no fetch'); };
global.requestAnimationFrame = function() {};
global.cancelAnimationFrame = function() {};

// Load data.js
eval(loadJS('js/data.js'));

// Stubs
global.saveState = function() {};
global.playSound = function() {};
global.showToast = function() {};
global.render = function() {};
global.showConfetti = function() {};

// Load state.js (partial - just the state object)
eval(loadJS('js/state.js'));

// Load ui.js
eval(loadJS('js/ui.js'));

// Reset state for tests
function resetTestState() {
  S.xp = 0; S.streak = 0; S.sessions = 0; S.level = 1; S.earned = [];
  S.chordProg = {}; S.history = []; S.customSets = []; S.songsDone = [];
  S.drillsDone = 0; S.dailiesDone = 0; S.quizCorrect = 0;
  S.currentSession = 1; S.completedSessions = []; S.jackpotsHit = 0;
  S.personalBests = { bpm:0, streak:0, sessionsInRow:0, longestSession:0 };
  S.onboardingComplete = false; S.transitionStats = {};
  S.detecting = false; S.detectedNotes = [];
}

// ===== Tests: escHTML =====
console.log('\n--- escHTML ---');

test('escapes angle brackets', function() {
  assert.strictEqual(escHTML('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;');
});

test('handles normal text', function() {
  assert.strictEqual(escHTML('C Major'), 'C Major');
});

// ===== Tests: Note helpers =====
console.log('\n--- Note helpers ---');

test('midiToNote returns correct note', function() {
  assert.strictEqual(midiToNote(60), 'C');
  assert.strictEqual(midiToNote(69), 'A');
  assert.strictEqual(midiToNote(64), 'E');
});

test('midiToOctave returns correct octave', function() {
  assert.strictEqual(midiToOctave(60), 4);
  assert.strictEqual(midiToOctave(48), 3);
  assert.strictEqual(midiToOctave(72), 5);
});

test('midiToFreq returns 440 for A4', function() {
  assert.strictEqual(midiToFreq(69), 440);
});

test('noteToMidi converts correctly', function() {
  assert.strictEqual(noteToMidi('C', 4), 60);
  assert.strictEqual(noteToMidi('A', 4), 69);
});

test('noteToMidi handles flats', function() {
  assert.strictEqual(noteToMidi('Bb', 3), 58);
  assert.strictEqual(noteToMidi('Eb', 4), 63);
});

test('noteToMidi returns -1 for invalid note', function() {
  assert.strictEqual(noteToMidi('Z', 4), -1);
});

// ===== Tests: CURRICULUM array =====
console.log('\n--- CURRICULUM ---');

test('CURRICULUM has 8 levels', function() {
  assert.strictEqual(CURRICULUM.length, 8);
});

test('each CURRICULUM entry has required fields', function() {
  CURRICULUM.forEach(function(c) {
    assert.ok(c.num, 'missing num');
    assert.ok(c.title, 'missing title');
    assert.ok(c.sub, 'missing sub');
    assert.ok(c.icon, 'missing icon');
    assert.ok(c.sessions, 'missing sessions for level ' + c.num);
    assert.ok(Array.isArray(c.chords), 'chords not array for level ' + c.num);
    assert.ok(c.desc, 'missing desc for level ' + c.num);
    assert.ok(Array.isArray(c.songs), 'songs not array for level ' + c.num);
    assert.ok(c.lhPattern, 'missing lhPattern for level ' + c.num);
    assert.ok(Array.isArray(c.transitions), 'transitions not array for level ' + c.num);
  });
});

test('CURRICULUM levels are numbered 1-8', function() {
  CURRICULUM.forEach(function(c, i) {
    assert.strictEqual(c.num, i + 1);
  });
});

test('CURRICULUM sessions span 1-50', function() {
  var first = CURRICULUM[0].sessions.split("-");
  assert.strictEqual(parseInt(first[0]), 1);
  var last = CURRICULUM[7].sessions.split("-");
  assert.strictEqual(parseInt(last[1]), 50);
});

// ===== Tests: Chord definitions =====
console.log('\n--- Chord definitions ---');

test('CHORDS object has entries', function() {
  assert.ok(Object.keys(CHORDS).length > 0);
});

test('each chord has required fields', function() {
  allChords().forEach(function(c) {
    assert.ok(c.name, c.short + ' missing name');
    assert.ok(c.short, 'missing short name');
    assert.ok(c.type, c.short + ' missing type');
    assert.ok(typeof c.level === 'number', c.short + ' missing level');
    assert.ok(c.color, c.short + ' missing color');
    assert.ok(c.rootPosition, c.short + ' missing rootPosition');
    assert.ok(Array.isArray(c.rootPosition.midi), c.short + ' rootPosition.midi not array');
    assert.ok(Array.isArray(c.rootPosition.notes), c.short + ' rootPosition.notes not array');
    assert.ok(Array.isArray(c.rootPosition.fingers_rh), c.short + ' rootPosition.fingers_rh not array');
    assert.ok(typeof c.bassMidi === 'number', c.short + ' missing bassMidi');
  });
});

test('chord inversions exist', function() {
  var c = findChord('C');
  assert.ok(c.rootPosition, 'C missing rootPosition');
  assert.ok(c.firstInversion, 'C missing firstInversion');
  assert.ok(c.secondInversion, 'C missing secondInversion');
});

test('voice leading data exists for C', function() {
  var c = findChord('C');
  assert.ok(c.voiceLeadTo, 'C missing voiceLeadTo');
  assert.ok(c.voiceLeadTo['F'], 'C missing voiceLeadTo.F');
  assert.ok(c.voiceLeadTo['Am'], 'C missing voiceLeadTo.Am');
});

test('CHORD_NOTES populated for all chords', function() {
  allChords().forEach(function(c) {
    assert.ok(CHORD_NOTES[c.short], 'Missing CHORD_NOTES for ' + c.short);
    assert.ok(CHORD_NOTES[c.short].length > 0, 'Empty CHORD_NOTES for ' + c.short);
  });
});

test('findChord returns correct chord', function() {
  var c = findChord('C');
  assert.ok(c);
  assert.strictEqual(c.name, 'C Major');
});

test('findChord returns null for invalid', function() {
  assert.strictEqual(findChord('XYZ'), null);
});

test('no duplicate chord short names', function() {
  var shorts = allChords().map(function(c) { return c.short; });
  var unique = {};
  shorts.forEach(function(s) { unique[s] = true; });
  assert.strictEqual(shorts.length, Object.keys(unique).length, 'Duplicate short names found');
});

test('chordsForLevel returns correct chords', function() {
  var lvl1 = chordsForLevel(1);
  assert.ok(lvl1.length > 0, 'Level 1 has no chords');
  lvl1.forEach(function(c) { assert.strictEqual(c.level, 1); });
});

test('chordsUpToLevel accumulates', function() {
  var upto1 = chordsUpToLevel(1);
  var upto2 = chordsUpToLevel(2);
  assert.ok(upto2.length >= upto1.length, 'Level 2 should have >= level 1 chords');
});

// ===== Tests: SESSION_PLANS =====
console.log('\n--- SESSION_PLANS ---');

test('SESSION_PLANS has 50 sessions', function() {
  assert.strictEqual(SESSION_PLANS.length, 50);
});

test('sessions are numbered 1-50', function() {
  SESSION_PLANS.forEach(function(s, i) {
    assert.strictEqual(s.num, i + 1, 'Session ' + (i+1) + ' has wrong num: ' + s.num);
  });
});

test('each session has required fields', function() {
  SESSION_PLANS.forEach(function(s) {
    assert.ok(s.title, 'Session ' + s.num + ' missing title');
    assert.ok(typeof s.level === 'number', 'Session ' + s.num + ' missing level');
    assert.ok(s.spark, 'Session ' + s.num + ' missing spark');
    assert.ok(s.spark.text, 'Session ' + s.num + ' missing spark.text');
    assert.ok(s.newMove, 'Session ' + s.num + ' missing newMove');
    assert.ok(s.songSlice, 'Session ' + s.num + ' missing songSlice');
    assert.ok(s.victoryLap, 'Session ' + s.num + ' missing victoryLap');
    assert.ok(typeof s.bpm === 'number', 'Session ' + s.num + ' missing bpm');
    assert.ok(s.ifThen, 'Session ' + s.num + ' missing ifThen');
  });
});

test('session 1 has no review', function() {
  assert.strictEqual(SESSION_PLANS[0].review, null);
});

test('sessions 2+ have review', function() {
  for (var i = 1; i < SESSION_PLANS.length; i++) {
    assert.ok(SESSION_PLANS[i].review, 'Session ' + (i+1) + ' missing review');
  }
});

test('newMove chords are findable', function() {
  SESSION_PLANS.forEach(function(s) {
    if (s.newMove && s.newMove.chord) {
      assert.ok(findChord(s.newMove.chord), 'Session ' + s.num + ' references unknown chord: ' + s.newMove.chord);
    }
  });
});

// ===== Tests: LH_PATTERNS =====
console.log('\n--- LH_PATTERNS ---');

test('LH_PATTERNS has 7 levels', function() {
  assert.strictEqual(LH_PATTERNS.length, 7);
});

test('LH patterns have valid structure', function() {
  LH_PATTERNS.forEach(function(p) {
    assert.ok(p.id, 'missing id');
    assert.ok(p.name, 'missing name');
    assert.ok(Array.isArray(p.pattern), p.id + ' pattern not array');
    assert.ok(Array.isArray(p.bpmRange), p.id + ' bpmRange not array');
    assert.strictEqual(p.bpmRange.length, 2, p.id + ' bpmRange should have 2 values');
    assert.ok(typeof p.unlockAt === 'number', p.id + ' missing unlockAt');
  });
});

test('LH pattern IDs are R1-R7', function() {
  LH_PATTERNS.forEach(function(p, i) {
    assert.strictEqual(p.id, 'R' + (i + 1));
  });
});

// ===== Tests: REWARD_PHASES =====
console.log('\n--- REWARD_PHASES ---');

test('REWARD_PHASES has 4 phases', function() {
  assert.strictEqual(REWARD_PHASES.length, 4);
});

test('reward phases cover sessions 1-50', function() {
  assert.strictEqual(REWARD_PHASES[0].sessions[0], 1);
  // Last phase should go past 50 or to 50
  var last = REWARD_PHASES[REWARD_PHASES.length - 1];
  assert.ok(last.sessions[1] >= 50, 'Last phase should cover session 50');
});

test('getRewardPhase returns correct phase', function() {
  var p1 = getRewardPhase(1);
  assert.strictEqual(p1.schedule, 'continuous');
  var p2 = getRewardPhase(10);
  assert.strictEqual(p2.schedule, 'VR-2-3');
  var p3 = getRewardPhase(20);
  assert.strictEqual(p3.schedule, 'VR-5-8');
  var p4 = getRewardPhase(40);
  assert.strictEqual(p4.schedule, 'intrinsic');
});

// ===== Tests: Songs =====
console.log('\n--- Songs ---');

test('all songs have required fields', function() {
  SONGS.forEach(function(s) {
    assert.ok(s.title, 'missing title');
    assert.ok(s.artist, 'missing artist');
    assert.ok(Array.isArray(s.chords), s.title + ' chords not array');
    assert.ok(Array.isArray(s.progression), s.title + ' progression not array');
    assert.ok(s.bpm > 0, s.title + ' invalid bpm');
    assert.ok(s.level >= 1 && s.level <= 8, s.title + ' invalid level');
  });
});

test('all song chords are findable', function() {
  var missing = [];
  SONGS.forEach(function(s) {
    s.chords.forEach(function(c) {
      if (!findChord(c)) missing.push(s.title + ': ' + c);
    });
  });
  assert.strictEqual(missing.length, 0, 'Songs reference unknown chords: ' + missing.join(', '));
});

test('all progression chords exist in song chord list', function() {
  SONGS.forEach(function(s) {
    s.progression.forEach(function(c) {
      assert.ok(s.chords.indexOf(c) >= 0, s.title + ': progression chord "' + c + '" not in chords list');
    });
  });
});

test('at least 25 songs', function() {
  assert.ok(SONGS.length >= 25, 'Expected 25+ songs, got ' + SONGS.length);
});

// ===== Tests: Badges =====
console.log('\n--- Badges ---');

test('at least 15 badges', function() {
  assert.ok(BADGES.length >= 15, 'Expected 15+ badges, got ' + BADGES.length);
});

test('checkBadges awards first_chord', function() {
  resetTestState();
  S.sessions = 1;
  S.completedSessions = [1];
  checkBadges();
  assert.ok(S.earned.indexOf('first_chord') >= 0);
});

test('checkBadges does not duplicate', function() {
  resetTestState();
  S.earned = ['first_chord'];
  S.sessions = 1;
  S.completedSessions = [1];
  checkBadges();
  assert.strictEqual(S.earned.filter(function(b) { return b === 'first_chord'; }).length, 1);
});

test('checkBadges awards level badges', function() {
  resetTestState();
  S.level = 5;
  checkBadges();
  assert.ok(S.earned.indexOf('level_2') >= 0);
  assert.ok(S.earned.indexOf('level_5') >= 0);
});

// ===== Tests: Chord tiers =====
console.log('\n--- Chord tiers ---');

test('getChordTier returns correct tiers', function() {
  assert.strictEqual(getChordTier(0).tier, 'none');
  assert.strictEqual(getChordTier(25).tier, 'bronze');
  assert.strictEqual(getChordTier(50).tier, 'silver');
  assert.strictEqual(getChordTier(75).tier, 'gold');
  assert.strictEqual(getChordTier(100).tier, 'gold');
});

// ===== Tests: Transition tips =====
console.log('\n--- Transition tips ---');

test('transition tips exist', function() {
  assert.ok(Object.keys(TRANSITION_TIPS).length > 0);
  assert.ok(TRANSITION_TIPS['C_Am']);
  assert.ok(TRANSITION_TIPS['C_F']);
});

// ===== Tests: Scales =====
console.log('\n--- Scales ---');

test('scales have valid MIDI notes', function() {
  for (var name in SCALES) {
    var scale = SCALES[name];
    assert.ok(Array.isArray(scale.notes), name + ' notes not array');
    scale.notes.forEach(function(n) {
      assert.ok(n >= 0 && n < 128, name + ' has invalid MIDI note ' + n);
    });
  }
});

// ===== Tests: Onboarding / Placement =====
console.log('\n--- Onboarding ---');

test('PLACEMENT_TESTS has entries', function() {
  assert.ok(PLACEMENT_TESTS.length > 0);
});

test('KEYBOARD_SIZES has entries', function() {
  assert.ok(KEYBOARD_SIZES.length >= 5);
});

test('STYLE_PREFS has entries', function() {
  assert.ok(STYLE_PREFS.length >= 5);
});

// ===== Tests: State migration =====
console.log('\n--- State migration ---');

test('migrateOldState sets currentSession', function() {
  resetTestState();
  migrateOldState({ level: 2, xp: 100, streak: 3 });
  assert.ok(S.currentSession > 0);
  assert.strictEqual(S.xp, 100);
  assert.strictEqual(S.streak, 3);
  assert.strictEqual(S.onboardingComplete, true);
});

// ===== Tests: Level helpers =====
console.log('\n--- Level helpers ---');

test('levelForSession returns correct level', function() {
  assert.strictEqual(levelForSession(1), 1);
  assert.strictEqual(levelForSession(3), 1);
  assert.strictEqual(levelForSession(4), 2);
  assert.strictEqual(levelForSession(9), 3);
  assert.strictEqual(levelForSession(15), 4);
  assert.strictEqual(levelForSession(43), 8);
});

test('getCurrentSessionPlan returns plan', function() {
  S.currentSession = 5;
  var plan = getCurrentSessionPlan();
  assert.ok(plan);
  assert.strictEqual(plan.num, 5);
  assert.strictEqual(plan.title, 'The G Chord (Smooth Slide)');
});

// ===== Tests: Play styles =====
console.log('\n--- Play styles ---');

test('play styles have valid patterns', function() {
  PLAY_STYLES.forEach(function(ps) {
    assert.ok(ps.name, 'missing name');
    assert.ok(ps.id, 'missing id');
    assert.ok(Array.isArray(ps.pattern), ps.id + ' pattern not array');
    assert.ok(ps.bpm > 0, ps.id + ' invalid bpm');
  });
});

// ===== Tests: Daily types =====
console.log('\n--- Daily types ---');

test('daily types have valid structure', function() {
  DAILY_TYPES.forEach(function(dt) {
    assert.ok(dt.id, 'missing id');
    assert.ok(dt.name, 'missing name');
    assert.ok(dt.dur > 0, dt.id + ' invalid duration');
  });
});

// ===== Tests: Finger exercises =====
console.log('\n--- Finger exercises ---');

test('FINGER_EXERCISES has entries', function() {
  assert.ok(FINGER_EXERCISES.length >= 14, 'Expected 14+ exercises, got ' + FINGER_EXERCISES.length);
});

test('all finger exercises have required fields', function() {
  FINGER_EXERCISES.forEach(function(ex) {
    assert.ok(ex.id, 'missing id');
    assert.ok(ex.name, ex.id + ' missing name');
    assert.ok(ex.desc, ex.id + ' missing desc');
    assert.ok(typeof ex.tier === 'number', ex.id + ' missing tier');
    assert.ok(ex.tier >= 1 && ex.tier <= 4, ex.id + ' invalid tier: ' + ex.tier);
    assert.ok(typeof ex.duration === 'number', ex.id + ' missing duration');
    assert.ok(ex.frequency, ex.id + ' missing frequency');
    assert.ok(Array.isArray(ex.sessionRange), ex.id + ' sessionRange not array');
    assert.strictEqual(ex.sessionRange.length, 2, ex.id + ' sessionRange should have 2 values');
    assert.ok(typeof ex.offInstrument === 'boolean', ex.id + ' missing offInstrument');
  });
});

test('exercise IDs are unique', function() {
  var ids = {};
  FINGER_EXERCISES.forEach(function(ex) { ids[ex.id] = (ids[ex.id] || 0) + 1; });
  for (var id in ids) {
    assert.strictEqual(ids[id], 1, 'Duplicate exercise ID: ' + id);
  }
});

test('exercise tiers cover 1-4', function() {
  for (var t = 1; t <= 4; t++) {
    var count = FINGER_EXERCISES.filter(function(ex) { return ex.tier === t; }).length;
    assert.ok(count >= 2, 'Tier ' + t + ' has too few exercises: ' + count);
  }
});

test('FINGER_BADGES has entries', function() {
  assert.ok(FINGER_BADGES.length >= 7, 'Expected 7+ finger badges, got ' + FINGER_BADGES.length);
});

test('finger badge IDs are unique', function() {
  var ids = {};
  FINGER_BADGES.forEach(function(b) { ids[b.id] = (ids[b.id] || 0) + 1; });
  for (var id in ids) {
    assert.strictEqual(ids[id], 1, 'Duplicate finger badge ID: ' + id);
  }
});

test('getAvailableExercises returns exercises for session 1', function() {
  var avail = getAvailableExercises(1);
  assert.ok(avail.length >= 3, 'Session 1 should have at least 3 exercises');
  // Should include Tier 1 off-instrument exercises
  var tier1 = avail.filter(function(ex) { return ex.tier === 1; });
  assert.ok(tier1.length >= 3, 'Session 1 should have at least 3 Tier 1 exercises');
});

test('getAvailableExercises returns more for session 10', function() {
  var avail1 = getAvailableExercises(1);
  var avail10 = getAvailableExercises(10);
  assert.ok(avail10.length > avail1.length, 'Session 10 should have more exercises than session 1');
});

test('getAvailableExercises returns all tiers for session 40', function() {
  var avail = getAvailableExercises(40);
  var tiers = {};
  avail.forEach(function(ex) { tiers[ex.tier] = true; });
  assert.ok(tiers[1], 'Session 40 should have Tier 1');
  assert.ok(tiers[4], 'Session 40 should have Tier 4');
});

test('getWarmUpExercise returns off-instrument exercise', function() {
  var warmUp = getWarmUpExercise(5);
  assert.ok(warmUp, 'Should return a warm-up exercise');
  assert.strictEqual(warmUp.tier, 1, 'Warm-up should be Tier 1');
  assert.strictEqual(warmUp.offInstrument, true, 'Warm-up should be off-instrument');
});

test('getSessionExercise returns exercise for integration point', function() {
  var ex = getSessionExercise(12, "victoryLap");
  assert.ok(ex, 'Should return Shape Drop for session 12 victoryLap');
  assert.strictEqual(ex.id, 'P-CHORD-1');
});

test('INJURY_TIPS has entries', function() {
  assert.ok(INJURY_TIPS.length >= 5);
});

// ===== Summary =====
console.log('\n' + '='.repeat(40));
console.log('Results: ' + passed + ' passed, ' + failed + ' failed');
console.log('='.repeat(40));
process.exit(failed > 0 ? 1 : 0);
