#!/usr/bin/env node
/* Builds dist/index.html: one self-contained page (HTML + CSS + JS + recorded voice).
   Usage: node scripts/build.js [--no-audio]   (--no-audio makes a small page for quick UI work) */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (...p) => fs.readFileSync(path.join(root, ...p), 'utf8');
const noAudio = process.argv.includes('--no-audio');

const parts = {
  STYLES: read('src', 'styles.css').trim(),
  BODY: read('src', 'body.html').trim(),
  // generators and speech helpers are pure; app.js is the UI. Order matters: they share one scope.
  SCRIPT: ['generators.js', 'speech-text.js', 'app.js'].map(f => read('src', f).trim()).join('\n\n'),
};

function audioScript() {
  if (noAudio) return '';
  const audio = path.join(root, 'assets', 'audio');
  const manifest = JSON.parse(fs.readFileSync(path.join(audio, 'clips.json'), 'utf8'));
  const clips = {};
  for (const id of Object.keys(manifest)) {
    const f = path.join(audio, 'clips', id + '.mp3');
    if (!fs.existsSync(f)) throw new Error('missing clip ' + id + ' for "' + manifest[id] + '"');
    clips[id] = 'data:audio/mpeg;base64,' + fs.readFileSync(f).toString('base64');
  }
  const words = JSON.parse(fs.readFileSync(path.join(audio, 'words.json'), 'utf8'));
  const sprite = 'data:audio/mpeg;base64,' + fs.readFileSync(path.join(audio, 'words.mp3')).toString('base64');
  return '<script>window.CLIPS=' + JSON.stringify(clips) + ';window.WORDS=' + JSON.stringify(words) +
    ';window.WORDS_AUDIO=' + JSON.stringify(sprite) + ';</script>';
}
parts.AUDIO = audioScript();

let html = read('src', 'index.template.html');
for (const [k, v] of Object.entries(parts)) {
  const re = new RegExp('(?:<!--)?/?\\*?\\{\\{' + k + '\\}\\}\\*?/?(?:-->)?');
  html = html.replace(re, () => v);
}
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
const out = path.join(root, 'dist', 'index.html');
fs.writeFileSync(out, html);
console.log('built ' + path.relative(root, out) + ' (' + Math.round(html.length / 1024) + ' KB' + (noAudio ? ', no audio' : '') + ')');
