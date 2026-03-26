import os
import json

# Define the full project structure and file contents
project_files = {
    "sync_content.py": """import json
import os

class VisualDebugger:
    @staticmethod
    def show_piano(chord_name, notes):
        keys = ["C ", "C#", "D ", "D#", "E ", "F ", "F#", "G ", "G#", "A ", "A#", "B "]
        display = "|"
        for k in keys:
            marker = "[X]" if k.strip() in [n[:2].strip() for n in notes] else "[ ]"
            display += f"{k}{marker}|"
        print(f"PIANO ({chord_name}): {display}")

    @staticmethod
    def show_guitar(chord_name, frets):
        print(f"GUITAR ({chord_name}):")
        strings = ["e", "B", "G", "D", "A", "E"]
        for i, s in enumerate(strings):
            fret = str(frets[5-i])
            print(f"{s} |---{fret}---")

class ChordEngine:
    NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    @staticmethod
    def get_chord(root, quality="Major"):
        try:
            root_idx = ChordEngine.NOTES.index(root.upper())
            intervals = [0, 4, 7] if quality == "Major" else [0, 3, 7]
            return [ChordEngine.NOTES[(root_idx + i) % 12] for i in intervals]
        except ValueError: return None

pianospark_data = {
    "app_name": "Pianospark_Chordspark_Combined",
    "version": "1.8.1",
    "piano_logic": {
        "C_Major": {"notes": ["G3", "C4", "E4"], "fingers": [1, 2, 5]},
        "G_Major": {"notes": ["G3", "B3", "D4"], "fingers": [1, 2, 4]}
    },
    "guitar_logic": {
        "G_Major": {"frets": [3, 2, 0, 0, 3, 3], "fingers": [2, 1, 0, 0, 3, 4]},
        "Cadd9":   {"frets": ["x", 3, 2, 0, 3, 3], "fingers": [0, 2, 1, 0, 3, 4]}
    }
}

def sync():
    print("--- VISUAL DEBUGGER MODE ---")
    VisualDebugger.show_piano("G Major Inversion", pianospark_data['piano_logic']['G_Major']['notes'])
    VisualDebugger.show_guitar("G Major", pianospark_data['guitar_logic']['G_Major']['frets'])
    if not os.path.exists("data"): os.makedirs("data")
    with open("data/pianospark_content.json", "w") as f:
        json.dump(pianospark_data, f, indent=4)
    print("\\nSync Success: v1.8.1 Project Files Generated.")

if __name__ == "__main__": sync()
""",
    "CHANGELOG.md": """# Project Change Log
## [1.8.1] - 2026-03-24
### Added
- Self-extracting bootstrap for easy agent handoff.
- Console-based visual debugger for Piano/Guitar.
- Integrated ChordEngine and Anchor mapping.
""",
    "sync_all.bat": """@echo off
python sync_content.py
powershell -Command "Write-Host 'Pianospark & Chordspark v1.8.1 Sync Success' -ForegroundColor Yellow"
pause
""",
    "README.md": """# AGENT INSTRUCTIONS
1. Run `sync_all.bat` to initialize.
2. Verify console visualizations for Piano (X markers) and Guitar (Fret numbers).
3. Integrate `data/pianospark_content.json` into the UI.
"""
}

def bootstrap():
    print("--- Extracting Pianospark & Chordspark Project Files ---")
    for filename, content in project_files.items():
        with open(filename, "w") as f:
            f.write(content)
        print(f"Generated: {filename}")
    
    # Run the initial sync to create the /data folder
    import subprocess
    subprocess.run(["python", "sync_content.py"])
    print("\nProject Extracted & Initialized. You are ready to develop.")

if __name__ == "__main__":
    bootstrap()