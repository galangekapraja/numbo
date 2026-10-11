#!/usr/bin/env python3
"""Turns text into speech with the offline Kokoro model (voice af_heart) through sherpa-onnx.
No cloud service and no API key: everything runs on your machine.

  python3 scripts/voice/synth.py sentences  scripts/voice/sentence-texts.json scripts/voice/question-texts.json
  python3 scripts/voice/synth.py words      scripts/voice/words.json

Environment:
  SHERPA_DIR   folder of the sherpa-onnx release (contains bin/ and lib/)
  KOKORO_DIR   folder of kokoro-multi-lang-v1_0 (model.onnx, voices.bin, tokens.txt, ...)
  THREADS      threads per synthesis (default 2)
Output: build/voice/wav/<id>.wav (sentences) or build/voice/words/<word>.wav (words)."""
import json, os, subprocess, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SHERPA, KOKORO = os.environ['SHERPA_DIR'], os.environ['KOKORO_DIR']
THREADS = os.environ.get('THREADS', '2')
SPEAKER = os.environ.get('SPEAKER', '3')  # af_heart


def clip_id(text):
    """Same djb2 -> base36 hash as src/speech-text.js (hashStr)."""
    h = 5381
    for c in text:
        h = ((h << 5) + h + ord(c)) & 0xFFFFFFFF
    digits, out = '0123456789abcdefghijklmnopqrstuvwxyz', ''
    while h:
        out = digits[h % 36] + out
        h //= 36
    return out or '0'


def synth(text, wav):
    if os.path.exists(wav):
        return
    os.makedirs(os.path.dirname(wav), exist_ok=True)
    env = dict(os.environ, LD_LIBRARY_PATH=os.path.join(SHERPA, 'lib'))
    subprocess.run([
        os.path.join(SHERPA, 'bin', 'sherpa-onnx-offline-tts'),
        f'--kokoro-model={KOKORO}/model.onnx', f'--kokoro-voices={KOKORO}/voices.bin',
        f'--kokoro-tokens={KOKORO}/tokens.txt', f'--kokoro-data-dir={KOKORO}/espeak-ng-data',
        f'--kokoro-lexicon={KOKORO}/lexicon-us-en.txt', f'--kokoro-dict-dir={KOKORO}/dict',
        f'--num-threads={THREADS}', f'--sid={SPEAKER}', '--speed=1.0', f'--output-filename={wav}', text,
    ], env=env, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


mode, files = sys.argv[1], sys.argv[2:]
if mode == 'sentences':
    texts = [t for f in files for t in json.load(open(f))]
    manifest = {clip_id(t): t for t in texts}
    for i, (cid, t) in enumerate(manifest.items(), 1):
        synth(t, os.path.join(ROOT, 'build', 'voice', 'wav', cid + '.wav'))
        print(f'\r{i}/{len(manifest)}', end='', flush=True)
    json.dump(manifest, open(os.path.join(ROOT, 'build', 'voice', 'clips.json'), 'w'), indent=0, ensure_ascii=False)
    print('\nmanifest -> build/voice/clips.json')
elif mode == 'words':
    words = json.load(open(files[0]))
    for i, w in enumerate(words, 1):
        synth(w, os.path.join(ROOT, 'build', 'voice', 'words', w.replace("'", '_') + '.wav'))
        print(f'\r{i}/{len(words)}', end='', flush=True)
    print()
else:
    sys.exit(__doc__)
