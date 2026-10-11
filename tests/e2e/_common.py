import os, sys
from contextlib import contextmanager
from playwright.sync_api import sync_playwright

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PAGE = 'file://' + os.path.join(ROOT, 'dist', 'index.html')


@contextmanager
def browser():
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
        try:
            yield b
        finally:
            b.close()


def open_page(b, width=390, height=844, grade=3, scheme='light'):
    """New page with the intro story skipped and a grade chosen."""
    pg = b.new_page(viewport={'width': width, 'height': height}, color_scheme=scheme)
    errors = []
    pg.on('pageerror', lambda e: errors.append(str(e)))
    pg.add_init_script("try{localStorage.setItem('numbo.pref',JSON.stringify({intro:true,grade:%d}))}catch(e){}" % grade)
    pg.goto(PAGE, wait_until='domcontentloaded')
    pg.wait_for_timeout(700)
    return pg, errors


def check(cond, msg):
    print(('ok    ' if cond else 'FAIL  ') + msg)
    if not cond:
        check.failed = True
check.failed = False


def finish():
    sys.exit(1 if check.failed else 0)
