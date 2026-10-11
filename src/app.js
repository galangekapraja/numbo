document.documentElement.lang='en';
const $=(s,el=document)=>el.querySelector(s);
const $$=(s,el=document)=>[...el.querySelectorAll(s)];
const reduce=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const scrollTo=el=>el.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const TOPICS=[
  {id:'tambah',sign:'+',name:'Addition',bg:'var(--green)',fg:'var(--navy)'},
  {id:'kurang',sign:'−',name:'Subtraction',bg:'var(--orange)',fg:'var(--navy)'},
  {id:'kali',sign:'×',name:'Multiplication',bg:'var(--blue)',fg:'#fff'},
  {id:'bagi',sign:'÷',name:'Division',bg:'var(--purple)',fg:'#fff'},
  {id:'pecah',sign:'½',name:'Fractions',bg:'var(--red)',fg:'#fff'},
  {id:'bentuk',sign:'△',name:'Shapes',bg:'var(--yellow)',fg:'var(--navy)'},
  {id:'ukur',sign:'↔',name:'Measure & Time',bg:'var(--pink)',fg:'var(--navy)'},
  {id:'data',sign:'▥',name:'Data',bg:'#8fd3ff',fg:'var(--navy)'},
  {id:'cerita',sign:'?',name:'Word Problems',bg:'var(--teal)',fg:'var(--navy)'}
];
const PLACES={
  tambah:{place:'Plus Garden',story:'Numbers are hiding among the flowers in Plus Garden. Put two amounts together to find them!'},
  kurang:{place:'Minus River',story:'The current in Minus River carried the numbers away. Take some away to catch them back!'},
  kali:{place:'Times Hill',story:'On Times Hill, numbers love to jump in groups. Count their jumps with multiplication!'},
  bagi:{place:'Divide Cave',story:'Divide Cave is dark, but the numbers will come out if you share the treasure equally. Start sharing!'},
  pecah:{place:'Fraction Island',story:'Fraction Island is split into equal parts. Can you find the shaded part?'},
  bentuk:{place:'Shape Shore',story:'Shells of every shape wash up on Shape Shore. Look closely at their sides, corners and sizes!'},
  ukur:{place:'Measure Mountain',story:'Bobby wants to climb Measure Mountain. Measure the path, check the clock and weigh the backpack!'},
  data:{place:'Chart Valley',story:'Colorful charts grow in Chart Valley. Read them carefully to find the hidden numbers!'},
  cerita:{place:'Story Village',story:'The people of Story Village have everyday tales. Listen to each story, then pick the right math!'}
};
const LV=['Easy','Medium','Hard'];
const LV_STYLE=[['var(--green)','var(--navy)'],['var(--orange)','var(--navy)'],['var(--purple)','#fff']];
const CHOICE_STYLE=[['var(--blue)','#fff'],['var(--purple)','#fff'],['var(--orange)','var(--navy)'],['var(--teal)','var(--navy)']];
const NB_COL=[['var(--red)','#fff'],['var(--blue)','#fff'],['var(--green)','var(--navy)'],['var(--orange)','var(--navy)'],['var(--purple)','#fff'],['var(--teal)','var(--navy)']];
const nbStyle=i=>`--bg:${NB_COL[i%6][0]};--fg:${NB_COL[i%6][1]};--i:${i}`;
const CHEER=['Great job!','Exactly right!',"You're so smart!",'Yes, nailed it!','Awesome!'];
const OOPS=['Almost! Check the steps.',"That's okay. Try again next time.","Let's learn from this one."];
const STAR_D='M12 2.5l2.9 6.2 6.8.8-5 4.7 1.3 6.7L12 17.5 6 20.9l1.3-6.7-5-4.7 6.8-.8z';
const star=on=>`<svg class="star ${on?'on':''}" viewBox="0 0 24 24" aria-hidden="true"><path d="${STAR_D}"/></svg>`;
const stars=(n,max=3)=>`<span role="img" aria-label="${n} of ${max} stars">`+Array.from({length:max},(_,i)=>star(i<n)).join('')+'</span>';
const miniStar=`<svg class="mini" viewBox="0 0 24 24" aria-hidden="true"><path d="${STAR_D}"/></svg>`;

/* progress and settings, saved in this browser */
const KEY='numbo.v2',PREF='numbo.pref';
const readJSON=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')||{};}catch(e){return {};}};
let progress=readJSON(KEY),pref=readJSON(PREF);
const grade=()=>pref.grade>=1&&pref.grade<=6?pref.grade:3;
const pkey=(t,l)=>`g${grade()}:${t}-${l}`;
const finDone=()=>!!(pref.fin&&pref.fin[grade()]);
const setFin=()=>{pref.fin=pref.fin||{};pref.fin[grade()]=true;savePref();};
const saveProgress=()=>{try{localStorage.setItem(KEY,JSON.stringify(progress));}catch(e){}};
const savePref=()=>{try{localStorage.setItem(PREF,JSON.stringify(pref));}catch(e){}};
const starsFor=(t,l)=>progress[pkey(t,l)]||0;
const topicStars=t=>[1,2,3].reduce((s,l)=>s+starsFor(t,l),0);
/* which places (topics) each grade has: matched to what children learn in that grade */
const GRADE_TOPICS={1:['tambah','kurang','bentuk','ukur','data','cerita'],2:['tambah','kurang','kali','bagi','pecah','bentuk','ukur','data','cerita'],3:['tambah','kurang','kali','bagi','pecah','bentuk','ukur','data','cerita'],4:['tambah','kurang','kali','bagi','pecah','bentuk','ukur','data','cerita'],5:['tambah','kurang','kali','bagi','pecah','bentuk','ukur','data','cerita'],6:['tambah','kurang','kali','bagi','pecah','bentuk','ukur','data','cerita']};
const topicsNow=()=>TOPICS.filter(t=>GRADE_TOPICS[grade()].includes(t.id));
const totalStars=()=>topicsNow().reduce((s,t)=>s+topicStars(t.id),0);
const starsPer=()=>Math.max(2,Math.round(topicsNow().length*0.67));
const returnedCount=()=>Math.min(9,Math.floor(totalStars()/starsPer()));
const topicOf=id=>TOPICS.find(t=>t.id===id);
const nmC=()=>{const n=(pref.name||'').trim();return n?n.charAt(0).toUpperCase()+n.slice(1).toLowerCase():'';};
const NAME_CHOICES=["Emma", "Olivia", "Sophia", "Ava", "Isabella", "Mia", "Charlotte", "Amelia", "Harper", "Evelyn", "Abigail", "Emily", "Ella", "Elizabeth", "Sofia", "Avery", "Scarlett", "Grace", "Chloe", "Lily", "Aria", "Zoe", "Nora", "Hannah", "Layla", "Riley", "Luna", "Lucy", "Maya", "Ellie", "Madison", "Stella", "Hazel", "Violet", "Claire", "Anna", "Sarah", "Sara", "Kayla", "Natalie", "Leah", "Julia", "Alice", "Ruby", "Sadie", "Piper", "Quinn", "Paige", "Molly", "Jade", "Faith", "Taylor", "Liam", "Noah", "Oliver", "Elijah", "James", "William", "Benjamin", "Lucas", "Henry", "Theodore", "Jack", "Levi", "Alexander", "Alex", "Mason", "Ethan", "Daniel", "Jacob", "Logan", "Jackson", "Sebastian", "Aiden", "Matthew", "Samuel", "David", "Joseph", "Carter", "Owen", "Wyatt", "John", "Dylan", "Luke", "Gabriel", "Anthony", "Isaac", "Grayson", "Jayden", "Andrew", "Joshua", "Christopher", "Nathan", "Ryan", "Leo", "Max", "Sam", "Ben", "Tom", "Jake", "Cole", "Eli", "Kai", "Finn", "Zach", "Adam", "Nick", "Tyler", "Jordan", "Cameron", "Evan", "Charlie", "Michael", "Kevin", "Mark"];
const NL={meet:n=>`Nice to meet you, ${n}!`,go:n=>`Let's go, ${n}!`,good:n=>`Great job, ${n}!`,try:n=>`You can do it, ${n}!`};
const nameLine=(k,generic)=>{const n=nmC();if(n&&window.CLIPS&&window.CLIPS[hashStr(spoken(NL[k](n)))])return NL[k](n);return generic;};
const greet=()=>pref.name?`Hi, ${pref.name}! Let's find my numbers!`:"Hi! Let's find my numbers!";
const state={topic:'tambah',level:1,quiz:null,screen:'home',bubble:greet()};

/* small sounds */
let actx=null;
function tone(freqs,dur=.12,type='triangle',vol=.14){
  if(pref.sound===false)return;
  try{
    actx=actx||new (window.AudioContext||window.webkitAudioContext)();
    if(actx.state==='suspended')actx.resume();
    const t0=actx.currentTime;
    freqs.forEach((f,i)=>{
      const o=actx.createOscillator(),g=actx.createGain(),t=t0+i*dur;
      o.type=type;o.frequency.value=f;
      g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.02);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
      o.connect(g);g.connect(actx.destination);o.start(t);o.stop(t+dur+.03);
    });
  }catch(e){}
}
let lastTap=0;
const sfx={
  tap:()=>{const n=Date.now();if(n-lastTap<90)return;lastTap=n;tone([520],.07,'sine',.1);},
  good:()=>tone([659,784,1047],.11),
  bad:()=>tone([262,196],.16,'square',.06),
  win:()=>tone([523,659,784,1047,1319],.12)
};

