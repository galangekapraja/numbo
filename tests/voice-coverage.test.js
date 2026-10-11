/* The read-aloud voice must be able to say every question.
   1) every word of every generated question exists in the recorded word sprite
   2) the simple Grade 1-2 sums (numbers up to 20) all have a whole-sentence clip
   Run: node tests/voice-coverage.test.js */
const fs = require('fs'), path = require('path');
const { GEN } = require('../src/generators.js');
const { spoken, speechTokens, hashStr } = require('../src/speech-text.js');
const audio = path.join(__dirname, '..', 'assets', 'audio');
const WORDS = JSON.parse(fs.readFileSync(path.join(audio, 'words.json'), 'utf8'));
const CLIPS = JSON.parse(fs.readFileSync(path.join(audio, 'clips.json'), 'utf8'));
const TOPICS = ['tambah', 'kurang', 'kali', 'bagi', 'pecah', 'cerita', 'bentuk', 'ukur', 'data'];

const missing = {}; let n = 0;
for (let g = 1; g <= 6; g++) for (const t of TOPICS) for (let l = 1; l <= 3; l++)
  for (let i = 0; i < (t === 'cerita' ? 1500 : 500); i++) {
    const q = GEN[t](l, g); n++;
    for (const w of speechTokens(q.text)) if (/[a-z]/.test(w) && !WORDS[w]) missing[w] = (missing[w] || 0) + 1;
  }
let ok = Object.keys(missing).length === 0;
console.log(`words: ${n} questions, missing words: ${ok ? 'none' : JSON.stringify(missing)}`);

let sums = 0, noClip = 0;
for (const g of [1, 2]) for (const t of ['tambah', 'kurang']) for (let l = 1; l <= 3; l++) for (let i = 0; i < 400; i++) {
  const s = spoken(GEN[t](l, g).text);
  const m = s.match(/^(\d+) (plus|minus) (\d+) equals what$/);
  if (m && +m[1] <= 20 && +m[3] <= 20) { sums++; if (!CLIPS[hashStr(s)]) noClip++; }
}
console.log(`sentence clips: ${sums} simple sums checked, ${noClip} without a clip`);
if (noClip) ok = false;
process.exit(ok ? 0 : 1);
