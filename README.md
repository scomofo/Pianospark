<p align="center">
  <img src="https://img.shields.io/badge/JavaScript-ES2024-f7df1e?style=for-the-badge&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/Electron-Desktop-47848f?style=for-the-badge&logo=electron&logoColor=white" />
  <img src="https://img.shields.io/badge/Web_Audio-API-ff6b6b?style=for-the-badge&logo=audiomack&logoColor=white" />
</p>

<h1 align="center">🎹 PianoSpark</h1>

<p align="center">
  <strong>Piano and keyboard learning app with interactive lessons, practice tracking, and song library</strong>
</p>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎼 Learn
- **Interactive Piano** &mdash; On-screen keyboard with highlights
- **Chord Library** &mdash; All chords with inversions and voicings
- **Guided Lessons** &mdash; Step-by-step from basics

</td>
<td width="50%">

### 🎯 Practice
- **Timed Sessions** &mdash; Practice with progress tracking
- **Song Library** &mdash; Play along with chord progressions
- **Streak Tracking** &mdash; Build consistency

</td>
</tr>
</table>

---

## 🚀 Quick Start

```bash
npm install
npm start          # 🖥️ Electron desktop app
```

Or open `index.html` in any browser for the web version.

## 📁 Structure

```
pianospark/
├── 📄 index.html              App entry point
├── 🎨 styles.css              Styling
├── js/
│   ├── app.js                 App coordinator
│   ├── audio.js               Audio engine
│   ├── data.js                Content database
│   ├── state.js               State management
│   ├── ui.js                  UI rendering
│   └── pages/
│       └── songs.js           Song library
├── data/
│   └── pianospark_content.json  Lessons & songs
├── main.js                    Electron main process
└── preload.js                 Electron bridge
```

## 🎸 Sister App

ChordSpark is the guitar companion &mdash; same lesson format, shared content sync.

**[ChordSpark &rarr;](https://github.com/scomofo/chordspark)**

---

<p align="center">
  <sub>Built by Scott Morley</sub>
</p>