/* every button gives a soft tap (answers have their own good/bad sounds, Listen has the voice) */
try{document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button,[role="button"],a[href],[data-nav],[data-i],[data-p]');if(!b||b.disabled||b.classList.contains('choice')||b.classList.contains('listen'))return;sfx.tap();},true);}catch(e){}

/* read aloud (for children who cannot read yet) */
/* only recorded voice is used: whole-sentence clips, or recorded words stitched together */
const AC=window.AudioContext||window.webkitAudioContext;
const canAudio=()=>!!AC;
const ctxGet=()=>{try{actx=actx||new AC();if(actx.state==='suspended')actx.resume();return actx;}catch(e){return null;}};
let spriteFail=0,spriteEl=null,spriteTimers=[];
let curAudio=null,curSrcs=[],speakId=0,spriteBuf=null,spriteLoading=null;
const stopAudio=()=>{
  speakId++;
  if(curAudio){try{curAudio.pause();}catch(e){}curAudio=null;}
  curSrcs.forEach(x=>{try{x.stop();}catch(e){}});curSrcs=[];
  spriteTimers.forEach(clearTimeout);spriteTimers=[];
};
const stopSpeak=stopAudio;
const clipBufs={};
function decodeB64(d){
  const c=ctxGet();if(!c)return Promise.resolve(null);
  return new Promise(res=>{
    try{
      const bin=atob(d.split(',')[1]),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
      let done=false;const ok=b=>{if(!done){done=true;res(b);}},bad=()=>{if(!done){done=true;res(null);}};
      const p=c.decodeAudioData(u.buffer,ok,bad);if(p&&p.then)p.then(ok,bad);
    }catch(e){res(null);}
  });
}
/* run fn(ctx) once the audio context is really running (browsers keep it asleep until a tap) */
function whenRunning(id,fn,fail){
  const c=ctxGet();if(!c){fail&&fail();return;}
  if(c.state==='running'){fn(c);return;}
  let d=false;const once=()=>{if(!d){d=true;if(id===speakId)fn(c);}};
  try{const p=c.resume();if(p&&p.then)p.then(once,()=>{if(!d){d=true;fail&&fail();}});else once();}catch(e){fail&&fail();}
  setTimeout(()=>{if(!d){d=true;if(c.state==='running'){if(id===speakId)fn(c);}else fail&&fail();}},700);
}
function playClipEl(d){
  try{const a=new Audio(d);curAudio=a;const pr=a.play();if(pr&&pr.catch)pr.catch(()=>{});}catch(e){}
}
function playClip(sp){
  const k=hashStr(sp),d=window.CLIPS&&window.CLIPS[k];if(!d)return false;
  stopAudio();const id=speakId;
  if(!canAudio()){playClipEl(d);return true;}
  const go=buf=>{
    if(id!==speakId)return;
    if(!buf){playClipEl(d);return;}
    whenRunning(id,c=>{const src=c.createBufferSource();src.buffer=buf;src.connect(c.destination);src.start(c.currentTime+.03);curSrcs.push(src);},()=>playClipEl(d));
  };
  if(clipBufs[k])go(clipBufs[k]);
  else decodeB64(d).then(b=>{if(b)clipBufs[k]=b;go(b);});
  return true;
}
function loadSprite(){
  if(spriteBuf)return Promise.resolve(spriteBuf);
  if(spriteLoading)return spriteLoading;
  const d=window.WORDS_AUDIO,c=ctxGet();if(!d||!c)return Promise.resolve(null);
  spriteLoading=new Promise(res=>{
    const fail=()=>{spriteLoading=null;spriteFail++;res(null);};
    try{
      const bin=atob(d.split(',')[1]),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
      let done=false;const ok=b=>{if(done)return;done=true;spriteBuf=b;res(b);};
      const bad=()=>{if(done)return;done=true;fail();};
      const p=c.decodeAudioData(u.buffer,ok,bad);
      if(p&&p.then)p.then(ok,bad);
    }catch(e){fail();}
  });
  return spriteLoading;
}
const GAP={',':.16,'.':.3,'?':.3,'!':.3,':':.18,';':.18};
/* fallback: play the word sprite through a plain <audio> element, seeking word by word */
function stitchAudioEl(toks,id){
  try{
    if(!spriteEl){spriteEl=new Audio(window.WORDS_AUDIO);spriteEl.preload='auto';}
    const a=spriteEl;curAudio=a;
    let at=0;const plan=[];
    toks.forEach(w=>{const e=window.WORDS[w];if(!e){at+=GAP[w]*1000;return;}plan.push([at,e[0],e[1]]);at+=(e[1]+.04)*1000;});
    const playSeg=i=>{
      if(id!==speakId||i>=plan.length){try{a.pause();}catch(e){}return;}
      const [,st,du]=plan[i];
      try{a.currentTime=Math.max(0,st-.05);const pr=a.play();if(pr&&pr.catch)pr.catch(()=>{});}catch(e){}
      const nextAt=i+1<plan.length?plan[i+1][0]-plan[i][0]:du*1000+100;
      spriteTimers.push(setTimeout(()=>{ if(i+1<plan.length){playSeg(i+1);}else{try{a.pause();}catch(e){}} },Math.max(60,nextAt)));
    };
    playSeg(0);
  }catch(e){}
}
function stitchSpeak(raw){
  if(!window.WORDS||!window.WORDS_AUDIO)return false;
  const toks=speechTokens(raw).filter(t=>GAP[t]||window.WORDS[t]);
  if(!toks.some(t=>window.WORDS[t]))return false;
  const id=speakId;
  const useEl=()=>{if(id===speakId)stitchAudioEl(toks,id);};
  if(!canAudio()||spriteFail>=2){useEl();return true;}
  loadSprite().then(buf=>{
    if(id!==speakId)return;
    const c=ctxGet();if(!buf||!c){useEl();return;}
    whenRunning(id,c2=>{
      let t=c2.currentTime+.06;
      toks.forEach(w=>{
        const e=window.WORDS[w];
        if(!e){t+=GAP[w];return;}
        const src=c2.createBufferSource();src.buffer=buf;src.connect(c2.destination);
        src.start(t,Math.max(0,e[0]-.05),e[1]+.1);curSrcs.push(src);t+=e[1]+.04;
      });
    },useEl);
  });
  return true;
}
function speak(t,force){
  if(pref.sound===false&&!force)return;
  if(playClip(spoken(t)))return;
  stopAudio();stitchSpeak(t);
}
try{addEventListener('pointerdown',()=>{try{if(window.WORDS_AUDIO&&canAudio())loadSprite();}catch(e){}},{once:true,capture:true});}catch(e){}
const autoSpeak=t=>{if(grade()<=2&&pref.read!==false)speak(t);};
const sayLater=(t,ms)=>setTimeout(()=>{if(pref.read!==false)speak(t);},ms||0);

/* confetti */
const CONF=['--red','--blue','--green','--yellow','--purple','--orange','--teal'];
function confetti(x,y,n=28){
  if(reduce)return;
  const box=document.createElement('div');box.className='confetti';box.setAttribute('aria-hidden','true');
  for(let i=0;i<n;i++){
    const s=document.createElement('i'),a=Math.random()*Math.PI*2,d=60+Math.random()*130;
    s.className=Math.random()<.4?'ci rnd':'ci';
    s.style.cssText=`left:${x}px;top:${y}px;--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d-50}px;--rot:${rnd(-400,400)}deg;background:var(${pick(CONF)});animation-delay:${(Math.random()*.08).toFixed(2)}s`;
    box.appendChild(s);
  }
  document.body.appendChild(box);setTimeout(()=>box.remove(),1500);
}
function rain(n=46){
  if(reduce)return;
  const box=document.createElement('div');box.className='confetti';box.setAttribute('aria-hidden','true');
  for(let i=0;i<n;i++){
    const s=document.createElement('i');
    s.className=Math.random()<.4?'ci rnd fall':'ci fall';
    s.style.cssText=`left:${Math.random()*100}%;--rot:${rnd(-540,540)}deg;background:var(${pick(CONF)});animation-delay:${(Math.random()*1.1).toFixed(2)}s;animation-duration:${(1.8+Math.random()*1.2).toFixed(2)}s`;
    box.appendChild(s);
  }
  document.body.appendChild(box);setTimeout(()=>box.remove(),3600);
}

/* mascot: Bobby */
function mascotSVG(){
  return `<svg class="mascot" viewBox="0 0 120 130" aria-hidden="true">
  <g class="ant l"><path class="mline" d="M42 40 L33 15"/><circle class="mant-r" cx="32" cy="11" r="7"/></g>
  <g class="ant r"><path class="mline" d="M78 40 L87 15"/><circle class="mant-b" cx="88" cy="11" r="7"/></g>
  <ellipse class="mfoot" cx="42" cy="119" rx="15" ry="8"/><ellipse class="mfoot" cx="78" cy="119" rx="15" ry="8"/>
  <g class="arm l"><ellipse class="mb" cx="17" cy="82" rx="9" ry="15" transform="rotate(18 17 82)"/></g>
  <g class="arm r"><ellipse class="mb" cx="103" cy="82" rx="9" ry="15" transform="rotate(-18 103 82)"/></g>
  <ellipse class="mb" cx="60" cy="80" rx="42" ry="40"/>
  <ellipse class="mbelly" cx="60" cy="94" rx="24" ry="18"/>
  <g class="eyes"><circle class="meye" cx="45" cy="70" r="11"/><circle class="mpupil" cx="47" cy="71" r="5"/><circle class="meye" cx="75" cy="70" r="11"/><circle class="mpupil" cx="73" cy="71" r="5"/></g>
  <circle class="mcheek" cx="30" cy="88" r="6"/><circle class="mcheek" cx="90" cy="88" r="6"/>
  <path class="m m-happy mline" d="M48 90 Q60 102 72 90"/>
  <path class="m m-cheer mopen" d="M46 87 Q60 112 74 87 Z"/>
  <path class="m m-oops mline" d="M49 100 Q60 88 71 100"/>
  <path class="sp" d="${STAR_D}" transform="translate(-8 22) scale(1.2)"/>
  <path class="sp" d="${STAR_D}" transform="translate(98 8) scale(1.1)"/>
  <path class="sp" d="${STAR_D}" transform="translate(104 54) scale(.9)"/>
  </svg>`;
}
const bubbleHTML=()=>`<p class="bubble">${esc(state.bubble)}</p>`;
function say(msg){state.bubble=msg;$$('.bubble:not(.l)').forEach(b=>{b.textContent=msg;});}
let moodTimer;
function setMood(m,msg){
  if(msg)say(msg);
  $$('.buddy .mascot').forEach(el=>{el.classList.remove('cheer','oops','hello');void el.getBoundingClientRect();el.classList.add(m);});
  clearTimeout(moodTimer);
  moodTimer=setTimeout(()=>$$('.buddy .mascot').forEach(el=>el.classList.remove('cheer','oops','hello')),1800);
}

/* brand logo: NUMBO in toy blocks */
function logoHTML(withText=true){
  const R=[-5,3,-2,5,-3,2];let k=0;
  return (withText?'<span class="vh">Numbo</span>':'')+['NUMBO'].map(w=>'<span class="word" aria-hidden="true">'+w.split('').map(ch=>{
    const i=k++,[bg,fg]=NB_COL[i%6];
    return `<span class="blk" style="--bg:${bg};--fg:${fg};--r:${R[i%6]}deg;--d:${(i*0.07).toFixed(2)}s">${ch}</span>`;
  }).join('')+'</span>').join('');
}
function updateLead(){
  $('#lead').textContent=pref.name?`Hi, ${pref.name}! Help Bobby find the missing numbers.`:'Help Bobby find the missing numbers.';
}

/* Bobby's Number Shelf: story progress */
let lastTotal=null,lastRet=null;
function renderShelf(){
  const tot=totalStars(),ret=returnedCount(),bump=lastTotal!==null&&tot>lastTotal;
  $('#score').innerHTML=`<span class="${bump?'bump':''}">${star(true)}</span><span><b>${tot}</b> ${tot===1?'star':'stars'}</span>`;
  $('#slots').innerHTML=Array.from({length:9},(_,i)=>{
    const on=i<ret,isNew=on&&lastRet!==null&&i>=lastRet;
    return `<span class="slot${on?' on':''}${isNew?' new':''}" style="${nbStyle(i)}" role="img" aria-label="Number ${i+1} is ${on?'home':'still missing'}">${i+1}</span>`;
  }).join('');
  const need=(ret+1)*starsPer()-tot;
  $('#shNote').innerHTML=ret>=9?'All the numbers are home! <button type="button" class="link" data-act="finale">Watch the ending</button>':`Collect ${need} more ${need===1?'star':'stars'} to bring number ${ret+1} home.`;
  lastTotal=tot;lastRet=ret;
}
const ICO={
  say:'<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z"/></svg>',
  back:'<svg class="ico ln" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  bulb:'<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 0-4 12.7V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.3A7 7 0 0 0 12 2zM9.5 20h5v1a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1z"/></svg>',
  play:'<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6.2 6.6.8-4.9 4.6 1.3 6.6L12 17.4 6.1 20.7l1.3-6.6L2.5 9.5l6.6-.8z"/></svg>'
};
const listenBtn=sel=>canAudio()?`<button type="button" class="tool listen" data-say-sel="${sel}">${ICO.say}Listen</button>`:'';
function renderTabs(){
  const first=totalStars()===0;
  $('#tabs').dataset.n=topicsNow().length;
  $('#tabs').innerHTML=topicsNow().map((t,i)=>`<button type="button" class="tab" data-topic="${t.id}" style="--bg:${t.bg};--fg:${t.fg}">
    ${first&&i===0?'<span class="tab-badge">Start here!</span>':''}
    <span class="tab-sign" aria-hidden="true">${t.sign}</span>
    <span class="tab-name">${PLACES[t.id].place}</span>
    <span class="tab-topic">${t.name}</span>
    <span class="tab-stars" aria-label="${topicStars(t.id)} of 9 stars">${miniStar} ${topicStars(t.id)}/9</span>
  </button>`).join('');
}

/* ---------- lessons ---------- */
function colHTML(a,b,op,ann,res){
  const A=String(a),B=String(b),R=String(res);
  const n=Math.max(A.length,B.length,R.length);
  const cells=s=>s.padStart(n,' ').split('').map(c=>c.trim()||'&nbsp;');
  const labs=PLACE.slice(0,n).reverse();
  let h=`<div class="colwrap"><div class="col" style="--n:${n};--w:${n>=6?'2.6rem':n>=5?'3rem':'4.4rem'}" role="img" aria-label="${a} ${op} ${b} = ${res}, written in columns">`;
  h+='<span></span>'+labs.map(l=>`<span class="lab">${l}</span>`).join('');
  h+='<span></span>'+Array.from({length:n},(_,i)=>`<span class="ann">${ann[n-1-i]||''}</span>`).join('');
  h+='<span></span>'+cells(A).map(c=>`<span class="dg">${c}</span>`).join('');
  h+=`<span class="sg">${op}</span>`+cells(B).map(c=>`<span class="dg">${c}</span>`).join('');
  h+='<span class="rule"></span>';
  h+='<span></span>'+cells(R).map(c=>`<span class="dg res">${c}</span>`).join('');
  return h+'</div></div>';
}
function colDemo(a,b,max){
  return `<div class="demo"><div class="demo-controls">
    <label for="inA">First number<input id="inA" type="number" inputmode="numeric" min="0" max="${max}" value="${a}"></label>
    <label for="inB">Second number<input id="inB" type="number" inputmode="numeric" min="0" max="${max}" value="${b}"></label>
  </div><div id="demoOut" aria-live="polite"></div></div>`;
}
const clampIn=(el,max)=>{let v=parseInt(el.value,10);if(isNaN(v)||v<0)v=0;if(v>max)v=max;return v;};
const blocks=n=>{const a=Math.floor(n/100),t=Math.floor(n/10)%10,o=n%10;return `<span class="blocks" aria-hidden="true">${'<i class="bk hun"></i>'.repeat(a)}${'<i class="bk ten"></i>'.repeat(t)}${'<i class="bk one"></i>'.repeat(o)}</span>`;};
function blocksBox(op,a,b,max){
  const r=op==='+'?a+b:a-b,leg=max>=999?'cube = 1, rod = 10, flat = 100':'cube = 1, rod = 10';
  const row=(lab,n,cls)=>`<div class="bkrow"><b>${lab}</b>${blocks(n).replace('class="blocks"','class="blocks '+(cls||'')+'"')}</div>`;
  const rows=op==='+'?row(fmt(a),a)+row('+ '+fmt(b),b)+row('= '+fmt(r),r):row(fmt(a),a)+row('− '+fmt(b)+' (take away)',b,'gone')+row('= '+fmt(r)+' (left)',r);
  const tip=op==='+'?'When 10 cubes are together, trade them for 1 rod. When 10 rods are together, trade them for 1 flat.':'If there are not enough cubes, trade 1 rod for 10 cubes first.';
  return `<div class="blockbox"><p class="bkleg">Blocks: ${leg}</p>${rows}<p class="bkleg">${tip}</p></div>`;
}
function mountCol(op,max){
  const inA=$('#inA'),inB=$('#inB'),out=$('#demoOut');
  const draw=()=>{
    const a=clampIn(inA,max),b=clampIn(inB,max);
    if(op==='−'&&b>a){out.innerHTML='<p class="note">In subtraction, the first number must be bigger than or equal to the second number.</p>';return;}
    const r=op==='+'?addSteps(a,b):subSteps(a,b);
    out.innerHTML=colHTML(a,b,op,r.ann,r.result)+`<ol class="steps">${r.steps.map(s=>`<li>${s}</li>`).join('')}</ol>`+(max>=99&&max<=999?blocksBox(op,a,b,max):'');
  };
  inA.addEventListener('input',draw);inB.addEventListener('input',draw);draw();
}
function twoNumDemo(a,b,maxA,maxB,la,lb){
  return `<div class="demo"><div class="demo-controls">
    <label for="inA">${la}<input id="inA" type="number" inputmode="numeric" min="1" max="${maxA}" value="${a}"></label>
    <label for="inB">${lb}<input id="inB" type="number" inputmode="numeric" min="1" max="${maxB}" value="${b}"></label>
  </div><div id="demoOut" aria-live="polite"></div></div>`;
}
const partsOf=n=>String(n).split('').map((d,i,A)=>+d*Math.pow(10,A.length-1-i)).filter(x=>x>0);
function areaModel(a,b){
  const pa=partsOf(a),pb=partsOf(b);
  if(pa.length*pb.length<2)return '';
  let s=`<div class="amwrap"><div class="am" style="--c:${pb.length}" role="img" aria-label="Area model for ${a} times ${b}"><span class="amh"></span>${pb.map(x=>`<span class="amh">${fmt(x)}</span>`).join('')}`;
  pa.forEach((x,i)=>{s+=`<span class="amh">${fmt(x)}</span>`+pb.map((y,j)=>`<span class="amc c${(i+j)%4}">${fmt(x*y)}</span>`).join('');});
  return s+`</div></div><p>${pa.flatMap(x=>pb.map(y=>fmt(x*y))).join(' + ')} = <b>${fmt(a*b)}</b></p>`;
}
function mountMul(maxA,maxB){
  const inA=$('#inA'),inB=$('#inB'),out=$('#demoOut');
  const draw=()=>{
    const a=Math.max(1,clampIn(inA,maxA)),b=Math.max(1,clampIn(inB,maxB));
    out.innerHTML=`<p class="eq">${fmt(a)} × ${fmt(b)} = <b>${fmt(a*b)}</b></p><p>${mulExplain(a,b)}</p>${areaModel(a,b)}`;
  };
  inA.addEventListener('input',draw);inB.addEventListener('input',draw);draw();
}
const mdots=c=>Array.from({length:c},(_,i)=>`<i style="animation-delay:${i*25}ms"></i>`).join('');
function binsHTML(n,k){
  const q=Math.floor(n/k),r=n%k;let s='<div class="bins">';
  for(let i=1;i<=k;i++)s+=`<div class="bin"><span class="bin-l">Group ${i}</span><div class="mdots">${mdots(q)}</div></div>`;
  if(r)s+=`<div class="bin rest"><span class="bin-l">Left over</span><div class="mdots">${mdots(r)}</div></div>`;
  return s+'</div>';
}
function mountDiv(maxA,maxB){
  const inA=$('#inA'),inB=$('#inB'),out=$('#demoOut');
  const draw=()=>{
    const n=Math.max(1,clampIn(inA,maxA)),k=Math.max(2,clampIn(inB,maxB)),q=Math.floor(n/k),r=n%k;
    out.innerHTML=`<p class="eq">${fmt(n)} ÷ ${k} = <b>${fmt(q)}</b>${r?` remainder <b>${r}</b>`:''}</p>
      <p>Check: ${k} × ${fmt(q)}${r?` + ${r}`:''} = ${fmt(n)}.</p>${n<=30&&k<=8?binsHTML(n,k):'<p class="note">Try a number up to 30 and a divisor up to 8 to see the groups.</p>'}`;
  };
  inA.addEventListener('input',draw);inB.addEventListener('input',draw);draw();
}

function kaliDemo(){
  let h='<div class="demo"><div class="mtwrap"><table class="mt"><caption class="vh">Multiplication table, 1 to 10. Pick a square.</caption><thead><tr><th><span aria-hidden="true">×</span></th>';
  for(let j=1;j<=10;j++)h+=`<th scope="col" data-c="${j}">${j}</th>`;
  h+='</tr></thead><tbody>';
  for(let i=1;i<=10;i++){
    h+=`<tr><th scope="row" data-r="${i}">${i}</th>`;
    for(let j=1;j<=10;j++)h+=`<td><button type="button" data-a="${i}" data-b="${j}" aria-label="${i} times ${j}">${i*j}</button></td>`;
    h+='</tr>';
  }
  return h+'</tbody></table></div><div id="kaliOut" aria-live="polite"></div></div>';
}
function mountKali(a0,b0){
  const root=$('#learn');
  const select=(a,b)=>{
    $$('.mt button',root).forEach(btn=>{
      const x=+btn.dataset.a,y=+btn.dataset.b;
      btn.classList.toggle('sel',x===a&&y===b);
      btn.classList.toggle('hl',(x===a||y===b)&&!(x===a&&y===b));
      btn.classList.toggle('mir',x===b&&y===a&&a!==b);
    });
    $$('.mt th[data-r]',root).forEach(th=>th.classList.toggle('on',+th.dataset.r===a));
    $$('.mt th[data-c]',root).forEach(th=>th.classList.toggle('on',+th.dataset.c===b));
    let dots='',idx=0;
    for(let r=0;r<a;r++)for(let c=0;c<b;c++){dots+=`<i class="${r%2?'alt':''}" style="animation-delay:${Math.min(idx,50)*14}ms"></i>`;idx++;}
    $('#kaliOut').innerHTML=`<p class="eq">${a} × ${b} = <b>${a*b}</b></p>
      <p>${a} × ${b} is the same as ${Array(a).fill(b).join(' + ')}.</p>
      <p>You can swap the order: ${b} × ${a} = ${a*b}.</p>
      <div class="dots" style="--c:${b}" aria-hidden="true">${dots}</div>`;
  };
  $('.mt',root).addEventListener('click',e=>{const b=e.target.closest('button');if(b){sfx.tap();select(+b.dataset.a,+b.dataset.b);}});
  select(a0,b0);
}

function bagiDemo(){
  return `<div class="demo"><div class="demo-controls">
    <label for="rN">Marbles: <output id="oN">12</output><input id="rN" type="range" min="2" max="30" value="12"></label>
    <label for="rK">Bags: <output id="oK">3</output><input id="rK" type="range" min="2" max="6" value="3"></label>
  </div><div id="bagiOut" aria-live="polite"></div></div>`;
}
function mountBagi(){
  const rN=$('#rN'),rK=$('#rK');
  const draw=()=>{
    const n=+rN.value,k=+rK.value,q=Math.floor(n/k),r=n%k;
    $('#oN').textContent=n;$('#oK').textContent=k;
    let h=binsHTML(n,k).replace(/Group (\d)/g,'Bag $1');
    h+=`<p class="eq">${n} ÷ ${k} = <b>${q}</b>${r?` remainder <b>${r}</b>`:''}</p>`;
    h+=r?`<p>Check: ${k} × ${q} + ${r} = ${n}.</p>`:`<p>Check with multiplication: ${k} × ${q} = ${n}.</p>`;
    $('#bagiOut').innerHTML=h;
  };
  rN.addEventListener('input',draw);rK.addEventListener('input',draw);draw();
}

function pecahDemo(g){
  const dm=g===1?4:g===2?6:g===3?8:12;
  return `<div class="demo"><div class="demo-controls">
    <label for="rD">Denominator: <output id="oD">4</output><input id="rD" type="range" min="2" max="${dm}" value="4"></label>
    <label for="rP">Numerator: <output id="oP">3</output><input id="rP" type="range" min="0" max="4" value="3"></label>
  </div><div id="pecahOut" aria-live="polite"></div></div>`;
}
function mountPecah(g){
  const rD=$('#rD'),rP=$('#rP'),outEl=$('#pecahOut');let sel=new Set([0,1,2]);
  const pie=(s,d)=>{
    let o=`<svg class="pie" viewBox="0 0 100 100" role="group" aria-label="Circle divided into ${d} equal parts. Tap a part to shade it.">`;
    for(let i=0;i<d;i++){
      const a0=-Math.PI/2+i*2*Math.PI/d,a1=-Math.PI/2+(i+1)*2*Math.PI/d,on=s.has(i);
      o+=`<path data-i="${i}" tabindex="0" role="button" aria-pressed="${on}" aria-label="Part ${i+1} of ${d}, ${on?'shaded':'not shaded'}" class="${on?'on':'off'}" d="M50 50 L${(50+46*Math.cos(a0)).toFixed(2)} ${(50+46*Math.sin(a0)).toFixed(2)} A46 46 0 0 1 ${(50+46*Math.cos(a1)).toFixed(2)} ${(50+46*Math.sin(a1)).toFixed(2)} Z"/>`;
    }
    return o+'</svg>';
  };
  const bar=(s,d)=>`<div class="bar2" style="--d:${d}" role="img" aria-label="Bar divided into ${d} equal parts, ${s.size} shaded">${Array.from({length:d},(_,i)=>`<i data-i="${i}" class="${s.has(i)?'on':''}"></i>`).join('')}</div>`;
  const draw=focus=>{
    const d=+rD.value;[...sel].forEach(i=>{if(i>=d)sel.delete(i);});
    const n=sel.size;rP.max=d;rP.value=n;
    $('#oD').textContent=d;$('#oP').textContent=n;
    const extra=g>=5?` As a decimal, that is ${(n/d).toFixed(2)}${g>=6?` and about ${Math.round(n/d*100)}%`:''}.`:'';
    outEl.innerHTML=`<div class="pf"><div class="frac" role="img" aria-label="fraction ${n} over ${d}"><span>${n}</span><span class="vinc"></span><span>${d}</span></div>${pie(sel,d)}</div>
      <div class="barwrap">${bar(sel,d)}</div>
      <p class="pecah-note">${n} of ${d} equal parts are shaded.${extra}</p><p class="pecah-note"><b>Tap a part</b> to shade it or clear it.</p>`;
    if(focus!=null){const el=$(`.pie [data-i="${focus}"]`,outEl);if(el)el.focus({preventScroll:true});}
  };
  rD.addEventListener('input',()=>draw());
  rP.addEventListener('input',()=>{const n=+rP.value;sel=new Set(Array.from({length:n},(_,i)=>i));draw();});
  outEl.addEventListener('click',e=>{const t=e.target.closest('[data-i]');if(!t)return;const i=+t.dataset.i;if(sel.has(i))sel.delete(i);else sel.add(i);sfx.tap();draw(t.closest('.pie')?i:null);});
  outEl.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('.pie [data-i]')){e.preventDefault();e.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});
  draw();
}

