"""Audio checks in a real browser (Chromium). It cannot hear sound, so it verifies that
the right audio nodes are created: recorded clips, stitched words, tap sounds, no browser TTS."""
from _common import *

with browser() as b:
    pg, errors = open_page(b, grade=2)
    src = open(os.path.join(ROOT, 'dist', 'index.html'), encoding='utf8').read()
    check('speechSynthesis' not in src and 'SpeechSynthesisUtterance' not in src, 'no browser text-to-speech anywhere in the page')

    # whole-sentence clip is played through WebAudio
    n = pg.evaluate("""async()=>{speak('Awesome!',true);await new Promise(r=>setTimeout(r,800));return curSrcs.length}""")
    check(n == 1, 'a recorded sentence clip plays (1 audio source)')

    # a question outside the clip list is stitched from recorded words
    n = pg.evaluate("""async()=>{speak('A rectangle is 12 cm long and 5 cm wide. What is its area?',true);await new Promise(r=>setTimeout(r,900));return curSrcs.length}""")
    check(n > 5, f'a long question is stitched from recorded words ({n} sources)')

    # simple sums have their own clip
    hit = pg.evaluate("!!CLIPS[hashStr(spoken('8 + 2 = ?'))]")
    check(hit, '"8 + 2 = ?" has a whole-sentence clip')

    # every button gives a tap (one oscillator per click)
    pg.evaluate("()=>{window.__o=0;const f=BaseAudioContext.prototype.createOscillator;BaseAudioContext.prototype.createOscillator=function(){window.__o++;return f.call(this)}}")
    pg.click('#setBtn'); pg.wait_for_timeout(200)
    check(pg.evaluate('__o') == 1, 'a button click plays exactly one tap sound')

    # sound check panel in Settings
    pg.click('#voiceTest'); pg.wait_for_timeout(2500)
    diag = pg.evaluate("document.querySelector('#sndDiag').textContent")
    check('decoded OK' in diag and 'Sentence decode: OK' in diag, 'Settings > Hear it reports a working voice: ' + diag)

    # fallback when the browser cannot decode the word sprite
    pg2, errors2 = open_page(b, grade=2)
    pg2.evaluate("()=>{AudioContext.prototype.decodeAudioData=function(b,ok,bad){bad&&bad(new Error('x'));return Promise.reject(new Error('x'))};window.__plays=0;const p=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){window.__plays++;return p.call(this).catch(()=>{})}}")
    pg2.evaluate("async()=>{speak('9 + 1 = ?',true);await new Promise(r=>setTimeout(r,900))}")
    check(pg2.evaluate('__plays') > 0, 'falls back to a plain audio element if decoding fails')
    check(not errors and not errors2, 'no page errors')
finish()
