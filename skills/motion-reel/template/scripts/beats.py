#!/usr/bin/env python3
"""Measure a music track for the timeline: python3 scripts/beats.py assets/track.wav > beats.json

Output: {"bpm", "t0", "beats": [s], "downbeats": [s], "hits": [s]}. Copy bpm → TL.BPM and t0 (first
downbeat) → TL.T0 in timeline.js; state changes go on beats, big moments on downbeats, SFX on hits.
Needs: pip install numpy librosa soundfile. Assumes 4/4.
"""
import json
import sys

import librosa
import numpy as np

y, sr = librosa.load(sys.argv[1], sr=None, mono=True)
env = librosa.onset.onset_strength(y=y, sr=sr)
tempo, frames = librosa.beat.beat_track(onset_envelope=env, sr=sr, units="frames")
beats = list(librosa.frames_to_time(frames, sr=sr))

# beat_track drops leading beats: extend the grid backwards by the median period.
if len(beats) > 1:
    period = float(np.median(np.diff(beats)))
    while beats[0] - period > -0.03:
        beats.insert(0, max(0.0, beats[0] - period))

# Downbeat phase: the offset (0..3) whose beats carry the most onset energy.
bf = librosa.time_to_frames(beats, sr=sr)
bf = bf[bf < len(env)]
phase = int(np.argmax([env[bf[k::4]].sum() for k in range(4)])) if len(bf) >= 4 else 0
downbeats = beats[phase::4]

peaks = librosa.util.peak_pick(env, pre_max=3, post_max=3, pre_avg=3, post_avg=5, delta=0.5, wait=10)
r = lambda xs: [round(float(x), 3) for x in xs]
json.dump({"bpm": round(float(np.atleast_1d(tempo)[0]), 2), "t0": round(float(downbeats[0]), 3) if downbeats else 0.0,
           "beats": r(beats), "downbeats": r(downbeats), "hits": r(librosa.frames_to_time(peaks, sr=sr))}, sys.stdout, indent=1)