function ceritaDemo(g){
  const rows=[['in total, altogether, sum, plus','Add (+)',1],['left, remain, gave away, ate, difference','Subtract (−)',1],['each, every, per, times','Multiply (×)',2],['shared equally, split evenly','Divide (÷)',2]].filter(r=>r[2]<=g);
  const ex=g===1
    ?`<p><b>Example.</b> Mia has 5 stickers. Ben gives her 3 more. How many stickers does Mia have <span class="mk">in total</span>?</p>
      <p>Known: 5 stickers and 3 more. The key words "in total" mean add.</p>
      <p>5 + 3 = <b>8 stickers</b>.</p>`
    :`<p><b>Example.</b> Mom buys 4 bags of oranges. <span class="mk">Each</span> bag has 6 oranges. How many oranges does Mom buy?</p>
      <p>Known: 4 bags, 6 oranges in each bag. The key word "each" means multiply.</p>
      <p>4 × 6 = <b>24 oranges</b>.</p>`;
  return `<ol class="steps">
      <li>Read the whole problem.</li>
      <li>Write what you know and what you need to find.</li>
      <li>Choose an operation. Key words can help.</li>
      <li>Solve it, then check that your answer makes sense.</li>
    </ol>
    <table class="kw"><thead><tr><th scope="col">Words in the problem</th><th scope="col">Operation</th></tr></thead><tbody>
      ${rows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}
    </tbody></table>
    <div class="worked">${ex}</div>`;
}


