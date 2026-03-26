import json
import os

# Define the data structure for Pianospark
pianospark_data = {
    "app_name": "Pianospark",
    "version": "1.0.0",
    "content": {
        "difficulty_tiers": [
            {
                "tier": 1,
                "label": "The Vamp",
                "songs": [
                    {"title": "Smokestack Lightning", "artist": "Howlin' Wolf", "chords": ["E7"]},
                    {"title": "Run Through the Jungle", "artist": "CCR", "chords": ["Dm"]},
                    {"title": "Chain of Fools", "artist": "Aretha Franklin", "chords": ["Cm"]}
                ]
            },
            {
                "tier": 2,
                "label": "The Toggle",
                "songs": [
                    {"title": "Dreams", "artist": "Fleetwood Mac", "chords": ["F", "G"]},
                    {"title": "You Never Can Tell", "artist": "Chuck Berry", "chords": ["C", "G7"]},
                    {"title": "Paperback Writer", "artist": "The Beatles", "chords": ["G7", "C"]}
                ]
            },
            {
                "tier": 3,
                "label": "The Standard",
                "songs": [
                    {"title": "Hound Dog", "artist": "Elvis Presley", "chords": ["C", "F", "G"]},
                    {"title": "Wild Thing", "artist": "The Troggs", "chords": ["A", "D", "E"]},
                    {"title": "Free Fallin'", "artist": "Tom Petty", "chords": ["F", "Bb", "C"]}
                ]
            }
        ],
        "inversions": {
            "C_Major": ["G3", "C4", "E4"],
            "F_Major": ["A3", "C4", "F4"],
            "G_Major": ["G3", "B3", "D4"]
        }
    }
}

def sync_content():
    # Ensure directory exists
    target_dir = "data"
    if not os.path.exists(target_dir):
        os.makedirs(target_dir)
        print(f"Created directory: {target_dir}")

    # Write JSON data
    file_path = os.path.join(target_dir, "pianospark_content.json")
    with open(file_path, "w") as f:
        json.dump(pianospark_data, f, indent=4)
    
    print(f"Successfully synced Pianospark content to {file_path}")

if __name__ == "__main__":
    sync_content()