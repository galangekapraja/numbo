#!/usr/bin/env python3
"""Collects every fixed sentence the app speaks (story, lessons, cheers, hints, name lines)
by running the built page in Chromium. Writes scripts/voice/sentence-texts.json.
Needs: pip install playwright && playwright install chromium; and `npm run build:lite` first."""
import json, os
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
names = json.load(open(os.path.join(HERE, 'names.json')))

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 390, 'height': 844})
    pg.add_init_script("try{localStorage.setItem('numbo.pref',JSON.stringify({intro:true,grade:3}))}catch(e){}")
    pg.goto('file://' + os.path.join(ROOT, 'dist', 'index.html'), wait_until='domcontentloaded')
    pg.wait_for_timeout(500)
    texts = pg.evaluate("""names=>{
      const T={};const add=t=>{const s=spoken(t);if(s)T[s]=1;};
      introScenes().forEach(s=>add(s.text));finaleScenes().forEach(s=>add(s.text));
      add(HELLO);CHEER.forEach(add);OOPS.forEach(add);add('Yes, you found it!');add('Not quite. Try once more!');
      for(let g=1;g<=6;g++){pref.grade=g;for(const t of GRADE_TOPICS[g]){state.topic=t;renderLearn();add($('#learn .intro').textContent);add('Try once more. '+HINT[t](g));}}
      add("Let's go!");add('You can do it!');
      for(const n of names)for(const k of Object.keys(NL))add(NL[k](n));
      return Object.keys(T);}""", names)
    b.close()

out = os.path.join(HERE, 'sentence-texts.json')
json.dump(texts, open(out, 'w'), indent=0, ensure_ascii=False)
print(len(texts), 'sentences ->', os.path.relpath(out, ROOT))