function playAddDemo(){
  const grp=(id,label,k)=>`<div class="pgroup"><div class="plabel">${label}</div><div class="pdots" id="group${id}" aria-hidden="true"></div>
    <div class="pctl"><button type="button" class="rnd" data-p="${k}-" aria-label="Take one away from the ${label.toLowerCase()}">−</button><output id="pc${id}" aria-live="polite"></output><button type="button" class="rnd" data-p="${k}+" aria-label="Add one to the ${label.toLowerCase()}">+</button></div></div>`;
  return `<div class="demo" id="playBox">${grp('A','First group','a')}${grp('B','Second group','b')}
    <div class="actions" style="margin-top:6px"><button type="button" class="btn go" data-p="join">Put them together!</button></div>
    <div id="playOut" aria-live="polite"></div></div>`;
}
function mountPlayAdd(){
  let a=5,b=3,joined=false;
  const dots=(n,c)=>Array.from({length:n},(_,i)=>`<i class="pd ${c}" style="animation-delay:${i*40}ms"></i>`).join('');
  const draw=()=>{
    $('#pcA').textContent=a;$('#pcB').textContent=b;
    $('#groupA').innerHTML=dots(a,'a');$('#groupB').innerHTML=dots(b,'b');
    $('#playOut').innerHTML=joined
      ?`<div class="pdrow">${Array.from({length:a+b},(_,i)=>`<i class="pd ${i<a?'a':'b'}" style="animation-delay:${i*70}ms"><b>${i+1}</b></i>`).join('')}</div><p class="eq">${a} + ${b} = <b>${a+b}</b></p>`
      :'<p class="pick-note">Change the groups, then press the button.</p>';
  };
  $('#playBox').addEventListener('click',e=>{
    const t=e.target.closest('[data-p]');if(!t)return;const k=t.dataset.p;sfx.tap();
    if(k==='a+')a=Math.min(10,a+1);else if(k==='a-')a=Math.max(1,a-1);
    else if(k==='b+')b=Math.min(10,b+1);else if(k==='b-')b=Math.max(1,b-1);
    if(k==='join'){joined=true;draw();sfx.good();speak(`${a} plus ${b} equals ${a+b}`);return;}
    joined=false;draw();
  });
  draw();
}
function playSubDemo(){
  return `<div class="demo" id="playBox"><div class="pgroup"><div class="plabel">Tap a dot to take it away</div><div class="pdots" id="subDots"></div>
    <div class="pctl"><button type="button" class="rnd" data-p="n-" aria-label="Fewer dots">−</button><output id="pcN" aria-live="polite"></output><button type="button" class="rnd" data-p="n+" aria-label="More dots">+</button><button type="button" class="tool" data-p="reset">Start again</button></div></div>
    <div id="playOut" aria-live="polite"></div></div>`;
}
function mountPlaySub(){
  let n=12;const gone=new Set();
  const draw=()=>{
    $('#pcN').textContent=n;
    $('#subDots').innerHTML=Array.from({length:n},(_,i)=>`<button type="button" class="pd a${gone.has(i)?' gone':''}" data-i="${i}" aria-label="Dot ${i+1}${gone.has(i)?', taken away':', tap to take away'}" aria-pressed="${gone.has(i)}"></button>`).join('');
    const t=gone.size;
    $('#playOut').innerHTML=t?`<p class="eq">${n} − ${t} = <b>${n-t}</b></p><p>You started with ${n}, took ${t} away, and ${n-t} are left.</p>`:'<p class="pick-note">Tap the dots to take them away.</p>';
  };
  $('#playBox').addEventListener('click',e=>{
    const d=e.target.closest('[data-i]');
    if(d){const i=+d.dataset.i;if(gone.has(i))gone.delete(i);else gone.add(i);sfx.tap();draw();return;}
    const t=e.target.closest('[data-p]');if(!t)return;const k=t.dataset.p;sfx.tap();
    if(k==='n+'){n=Math.min(20,n+1);}else if(k==='n-'){n=Math.max(3,n-1);[...gone].forEach(i=>{if(i>=n)gone.delete(i);});}
    else if(k==='reset')gone.clear();
    draw();
  });
  draw();
}

/* ---------- hands-on tools (sliders and picks) for Shapes, Measure & Time, Data ---------- */
const num=x=>{const r=Math.round(x*100)/100;return r.toLocaleString('en-US');};
const SHAPEINFO={
  circle:['Circle','No sides and no corners. It is round.'],square:['Square','4 equal sides and 4 corners.'],
  rectangle:['Rectangle','4 sides and 4 corners. 2 sides are long and 2 are short.'],triangle:['Triangle','3 sides and 3 corners.'],
  pentagon:['Pentagon','5 sides and 5 corners.'],hexagon:['Hexagon','6 sides and 6 corners.'],
  sphere:['Sphere','Round like a ball. It rolls.'],cube:['Cube','6 flat faces. Every face is a square.'],
  cuboid:['Box (cuboid)','6 flat faces. They are rectangles.'],cylinder:['Cylinder','Like a can. 2 flat faces and 1 curved face.'],
  cone:['Cone','Like an ice cream cone. 1 flat face and 1 point.']
};
const triLabeled=(b,h)=>`<div class="qvis"><svg class="shp dim" viewBox="0 0 144 84" role="img" aria-label="A triangle with its base and height labeled"><polygon points="14,64 104,64 54,12"/><line x1="54" y1="12" x2="54" y2="64"/><text x="59" y="80">base ${b} cm</text><text x="58" y="42" class="v">height ${h} cm</text></svg></div>`;
const circleSVG=r=>`<div class="qvis"><svg class="shp dim" viewBox="0 0 144 84" role="img" aria-label="A circle with its radius labeled"><circle cx="50" cy="42" r="36"/><line x1="50" y1="42" x2="86" y2="42"/><circle cx="50" cy="42" r="2.5" class="pt"/><text x="102" y="45" class="v">r = ${r} cm</text></svg></div>`;
const clockTxt=(h,m)=>`${clockSVG(h,m)}<p class="eq"><b>${timeStr(h,m)}</b></p><p>The <b>short</b> hand points to ${h}${m===30?', just past it':''}. The <b>long</b> hand points to ${m/5||12}${m===0?". That means o'clock.":m===30?'. That means half past.':`. That is ${m} minutes.`}</p>`;
const durText=d=>d>=60?`${Math.floor(d/60)} hour${d>=120?'s':''}${d%60?` ${d%60} minutes`:''}`:`${d} minutes`;
const mostFewest=(L,v)=>{const mx=Math.max(...v),mn=Math.min(...v);const nm=x=>L.filter((_,i)=>v[i]===x).join(' and ');return mx===mn?'<p>All are the same.</p>':`<p>Most: <b>${nm(mx)}</b> (${mx}). Fewest: <b>${nm(mn)}</b> (${mn}).</p>`;};
const FAM={len:['m','cm',100],wt:['kg','g',1000],cap:['L','mL',1000],km:['km','m',1000],cm:['cm','mm',10],time:['minutes','seconds',60],hr:['hours','minutes',60]};
const FAMLAB={len:'m ↔ cm',wt:'kg ↔ g',cap:'L ↔ mL',km:'km ↔ m',cm:'cm ↔ mm',time:'min ↔ sec',hr:'hours ↔ min'};
const convTool=(fams,step)=>({name:'Convert',pick:fams.map(f=>[f,FAMLAB[f]]),inputs:[['Amount',step,10,step===1?3:1.5,'',step]],
  draw:([n],p)=>{const [B,S,k]=FAM[p];return `<p class="eq">${num(n)} ${B} = <b>${num(n*k)} ${S}</b></p><p>Big unit to small unit: multiply by ${num(k)}. ${num(n)} × ${num(k)} = ${num(n*k)}.</p><p class="eq">${num(n*k)} ${S} = <b>${num(n)} ${B}</b></p><p>Small unit to big unit: divide by ${num(k)}.</p>`;}});
const barsTool=step=>({name:'Bar chart',inputs:KIDS.map((k,i)=>[k,1,10,[6,4,8,3][i]]),
  draw:v=>{const vals=v.map(x=>x*step),s=vals.reduce((a,b)=>a+b,0);return `${barChart(KIDS,vals,step)}<p class="eq">Total: <b>${s}</b></p><p>${vals.join(' + ')} = ${s}</p>${mostFewest(KIDS,vals)}`;}});
const statsTool=(n,full)=>({name:'Number set',inputs:Array.from({length:n},(_,i)=>['Number '+(i+1),1,20,[7,4,9,7,12,3][i]]),
  draw:v=>{
    const s=[...v].sort((a,b)=>a-b),sum=v.reduce((a,b)=>a+b,0),cnt={};v.forEach(x=>cnt[x]=(cnt[x]||0)+1);
    const top=Math.max(...Object.values(cnt)),modes=Object.keys(cnt).filter(k=>cnt[k]===top).map(Number).sort((a,b)=>a-b);
    const mode=top===1?'none':modes.join(', '),med=n%2?s[(n-1)/2]:(s[n/2-1]+s[n/2])/2;
    let o=`<p>In order: <b>${s.join(', ')}</b></p><div class="statgrid"><div><span>Mode</span><b>${mode}</b></div><div><span>Range</span><b>${s[n-1]-s[0]}</b></div>${full?`<div><span>Mean</span><b>${num(sum/n)}</b></div><div><span>Median</span><b>${num(med)}</b></div>`:''}</div><ul class="statlist"><li>Mode: ${top===1?'no number appears more than once':'appears '+top+' times'}.</li><li>Range: ${s[n-1]} − ${s[0]} = ${s[n-1]-s[0]}.</li>`;
    if(full)o+=`<li>Mean: ${v.join(' + ')} = ${sum}, then ${sum} ÷ ${n} = ${num(sum/n)}.</li><li>Median: ${n%2?`the middle number is ${med}`:`the middle two are ${s[n/2-1]} and ${s[n/2]}, so their mean is ${num(med)}`}.</li>`;
    return o+'</ul>';
  }});
