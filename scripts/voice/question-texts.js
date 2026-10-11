#!/usr/bin/env node
/* Lists the question sentences that deserve a whole-sentence recording: the simple Grade 1-2
   sums and differences with both numbers up to 20 (e.g. "8 plus 2 equals what").
   Longer or rarer questions are spoken by stitching recorded words together.
   Usage: node scripts/voice/question-texts.js > scripts/voice/question-texts.json */
const { GEN } = require('../../src/generators.js');
const { spoken } = require('../../src/speech-text.js');
const out = new Set();
for (const g of [1, 2]) for (const t of ['tambah', 'kurang']) for (let l = 1; l <= 3; l++) for (let i = 0; i < 100000; i++) {
  const s = spoken(GEN[t](l, g).text);
  const m = s.match(/^(\d+) (plus|minus) (\d+) equals what$/);
  if (m && +m[1] <= 20 && +m[3] <= 20) out.add(s);
}
console.log(JSON.stringify([...out].sort(), null, 0));
