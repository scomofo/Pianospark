import os

files_to_create = {
    "sync_content.py": """import json
import os

class ChordEngine:
    '''Calculates Piano Notes based on Root and Quality'''
    NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    
    @staticmethod
    def get_chord(root, quality="Major"):
        root_idx = ChordEngine.NOTES.index(root.upper())
        # Intervals: Major (0,4,7), Minor (0,3,7)
        intervals = [0, 4, 7] if quality == "Major" else [0, 3, 7]
        return [ChordEngine.NOTES[(root_idx + i) % 12] for i in intervals]

pianospark_data = {
    "app_name": "Pianospark_Chordspark_Combined",
    "version": "1.6.0",
    "engine_logic": {
        "description": "Agent can use ChordEngine class to generate missing chords.",
        "intervals": {"Major": [0, 4, 7], "Minor": [0, 3, 7]}
    },
    "piano_logic": {
        "Major_Chords": {
            "C_Major": {"notes": ["G3", "C4", "E4"], "fingers": [1, 2, 5]},
            "F_Major": {"notes": ["A3", "C4", "F4"], "fingers": [1, 2, 5]},
            "G_Major": {"notes": ["G3", "B3", "D4"], "fingers": [1, 2, 4]}
        },
        "Minor_Chords": {
            "A_Minor": {"notes": ["A3", "C4", "E4"], "fingers": [1, 2, 5]},
            "D_Minor": {"notes": ["A3", "D4", "F4"], "fingers": [1, 2, 5]}
        }
    },
    "guitar_logic": {
        "chords": {
            "G_Major": {"frets": [3, 2, 0, 0, 3, 3], "fingers": [2, 1, 0, 0, 3, 4]},
            "Cadd9":   {"frets": ["x", 3, 2, 0, 3, 3], "fingers": [0, 2, 1, 0, 3, 4]},
            "D_Major": {"frets": ["x", "x", 0, 2, 3, 2], "fingers": [0, 0, 0, 1, 3, 2]}
        },
        "anchor_mapping": {
            "target_string": 2, 
            "fret": 3,
            "finger": 3,
            "instruction": "Lock Ring Finger on B-string 3rd fret throughout G-Cadd9-D transition."
        }
    }
}

def sync():
    if not os.path.exists("data"): os.makedirs("data")
    with open("data/pianospark_content.json", "w") as f:
        json.dump(pianospark_data, f, indent=4)
    print("Sync Success: v1.6 Major/Minor Combined Data Generated.")

if __name__ == "__main__": sync()
""",

    "sync_all.bat": """@echo off
if not exist data mkdir data
python sync_content.py
powershell -Command "Write-Host 'Pianospark & Chordspark Sync v1.6 Success' -ForegroundColor Yellow"
pause
""",

    "README.md": """# AGENT INSTRUCTIONS: Dual-Instrument Content Sync

## 1. Scope
This module handles both **Pianospark** (Keyboard) and **Chordspark** (Guitar). 

## 2. Visual Protocols
- **Piano**: Use `piano_logic` for curated inversions. Use finger IDs 1-5.
- **Guitar**: Use `guitar_logic`. Handle 'x' as muted.
- **Anchor Mode**: Highlight the **2nd string, 3rd fret** as a persistent 'Anchor' for G-C-D progressions.

## 3. Dynamic Calculation
If a requested chord is missing from the JSON, the agent is authorized to use the `engine_logic` intervals (Major: 0,4,7 | Minor: 0,3,7) to build a standard Root Position voicing.
"""
}

for filename, content in files_to_create.items():
    with open(filename, "w") as f:
        f.write(content)
    print(f"File Created: {filename}")

print("\nBootstrap Complete. Your coding agent is ready to integrate Pianospark and Chordspark.")