const UNITS={len:[['cm','a pencil, a finger'],['m','a door, a classroom'],['km','the road to another town']],wt:[['g','a paper clip, an apple'],['kg','a bag of rice, a child']],cap:[['mL','a spoon of medicine'],['L','a bucket of water, a milk bottle']]};
const UNITNOTE={len:'1 m = 100 cm. 1 km = 1,000 m.',wt:'1 kg = 1,000 g.',cap:'1 L = 1,000 mL.'};
const TOOLS={
  shapes:{name:'Flat shapes',pick:['circle','square','rectangle','triangle','pentagon','hexagon'].map(k=>[k,SHAPEINFO[k][0]]),draw:(v,p)=>`${shapeSVG(p)}<p class="eq"><b>${SHAPEINFO[p][0]}</b></p><p>${SHAPEINFO[p][1]}</p>`},
  solids:{name:'Solid shapes',pick:['sphere','cube','cuboid','cylinder','cone'].map(k=>[k,SHAPEINFO[k][0]]),draw:(v,p)=>`${solidSVG(p)}<p class="eq"><b>${SHAPEINFO[p][0]}</b></p><p>${SHAPEINFO[p][1]}</p>`},
  rect:{name:'Rectangle',inputs:[['Length',2,15,8,'cm'],['Width',2,10,5,'cm']],draw:([l,w])=>`${rectLabeled(l,w,'cm')}${gridRect(l,w)}<p class="eq">Perimeter = <b>${2*(l+w)} cm</b></p><p>2 × (${l} + ${w}) = ${2*(l+w)}</p><p class="eq">Area = <b>${l*w} cm²</b></p><p>${l} × ${w} = ${l*w}. That is ${w} rows of ${l} squares.</p>`},
  angle:{name:'Angles',inputs:[['Angle',10,180,60,'°',5]],draw:([d])=>{const k=d<90?'Acute':d===90?'Right':d<180?'Obtuse':'Straight';const e={Acute:'An acute angle is smaller than a right angle.',Right:'A right angle is exactly 90°, like the corner of a book.',Obtuse:'An obtuse angle is bigger than 90° but smaller than 180°.',Straight:'A straight angle is 180°, a straight line.'}[k];return `${angleSVG(d)}<p class="eq"><b>${d}°</b> · ${k}</p><p>${e}</p>`;}},
  trisum:{name:'Triangle angles',inputs:[['First angle',20,100,60,'°',5],['Second angle',20,100,50,'°',5]],draw:([a,b])=>{const c=180-a-b;return c<=0?'<p class="note">These two angles are too big. The angles of a triangle must add up to 180°.</p>':`<p class="eq">${a}° + ${b}° + <b>${c}°</b> = 180°</p><p>The third angle is 180 − ${a+b} = ${c}°.</p>`;}},
  tri:{name:'Triangle',inputs:[['Base',2,20,8,'cm'],['Height',2,14,5,'cm']],draw:([b,h])=>`${triLabeled(b,h)}<p class="eq">Area = <b>${num(b*h/2)} cm²</b></p><p>${b} × ${h} ÷ 2 = ${num(b*h/2)}. A triangle is half of a ${b} by ${h} rectangle.</p>`},
  box:{name:'Box',inputs:[['Length',2,10,4,'cm'],['Width',2,10,3,'cm'],['Height',2,10,5,'cm']],draw:([l,w,h])=>`${solidSVG('cuboid')}<p class="eq">Volume = <b>${l*w*h} cm³</b></p><p>${l} × ${w} × ${h} = ${l*w*h}. The bottom layer has ${l*w} cubes, and there are ${h} layers.</p><p>Make all three the same to build a cube.</p>`},
  circle:{name:'Circle',inputs:[['Radius',1,10,5,'cm']],draw:([r])=>`${circleSVG(r)}<p class="eq">Circumference = <b>${D2(628*r)} cm</b></p><p>2 × 3.14 × ${r} = ${D2(628*r)}</p><p class="eq">Area = <b>${D2(314*r*r)} cm²</b></p><p>3.14 × ${r} × ${r} = ${D2(314*r*r)}</p>`},
  longer:{name:'Compare',inputs:[['Bar A',1,9,6],['Bar B',1,9,3]],draw:([a,b])=>`${lenBars([a,b])}<p class="eq"><b>${a===b?'Same length':a>b?'A is longer':'B is longer'}</b></p><p>${a===b?'Both bars are equally long.':a>b?'Bar A is longer. Bar B is shorter.':'Bar B is longer. Bar A is shorter.'}</p>`},
  clock1:{name:'Clock',pick:[['0',"O'clock"],['30','Half past']],inputs:[['Hour',1,12,3]],draw:([h],p)=>clockTxt(h,+p)},
  clock:{name:'Clock',inputs:[['Hour',1,12,3],['Minutes',0,55,15,'',5]],draw:([h,m])=>clockTxt(h,m)},
  elapsed:{name:'How long?',inputs:[['Start hour',1,12,2],['Start minutes',0,55,30,'',5],['Lasts',0,240,45,'minutes',5]],draw:([h,m,d])=>{const tot=h*60+m+d,eh=Math.floor(tot/60),em=tot%60;return `<div class="twoclk"><figure>${clockSVG(h,m)}<figcaption>Start ${timeStr(h,m)}</figcaption></figure><figure>${clockSVG(eh,em)}<figcaption>End ${timeStr(eh,em)}</figcaption></figure></div><p>${timeStr(h,m)} + ${durText(d)} = <b>${timeStr(eh,em)}</b></p>`;}},
  ruler:{name:'Ruler',inputs:[['Pencil',1,15,7,'cm']],draw:([L])=>`${rulerSVG(L)}<p>The pencil starts at 0 and ends at ${L}. It is <b>${L} cm</b> long.</p>`},
  units:{name:'Units',pick:[['len','Length'],['wt','Weight'],['cap','Liquid']],draw:(v,p)=>`<ul class="unitlist">${UNITS[p].map(([u,e])=>`<li><b>${u}</b> ${e}</li>`).join('')}</ul><p>${UNITNOTE[p]}</p>`},
  conv3:convTool(['len','wt','cap'],1),conv4:convTool(['len','wt','cap','km','cm'],.5),conv5:convTool(['km','wt','cap','time','hr'],.5),
  speed:{name:'Speed',inputs:[['Speed',10,120,60,'km/h',10],['Time',1,8,3,'hours']],draw:([s,t])=>`<p class="eq">Distance = <b>${num(s*t)} km</b></p><p>speed × time = ${s} × ${t} = ${num(s*t)}</p><p class="eq">Speed = <b>${s} km/h</b></p><p>distance ÷ time = ${num(s*t)} ÷ ${t} = ${s}</p><p class="eq">Time = <b>${t} hours</b></p><p>distance ÷ speed = ${num(s*t)} ÷ ${s} = ${t}</p>`},
  scale:{name:'Map scale',inputs:[['1 cm on the map is',1,20,5,'km'],['Distance on the map',1,15,6,'cm']],draw:([k,n])=>`<p class="eq">${n} cm → <b>${num(n*k)} km</b></p><p>Each centimeter stands for ${k} km. ${n} × ${k} = ${num(n*k)} km.</p>`},
  ratio:{name:'Ratio',inputs:[['Flour per batch',2,5,3,'cups'],['Milk per batch',2,7,5,'cups'],['Batches',1,6,2]],draw:([a,b,m])=>`<table class="kw"><thead><tr><th scope="col">Flour</th><th scope="col">Milk</th></tr></thead><tbody><tr><td>${a} cups</td><td>${b} cups</td></tr><tr><td>${a*m} cups</td><td>${b*m} cups</td></tr></tbody></table><p>The ratio is ${a} : ${b}. For ${m} batch${m>1?'es':''}, multiply both numbers by ${m}.</p>`},
  picto:{name:'Picture graph',inputs:[['Apples',0,8,5],['Bananas',0,8,3],['Grapes',0,8,6]],draw:v=>{const L=['Apples','Bananas','Grapes'];return `${picto(L,v)}${mostFewest(L,v)}`;}},
  bars:barsTool(1),bars2:barsTool(2),
  tally:{name:'Tally marks',inputs:[['Votes',1,25,13]],draw:([n])=>`${tallyHTML(n)}<p>${Math.floor(n/5)} group${Math.floor(n/5)===1?'':'s'} of 5 = ${Math.floor(n/5)*5}${n%5?`, plus ${n%5} = ${n}`:''}.</p>`},
  stats4:statsTool(5,false),stats5:statsTool(5,true),stats6:statsTool(6,true)
};
function toolDemo(ids){
  return `<div class="demo tooldemo">${ids.length>1?`<div class="tooltabs" role="group" aria-label="Choose a tool">${ids.map((id,i)=>`<button type="button" class="tool" data-tool="${id}" aria-pressed="${i===0}">${TOOLS[id].name}</button>`).join('')}</div>`:''}<div class="demo-controls" id="toolCtl"></div><div id="toolOut" aria-live="polite"></div></div>`;
}
function mountTool(ids){
  const demo=$('.tooldemo'),ctl=$('#toolCtl'),out=$('#toolOut');
  let cur=ids[0],p=null;
  const sliders=()=>$$('input[type="range"]',ctl);
  const draw=()=>{sliders().forEach(i=>{const o=$('output',i.parentNode);if(o)o.textContent=i.value;});out.innerHTML=TOOLS[cur].draw(sliders().map(i=>+i.value),p);};
  const build=()=>{
    const T=TOOLS[cur];p=T.pick?T.pick[0][0]:null;let s='';
    if(T.pick)s+=`<div class="pickrow" role="group" aria-label="Choose one">${T.pick.map(([val,lab],i)=>`<button type="button" class="tool" data-pick="${val}" aria-pressed="${i===0}">${lab}</button>`).join('')}</div>`;
    (T.inputs||[]).forEach(([lab,min,max,def,unit,step])=>{s+=`<label>${lab}: <span><output>${def}</output>${unit?' '+unit:''}</span><input type="range" min="${min}" max="${max}" value="${def}" step="${step||1}"></label>`;});
    ctl.innerHTML=s;draw();
  };
  demo.addEventListener('input',e=>{if(e.target.matches('input[type="range"]'))draw();});
  demo.addEventListener('click',e=>{
    const tb=e.target.closest('[data-tool]');
    if(tb){cur=tb.dataset.tool;$$('[data-tool]',demo).forEach(b=>b.setAttribute('aria-pressed',String(b===tb)));sfx.tap();build();return;}
    const pb=e.target.closest('[data-pick]');
    if(pb){p=pb.dataset.pick;$$('[data-pick]',demo).forEach(b=>b.setAttribute('aria-pressed',String(b===pb)));sfx.tap();draw();}
  });
  build();
}
const BT={1:['shapes','solids'],2:['shapes','solids'],3:['rect','angle'],4:['rect','angle','trisum'],5:['tri','box','rect'],6:['circle','box','tri']};
const UK={1:['longer','clock1'],2:['clock','ruler','units'],3:['conv3','elapsed'],4:['conv4','elapsed'],5:['speed','conv5'],6:['speed','scale','ratio']};
const DT={1:['picto'],2:['bars'],3:['bars2','tally'],4:['bars2','stats4'],5:['stats5'],6:['stats6']};

