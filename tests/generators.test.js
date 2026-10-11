/* Every generated question must be well formed and mathematically right.
   Run: node tests/generators.test.js */
const { GEN } = require('../src/generators.js');
const TOPICS = ['tambah', 'kurang', 'kali', 'bagi', 'pecah', 'cerita', 'bentuk', 'ukur', 'data'];
const PER_CELL = +process.env.PER_CELL || 400;
let bad = 0, n = 0;

for (let g = 1; g <= 6; g++) for (const t of TOPICS) for (let l = 1; l <= 3; l++) for (let i = 0; i < PER_CELL; i++) {
  const q = GEN[t](l, g); n++;
  const fail = m => { if (bad++ < 25) console.log('FAIL', 'grade', g, t, 'level', l, m, JSON.stringify(q).slice(0, 300)); };
  if (q.choices.length !== 4) fail('needs 4 choices');
  if (new Set(q.choices).size !== 4) fail('duplicate choices');
  if (!q.choices.includes(q.answer)) fail('answer missing from choices');
  if (/NaN|undefined|Infinity|-\d/.test(q.text + q.choices.join('|'))) fail('bad text');
  if (!q.explain) fail('no explanation');
  const m = q.text.match(/^([\d,.]+) ([+−×÷]) ([\d,.]+) = \?$/);
  if (m) {
    const a = parseFloat(m[1].replace(/,/g, '')), b = parseFloat(m[3].replace(/,/g, ''));
    const want = { '+': a + b, '−': a - b, '×': a * b, '÷': a / b }[m[2]];
    const got = parseFloat(q.answer.replace(/,/g, ''));
    if (Math.abs(want - got) > 1e-6) fail(`math ${a}${m[2]}${b}=${want} but answer is ${got}`);
    if (q.choices.some(c => parseFloat(c.replace(/,/g, '')) < 0)) fail('negative choice');
  }
}
console.log(`generators: checked ${n} questions, ${bad} problems`);
process.exit(bad ? 1 : 0);
