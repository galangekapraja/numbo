/* Runs the whole app in Node with a fake DOM: story, every topic, every level, a full quiz.
   Catches crashes and wrong wiring without a browser. Real-browser checks live in tests/e2e.
   Run: node tests/smoke.test.js */
const fs = require('fs'), vm = require('vm'), path = require('path');
const src = f => fs.readFileSync(path.join(__dirname, '..', 'src', f), 'utf8');
const js = ['generators.js', 'speech-text.js', 'app.js'].map(src).join('\n');
const cache = {};
function mk(sel) {
  return {
    sel, _html: '', value: '', hidden: false, dataset: {}, style: { cssText: '' }, attrs: {}, children: [], textContent: '', max: 0, inert: false, isConnected: true,
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    addEventListener() {}, setAttribute(k, v) { this.attrs[k] = v; }, getAttribute(k) { return this.attrs[k]; }, focus() {}, closest() { return null; },
    getBoundingClientRect() { return { left: 0, top: 0, width: 10, height: 10 }; }, remove() {}, appendChild() {}, scrollIntoView() {},
    querySelector(s) { return mk(s); }, querySelectorAll() { return []; },
    get innerHTML() { return this._html; }, set innerHTML(v) { this._html = v; },
  };
}
const doc = {
  querySelector(s) { return cache[s] || (cache[s] = mk(s)); },
  querySelectorAll(s) { return /\.choice/.test(s) ? [0, 1, 2, 3].map(() => mk('.choice')) : []; },
  createElement() { return mk('x'); }, addEventListener() {}, activeElement: null, body: mk('body'), documentElement: mk('html'),
};
// 35 of 36 stars already collected so that the last quiz triggers the finale
const store = { 'numbo.v2': JSON.stringify({ 'g3:tambah-1': 3, 'g3:tambah-2': 3, 'g3:tambah-3': 3, 'g3:kurang-1': 3, 'g3:kurang-2': 3, 'g3:kurang-3': 3, 'g3:kali-1': 3, 'g3:kali-2': 3, 'g3:kali-3': 3, 'g3:bagi-1': 3, 'g3:bagi-2': 3, 'g3:pecah-1': 2 }) };
const errors = [];
const ctx = {
  document: doc, console: { log() {}, error: (...a) => errors.push(a.join(' ')) }, setTimeout, clearTimeout,
  localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = v; } },
  Math, JSON, Number, String, Array, Set, Object, Date, parseInt, isNaN,
};
ctx.window = ctx; ctx.window.matchMedia = () => ({ matches: false });
vm.createContext(ctx);
const run = c => vm.runInContext(c, ctx);
const check = (cond, msg) => { if (!cond) throw new Error(msg); };

try {
  vm.runInContext("'use strict';\n" + js, ctx);
  check(run('story.open === true'), 'the opening story should start automatically');
  const scenes = run('story.list.length');
  for (let i = 0; i < scenes; i++) run('storyNext()');
  check(!run('story.open'), 'the opening story did not close');
  check(run('pref.intro'), 'pref.intro was not saved');
  run('openStory(introScenes(),afterIntro);for(const s of story.list){s.art();if(s.extra)s.extra();}closeStory()');
  run('openStory(finaleScenes());storyNext();storyNext();');
  for (const t of ['tambah', 'kurang', 'kali', 'bagi', 'pecah', 'cerita']) run(`setTopic('${t}')`);

  run("state.topic='pecah';state.level=3;startQuiz()");
  for (let i = 0; i < 10; i++) {
    run('answer(state.quiz.qs[state.quiz.i].choices.indexOf(state.quiz.qs[state.quiz.i].answer))');
    run('nextQ()');
  }
  check(run('state.quiz.done'), 'the quiz did not finish');
  check(run('state.quiz.answers.filter(a=>a.ok).length') === 10, 'all-correct quiz should score 10');
  check(/back on Bobby's shelf/.test(run("document.querySelector('#practice').innerHTML")), 'result screen should announce the number coming home');

  for (const g of [1, 2, 3, 4, 5, 6]) {
    run(`pref.grade=${g};chooseGrade(${g})`);
    for (const t of ['tambah', 'kurang', 'kali', 'bagi', 'pecah', 'cerita']) {
      run(`setTopic('${t}')`);
      for (const l of [1, 2, 3]) run(`state.topic='${t}';state.level=${l};startQuiz();answer(0);nextQ();state.quiz=null`);
    }
  }
  run('pref.grade=3');
  setTimeout(() => {
    check(run('story.open'), 'the finale should open after the last number comes home');
    check(!errors.length, 'errors: ' + errors.join('; '));
    console.log('smoke: ok');
    process.exit(0);
  }, 2200);
} catch (e) { console.log('smoke FAILED:', e.message, (e.stack || '').split('\n').slice(0, 5).join('\n')); process.exit(1); }