const ADDD={1:[8,7,20],2:[38,27,99],3:[358,264,999],4:[4825,3769,9999],5:[48250,37690,99999],6:[458250,237690,999999]};
const SUBD={1:[15,8,20],2:[52,27,99],3:[524,278,999],4:[5240,2783,9999],5:[52400,27830,99999],6:[524000,278300,999999]};
const decBox=(eq,txt)=>`<div class="worked"><p><b>Decimals.</b> ${txt}</p><p class="eq">${eq}</p></div>`;
const LEARN={
  tambah:{
    intro:g=>g===1?'Addition means putting two amounts together. Change the numbers below and watch the steps. Try making 10 first!'
      :g===2?'Addition means putting two amounts together. When the ones add up to 10 or more, carry 1 to the tens. Change the numbers and watch the steps.'
      :'Addition means putting two amounts together. Line up the digits and add column by column. When a column adds up to 10 or more, carry 1 to the next column on the left.',
    demo:g=>g===1?playAddDemo():colDemo(ADDD[g][0],ADDD[g][1],ADDD[g][2]),mount:g=>g===1?mountPlayAdd():mountCol('+',ADDD[g][2]),
    tip:g=>g===1?'To add 8 + 5, make 10 first: <span class="mk">8 + 2 = 10</span>, then add the 3 that is left. 10 + 3 = 13.'
      :'Start with the <span class="mk">ones</span> column, then tens, then hundreds. Write the carried number small above the next column.',
    extra:g=>g>=5?decBox('3.40 + 2.75 = 6.15','Line up the decimal points, then add each column just like whole numbers.'):''},
  kurang:{
    intro:g=>g===1?'Subtraction means taking some away. Change the numbers below and watch the steps.'
      :'Subtraction means taking some away from the amount you started with. When the top digit is smaller than the bottom digit, borrow 10 from the next column on the left.',
    demo:g=>g===1?playSubDemo():colDemo(SUBD[g][0],SUBD[g][1],SUBD[g][2]),mount:g=>g===1?mountPlaySub():mountCol('−',SUBD[g][2]),
    tip:g=>g===1?'You can check subtraction with <span class="mk">addition</span>. 15 − 8 = 7, because 7 + 8 = 15.'
      :'You can check subtraction with <span class="mk">addition</span>. For example, 52 − 27 = 25, because 25 + 27 = 52.',
    extra:g=>g>=5?decBox('6.50 − 2.75 = 3.75','Line up the decimal points, then subtract each column just like whole numbers.'):''},
  kali:{
    intro:g=>g===1?'Multiplication means equal groups. 3 × 2 means 3 groups of 2. Pick a square in the table to see the dots.'
      :g===2?'Multiplication is repeated addition made shorter. Pick a square in the table to see the dots. Start with the 2s, 5s and 10s.'
      :g===3?'Multiplication is repeated addition made shorter. Pick a square in the table to see the dots.'
      :'To multiply big numbers, break one number into place-value parts, multiply each part, then add the answers. Type your own numbers below.',
    demo:g=>g<=3?kaliDemo():twoNumDemo(g===4?36:g===5?47:245,g===4?7:g===5?23:18,999,g===4?9:99,'First number','Second number'),
    mount:g=>g<=3?mountKali(...({1:[2,3],2:[5,4],3:[6,7]}[g])):mountMul(999,g===4?9:99),
    tip:g=>g<=2?'Skip counting helps: <span class="mk">5, 10, 15, 20</span> is the 5 times table.'
      :g===3?'Learn the times table a little at a time. Because <span class="mk">6 × 7 = 7 × 6</span>, there is less to remember.'
      :'Multiply each part on its own, then add: <span class="mk">(30 × 7) + (6 × 7)</span> = 210 + 42 = 252.',
    extra:g=>g>=6?decBox('3.9 × 4 = 15.6','Ignore the decimal point and multiply: 39 × 4 = 156. Then put the point back with one decimal place.'):''},
  bagi:{
    intro:g=>g===1?'Division means sharing equally. Move the sliders to share marbles into bags.'
      :g<=3?'Division means sharing equally. Move the sliders to share marbles into bags.'
      :'Division means sharing equally or making equal groups. Type a number and a divisor to see the answer and what is left over.',
    demo:g=>g<=3?bagiDemo():twoNumDemo(g===4?29:g===5?594:3480,g===4?4:g===5?22:15,9999,99,'Number to share','Divide by'),
    mount:g=>g<=3?mountBagi():mountDiv(9999,99),
    tip:g=>'Division is the <span class="mk">opposite of multiplication</span>. If 3 × 4 = 12, then 12 ÷ 3 = 4 and 12 ÷ 4 = 3.',
    extra:g=>g>=6?decBox('16.8 ÷ 3 = 5.6','Divide as if there is no decimal point: 168 ÷ 3 = 56. Then put the point back with one decimal place.'):''},
  pecah:{
    intro:g=>g===1?'A fraction shows part of a whole that is split into equal parts. Half means 2 equal parts. Change the numbers and look at the picture.'
      :g<=3?'A fraction shows part of a whole that is split into equal parts. Change the denominator and the numerator, then look at the picture.'
      :g===4?'A fraction shows part of a whole that is split into equal parts. Change the denominator and the numerator, then look at the picture. Fractions can be equal even when they look different.'
      :'A fraction can also be a decimal or a percent. Change the denominator and the numerator and watch all three forms.',
    demo:pecahDemo,mount:mountPecah,
    tip:g=>g<=3?'The <span class="mk">denominator</span> (bottom) is the number of equal parts. The <span class="mk">numerator</span> (top) is the number of parts we take.'
      :'Equivalent fractions: multiply or divide the <span class="mk">top and bottom by the same number</span>. 1/2 = 2/4 = 3/6.',
    extra:g=>g===6?decBox('25% of 80 = 20','Percent means "out of 100". 25% = 25/100 = 1/4, and 1/4 of 80 is 20.'):''},
  bentuk:{
    intro:g=>[,'Shapes are all around us. Tap a shape to see its sides and corners. Then look at the solid shapes.','Count the sides and corners of each flat shape, and the flat faces of each solid. Tap to explore.','Perimeter is the distance around a shape. Area is the space inside. Move the sliders and watch both change. Then try angles.','Perimeter is the distance around a shape. Area is the space inside it, counted in square units. Angles are measured in degrees.','The area of a triangle is half of a rectangle. Volume is how much space a box fills, counted in cubic units. Try each tool.','A circle has a radius and a circumference. We use π ≈ 3.14. Try each tool.'][g],
    demo:g=>toolDemo(BT[g]),mount:g=>mountTool(BT[g]),
    tip:g=>[,'A <span class="mk">side</span> is a straight edge. A <span class="mk">corner</span> is where two sides meet.','Look at the <span class="mk">sides</span> and the <span class="mk">corners</span>. A square has 4 equal sides.','<span class="mk">Perimeter</span>: add all the sides. <span class="mk">Area</span>: count the squares, or length × width.','Perimeter = 2 × (length + width). Area = length × width. The angles of a triangle add up to <span class="mk">180°</span>.','Triangle area = <span class="mk">base × height ÷ 2</span>. Box volume = <span class="mk">length × width × height</span>.','Circumference = <span class="mk">2 × π × r</span>. Area = <span class="mk">π × r × r</span>. For a cube, volume = edge × edge × edge.'][g],
    extra:g=>''},
  ukur:{
    intro:g=>[,'Measuring tells us how long something is, and what time it is. Compare two bars, then try the clock.','We measure length with a ruler and read time on a clock. The short hand shows the hour. The long hand shows the minutes.','Units help us measure. Big units and small units are linked. Change the number to see how. Then find out when something ends.','Change between units by multiplying or dividing by 10, 100 or 1,000. Then work out when an activity ends.','Speed tells how far something goes in one hour. Try the calculators, and change units too.','Speed, time and distance are linked. Maps use a scale, and ratios help us scale up recipes. Try each tool.'][g],
    demo:g=>toolDemo(UK[g]),mount:g=>mountTool(UK[g]),
    tip:g=>[,'The <span class="mk">short</span> hand shows the hour. The <span class="mk">long</span> hand shows the minutes.',"Start the ruler at <span class=\"mk\">0</span>. The long hand on 12 means o'clock. On 6 it means half past.",'Big unit to small unit: <span class="mk">multiply</span>. Small unit to big unit: <span class="mk">divide</span>.','Add the hours and the minutes separately. Then change 60 minutes into 1 hour.','Distance = <span class="mk">speed × time</span>. Speed = distance ÷ time. Time = distance ÷ speed.','Scale: multiply the map distance by the scale. Ratio: find how many batches, then multiply each amount.'][g],
    extra:g=>''},
  data:{
    intro:g=>[,'A picture graph uses pictures to show how many. Move the sliders and watch the rows grow.','A bar chart uses bars to show how many. Move the sliders and read the bars.','Bar charts can count in 2s. Tally marks count votes: each group of 5 has a line through it.','Data helps us see what is common. The mode is the number that appears most. The range tells how spread out the numbers are.','The mean is the average. The median is the middle number when the numbers are in order. Move the sliders and see.','Mean, median, mode and range describe a set of numbers. Change the six numbers and watch.'][g],
    demo:g=>toolDemo(DT[g]),mount:g=>mountTool(DT[g]),
    tip:g=>[,'Count the pictures in each row. The longest row has the <span class="mk">most</span>.','Look at the <span class="mk">height</span> of each bar, then read the number on the side.','Each group of tally marks with a line through it is <span class="mk">5</span>.','Mode = appears <span class="mk">most often</span>. Range = biggest − smallest.','Mean = <span class="mk">total ÷ how many</span>. Median = the middle number after you put them in order.','With an even number of values, the median is the <span class="mk">mean of the two middle numbers</span>.'][g],
    extra:g=>''},

  cerita:{
    intro:g=>'Word problems turn everyday stories into math. Follow these four steps.',
    demo:ceritaDemo,mount:null,
    tip:g=>'Key words are only clues. Picture the story first, then choose the operation.',extra:g=>''}
};

const SHORT={
  tambah:{1:['Put two groups together. Tap + or − to change them. Then press the button!','Count them all to find the total.'],2:['Add the ones first, then the tens. If you reach 10, carry 1.','Start with the ones.']},
  kurang:{1:['Take some away. Tap a dot to take it away.','What is left is the answer.'],2:['Take away the ones first, then the tens. Borrow if you need to.','Check it: answer + small number = big number.']},
  kali:{1:['Equal groups! 3 × 2 means 3 groups of 2. Tap a square.','Count the dots to check.'],2:['Multiplying is adding the same number again and again. Tap a square!','Try the 2s, 5s and 10s first.']},
  bagi:{1:['Share equally. Move the sliders to share the marbles.','Every bag gets the same amount.'],2:['Share equally. Move the sliders to share the marbles.','Check it with times: bags × each = marbles.']},
  pecah:{2:['A fraction is part of a whole. Cut it into equal parts and look!','Bottom number: equal parts. Top number: parts we take.']},
  bentuk:{1:['Look at the shapes. Tap one to see its sides!','Sides are straight edges.'],2:['Tap a shape. Count its sides and corners.','A square has 4 equal sides.']},
  ukur:{1:['Compare lengths and read the clock. Move the sliders!','Short hand: the hour. Long hand: the minutes.'],2:['Read the clock and the ruler. Move the sliders!','Start the ruler at zero.']},
  data:{1:['Count the pictures in each row. Move the sliders!','The longest row has the most.'],2:['Read the bars. Move the sliders!','Look at how tall each bar is.']},
  cerita:{1:['Read the story. Find the key words. Pick plus or minus.','Key words are clues.'],2:['Read the story. Find the key words. Then pick the math.','Picture the story first.']}
};
function renderLearn(){
  const t=topicOf(state.topic),L=LEARN[t.id],P=PLACES[t.id],g=grade(),sh=g<=2&&SHORT[t.id]&&SHORT[t.id][g];
  $('#learn').innerHTML=`<button type="button" class="tool back" data-nav="place">${ICO.back}Back</button>
    <div class="card-head"><span class="sign" style="--bg:${t.bg};--fg:${t.fg}" aria-hidden="true">${t.sign}</span><div><p class="eyebrow">Learn ${t.name.toLowerCase()} · Grade ${g}</p><h2 id="learnH" tabindex="-1">${P.place}</h2></div></div>
    <div class="storybox"><div class="mw" aria-hidden="true">${mascotSVG()}</div><p class="bubble l">${P.story}</p></div>
    <p class="intro">${sh?sh[0]:L.intro(g)}</p><p class="listenrow">${listenBtn('#learn .intro')}</p>${L.demo(g)}${L.extra(g)}<p class="tip"><span class="sticker">Remember!</span>${sh?sh[1]:L.tip(g)}</p>
    <div class="actions"><button type="button" class="btn go" data-nav="levels">Ready? Let's play!</button></div>`;
  if(L.mount)L.mount(g);
}


/* ---------- choose your grade ---------- */
const GRADE_INFO={1:['Ages 6–7','Numbers to 20'],2:['Ages 7–8','Numbers to 100'],3:['Ages 8–9','Numbers to 1,000'],4:['Ages 9–10','Numbers to 10,000'],5:['Ages 10–11','Big numbers and decimals'],6:['Ages 11–12','Fractions, decimals, percent']};
function renderGrade(){
  const cur=pref.grade,nm=pref.name?`, ${esc(pref.name)}`:'';
  $('#gradeScr').innerHTML=`${cur?`<button type="button" class="tool back" data-nav="home">${ICO.back}Back</button>`:''}
    <h2 id="gradeH" tabindex="-1">Which grade are you in?</h2>
    <div class="storybox"><div class="mw" aria-hidden="true">${mascotSVG()}</div><p class="bubble l">Hi${nm}! Tell me your grade and I will pick the right math for you.</p></div>
    <p class="pick-note">Tap your grade. You will get the topics and numbers that fit it.</p>
    <div class="grades">${[1,2,3,4,5,6].map(n=>`<button type="button" class="gbtn" data-grade="${n}" style="--bg:${NB_COL[n-1][0]};--fg:${NB_COL[n-1][1]}"${cur===n?' aria-current="true"':''}>
      <span class="g-n" aria-hidden="true">${n}</span><span class="g-l">Grade ${n}</span><span class="g-i">${GRADE_INFO[n][0]}</span><span class="g-h">${GRADE_INFO[n][1]}</span></button>`).join('')}</div>`;
}
function updateGrade(){$('#gradeTxt').textContent='Grade '+grade();}
function chooseGrade(n){
  pref.grade=n;savePref();state.quiz=null;lastTotal=null;lastRet=null;
  updateGrade();renderShelf();renderTabs();renderPlace();renderLearn();renderPractice();
  go('home');sfx.win();setMood('cheer',`Grade ${n}! Let's find my numbers!`);
  if(pref.read!==false)speak(nameLine('go',"Let's go!"));
}

/* ---------- place: choose Learn or Play ---------- */
function renderPlace(){
  const t=topicOf(state.topic),P=PLACES[t.id],n=topicStars(t.id);
  const badge='<span class="tab-badge">Start here!</span>';
  $('#place').innerHTML=`<div class="card-head"><span class="sign" style="--bg:${t.bg};--fg:${t.fg}" aria-hidden="true">${t.sign}</span><div><p class="eyebrow">${t.name} · Grade ${grade()}</p><h2 id="placeH" tabindex="-1">${P.place}</h2></div></div>
    <div class="storybox"><div class="mw" aria-hidden="true">${mascotSVG()}</div><p class="bubble l">${P.story}</p></div>
    <h3>What do you want to do?</h3>
    <div class="doors">
      <button type="button" class="door learn" data-nav="learn"><span class="door-n" aria-hidden="true">1</span>${n===0?badge:''}${ICO.bulb}<b>Learn</b><small>See how it works</small></button>
      <button type="button" class="door play" data-nav="levels"><span class="door-n" aria-hidden="true">2</span>${n>0?badge:''}${ICO.play}<b>Play</b><small>Answer 10 questions</small><span class="door-stars">${miniStar} ${n}/9 stars here</span></button>
    </div>`;
}

