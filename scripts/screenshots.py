#!/usr/bin/env python3
"""Regenerates docs/screenshots/*.png from dist/index.html (run `npm run build` first).
Run it on a machine with internet access so the Fredoka and Nunito fonts load from Google Fonts."""
import os
from playwright.sync_api import sync_playwright

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
OUT = os.path.join(ROOT, 'docs', 'screenshots')
os.makedirs(OUT, exist_ok=True)
SHOTS = [
    # name, width, height, grade, js to reach the screen
    ('desktop-home', 1440, 900, 3, "renderTabs();renderShelf();go('home')"),
    ('desktop-learn', 1440, 900, 3, "state.topic='tambah';renderLearn();go('learn')"),
    ('tablet-quiz', 820, 1180, 2, "state.topic='tambah';state.level=1;startQuiz();go('quiz')"),
    ('mobile-home', 390, 844, 3, "renderTabs();renderShelf();go('home')"),
    ('mobile-quiz', 390, 844, 1, "state.topic='tambah';state.level=1;startQuiz();go('quiz')"),
    ('mobile-shapes', 390, 844, 3, "state.topic='bentuk';renderLearn();go('learn')"),
]
with sync_playwright() as p:
    b = p.chromium.launch()
    for name, w, h, grade, js in SHOTS:
        pg = b.new_page(viewport={'width': w, 'height': h})
        pg.add_init_script("try{localStorage.setItem('numbo.pref',JSON.stringify({intro:true,grade:%d}))}catch(e){}" % grade)
        pg.goto('file://' + os.path.join(ROOT, 'dist', 'index.html'), wait_until='load')
        pg.wait_for_timeout(1200)
        pg.evaluate('()=>{' + js + '}')
        pg.wait_for_timeout(500)
        pg.screenshot(path=os.path.join(OUT, name + '.png'))
        print(name)
    b.close()
