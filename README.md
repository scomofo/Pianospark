# AGENT INSTRUCTIONS: Dual-Instrument Content Sync

## 1. Scope
This module handles both **Pianospark** (Keyboard) and **Chordspark** (Guitar). 

## 2. Visual Protocols
- **Piano**: Use `piano_logic` for curated inversions. Use finger IDs 1-5.
- **Guitar**: Use `guitar_logic`. Handle 'x' as muted.
- **Anchor Mode**: Highlight the **2nd string, 3rd fret** as a persistent 'Anchor' for G-C-D progressions.

## 3. Dynamic Calculation
If a requested chord is missing from the JSON, the agent is authorized to use the `engine_logic` intervals (Major: 0,4,7 | Minor: 0,3,7) to build a standard Root Position voicing.