/* ---------- practice ---------- */
function renderPractice(){
  const t=topicOf(state.topic),P=PLACES[t.id];
  $('#practice').innerHTML=`<button type="button" class="tool back" data-nav="place">${ICO.back}Back</button>
    <div class="card-head"><span class="sign" style="--bg:${t.bg};--fg:${t.fg}" aria-hidden="true">${t.sign}</span><div class="grow"><p class="eyebrow">${P.place} · Grade ${grade()}</p><h2 id="levelH" tabindex="-1">Pick a level</h2></div></div>
    <p class="pick-note">Tap a level to start. Each game has 10 questions.</p>
    <div class="level-grid" style="margin-top:16px">
      ${[1,2,3].map(l=>`<button type="button" class="level" data-level="${l}" style="--bg:${LV_STYLE[l-1][0]};--fg:${LV_STYLE[l-1][1]}">
        <span class="lv-name">${LV[l-1]}</span><span class="lv-desc">${LEVEL_DESC[grade()][t.id][l-1]}</span><span class="lv-stars">${stars(starsFor(t.id,l))}</span></button>`).join('')}
    </div>
    <p class="hintrow"><button type="button" class="link" data-nav="learn">Not sure? Read the lesson first</button></p>`;
}
const HINT={
  tambah:g=>g<=2?'Try counting up. Start from the bigger number!':'Add the ones first, then the next column. Remember to carry.',
  kurang:g=>g<=2?'Try counting back. Or check: answer + small number = big number.':'Subtract the ones first. Borrow if the top digit is too small. Check with addition.',
  kali:g=>g<=3?'Think of equal groups. Add the same number again and again.':'Break a number into tens and ones, multiply each part, then add.',
  bagi:g=>'Division is the opposite of multiplication. Check it with times.',
  pecah:g=>'Look at the picture or the numbers. The bottom number is how many equal parts.',
  bentuk:g=>g<=2?'Look closely. Count the sides and corners one by one.':'Draw the shape if you can. Remember the formula and write the units.',
  ukur:g=>g<=2?'Look at the picture carefully. On a clock, the short hand is the hour and the long hand is the minutes.':'Check the units first. Change to the same unit before you calculate.',
  data:g=>g<=3?'Look at the chart again. Find the label, then read its number.':g===4?'Mode is the number that appears most often. Range is biggest minus smallest.':'Mean is the total divided by how many. Median is the middle number in order.',
  cerita:g=>'Find the key words in the story. Then choose plus, minus, times or divide.'
};
const BEATS=['Number 1 is home! Now Bobby can start counting.','Number 2 came back with a shiny button.','Number 3 is dancing on the shelf!','Number 4 found its way out of the wind.','Number 5 is home. We are halfway there!','Number 6 rolled all the way back.','Number 7 brought good luck with it!','Number 8 is back. Only one more to go!','Number 9 is home! The shelf is complete!'];
function startQuiz(){
  const gen=GEN[state.topic],qs=[],seen=new Set();let guard=0;
  while(qs.length<10&&guard++<300){const q=gen(state.level,grade());if(seen.has(q.key))continue;seen.add(q.key);q.hint=HINT[state.topic](grade());qs.push(q);}
  state.quiz={qs,i:0,answers:[],locked:false,done:false};
  sfx.tap();renderQuiz();go('quiz');
}
function progHTML(){
  const q=state.quiz;
  return q.qs.map((_,i)=>{
    const a=q.answers[i];let c='',t=i+1;
    if(a){c=a.ok?'ok':a.retry?'try':'no';t=a.ok||a.retry?'✓':'✕';}else if(i===q.i)c='cur';
    return `<i class="${c}">${t}</i>`;
  }).join('');
}
function renderQuiz(){
  const q=state.quiz,cur=q.qs[q.i],t=topicOf(state.topic);
  const letters=['A','B','C','D'];
  state.bubble=q.i===0?`Let's find numbers in ${PLACES[t.id].place}!`:'Pick your answer!';
  $('#practice').innerHTML=`<div class="qhead"><div class="buddy sm" aria-hidden="true">${bubbleHTML()}${mascotSVG()}</div><button type="button" class="tool" data-act="quit">✕ Exit</button></div>
    <h2 class="vh">Quiz: ${PLACES[t.id].place}</h2><p class="eyebrow" style="margin-top:8px">Grade ${grade()} · ${PLACES[t.id].place} · ${LV[state.level-1]}</p>
    <div class="prog" id="prog" role="img" aria-label="Question ${q.i+1} of ${q.qs.length}">${progHTML()}</div>
    <p class="q-count">Question ${q.i+1} of ${q.qs.length}</p>
    ${cur.visual}
    <p class="q-text ${cur.kind==='eq'?'eq-big':'sentence'}" tabindex="-1">${cur.text}</p>
    <p class="listenrow">${listenBtn('#practice .q-text')}</p>
    <div class="choices" role="group" aria-label="Answer choices">${cur.choices.map((c,i)=>`<button type="button" class="choice" data-choice="${i}" style="--bg:${CHOICE_STYLE[i][0]};--fg:${CHOICE_STYLE[i][1]}"><span class="key" aria-hidden="true">${letters[i]}</span><span class="val">${c}</span><span class="mark" aria-hidden="true"></span></button>`).join('')}</div>
    <div class="feedback" id="fb" role="status"></div>
    <div class="actions"><button type="button" class="btn go nudge" id="nextBtn" data-act="next" hidden>Next question</button></div>`;
  say(state.bubble);
  if(q.i>0)toTop();
  const qt=$('#practice .q-text');if(qt)qt.focus({preventScroll:true});
  autoSpeak(cur.text);
}
function answer(idx){
  const q=state.quiz;if(!q||q.locked||q.done)return;
  const cur=q.qs[q.i],picked=cur.choices[idx];if(picked===undefined)return;
  const ok=picked===cur.answer,btns=$$('#practice .choice'),pb=btns[idx];
  if(pb&&pb.classList.contains('tried'))return;
  if(!ok&&!cur.tried){
    cur.tried=true;pb.classList.add('wrong','tried');pb.setAttribute('aria-disabled','true');
    const fb1=$('#fb');fb1.className='feedback hint';
    fb1.innerHTML=`<p class="fb-title">Not quite. Try once more!</p><p class="fb-body">Hint: ${cur.hint}</p>`;
    sfx.bad();setMood('oops','Try once more!');sayLater(grade()<=2?'Try once more. '+cur.hint:'Not quite. Try once more!',380);
    return;
  }
  q.locked=true;q.answers.push({picked,ok:ok&&!cur.tried,retry:ok&&!!cur.tried});
  btns.forEach((b,i)=>{
    b.setAttribute('aria-disabled','true');
    if(cur.choices[i]===cur.answer){b.classList.add('right');$('.mark',b).textContent='✓';}
    else if(i===idx){b.classList.add('wrong');$('.mark',b).textContent='✕';}
    else b.classList.add('dim');
  });
  const msg=ok?pick(CHEER):pick(OOPS);
  const fb=$('#fb');fb.className='feedback '+(ok?'ok':'no');
  fb.innerHTML=`<p class="fb-title">${ok?(cur.tried?'Yes, you found it!':msg):'Not quite. The correct answer is: '+cur.answer}</p><p class="fb-body">${cur.explain}</p>`;
  $('#prog').innerHTML=progHTML();
  if(ok){const r=pb.getBoundingClientRect();confetti(r.left+r.width/2,r.top+r.height/2);sfx.good();}else sfx.bad();
  setMood(ok?'cheer':'oops',msg);
  sayLater(ok?(cur.tried?'Yes, you found it!':msg):msg,380);
  const nb=$('#nextBtn');nb.hidden=false;nb.textContent=q.i===q.qs.length-1?'See results':'Next question';nb.focus();
}
function nextQ(){
  const q=state.quiz;if(!q||!q.locked)return;
  q.i++;q.locked=false;sfx.tap();
  if(q.i>=q.qs.length)finishQuiz();else renderQuiz();
}
function finishQuiz(){
  const q=state.quiz;q.done=true;
  const score=q.answers.filter(a=>a.ok).length,total=q.qs.length;
  const st=score>=9?3:score>=7?2:score>=5?1:0;
  const key=pkey(state.topic,state.level),prev=progress[key]||0,before=returnedCount();
  if(st>prev){progress[key]=st;saveProgress();}
  const after=returnedCount();
  renderTabs();renderShelf();
  const msg=st===3?'Amazing! You have mastered this level.':st===2?'Great! Almost perfect.':st===1?'Not bad. Read the lesson again, then try once more.':"Don't give up. Read the lesson first, then try again.";
  const wrong=q.qs.map((qq,i)=>({qq,a:q.answers[i]})).filter(x=>!x.a.ok);
  const firstTry=q.answers.filter(a=>a.ok).length;
  const t=topicOf(state.topic),canUp=score>=7&&state.level<3;
  const nm=pref.name||'friend';
  const retHTML=after>before?`<div class="returned"><span class="nb big" style="${nbStyle(after-1)}">${after}</span><p><b>Number ${after} is back on Bobby's shelf!</b> Thank you, ${esc(nm)}.<br><i class="beat">${BEATS[after-1]}</i></p></div>`:'';
  state.bubble=after>before?'A number came home!':st>=2?'Yay, you are amazing!':'Try again, you can do it!';
  if(pref.read!==false)speak(st>=2?nameLine('good','Great job!'):nameLine('try','You can do it!'));
  $('#practice').innerHTML=`<div class="qhead"><div class="buddy sm" aria-hidden="true">${bubbleHTML()}${mascotSVG()}</div></div>
    <p class="eyebrow" style="margin-top:8px">Results · ${PLACES[t.id].place} · ${LV[state.level-1]}</p>
    <p class="result-score">${score}<small> out of ${total} correct</small></p>
    <div class="result-stars" role="img" aria-label="${st} of 3 stars">${[0,1,2].map(i=>`<span class="rs" style="--n:${i}">${star(i<st)}</span>`).join('')}</div>
    <p>${msg}</p>
    ${retHTML}
    ${wrong.length?`<h3>Questions to review</h3><ul class="review">${wrong.map(({qq,a})=>`<li>${qq.visual}<p class="rv-q">${qq.text}</p>${a.retry?`<p>You found it on the second try. Answer: <b>${qq.answer}</b>.</p>`:`<p>Your answer: <b>${a.picked}</b>. Correct answer: <b>${qq.answer}</b>.</p>`}<p>${qq.explain}</p></li>`).join('')}</ul>`:''}
    <div class="actions">
      ${canUp?`<button type="button" class="btn go" data-act="up">Try ${LV[state.level].toLowerCase()} level</button>`:''}
      <button type="button" class="btn${canUp?'':' go'}" data-act="again">Play again</button>
      <button type="button" class="btn alt" data-nav="home">Back to home</button>
    </div>
    <p class="hintrow"><button type="button" class="link" data-act="learn">Read the lesson again</button></p>`;
  go('result');
  say(state.bubble);
  setMood(st>=2||after>before?'cheer':'hello');
  if(st>=2){rain();sfx.win();}else sfx.tap();
  if(after>=9&&!finDone())setTimeout(()=>{if(!story.open)openStory(finaleScenes(),setFin);},1800);
}

/* ---------- full-screen story ---------- */
const story={list:[],i:0,done:null,open:false,prev:null};
const words=t=>t.split(' ').map((w,i)=>`<span style="--w:${i}">${w}</span>`).join(' ');
const HILLS='<i class="hill h1"></i><i class="hill h2"></i>';
const bobby=(c='',w='')=>`<div class="sbobby ${w}">${mascotSVG().replace('class="mascot"',`class="mascot ${c}"`)}</div>`;
const nbRow=(cls)=>`<div class="plank"></div><div class="row ${cls}">${Array.from({length:9},(_,i)=>`<span class="nb" style="${nbStyle(i)};--tx:${(i-4)*70}px;--ty:${-(110+(i%3)*50)}px;--rot:${(i-4)*80}deg">${i+1}</span>`).join('')}</div>`;

