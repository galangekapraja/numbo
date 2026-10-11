#!/usr/bin/env python3
"""Turns the raw wav files from synth.py into the shipped assets in assets/audio/:
  clips/<id>.mp3  one mp3 per sentence (silence trimmed, loudness normalised, 32 kbps mono)
  clips.json      id -> sentence
  words.mp3       every word on one 'sprite' track (equal loudness, small gaps)
  words.json      word -> [start seconds, duration seconds]
Needs: ffmpeg and numpy."""
import json, os, subprocess, wave
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
BUILD, OUT = os.path.join(ROOT, 'build', 'voice'), os.path.join(ROOT, 'assets', 'audio')
os.makedirs(os.path.join(OUT, 'clips'), exist_ok=True)

# 1) sentence clips
manifest = json.load(open(os.path.join(BUILD, 'clips.json'))) if os.path.exists(os.path.join(BUILD, 'clips.json')) else {}
for cid in manifest:
    wav, mp3 = os.path.join(BUILD, 'wav', cid + '.wav'), os.path.join(OUT, 'clips', cid + '.mp3')
    if os.path.exists(wav) and not os.path.exists(mp3):
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-af',
                        'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-18:TP=-2',
                        '-ac', '1', '-ar', '24000', '-b:a', '32k', mp3], check=True)
if manifest:
    old = json.load(open(os.path.join(OUT, 'clips.json'))) if os.path.exists(os.path.join(OUT, 'clips.json')) else {}
    old.update(manifest)
    json.dump(old, open(os.path.join(OUT, 'clips.json'), 'w'), indent=0, ensure_ascii=False)
    print(len(old), 'clips in manifest')

# 2) word sprite
words_dir = os.path.join(BUILD, 'words')
if os.path.isdir(words_dir):
    words = json.load(open(os.path.join(ROOT, 'scripts', 'voice', 'words.json')))
    SR = 24000
    PAD = int(.15 * SR)
    table, out, pos = {}, [np.zeros(PAD)], PAD
    for w in words:
        p = os.path.join(words_dir, w.replace("'", '_') + '.wav')
        if not os.path.exists(p):
            print('missing word', w); continue
        f = wave.open(p); assert f.getframerate() == SR
        x = np.frombuffer(f.readframes(f.getnframes()), dtype=np.int16).astype(np.float64) / 32768
        pk = np.abs(x).max()
        if pk < 1e-3:
            print('silent word', w); continue
        env = np.convolve(np.abs(x), np.ones(int(.005 * SR)) / int(.005 * SR), 'same')
        idx = np.where(env > pk * 10 ** (-42 / 20))[0]
        y = x[max(0, idx[0] - int(.012 * SR)):min(len(x), idx[-1] + int(.02 * SR))].copy()
        fd = int(.006 * SR); y[:fd] *= np.linspace(0, 1, fd); y[-fd:] *= np.linspace(1, 0, fd)
        y *= min(0.11 / np.sqrt((y ** 2).mean()), 0.95 / np.abs(y).max())  # equal loudness
        table[w] = [round(pos / SR, 4), round(len(y) / SR, 4)]
        out += [y, np.zeros(PAD)]; pos += len(y) + PAD
    sprite = np.concatenate(out)
    tmp = os.path.join(BUILD, 'sprite.wav')
    f = wave.open(tmp, 'wb'); f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR)
    f.writeframes((np.clip(sprite, -1, 1) * 32767).astype(np.int16).tobytes()); f.close()
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-ac', '1', '-b:a', '40k', os.path.join(OUT, 'words.mp3')], check=True)
    json.dump(table, open(os.path.join(OUT, 'words.json'), 'w'))
    print(len(table), 'words,', round(len(sprite) / SR, 1), 's')
