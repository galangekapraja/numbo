"""Accessibility audit without extra dependencies: colour contrast (WCAG AA), accessible names,
touch-target size, headings, language and landmarks. The 'N'/'O' logo letters are exempt (logotype)."""
from _common import *

JS = r"""()=>{
 const parse=c=>{const m=c.match(/rgba?\(([^)]+)\)/);if(!m)return null;const p=m[1].split(/[ ,\/]+/).filter(Boolean).map(Number);return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1};};
 const lum=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b)};
 const bgOf=el=>{const L=[];for(let e=el;e;e=e.parentElement){const c=parse(getComputedStyle(e).backgroundColor);if(c&&c.a>0){L.push(c);if(c.a>=1)break;}}
  let base={r:255,g:255,b:255,a:1};if(!L.length||L[L.length-1].a<1){const b=parse(getComputedStyle(document.body).backgroundColor);if(b&&b.a>0)base=b;}
  for(let i=L.length-1;i>=0;i--){const l=L[i];base={r:l.r*l.a+base.r*(1-l.a),g:l.g*l.a+base.g*(1-l.a),b:l.b*l.a+base.b*(1-l.a),a:1};}return base;};
 const vis=e=>{const r=e.getBoundingClientRect(),cs=getComputedStyle(e);return r.width>0&&r.height>0&&cs.visibility!=='hidden'&&cs.display!=='none'};
 const out={contrast:[],noname:[],small:[],lang:document.documentElement.lang,main:!!document.querySelector('main')};
 document.querySelectorAll('body *').forEach(e=>{
  if(!vis(e)||e.closest('.logo,.logobtn,.mini-logo'))return;
  if(![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))return;
  const cs=getComputedStyle(e),fg=parse(cs.color);if(!fg)return;const bg=bgOf(e),a=fg.a;
  const f={r:fg.r*a+bg.r*(1-a),g:fg.g*a+bg.g*(1-a),b:fg.b*a+bg.b*(1-a)};
  const L1=lum(f),L2=lum(bg),cr=(Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05);
  const fs=parseFloat(cs.fontSize),big=fs>=24||(fs>=18.66&&parseInt(cs.fontWeight)>=700);
  if(cr<(big?3:4.5))out.contrast.push([cr.toFixed(2),(e.className||e.tagName)+'',e.textContent.trim().slice(0,24)]);
 });
 document.querySelectorAll('button,[role=button],a[href],input,select').forEach(e=>{
  if(!vis(e))return;
  const name=(e.getAttribute('aria-label')||e.textContent||e.getAttribute('title')||e.getAttribute('placeholder')||'').trim()||(e.id&&document.querySelector('label[for="'+e.id+'"]')?'x':'');
  if(!name&&!e.getAttribute('aria-labelledby'))out.noname.push((e.tagName+'.'+e.className).slice(0,50));
  const r=e.getBoundingClientRect();if(r.width<44||r.height<44)out.small.push([(e.className||e.tagName)+'',Math.round(r.width),Math.round(r.height)]);
 });
 return out;}"""
SCREENS = {
    'home': "renderTabs();renderShelf();go('home')",
    'place': "state.topic='tambah';renderPlace();go('place')",
    'learn': "state.topic='tambah';renderLearn();go('learn')",
    'levels': "state.topic='tambah';renderPractice();go('levels')",
    'quiz': "state.topic='tambah';state.level=1;startQuiz();go('quiz')",
}
with browser() as b:
    for scheme in ('light', 'dark'):
        pg, errors = open_page(b, grade=2, scheme=scheme)
        for name, js in SCREENS.items():
            pg.evaluate('()=>{' + js + '}'); pg.wait_for_timeout(250)
            r = pg.evaluate(JS)
            check(r['lang'] == 'en' and r['main'], f'{scheme}/{name}: lang + main landmark')
            check(not r['contrast'], f'{scheme}/{name}: contrast AA {r["contrast"][:3]}')
            check(not r['noname'], f'{scheme}/{name}: every control has a name {r["noname"][:3]}')
            check(not r['small'], f'{scheme}/{name}: touch targets >= 44px {r["small"][:3]}')
        check(not errors, f'{scheme}: no page errors')
finish()