function introScenes(){
  return [
    {cls:'st-day',text:'Welcome to Numbo, the little land where math is an adventure!',next:"Let's go!",
     art:()=>`<i class="cloud" style="top:10%;--t:46s;--d:-12s"></i><i class="cloud" style="top:30%;--t:60s;--d:-34s;transform:scale(.7)"></i>${HILLS}<div class="logo-stage">${logoHTML(false)}</div>${bobby('cheer loop','right')}`},
    {cls:'st-dawn',text:'Behind the clouds lies a tiny land called Numbo. That is where Bobby lives, the keeper of numbers.',
     art:()=>`<i class="sun"></i><i class="cloud" style="top:14%;--t:40s;--d:-8s"></i><i class="cloud" style="top:32%;--t:56s;--d:-30s;transform:scale(.7)"></i>${HILLS}${bobby('cheer loop')}`},
    {cls:'st-day',text:'Every morning, Bobby lines up the numbers 1 to 9 on a favorite shelf. Everything is neat and cheerful!',
     art:()=>`<i class="cloud" style="top:10%;--t:50s;--d:-20s"></i>${HILLS}${nbRow('hop')}${bobby('cheer loop','left')}`},
    {cls:'st-wind',text:'Suddenly, WHOOSH! A big wind blows every number far away.',
     art:()=>`<svg class="windsvg" viewBox="0 0 200 120" preserveAspectRatio="none"><path d="M0 28 Q40 8 80 28 T160 28 T240 28" style="animation-delay:0s"/><path d="M0 62 Q40 42 80 62 T160 62 T240 62" style="animation-delay:-.5s"/><path d="M0 96 Q40 76 80 96 T160 96 T240 96" style="animation-delay:-1s"/></svg>${HILLS}${nbRow('fly')}${bobby('oops loop','left')}`},
    {cls:'st-map',text:'The numbers are hiding all over the land: in a garden, a river, a hill, a cave, an island, and a village.',
     art:()=>`<div class="map">${TOPICS.filter(t=>['tambah','kurang','kali','bagi','pecah','cerita'].includes(t.id)).map((t,i)=>`<div class="pin" style="--i:${i}"><b style="--bg:${t.bg};--fg:${t.fg}">${t.sign}</b><span>${PLACES[t.id].place}</span></div>`).join('')}</div>`},
    {cls:'st-day',text:'Bobby cannot count without the numbers. Will you help Bobby?',
     art:()=>`<i class="cloud" style="top:12%;--t:46s;--d:-12s"></i>${HILLS}<p class="sb-say">Please help me!</p>${bobby('oops loop')}`},
    {cls:'st-day',text:'What is your name, helper?',next:'Nice to meet you!',
     art:()=>`${HILLS}<p class="sb-say">Hello!</p>${bobby('cheer loop')}`,
     extra:()=>`<div class="sextra"><label for="nameIn">Your nickname</label><input id="nameIn" type="text" maxlength="14" autocomplete="off" placeholder="For example: Sara" list="nameList" value="${esc(pref.name||'')}"><datalist id="nameList">${NAME_CHOICES.map(n=>`<option value="${n}">`).join('')}</datalist></div>`,
     onNext:()=>{const v=($('#nameIn').value||'').trim().slice(0,14);pref.name=v;savePref();}},
    {cls:'st-day',get text(){return nameLine('meet','Nice to meet you!');},next:'Pick my grade',
     art:()=>`${HILLS}<p class="sb-say">Yay!</p>${bobby('cheer loop')}`}
  ];
}
function finaleScenes(){
  const nm=pref.name||'friend';
  return [
    {cls:'st-party',text:"Hooray! One by one, all the numbers are back on Bobby's shelf.",fx:'rain',
     art:()=>`<i class="sun"></i>${HILLS}${nbRow('back')}${bobby('cheer loop','left')}`},
    {cls:'st-party',text:'Thank you! You are now an official Number Keeper.',fx:'rain',
     art:()=>`<i class="sun"></i>${HILLS}<div class="badge"><i class="rib l"></i><i class="rib r"></i><div class="medal">${star(true)}<b>Number Keeper</b><span>${esc(nm)}</span></div></div>`},
    {cls:'st-day',text:'Thanks for playing Numbo. Come back any time. Bobby and the numbers will be waiting!',next:'Done',
     art:()=>`<i class="cloud" style="top:10%;--t:46s;--d:-12s"></i>${HILLS}<div class="logo-stage">${logoHTML(false)}</div>${bobby('cheer loop','right')}`}
  ];
}
function openStory(list,done){
  story.list=list;story.i=0;story.done=done||null;story.open=true;story.prev=document.activeElement;
  $('#story').hidden=false;$('.page').inert=true;document.documentElement.style.overflow='hidden';
  renderScene();
}
function closeStory(){
  if(!story.open)return;
  stopSpeak();story.open=false;$('#story').hidden=true;$('#story').innerHTML='';$('.page').inert=false;document.documentElement.style.overflow='';
  const d=story.done;story.done=null;
  if(story.prev&&story.prev.isConnected&&story.prev.focus)story.prev.focus({preventScroll:true});
  if(d)d();
}
function renderScene(){
  const s=story.list[story.i],last=story.i===story.list.length-1;
  $('#story').innerHTML=`<div class="sbox">
    <div class="stage ${s.cls}" aria-hidden="true">${s.art()}</div>
    <p class="stext">${words(s.text)}</p>
    <p class="listenrow">${listenBtn('#story .stext')}</p>
    ${s.extra?s.extra():''}
    <div class="sdots" aria-hidden="true">${story.list.map((_,i)=>`<i class="${i===story.i?'on':''}"></i>`).join('')}</div>
    <div class="sactions">
      ${story.i>0?'<button type="button" class="btn" data-s="prev">Back</button>':''}
      <button type="button" class="btn go" data-s="next" id="sNext">${s.next||(last?'Start!':'Next')}</button>
    </div>
    ${last?'':'<button type="button" class="link" data-s="skip">Skip story</button>'}
  </div>`;
  if(s.fx==='rain'){rain();sfx.win();}else sfx.tap();
  if(pref.read!==false)speak(s.text);
  const f=$('#nameIn')||$('#sNext');if(f)f.focus({preventScroll:true});
}
function storyNext(){
  const s=story.list[story.i];
  if(s.onNext&&s.onNext()===false)return;
  if(story.i>=story.list.length-1)closeStory();else{story.i++;renderScene();}
}
$('#story').addEventListener('click',e=>{
  const b=e.target.closest('[data-s]');if(!b)return;
  const a=b.dataset.s;
  if(a==='next')storyNext();
  else if(a==='prev'&&story.i>0){story.i--;renderScene();}
  else if(a==='skip')closeStory();
});
function afterIntro(){
  pref.intro=true;savePref();updateLead();
  renderGrade();go('grade');
  setMood('hello',greet());
}

/* ---------- events ---------- */
const SCREENS={grade:'gradeScr',home:'sc-home',place:'place',learn:'learn',levels:'practice',quiz:'practice',result:'practice'};
function toTop(){try{window.scrollTo({top:0,behavior:reduce?'auto':'smooth'});}catch(e){}}
function go(s,quiet){
  state.screen=s;stopSpeak();
  const target=SCREENS[s];
  $$('[data-screen]').forEach(el=>{el.hidden=el.id!==target;});
  $('#mapBtn').hidden=s==='home'||(s==='grade'&&!pref.grade);
  $('#gradeBtn').hidden=s!=='home';
  document.body.dataset.at=s;
  if(!quiet){
    toTop();
    const hd={grade:'#gradeH',home:'#mapH',place:'#placeH',learn:'#learnH',levels:'#levelH'}[s];
    const el=hd&&$(hd);if(el&&el.focus)try{el.focus({preventScroll:true});}catch(e){}
  }
}
function setTopic(id){
  state.topic=id;state.quiz=null;
  renderPlace();renderLearn();renderPractice();go('place');
  sfx.tap();setMood('hello',`Welcome to ${PLACES[id].place}!`);
}
document.addEventListener('click',e=>{const gb=e.target.closest('[data-grade]');if(gb)chooseGrade(+gb.dataset.grade);});
$('#tabs').addEventListener('click',e=>{const b=e.target.closest('[data-topic]');if(b)setTopic(b.dataset.topic);});
document.addEventListener('click',e=>{
  const sy=e.target.closest('[data-say-sel]');
  if(sy){const el=$(sy.dataset.saySel);if(el)speak(el.textContent,true);return;}
  const n=e.target.closest('[data-nav]');if(!n)return;
  const to=n.dataset.nav;sfx.tap();state.quiz=null;
  if(to==='grade'){renderGrade();go('grade');return;}
  if(to==='home'){renderTabs();renderShelf();go('home');}
  else if(to==='place'){renderPlace();go('place');}
  else if(to==='learn'){go('learn');{const it=$('#learn .intro');if(it)autoSpeak(it.textContent);}}
  else if(to==='levels'){renderPractice();go('levels');}
});
$('#shelf').addEventListener('click',e=>{
  if(e.target.closest('[data-act="finale"]'))openStory(finaleScenes(),setFin);
});
$('#practice').addEventListener('click',e=>{
  const c=e.target.closest('[data-choice]');
  if(c){answer(+c.dataset.choice);return;}
  const lv=e.target.closest('[data-level]');
  if(lv){state.level=+lv.dataset.level;startQuiz();return;}
  const a=e.target.closest('[data-act]');if(!a)return;
  const act=a.dataset.act;
  if(act==='again')startQuiz();
  else if(act==='next')nextQ();
  else if(act==='quit'){state.quiz=null;renderPlace();renderPractice();go('place');say('See you soon!');}
  else if(act==='up'){state.level=Math.min(3,state.level+1);startQuiz();}
  else if(act==='learn'){state.quiz=null;go('learn');}
});
document.addEventListener('keydown',e=>{
  if(story.open){
    if(e.key==='Escape'){e.preventDefault();closeStory();return;}
    const tg=e.target.tagName;
    if(tg==='INPUT'){if(e.key==='Enter'){e.preventDefault();storyNext();}return;}
    if(tg==='BUTTON')return;
    if(e.key==='ArrowRight'||e.key==='Enter'){e.preventDefault();storyNext();}
    else if(e.key==='ArrowLeft'&&story.i>0){story.i--;renderScene();}
    return;
  }
  if(e.key==='Escape'&&!$('#settings').hidden){setSettings(false);$('#setBtn').focus();return;}
  const q=state.quiz;if(!q||q.done||e.ctrlKey||e.metaKey||e.altKey)return;
  const tag=(e.target.tagName||'').toLowerCase();
  if(tag==='input'||tag==='textarea'||tag==='select')return;
  const map={a:0,b:1,c:2,d:3,'1':0,'2':1,'3':2,'4':3};
  const k=e.key.toLowerCase();
  if(k in map&&!q.locked){e.preventDefault();answer(map[k]);}
});

/* settings: story, sound, big text, night mode */
function applyPref(){
  document.body.classList.toggle('big',!!pref.big);
  $('#bigBtn').setAttribute('aria-pressed',String(!!pref.big));
  $('#soundBtn').setAttribute('aria-pressed',String(pref.sound!==false));
  $('#readBtn').setAttribute('aria-pressed',String(pref.read!==false));
  if(pref.theme)document.documentElement.setAttribute('data-theme',pref.theme);
  const dark=pref.theme?pref.theme==='dark':!!(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);
  $('#themeBtn').setAttribute('aria-pressed',String(dark));
}
const HELLO='Hi! I am Bobby! Let us count together. Yay!';
$('#readBtn').addEventListener('click',()=>{pref.read=pref.read===false;savePref();applyPref();sfx.tap();});
$('#voiceTest').addEventListener('click',()=>{
  const out=$('#sndDiag'),lines=[];
  const show=()=>{out.textContent=lines.join(' · ');};
  lines.push('Sound button: '+(pref.sound===false?'OFF (press Sound to turn it on)':'on'));
  const c=ctxGet();lines.push('Audio engine: '+(c?c.state:'not available'));
  sfx.tap();speak(HELLO,true);show();
  const t0=Date.now();
  loadSprite().then(b=>{lines.push('Word voice: '+(b?'decoded OK':'could NOT be decoded'));
    const k=hashStr(spoken(HELLO));lines.push('Sentence voice: '+(window.CLIPS&&window.CLIPS[k]?'data present':'missing'));
    return window.CLIPS&&window.CLIPS[k]?decodeB64(window.CLIPS[k]):null;}).then(b=>{lines.push('Sentence decode: '+(b?'OK':'FAILED'));
    const c2=ctxGet();lines.push('Engine now: '+(c2?c2.state:'none'));show();});
});
$('#bigBtn').addEventListener('click',()=>{pref.big=!pref.big;savePref();applyPref();});
$('#soundBtn').addEventListener('click',()=>{pref.sound=pref.sound===false;savePref();applyPref();sfx.tap();});
$('#themeBtn').addEventListener('click',()=>{const dark=$('#themeBtn').getAttribute('aria-pressed')==='true';pref.theme=dark?'light':'dark';savePref();applyPref();});
function setSettings(open){
  $('#settings').hidden=!open;$('#setBtn').setAttribute('aria-expanded',String(open));
  if(open){const f=$('#soundBtn');if(f&&f.focus)f.focus({preventScroll:true});}
}
$('#setBtn').addEventListener('click',()=>setSettings($('#settings').hidden));
$('#closeSet').addEventListener('click',()=>{setSettings(false);$('#setBtn').focus();});
function resetAll(){
  const keep={};['big','sound','theme','read'].forEach(k=>{if(pref[k]!==undefined)keep[k]=pref[k];});
  progress={};pref=keep;saveProgress();savePref();
  state.quiz=null;state.topic='tambah';state.bubble=greet();lastTotal=null;lastRet=null;
  updateGrade();updateLead();renderShelf();renderTabs();renderGrade();renderPlace();renderLearn();renderPractice();
}
$('#logo').addEventListener('click',e=>{
  if(!e.target.closest('#logoBtn')||story.open)return;
  setSettings(false);resetAll();go('home',true);toTop();
  openStory(introScenes(),afterIntro);
});
$('#storyBtn').addEventListener('click',()=>{setSettings(false);openStory(introScenes(),afterIntro);});

/* start */
$('#logo').innerHTML=`<button type="button" class="logobtn" id="logoBtn" aria-label="Numbo. Start again from the story">${logoHTML(false)}</button>`;
$('#footLogo').innerHTML=logoHTML(false);
$('#buddy').innerHTML=bubbleHTML()+mascotSVG();
applyPref();updateLead();renderShelf();renderTabs();renderGrade();updateGrade();renderPlace();renderLearn();renderPractice();go(pref.intro&&!pref.grade?'grade':'home',true);
const startStory=()=>{if(!pref.intro)openStory(introScenes(),afterIntro);};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startStory);else startStory();
