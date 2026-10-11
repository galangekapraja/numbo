# The Numbo voice

Numbo never uses the browser's built-in text-to-speech. Every sound a child hears was recorded ahead of time
with an offline model and ships inside the page. This keeps the voice the same on every device and works with no network.

## Two kinds of recordings

| Kind | Files | Used for |
| --- | --- | --- |
| **Sentence clips** | `assets/audio/clips/<id>.mp3`, `clips.json` | Story, lessons, hints, cheers, name greetings, and every Grade 1–2 sum or difference with both numbers up to 20 |
| **Word sprite** | `assets/audio/words.mp3`, `words.json` | Everything else: word problems, bigger numbers, units. Words are played one after another. |

`<id>` is a small hash of the spoken text (`hashStr` in `src/speech-text.js`, djb2 in base 36). At run time the app
turns a question into spoken text (`spoken()`), hashes it and plays the clip if one exists. If not, `speechTokens()`
splits the text into words (numbers become words, `$12.50` becomes "twelve dollars and fifty cents", `km` becomes "kilometers")
and `stitchSpeak()` schedules each word from the sprite on the Web Audio clock.

Names: 115 common US first names have recorded greetings ("Nice to meet you, Mia!", "Great job, Leo!"). A name that is not on the
list gets a recorded generic line instead, so the app never speaks a mispronounced name.

## Playback details (`src/app.js`, "only recorded voice is used")

- All playback goes through one `AudioContext`, created or resumed on the first tap.
- Clips are decoded once and cached; `whenRunning()` waits until the context is really running before scheduling.
- If the browser cannot decode mp3 through Web Audio, the app falls back to a plain `<audio>` element (clips) or seeks through the sprite with timers (words).
- Beeps and button taps are small oscillator tones, separate from the voice.
- **Settings > Hear it** prints the sound button state, audio engine state and decode results. Use it to debug "no sound".

## Regenerating the audio

You need the models on your machine; none of this is required just to run or build the app.

1. Download a [sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx/releases) release (offline TTS binary) and the
   `kokoro-multi-lang-v1_0` model. Install `ffmpeg`, `numpy` and `playwright`.
2. Collect what has to be said:
   ```bash
   npm run build:lite
   python3 scripts/voice/collect_texts.py            # scripts/voice/sentence-texts.json
   node scripts/voice/question-texts.js > scripts/voice/question-texts.json
   ```
3. Synthesize (about 4 s per clip per thread; existing wav files are skipped):
   ```bash
   export SHERPA_DIR=/path/to/sherpa-onnx-v1.13.5-linux-x64-shared KOKORO_DIR=/path/to/kokoro-multi-lang-v1_0
   python3 scripts/voice/synth.py sentences scripts/voice/sentence-texts.json scripts/voice/question-texts.json
   python3 scripts/voice/synth.py words scripts/voice/words.json
   ```
4. Encode and build the sprite (writes into `assets/audio/`):
   ```bash
   python3 scripts/voice/make_assets.py
   npm run build && npm test
   ```

The voice is Kokoro `af_heart` (speaker id 3), speed 1.0. Raw wav files go to `build/voice/` (git-ignored).
Sentence clips are mp3, 32 kbps mono; the word sprite is 40 kbps mono with every word normalised to the same loudness.

## Known limits

- Stitched words sound a little more clipped than whole sentences. Add more sentence clips to `scripts/voice/question-texts.json`
  (and regenerate) to cover more questions; each clip adds about 4 KB to the page.
- The page is about 11 MB with audio, so the first load on a slow connection takes a moment.
