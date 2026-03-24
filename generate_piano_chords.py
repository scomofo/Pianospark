#!/usr/bin/env python3
# Requires Python 3.6+
"""
Generate realistic piano chord WAV files using additive synthesis.
No external dependencies - uses only Python stdlib.

Usage:
    python generate_piano_chords.py

Output: piano_chords/ directory with chord_*.wav files.
"""

import os
import struct
import math
import wave
import random

random.seed(42)  # Fixed seed for reproducible WAV output

# ===== Configuration =====
SAMPLE_RATE = 44100
OUTPUT_DIR = "piano_chords"
HOLD_SECS = 2.5          # How long notes sustain
RELEASE_SECS = 1.5       # Release/decay tail
VELOCITY = 95             # 0-127


# ===== Piano chord definitions: name -> list of MIDI note numbers =====
CHORDS = {
    # Level 1 - Major triads
    "C":      [60, 64, 67],
    "D":      [62, 66, 69],
    "E":      [64, 68, 71],
    "F":      [65, 69, 72],
    "G":      [67, 71, 74],
    "A":      [69, 73, 76],

    # Level 1 - Minor triads
    "Am":     [57, 60, 64],
    "Dm":     [62, 65, 69],
    "Em":     [64, 67, 71],

    # Level 2 - More triads
    "Bb":     [58, 62, 65],
    "Eb":     [63, 67, 70],
    "Fm":     [65, 68, 72],
    "Cm":     [60, 63, 67],
    "Gm":     [67, 70, 74],

    # Level 2 - Dominant 7ths
    "C7":     [60, 64, 67, 70],
    "G7":     [67, 71, 74, 77],
    "D7":     [62, 66, 69, 72],
    "Am7":    [57, 60, 64, 67],

    # Level 3 - Major 7ths
    "Cmaj7":  [60, 64, 67, 71],
    "Fmaj7":  [65, 69, 72, 76],

    # Level 3 - Minor 7ths
    "Dm7":    [62, 65, 69, 72],
    "Em7":    [64, 67, 71, 74],

    # Level 3 - Diminished / Augmented
    "Cdim":   [60, 63, 66],
    "Caug":   [60, 64, 68],

    # Level 3 - Other
    "F#m":    [66, 69, 73],
    "Bm":     [59, 62, 66],
    "Dadd9":  [62, 66, 69, 76],
    "A7":     [57, 61, 64, 67],
    "E7":     [64, 68, 71, 74],
}


def note_freq(midi_note):
    """Convert MIDI note number to frequency in Hz."""
    return 440.0 * (2.0 ** ((midi_note - 69) / 12.0))


def generate_piano_tone(freq, duration, velocity=VELOCITY, sample_rate=SAMPLE_RATE):
    """
    Generate a single piano-like tone using additive synthesis.

    Piano characteristics:
    - Rich harmonic series with inharmonicity (strings are slightly stiff)
    - Fast attack, medium decay, moderate sustain, long release
    - Higher notes decay faster, lower notes ring longer
    - Slight detuning between harmonics for natural chorus
    """
    n_samples = int(duration * sample_rate)
    samples = [0.0] * n_samples
    vel_scale = velocity / 127.0

    # Piano inharmonicity factor (higher for higher notes)
    # Real pianos have B ~ 0.0001 for bass, up to 0.005 for treble
    midi_approx = round(12 * math.log2(freq / 440) + 69)
    inharmonicity = 0.0001 + 0.00003 * max(0, midi_approx - 40)

    # Harmonic amplitudes (piano spectrum)
    # Lower harmonics are stronger, with specific piano characteristics
    harmonic_amps = [
        1.0,    # fundamental
        0.7,    # 2nd - strong in piano
        0.4,    # 3rd
        0.3,    # 4th
        0.15,   # 5th
        0.1,    # 6th
        0.06,   # 7th
        0.04,   # 8th
        0.02,   # 9th
        0.01,   # 10th
    ]

    # Decay rates per harmonic (higher harmonics decay faster)
    base_decay = 1.2 + 0.02 * max(0, midi_approx - 48)  # higher notes decay faster

    # Attack time (slightly longer for lower notes)
    attack_time = max(0.003, 0.008 - 0.00005 * max(0, midi_approx - 48))
    attack_samples = int(attack_time * sample_rate)

    for h_idx, h_amp in enumerate(harmonic_amps):
        h_num = h_idx + 1
        # Inharmonic frequency (piano strings are slightly stiff)
        h_freq = freq * h_num * math.sqrt(1 + inharmonicity * h_num * h_num)

        if h_freq > sample_rate / 2:
            continue  # skip above Nyquist

        # Per-harmonic decay (higher harmonics decay much faster)
        h_decay = base_decay * (1 + h_idx * 0.8)

        # Slight random detuning for natural sound (±2 cents)
        detune = 1.0 + (random.random() - 0.5) * 0.002
        h_freq *= detune

        # Phase randomization for natural timbre
        phase = random.random() * 2 * math.pi

        for i in range(n_samples):
            t = i / sample_rate

            # Two-stage envelope: initial fast decay + slower sustain decay
            if t < 0.3:
                envelope = h_amp * math.exp(-h_decay * 2 * t)
            else:
                env_at_03 = h_amp * math.exp(-h_decay * 2 * 0.3)
                envelope = env_at_03 * math.exp(-h_decay * 0.5 * (t - 0.3))

            # Attack
            if i < attack_samples:
                envelope *= i / attack_samples

            sample = envelope * math.sin(2 * math.pi * h_freq * t + phase)
            samples[i] += sample * vel_scale

    return samples


