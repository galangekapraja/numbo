"""No screen may scroll sideways at any common size; optional screenshots with --shots DIR."""
import sys
from _common import *

SIZES = [(320, 640), (360, 740), (390, 844), (844, 390), (820, 1180), (1024, 768), (1280, 720), (1440, 900), (1920, 1080)]
SCREENS = {
    'home': "renderTabs();renderShelf();go('home')",
    'place': "state.topic='tambah';renderPlace();go('place')",
    'learn': "state.topic='data';renderLearn();go('learn')",
    'levels': "state.topic='tambah';renderPractice();go('levels')",
    'quiz': "state.topic='ukur';state.level=2;startQuiz();go('quiz')",
    'grade': "renderGrade();go('grade')",
}
shots = sys.argv[sys.argv.index('--shots') + 1] if '--shots' in sys.argv else None
if shots:
    os.makedirs(shots, exist_ok=True)

with browser() as b:
    for w, h in SIZES:
        pg, errors = open_page(b, w, h, grade=6)
        over = []
        for name, js in SCREENS.items():
            pg.evaluate('()=>{' + js + '}'); pg.wait_for_timeout(150)
            if pg.evaluate('document.documentElement.scrollWidth-innerWidth') > 0:
                over.append(name)
            if shots:
                pg.screenshot(path=f'{shots}/{w}x{h}_{name}.png')
        check(not over and not errors, f'{w}x{h}: no horizontal scroll' + (f' (overflow on {over})' if over else ''))
finish()
