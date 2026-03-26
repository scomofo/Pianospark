<p align="center">
  <img src="https://img.shields.io/badge/JavaScript-Vanilla-f7df1e?style=flat-square&logo=javascript" />
  <img src="https://img.shields.io/badge/Electron-Ready-47848f?style=flat-square&logo=electron" />
  <img src="https://img.shields.io/badge/Platform-Multi-blueviolet?style=flat-square" />
</p>

# PianoSpark

> Piano and keyboard learning app with interactive lessons, practice tracking, and song library

---

### Highlights

| Feature | Description |
|:--------|:------------|
| **Interactive Piano** | On-screen keyboard with key highlighting and audio feedback |
| **Chord Library** | Piano chords with inversions, voicings, and audio playback |
| **Practice Sessions** | Timed practice with progress tracking |
| **Song Library** | Play along with songs using chord progressions |
| **Guided Lessons** | Step-by-step lessons from basics to advanced |
| **Progress Tracking** | Track practice time, accuracy, and streaks |
| **Content Sync** | Shared content system with ChordSpark (guitar companion app) |

---

### Tech Stack

```
Language        Vanilla JavaScript
Desktop         Electron (with preload bridge)
Audio           Web Audio API
Storage         localStorage
Content         JSON-based lesson and song data
Python          Optional integration for content sync
```

### Quick Start

```bash
npm install
npm start                      # Electron desktop app
# or open index.html in browser
```

### Project Structure

```
pianospark/
  index.html                   # Main app entry
  js/
    app.js                     # App coordinator
    audio.js                   # Audio engine
    data.js                    # Content database
    state.js                   # State management
    ui.js                      # UI rendering
    pages/
      songs.js                 # Song library and playback
  data/
    pianospark_content.json    # Lesson and song content
  styles.css                   # App styling
  main.js                      # Electron main process
  preload.js                   # Electron preload bridge
```

### Sister App

PianoSpark shares a content sync system with **[ChordSpark](https://github.com/scomofo/chordspark)** (guitar learning). Both apps use the same lesson format and can sync content.

---

*Built by Scott Morley*