def generate_chord_wav(name, midi_notes, output_dir):
    """Generate a piano chord WAV file."""
    total_duration = HOLD_SECS + RELEASE_SECS
    n_samples = int(total_duration * SAMPLE_RATE)
    mixed = [0.0] * n_samples

    # Slight stagger for natural feel (much less than guitar strum)
    stagger_secs = 0.008  # 8ms between notes

    for idx, note in enumerate(midi_notes):
        freq = note_freq(note)
        offset = int(idx * stagger_secs * SAMPLE_RATE)
        tone = generate_piano_tone(freq, total_duration - idx * stagger_secs)

        for i, s in enumerate(tone):
            pos = offset + i
            if pos < n_samples:
                mixed[pos] += s

    # Normalize to prevent clipping
    peak = max(abs(s) for s in mixed) or 1.0
    scale = 0.88 / peak
    mixed = [s * scale for s in mixed]

    # Smooth fade out in last 0.8s
    fade_samples = int(0.8 * SAMPLE_RATE)
    fade_start = n_samples - fade_samples
    for i in range(fade_samples):
        # Exponential fade for natural piano release
        t = i / fade_samples
        mixed[fade_start + i] *= (1 - t) ** 2

    # Write WAV (16-bit mono) — encode '#' so filenames are URL-safe
    safe_name = name.replace('#', 'sharp')
    filepath = os.path.join(output_dir, f"chord_{safe_name}.wav")
    with wave.open(filepath, "w") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        for s in mixed:
            clamped = max(-1.0, min(1.0, s))
            wf.writeframes(struct.pack("<h", int(clamped * 32767)))

    file_size = os.path.getsize(filepath)
    return filepath, file_size


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Generating {len(CHORDS)} piano chord WAV files...")
    print(f"Output directory: {OUTPUT_DIR}/")
    print(f"Sample rate: {SAMPLE_RATE} Hz, Duration: {HOLD_SECS + RELEASE_SECS}s")
    print()

    total_size = 0
    for name, notes in CHORDS.items():
        note_names = [['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'][n % 12] + str(n // 12 - 1) for n in notes]
        path, size = generate_chord_wav(name, notes, OUTPUT_DIR)
        total_size += size
        print(f"  {path:30s}  {size//1024:4d} KB  ({', '.join(note_names)})")

    print(f"\nDone! {len(CHORDS)} WAV files written to {OUTPUT_DIR}/")
    print(f"Total size: {total_size / 1024 / 1024:.1f} MB")
    print(f"\nTo use in PianoSpark, the app will auto-detect files in {OUTPUT_DIR}/")


if __name__ == "__main__":
    main()
