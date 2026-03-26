# Define the Pianospark content as a JSON string
$pianosparkJson = @"
{
    "app_name": "Pianospark",
    "version": "1.0.1",
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
"@

# Define target path
$targetDir = ".\data"
$filePath = Join-Path $targetDir "pianospark_content.json"

# Create directory if it doesn't exist
if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir | Out-Null
    Write-Host "Created directory: $targetDir" -ForegroundColor Cyan
}

# Write JSON to file with UTF8 encoding
$pianosparkJson | Out-File -FilePath $filePath -Encoding utf8
Write-Host "Successfully synced Pianospark content to $filePath" -ForegroundColor Green