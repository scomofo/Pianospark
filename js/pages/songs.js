/* PianoSpark - Songs tab */

function songsTab() {
  var html = '';

  // Sub-tabs
  var subtabs = [
    { id:"library", label:"Library" },
    { id:"styles",  label:"Styles" },
    { id:"build",   label:"Builder" }
  ];

  if (!S._songTab) S._songTab = "library";
  html += '<div class="level-tabs">';
  subtabs.forEach(function(t) {
    var active = S._songTab === t.id ? " active" : "";
    html += '<div class="level-tab' + active + '" style="color:var(--accent)" onclick="S._songTab=\'' + t.id + '\';render()">' + t.label + '</div>';
  });
  html += '</div>';

  switch (S._songTab) {
    case "library": html += songLibrary(); break;
    case "styles":  html += stylesTab(); break;
    case "build":   html += buildTab(); break;
  }
  return html;
}

function songLibrary() {
  var html = '<div class="card"><h2>Song Library</h2>';

  if (S.songIdx !== null && SONGS[S.songIdx]) {
    var song = SONGS[S.songIdx];
    html += '<div class="song-detail">';
    html += '<h3>' + escHTML(song.title) + '</h3>';
    html += '<div class="text-muted">' + escHTML(song.artist) + ' \u2022 Level ' + song.level + '</div>';
    html += '<div class="song-chords">';
    song.chords.forEach(function(ch) {
      var chord = findChord(ch);
      if (chord) html += chordTypeTag(chord);
      else html += '<span class="song-chord-tag">' + escHTML(ch) + '</span>';
    });
    html += '</div>';

    // Progression display
    html += '<div class="progression">';
    song.progression.forEach(function(c, i) {
      var active = S.songPlaying && i === S.songChordIdx;
      html += '<span class="prog-chord ' + (active ? 'prog-active' : '') + '">' + escHTML(c) + '</span>';
    });
    html += '</div>';

    var currentChord = song.progression[S.songChordIdx];
    if (currentChord) html += pianoSVG(findChord(currentChord));

    html += '<div class="song-controls">';
    html += '<button class="btn btn-accent" onclick="act(\'play_song\')">' + (S.songPlaying ? "\u23F8 Pause" : "\u25B6 Play Along") + '</button>';
    html += '<label style="font-size:0.85rem">Tempo: ' + S.bpm + ' BPM</label>';
    html += '<input type="range" min="40" max="200" step="5" value="' + S.bpm + '" onchange="act(\'set_bpm\', this.value)" style="width:80px"/>';
    html += '<button class="btn btn-secondary" onclick="act(\'song_back\')">\u2190 Back</button>';
    html += '</div></div>';
  } else {
    // Song list grouped by level
    for (var l = 1; l <= 8; l++) {
      var lvlSongs = SONGS.filter(function(s) { return s.level === l; });
      if (!lvlSongs.length) continue;
      var locked = l > S.level + 1;
      html += '<h3 style="color:' + levelColor(l) + (locked ? ';opacity:0.4' : '') + '">' + CURRICULUM[l-1].icon + ' Level ' + l + '</h3>';
      html += '<div class="song-list">';
      lvlSongs.forEach(function(s) {
        var idx = SONGS.indexOf(s);
        var done = S.songsDone && S.songsDone.indexOf(s.title) >= 0;
        html += clickableDiv(
          locked ? '' : "act('select_song'," + idx + ")",
          '<div class="song-row-inner"><span>' + (done ? "\u2705 " : "") + escHTML(s.title) + '</span><span class="text-muted">' + escHTML(s.artist) + '</span></div>',
          "song-row" + (locked ? " locked" : "")
        );
      });
      html += '</div>';
    }
  }
  html += '</div>';
  return html;
}

// ── Playing Styles ──
function stylesTab() {
  var html = '<div class="card"><h2>Playing Styles</h2>';
  html += '<p>Learn different ways to play piano chords.</p>';

  PLAY_STYLES.forEach(function(ps, i) {
    var active = S.styleIdx === i;
    html += '<div class="style-card ' + (active ? 'active' : '') + '">';
    html += '<div class="style-header" onclick="act(\'select_style\',' + i + ')">';
    html += '<strong>' + ps.name + '</strong> <span class="level-tag">Lvl ' + ps.level + '</span>';
    html += '</div>';
    if (active) {
      html += '<p class="text-muted" style="padding:0 14px">' + ps.desc + '</p>';
      html += styleHTML(ps);
      html += '<div class="style-controls">';
      html += '<label>BPM: ' + S.bpm + '</label>';
      html += '<input type="range" min="40" max="200" value="' + S.bpm + '" onchange="act(\'set_bpm\', this.value)"/>';
      html += '<button class="btn btn-accent" onclick="act(\'play_style\')">\u{1F50A} Demo</button>';
      html += '<button class="btn" onclick="act(\'start_metronome\')">Metro</button>';
      html += '<button class="btn btn-secondary" onclick="act(\'stop_metronome\')">Stop</button>';
      html += '</div>';
    }
    html += '</div>';
  });
  html += '</div>';
  return html;
}

// ── Progression Builder ──
function buildTab() {
  var html = '<div class="card"><h2>Progression Builder</h2>';
  html += '<p>Create your own chord progressions.</p>';

  html += '<div class="build-chords">';
  S.buildChords.forEach(function(c, i) {
    html += '<span class="build-chip">' + escHTML(c) + '<button class="chip-remove" onclick="act(\'build_remove\',' + i + ')">\u2715</button></span>';
  });
  if (!S.buildChords.length) html += '<span class="text-muted">Add chords below</span>';
  html += '</div>';

  if (S.buildChords.length > 0) {
    html += '<div class="build-controls">';
    html += '<button class="btn btn-accent" onclick="act(\'build_play\')">' + (S.buildPlaying ? "\u23F8 Stop" : "\u25B6 Play") + '</button>';
    html += '<button class="btn btn-secondary" onclick="act(\'build_clear\')">Clear</button>';
    html += '</div>';
  }

  html += '<div class="build-palette">';
  var all = chordsUpToLevel(S.level);
  all.forEach(function(c) {
    html += '<button class="btn btn-sm chord-palette-btn" onclick="act(\'build_add\',\'' + c.short + '\')">' + escHTML(c.short) + '</button>';
  });
  html += '</div></div>';
  return html;
}
