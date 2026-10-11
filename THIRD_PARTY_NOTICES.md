# Third-party notices

Numbo itself is MIT licensed (see [LICENSE](LICENSE)). It uses the following third-party work.
Please check each upstream project for its current terms.

## Used when the app runs

| What | How it is used | License |
| --- | --- | --- |
| [Fredoka](https://fonts.google.com/specimen/Fredoka) and [Nunito](https://fonts.google.com/specimen/Nunito) | Loaded from Google Fonts by the browser. Not bundled in this repository. | SIL Open Font License 1.1 |

The app has no other runtime dependencies, no analytics and no network calls besides the font stylesheet.

## Used to make the recorded voice (not redistributed)

The files in `assets/audio/` are speech generated offline from text. The tools below are only needed
if you want to regenerate the audio (see [docs/VOICE.md](docs/VOICE.md)); they are not part of this repository.

| What | Role | License |
| --- | --- | --- |
| [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) (voice `af_heart`) | Text-to-speech model | Apache-2.0 |
| [sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx) | Runs the model offline | Apache-2.0 |
| [eSpeak NG](https://github.com/espeak-ng/espeak-ng) | Phoneme data used by Kokoro in sherpa-onnx | GPL-3.0-or-later (tool only; its output is not part of this repo) |
| [FFmpeg](https://ffmpeg.org/) | Encodes wav to mp3 | LGPL/GPL, depending on build (tool only) |

## Used for testing (dev only)

| What | License |
| --- | --- |
| [Playwright](https://playwright.dev/) (end-to-end tests) | Apache-2.0 |

## Brand

The name "Numbo", the Bobby mascot and the toy-block logo in `docs/brand/` are part of this project.
The MIT license covers the files, but please do not present a fork as the official Numbo.
