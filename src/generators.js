/* Numbo question generators: pure logic, no DOM.
   GEN[topic](level, grade) -> {text, choices, answer, explain, ...} */
const rnd=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const pick=a=>a[rnd(0,a.length-1)];
const shuffle=a=>{const r=a.slice();for(let i=r.length-1;i>0;i--){const j=rnd(0,i);[r[i],r[j]]=[r[j],r[i]];}return r;};
const fmt=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,',');
const usd=c=>c%100===0?'$'+fmt(c/100):'$'+fmt(Math.floor(c/100))+'.'+String(c%100).padStart(2,'0');
const D1=n=>fmt(Math.floor(n/10))+'.'+(n%10);
const D2=n=>fmt(Math.floor(n/100))+'.'+String(n%100).padStart(2,'0');
const PLACE=['Ones','Tens','Hundreds','Thousands','Ten thousands','Hundred thousands'];
const NAMES=['Ben','Sara','Mia','Leo','Ava','Sam','Zoe','Max','Ella','Noah','Lily','Owen','Ruby','Jack'];
const digitsRev=n=>String(n).split('').reverse().map(Number);

function addSteps(a,b){
  const da=digitsRev(a),db=digitsRev(b),n=Math.max(da.length,db.length);
  let carry=0;const steps=[],ann={},out=[];
  for(let i=0;i<n;i++){
    const x=da[i]||0,y=db[i]||0,s=x+y+carry;
    let t=`${PLACE[i]}: ${x} + ${y}`+(carry?' + 1 (carried)':'')+` = ${s}.`;
    t+=s>=10?` Write ${s%10} and carry 1.`:` Write ${s}.`;
    steps.push(t);out.push(s%10);
    if(s>=10&&i+1<n)ann[i+1]='1';
    carry=s>=10?1:0;
  }
  if(carry){steps.push('There is still a 1 to carry. Write 1 at the front.');out.push(1);}
  return {steps,ann,result:Number(out.slice().reverse().join(''))};
}
function subSteps(a,b){
  const da=digitsRev(a),db=digitsRev(b),n=da.length;
  let borrow=0;const steps=[],ann={},out=[];
  for(let i=0;i<n;i++){
    const base=da[i],y=db[i]||0,had=borrow;
    let x=base-had;
    if(x<y){
      x+=10;borrow=1;
      steps.push(`${PLACE[i]}: ${base}${had?' minus 1 (it was borrowed from)':''} is not enough to subtract ${y}. Borrow 10 from the next column, so ${x} − ${y} = ${x-y}.`);
      ann[i]=((ann[i]||'')+' +10').trim();
      if(i+1<n)ann[i+1]=((ann[i+1]||'')+' −1').trim();
    }else{
      borrow=0;
      steps.push(`${PLACE[i]}: ${base}${had?' − 1':''} − ${y} = ${x-y}.`);
    }
    out.push(x-y);
  }
  return {steps,ann,result:Number(out.slice().reverse().join(''))};
}
function mulExplain(a,b){
  const p=a*b;
  if(a<=10&&b<=10)return `${a} × ${b} = ${p}`;
  const la=String(a).length,lb=String(b).length;
  const splitA=lb===1&&la>1;               // many digits × one digit: split the big one
  const x=splitA?a:b,y=splitA?b:a;
  const s=String(x),parts=[...s].map((d,i)=>d*10**(s.length-1-i)).filter(v=>v>0);
  if(parts.length===1){
    const z=s.length-1,base=x/10**z;
    return `${fmt(a)} × ${fmt(b)}: ${splitA?`${base} × ${b}`:`${a} × ${base}`} = ${fmt(base*y)}, then add ${z} zero${z>1?'s':''}: ${fmt(p)}`;
  }
  const terms=parts.map(v=>splitA?`${fmt(v)} × ${b}`:`${a} × ${fmt(v)}`);
  return `${fmt(a)} × ${fmt(b)} = (${terms.join(') + (')}) = ${parts.map(v=>fmt(v*y)).join(' + ')} = ${fmt(p)}`;
}
function addExplain(a,b){
  const s=a+b;
  if(s<=20){
    if(a<10&&b<10&&s>10){const need=10-a,rest=b-need;return `Make 10 first: ${a} + ${need} = 10, then 10 + ${rest} = ${s}.`;}
    return `${a} + ${b} = ${s}`;
  }
  return addSteps(a,b).steps.join('<br>')+`<br>The answer is <b>${fmt(s)}</b>.`;
}
function subExplain(a,b){
  const d=a-b;
  if(a<=20){
    if(a>10&&a%10<b&&b<10){return `Go back to 10 first: ${a} − ${a%10} = 10, then 10 − ${b-a%10} = ${d}.`;}
    return `${a} − ${b} = ${d}`;
  }
  return subSteps(a,b).steps.join('<br>')+`<br>The answer is <b>${fmt(d)}</b>.`;
}

function numChoices(ans,step,f){
  const mult=shuffle([1,-1,2,-2,10,-10,3,-3]);
  const wrong=[];
  for(const m of mult){const v=ans+m*step;if(v>0&&v!==ans&&!wrong.includes(v))wrong.push(v);if(wrong.length===3)break;}
  let k=4;while(wrong.length<3){wrong.push(ans+k*step);k++;}
  return shuffle([ans,...wrong]).map(f);
}
function strChoices(ans,pool,fallback){
  const w=shuffle([...new Set(pool)].filter(x=>x!==ans)).slice(0,3);
  let k=0;while(w.length<3){const f=fallback(k++);if(f!==ans&&!w.includes(f))w.push(f);}
  return shuffle([ans,...w]);
}
const stepFor=(ans,dec)=>dec===2?10:dec===1?1:ans>=10000?100:ans>=1000?10:1;
function mkN(text,ans,explain,o={}){
  const f=o.fmt||String;
  return {key:o.key||text,text,answer:f(ans),choices:numChoices(ans,o.step||1,f),explain,visual:o.visual||'',kind:o.kind||'eq'};
}
function mkS(text,ans,choices,explain,o={}){
  return {key:o.key||text,text,answer:ans,choices,explain,visual:o.visual||'',kind:o.kind||'eq'};
}
function barHTML(n,d,cls){
  let h=`<div class="${cls||'qbar'}" style="--d:${d}" role="img" aria-label="Bar divided into ${d} equal parts, ${n} shaded">`;
  for(let i=0;i<d;i++)h+=`<i class="${i<n?'on':''}"></i>`;
  return h+'</div>';
}
function pieSVG(n,d){
  const r=46,cx=50,cy=50;
  let s=`<svg class="pie" viewBox="0 0 100 100" role="img" aria-label="Circle divided into ${d} equal parts, ${n} shaded">`;
  for(let i=0;i<d;i++){
    const a0=-Math.PI/2+i*2*Math.PI/d,a1=-Math.PI/2+(i+1)*2*Math.PI/d;
    const x0=(cx+r*Math.cos(a0)).toFixed(2),y0=(cy+r*Math.sin(a0)).toFixed(2);
    const x1=(cx+r*Math.cos(a1)).toFixed(2),y1=(cy+r*Math.sin(a1)).toFixed(2);
    s+=`<path class="${i<n?'on':'off'}" d="M${cx} ${cy} L${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1} Z"/>`;
  }
  return s+'</svg>';
}

const dotVis=(a,b,op)=>{
  const d=(n,c,gone)=>Array.from({length:n},()=>`<i class="pd ${c}${gone?' gone':''}"></i>`).join('');
  return op==='+'?`<div class="dotvis" aria-hidden="true"><span class="dgrp">${d(a,'a')}</span><span class="dplus">+</span><span class="dgrp">${d(b,'b')}</span></div>`
    :`<div class="dotvis" aria-hidden="true"><span class="dgrp">${d(a-b,'a')}${d(b,'a',true)}</span></div>`;
};
/* ---------- curriculum tables: grade -> [level 1, 2, 3] ---------- */
const E=(g,dec=0,kind='')=>({g,dec,kind});
const bridgeAdd=()=>{const a=rnd(6,9),b=rnd(Math.max(4,11-a),9);return [a,b];};
const bridgeSub=()=>{const a=rnd(11,18),b=rnd(a%10+1,9);return [a,b];};
const subR=(aLo,aHi,bLo,gap)=>()=>{const a=rnd(aLo,aHi),b=rnd(bLo,a-gap);return [a,b];};
const ADD={
  1:[E(()=>{const a=rnd(1,9);return [a,rnd(1,10-a)];}),E(()=>{const a=rnd(3,12);return [a,rnd(2,20-a)];}),E(bridgeAdd)],
  2:[E(bridgeAdd),E(()=>[rnd(11,89),rnd(1,9)]),E(()=>{const a=rnd(11,88);return [a,rnd(11,99-a)];})],
  3:[E(()=>[rnd(11,89),rnd(11,89)]),E(()=>[rnd(100,899),rnd(11,99)]),E(()=>[rnd(120,899),rnd(110,899)])],
  4:[E(()=>[rnd(100,999),rnd(100,999)]),E(()=>[rnd(1000,8999),rnd(100,999)]),E(()=>[rnd(1000,9999),rnd(1000,9999)])],
  5:[E(()=>[rnd(10000,49999),rnd(1000,9999)]),E(()=>[rnd(10000,99999),rnd(10000,99999)]),E(()=>[rnd(100,999),rnd(100,999)],2)],
  6:[E(()=>[rnd(100000,499999),rnd(10000,499999)]),E(()=>[rnd(1000,9999),rnd(100,9999)],2),E(()=>[rnd(10000,99999),rnd(1000,99999)],2)]
};
const SUB={
  1:[E(subR(2,10,1,1)),E(subR(6,20,1,1)),E(bridgeSub)],
  2:[E(bridgeSub),E(()=>[rnd(20,99),rnd(1,9)]),E(subR(30,99,11,5))],
  3:[E(subR(30,99,11,5)),E(()=>[rnd(200,999),rnd(11,99)]),E(subR(300,999,110,20))],
  4:[E(subR(300,999,110,20)),E(()=>[rnd(2000,9999),rnd(100,999)]),E(subR(2000,9999,1000,100))],
  5:[E(()=>[rnd(10000,99999),rnd(1000,9999)]),E(()=>{const a=rnd(20000,99999);return [a,rnd(10000,a-1000)];}),E(subR(500,999,100,50),2)],
  6:[E(()=>{const a=rnd(200000,999999);return [a,rnd(10000,a-10000)];}),E(subR(1000,9999,100,100),2),E(subR(10000,99999,1000,500),2)]
};
const MUL={
  1:[E(()=>[2,rnd(1,5)]),E(()=>[pick([2,5]),rnd(2,5)]),E(()=>[pick([2,5,10]),rnd(2,6)])],
  2:[E(()=>[pick([2,5,10]),rnd(2,10)]),E(()=>[pick([3,4]),rnd(2,10)]),E(()=>[rnd(2,5),rnd(2,10)])],
  3:[E(()=>[rnd(2,5),rnd(2,10)]),E(()=>[rnd(6,9),rnd(2,10)]),E(()=>[rnd(11,30),rnd(2,5)])],
  4:[E(()=>[rnd(2,10),rnd(6,10)]),E(()=>[rnd(11,99),rnd(2,9)]),E(()=>[rnd(101,500),rnd(2,9)])],
  5:[E(()=>[rnd(11,99),rnd(3,9)]),E(()=>[rnd(11,30),rnd(11,30)]),E(()=>[rnd(100,300),rnd(11,20)])],
  6:[E(()=>[rnd(11,99),rnd(11,40)]),E(()=>[rnd(100,500),rnd(11,30)]),E(()=>[rnd(11,99),rnd(2,9)],1)]
};
const remGen=(kLo,kHi,qLo,qHi)=>()=>{const k=rnd(kLo,kHi),q=rnd(qLo,qHi),r=rnd(1,k-1);return [k,q,r];};
const DIV={
  1:[E(()=>[2,rnd(2,5)]),E(()=>[pick([2,3]),rnd(2,6)]),E(()=>[rnd(2,5),rnd(2,5)])],
  2:[E(()=>[pick([2,5,10]),rnd(2,10)]),E(()=>[pick([3,4]),rnd(2,10)]),E(()=>[rnd(2,5),rnd(2,10)])],
  3:[E(()=>[rnd(2,5),rnd(2,10)]),E(()=>[rnd(6,9),rnd(2,10)]),E(()=>[rnd(2,9),rnd(11,30)])],
  4:[E(()=>[rnd(2,10),rnd(6,10)]),E(()=>[rnd(2,9),rnd(11,99)]),E(remGen(3,9,11,30),0,'rem')],
  5:[E(remGen(3,9,30,120),0,'rem'),E(()=>[rnd(11,25),rnd(11,40)]),E(()=>[rnd(11,30),rnd(20,99)])],
  6:[E(()=>[rnd(11,19),rnd(11,50)]),E(()=>[rnd(12,40),rnd(30,200)]),E(()=>[rnd(2,9),rnd(11,99)],1)]
};
const LEVEL_DESC={
  1:{tambah:['Within 10','Within 20','Make 10'],kurang:['Within 10','Within 20','Go back to 10'],
     kali:['Groups of 2','2s and 5s','2s, 5s and 10s'],bagi:['Share by 2','Share by 2 or 3','Share by 2 to 5'],
     pecah:['Halves and quarters','Halves, thirds, quarters','Half of a number'],cerita:['Within 10','Within 20','Mixed']},
  2:{tambah:['Make 10','Two digits + one digit','Two digits + two digits'],kurang:['Go back to 10','Two digits − one digit','Two digits − two digits'],
     kali:['2s, 5s and 10s','3s and 4s','2s to 5s mixed'],bagi:['2s, 5s and 10s','3s and 4s','2s to 5s mixed'],
     pecah:['Halves and quarters','Half and quarter of a number','Quarters'],cerita:['Small numbers','Medium numbers','Mixed']},
  3:{tambah:['Two digits','Three + two digits','Three digits'],kurang:['Two digits','Three − two digits','Three digits'],
     kali:['Tables 2 to 5','Tables 6 to 9','Two digits × 2 to 5'],bagi:['Divide by 2 to 5','Divide by 6 to 9','Bigger answers'],
     pecah:['Reading fractions','Which is bigger?','Fraction of a number'],cerita:['Small numbers','Medium numbers','Big numbers']},
  4:{tambah:['Three digits','Four + three digits','Four digits'],kurang:['Three digits','Four − three digits','Four digits'],
     kali:['Tables to 10','Two digits × 1 digit','Three digits × 1 digit'],bagi:['Tables to 10','Three digits ÷ 1 digit','With remainders'],
     pecah:['Reading fractions','Equivalent fractions','Add and subtract'],cerita:['Small numbers','Medium numbers','Big numbers']},
  5:{tambah:['Up to 5 digits','Two 5-digit numbers','Decimals'],kurang:['Up to 5 digits','Two 5-digit numbers','Decimals'],
     kali:['Two digits × 1 digit','Two digits × two digits','Three digits × two digits'],bagi:['With remainders','Three digits ÷ two digits','Four digits ÷ two digits'],
     pecah:['Equivalent fractions','Simplest form','Unlike denominators'],cerita:['Medium numbers','Big numbers','Money and more']},
  6:{tambah:['Up to 6 digits','Decimals','Big decimals'],kurang:['Up to 6 digits','Decimals','Big decimals'],
     kali:['Two digits × two digits','Three digits × two digits','Decimals × whole'],bagi:['Three digits ÷ two digits','Four digits ÷ two digits','Decimals ÷ whole'],
     pecah:['Unlike denominators','Fraction × whole number','Percent of a number'],cerita:['Big numbers','Money and more','Hardest mix']}
};

/* ---------- fractions ---------- */
const frShade=(ds)=>()=>{
  const d=pick(ds),n=rnd(1,d-1),ans=`${n}/${d}`;
  const ch=strChoices(ans,[`${d-n}/${d}`,`${n}/${d+1}`,`${n+1}/${d}`,`${d}/${n}`,`${n}/${Math.max(d-1,n+1)}`],k=>`${n}/${d+k+2}`);
  return mkS('What fraction does the shaded part show?',ans,ch,
    `There are ${d} equal parts and ${n} are shaded. So the fraction is ${n}/${d}.`,
    {kind:'sentence',visual:`<div class="qvis">${barHTML(n,d)}</div>`,key:`p1-${n}/${d}`});
};
const frHalfOf=()=>{const w=rnd(1,10)*2;return mkN(`What is half of ${w}?`,w/2,`Half means share into 2 equal groups. ${w} ÷ 2 = ${w/2}.`,{kind:'sentence'});};
const frHQ=()=>{
  if(Math.random()<.5){const w=rnd(2,10)*2;return mkN(`What is half of ${w}?`,w/2,`Half means share into 2 equal groups. ${w} ÷ 2 = ${w/2}.`,{kind:'sentence'});}
  const w=rnd(2,6)*4;return mkN(`What is a quarter of ${w}?`,w/4,`A quarter means share into 4 equal groups. ${w} ÷ 4 = ${w/4}.`,{kind:'sentence'});
};
const frCompare=()=>{
  const ds=shuffle([2,3,4,5,6,8,10]).slice(0,4),best=Math.min(...ds),ans=`1/${best}`;
  return mkS('Which fraction is the biggest?',ans,shuffle(ds.map(d=>`1/${d}`)),
    `All of them have 1 part, but a smaller denominator means bigger parts. So ${ans} is the biggest.`,{kind:'sentence',key:'cmp-'+ds.slice().sort().join(',')});
};
const frOfNumber=()=>{
  const d=rnd(2,6),n=rnd(1,d-1),m=rnd(2,9),w=d*m;
  return mkN(`What is ${n}/${d} of ${w}?`,n*m,`${w} ÷ ${d} = ${m}, then ${m} × ${n} = ${n*m}.`,{kind:'sentence'});
};
const frEquiv=()=>{
  const [a,b]=pick([[1,2],[1,3],[2,3],[1,4],[3,4],[2,5],[3,5],[1,5]]),m=rnd(2,4);
  return mkN(`${a}/${b} = ?/${b*m}`,a*m,
    `Multiply the numerator and the denominator by ${m}: ${a} × ${m} = ${a*m} and ${b} × ${m} = ${b*m}. So ${a}/${b} = ${a*m}/${b*m}.`);
};
const frAddSub=()=>{
  const d=rnd(5,12);
  if(Math.random()<.5){
    const n1=rnd(1,d-2),n2=rnd(1,d-n1),s=n1+n2,ans=`${s}/${d}`;
    const ch=strChoices(ans,[`${s}/${d*2}`,`${s+1}/${d}`,`${Math.abs(n1-n2)||s+2}/${d}`,`${n1*n2}/${d}`],k=>`${s+k+2}/${d}`);
    return mkS(`${n1}/${d} + ${n2}/${d} = ?`,ans,ch,`The denominators are the same, so only add the numerators: ${n1} + ${n2} = ${s}. The denominator stays ${d}.${s===d?' That equals 1 whole.':''}`);
  }
  const n1=rnd(3,d-1),n2=rnd(1,n1-1),s=n1-n2,ans=`${s}/${d}`;
  const ch=strChoices(ans,[`${s}/${d*2}`,`${s+1}/${d}`,`${n1+n2}/${d}`,`${s}/${d-1}`],k=>`${s+k+2}/${d}`);
  return mkS(`${n1}/${d} − ${n2}/${d} = ?`,ans,ch,`The denominators are the same, so only subtract the numerators: ${n1} − ${n2} = ${s}. The denominator stays ${d}.`);
};
const frSimplify=()=>{
  const [a,b]=pick([[1,2],[1,3],[2,3],[3,4],[2,5],[3,5],[5,6],[1,4]]),m=rnd(2,4),ans=`${a}/${b}`;
  const ch=strChoices(ans,[`${a*m}/${b*m}`,`${b}/${a}`,`${a+1}/${b}`,`${a}/${b+1}`],k=>`${a}/${b+k+2}`);
  return mkS(`What is ${a*m}/${b*m} in simplest form?`,ans,ch,
    `Divide the numerator and the denominator by ${m}: ${a*m} ÷ ${m} = ${a} and ${b*m} ÷ ${m} = ${b}. So ${a}/${b}.`,{kind:'sentence'});
};
const frUnlike=()=>{
  const b=pick([2,3,4,5]),m=rnd(2,4),d2=b*m,a=rnd(1,b-1),c=rnd(1,d2-1),top=a*m+c,ans=`${top}/${d2}`;
  const ch=strChoices(ans,[`${a+c}/${b+d2}`,`${a+c}/${d2}`,`${top}/${b}`,`${top+1}/${d2}`,`${Math.max(1,top-1)}/${d2}`],k=>`${top+k+2}/${d2}`);
  return mkS(`${a}/${b} + ${c}/${d2} = ?`,ans,ch,
    `Make the denominators the same. ${a}/${b} = ${a*m}/${d2}. Then add the numerators: ${a*m} + ${c} = ${top}. So the answer is ${top}/${d2}.`,{kind:'sentence'});
};
const frTimesWhole=()=>{
  const d=rnd(2,6),n=rnd(1,d-1),m=rnd(2,8),k=d*m;
  return mkN(`${n}/${d} × ${k} = ?`,n*m,`${k} ÷ ${d} = ${m}, then ${m} × ${n} = ${n*m}.`);
};
const frPercent=()=>{
  const p=pick([10,20,25,50,75]),w=pick([40,60,80,100,120,200,400]),ans=p*w/100;
  return mkN(`What is ${p}% of ${w}?`,ans,`${p}% means ${p} out of 100. ${p}/100 × ${w} = ${ans}.`,{kind:'sentence'});
};
const FR={
  1:[frShade([2,4]),frShade([2,3,4]),frHalfOf],
  2:[frShade([2,4]),frHQ,frShade([4])],
  3:[frShade([2,3,4,5,6,7,8]),frCompare,frOfNumber],
  4:[frShade([2,3,4,5,6,7,8,9,10]),frEquiv,frAddSub],
  5:[frEquiv,frSimplify,frUnlike],
  6:[frUnlike,frTimesWhole,frPercent]
};

/* ---------- money (word problems) ---------- */
const MONEY=[[100,1,5,2,5],[50,2,10,3,8],[25,5,24,4,12],[25,10,40,5,12],[5,20,99,5,15],[5,50,199,6,20]];

const GEN={
  tambah(l,g){
    const e=ADD[g][l-1],[a,b]=e.g(),s=a+b;
    if(e.dec){
      return mkN(`${D2(a)} + ${D2(b)} = ?`,s,`Line up the decimal points, then add each column.<br>${D2(a)} + ${D2(b)} = <b>${D2(s)}</b>`,{fmt:D2,step:10});
    }
    return mkN(`${fmt(a)} + ${fmt(b)} = ?`,s,addExplain(a,b),{fmt,step:stepFor(s,0),visual:s<=20?dotVis(a,b,'+'):''});
  },
  kurang(l,g){
    const e=SUB[g][l-1],[a,b]=e.g(),d=a-b;
    if(e.dec){
      return mkN(`${D2(a)} − ${D2(b)} = ?`,d,`Line up the decimal points, then subtract each column.<br>${D2(a)} − ${D2(b)} = <b>${D2(d)}</b>`,{fmt:D2,step:10});
    }
    return mkN(`${fmt(a)} − ${fmt(b)} = ?`,d,subExplain(a,b),{fmt,step:stepFor(d,0),visual:a<=20?dotVis(a,b,'−'):''});
  },
  kali(l,g){
    const e=MUL[g][l-1],[a,b]=e.g(),p=a*b;
    if(e.dec===1){
      return mkN(`${D1(a)} × ${b} = ?`,p,`Ignore the decimal point: ${a} × ${b} = ${p}. Then put it back with one decimal place: <b>${D1(p)}</b>.`,{fmt:D1,step:1});
    }
    return mkN(`${fmt(a)} × ${fmt(b)} = ?`,p,mulExplain(a,b),{fmt,step:stepFor(p,0)});
  },
  bagi(l,g){
    const e=DIV[g][l-1],[k,q,r]=e.g();
    if(e.kind==='rem'){
      const n=k*q+r,ans=`${q} r ${r}`;
      const ch=strChoices(ans,[`${q} r ${r%(k-1)+1}`,`${q+1} r ${r}`,`${q-1} r ${r}`,`${q} r ${k-r}`,`${r} r ${q}`],j=>`${q+j+2} r ${r}`);
      return mkS(`What is ${fmt(n)} ÷ ${k}? Write the quotient and the remainder.`,ans,ch,
        `${k} × ${q} = ${fmt(k*q)}, and ${fmt(n)} − ${fmt(k*q)} = ${r} is left over. So ${fmt(n)} ÷ ${k} = ${q} r ${r}.`,{kind:'sentence'});
    }
    if(e.dec===1){
      const n=k*q;
      return mkN(`${D1(n)} ÷ ${k} = ?`,q,`Divide as if there were no decimal point: ${n} ÷ ${k} = ${q}. Then put the decimal point back: <b>${D1(q)}</b>.`,{fmt:D1,step:1});
    }
    const n=k*q;
    return mkN(`${fmt(n)} ÷ ${k} = ?`,q,`${fmt(n)} ÷ ${k} = ${fmt(q)}, because ${k} × ${fmt(q)} = ${fmt(n)}`,{fmt,step:stepFor(q,0)});
  },
  pecah(l,g){return FR[g][l-1]();},
  cerita(l,g){
    const types=g===1?['tambah','kurang']:['tambah','kurang','kali','bagi','uang'];
    const type=pick(types);
    const n1=pick(NAMES),n2=pick(NAMES.filter(x=>x!==n1)),o={kind:'sentence'};
    const ag=Math.min(g,4),al=g>=5?Math.min(3,l+1):l;           // keep story numbers friendly
    const mg=Math.min(g,5);
    if(type==='tambah'){
      const [a,b]=ADD[ag][al-1].g();
      const text=pick([
        `${n1} buys ${fmt(a)} apples and ${fmt(b)} oranges. How many pieces of fruit does ${n1} buy in total?`,
        `The school garden has ${fmt(a)} apple trees and ${fmt(b)} pear trees. How many trees are there altogether?`,
        `The library has ${fmt(a)} storybooks and ${fmt(b)} textbooks. How many books does the library have in total?`]);
      return mkN(text,a+b,`Key words like "in total" and "altogether" mean add.<br>${fmt(a)} + ${fmt(b)} = ${fmt(a+b)}`,{...o,fmt,step:stepFor(a+b,0)});
    }
    if(type==='kurang'){
      const [a,b]=SUB[ag][al-1].g();
      const text=pick([
        `${n1} has ${fmt(a)} marbles. ${n1} gives ${fmt(b)} marbles to ${n2}. How many marbles does ${n1} have left?`,
        `A farmer picks ${fmt(a)} ears of corn. ${fmt(b)} ears are sold at the market. How many ears of corn are left?`,
        `A shop has ${fmt(a)} notebooks. ${fmt(b)} notebooks are sold today. How many notebooks remain?`]);
      return mkN(text,a-b,`Key words like "left" and "remain" mean subtract.<br>${fmt(a)} − ${fmt(b)} = ${fmt(a-b)}`,{...o,fmt,step:stepFor(a-b,0)});
    }
    if(type==='kali'){
      const [a,b]=MUL[mg][l-1].g();
      const text=pick([
        `There are ${fmt(a)} pencil boxes. Each box holds ${fmt(b)} pencils. How many pencils are there?`,
        `${n1} puts cupcakes on ${fmt(a)} plates. Each plate has ${fmt(b)} cupcakes. How many cupcakes are there?`,
        `Each crate holds ${fmt(b)} oranges. There are ${fmt(a)} crates in the warehouse. How many oranges are in the warehouse?`]);
      return mkN(text,a*b,`The key word "each" means multiply.<br>${fmt(a)} × ${fmt(b)} = ${fmt(a*b)}`,{...o,fmt,step:stepFor(a*b,0)});
    }
    if(type==='bagi'){
      const [k,q]=DIV[mg][l-1].g(),n=k*q;
      const text=pick([
        `${fmt(n)} candies are shared equally among ${k} children. How many candies does one child get?`,
        `Mom has ${fmt(n)} eggs. She puts the same number of eggs into ${k} baskets. How many eggs go into one basket?`]);
      return mkN(text,q,`"Shared equally" means divide.<br>${fmt(n)} ÷ ${k} = ${fmt(q)}`,{...o,fmt,step:stepFor(q,0)});
    }
    const [unit,pLo,pHi,qLo,qHi]=MONEY[Math.min(5,Math.max(0,g-2+l-1))];
    const p=rnd(pLo,pHi)*unit,q=rnd(qLo,qHi);
    const text=pick([
      `One notebook costs ${usd(p)}. ${n1} buys ${q} notebooks. How much does ${n1} pay?`,
      `One bowl of soup costs ${usd(p)}. ${n1} buys ${q} bowls. How much does ${n1} pay?`]);
    return mkN(text,p*q,`Price of one times how many.<br>${usd(p)} × ${q} = ${usd(p*q)}`,{kind:'sentence',step:unit>=100?100:unit>=25?25:5,fmt:usd});
  }
};

/* ================= extra topics: Shapes, Measure, Data ================= */
const pad2=n=>String(n).padStart(2,'0');
const timeStr=(h,m)=>`${(((h%12)+11)%12)+1}:${pad2(m)}`;
const COLS4=['--blue','--red','--green','--orange'];
function polyPts(n){const pts=[];for(let i=0;i<n;i++){const a=-Math.PI/2+i*2*Math.PI/n;pts.push((50+40*Math.cos(a)).toFixed(1)+','+(50+40*Math.sin(a)).toFixed(1));}return pts.join(' ');}
const SHP={
  circle:'<circle cx="50" cy="50" r="38"/>',square:'<rect x="18" y="18" width="64" height="64"/>',rectangle:'<rect x="6" y="28" width="88" height="44"/>',
  triangle:'<polygon points="50,10 92,86 8,86"/>',pentagon:`<polygon points="${polyPts(5)}"/>`,hexagon:`<polygon points="${polyPts(6)}"/>`
};
const shapeSVG=k=>`<div class="qvis"><svg class="shp" viewBox="0 0 100 100" role="img" aria-label="A shape">${SHP[k]}</svg></div>`;
const SOL={
  sphere:'<circle cx="50" cy="50" r="36"/><ellipse class="hl" cx="38" cy="36" rx="10" ry="6"/>',
  cube:'<polygon points="18,38 62,38 62,82 18,82"/><polygon class="t" points="18,38 38,20 82,20 62,38"/><polygon class="s" points="62,38 82,20 82,64 62,82"/>',
  cuboid:'<polygon points="8,44 66,44 66,82 8,82"/><polygon class="t" points="8,44 30,24 88,24 66,44"/><polygon class="s" points="66,44 88,24 88,62 66,82"/>',
  cylinder:'<path d="M22 22 v56 a28 9 0 0 0 56 0 v-56"/><ellipse class="t" cx="50" cy="22" rx="28" ry="9"/>',
  cone:'<path d="M50 8 L82 78 a32 10 0 0 1 -64 0 Z"/>'
};
const solidSVG=k=>`<div class="qvis"><svg class="shp" viewBox="0 0 100 100" role="img" aria-label="A solid shape">${SOL[k]}</svg></div>`;
function clockSVG(h,m){
  let s='<svg class="clk" viewBox="0 0 100 100" role="img" aria-label="An analog clock"><circle cx="50" cy="50" r="46"/>';
  for(let i=1;i<=12;i++){const a=i*Math.PI/6;s+=`<text x="${(50+36*Math.sin(a)).toFixed(1)}" y="${(50-36*Math.cos(a)).toFixed(1)}">${i}</text>`;}
  const ha=((h%12)*30+m*.5)*Math.PI/180,ma=m*6*Math.PI/180;
  s+=`<line class="hh" x1="50" y1="50" x2="${(50+22*Math.sin(ha)).toFixed(1)}" y2="${(50-22*Math.cos(ha)).toFixed(1)}"/><line class="mh" x1="50" y1="50" x2="${(50+32*Math.sin(ma)).toFixed(1)}" y2="${(50-32*Math.cos(ma)).toFixed(1)}"/><circle class="dot" cx="50" cy="50" r="3"/></svg>`;
  return `<div class="qvis clkbox">${s}</div>`;
}
function angleSVG(deg){
  const r=45,rad=deg*Math.PI/180,x2=(50+r*Math.cos(rad)).toFixed(1),y2=(80-r*Math.sin(rad)).toFixed(1);
  const ax=(50+14*Math.cos(rad)).toFixed(1),ay=(80-14*Math.sin(rad)).toFixed(1);
  return `<div class="qvis"><svg class="shp ang" viewBox="0 0 100 100" role="img" aria-label="An angle"><line x1="50" y1="80" x2="95" y2="80"/><line x1="50" y1="80" x2="${x2}" y2="${y2}"/><path d="M64 80 A14 14 0 0 0 ${ax} ${ay}" class="arc"/></svg></div>`;
}
const gridRect=(l,w)=>`<div class="qvis"><div class="gridrect" style="--c:${l}" role="img" aria-label="A rectangle covered with squares">${'<i></i>'.repeat(l*w)}</div></div>`;
const rectLabeled=(l,w,u)=>`<div class="qvis"><svg class="shp dim" viewBox="0 0 144 84" role="img" aria-label="A rectangle with its sides labeled"><rect x="14" y="16" width="92" height="50"/><text x="60" y="10">${l} ${u}</text><text x="112" y="44" class="v">${w} ${u}</text></svg></div>`;
function barChart(labels,vals,step=1){
  const max=Math.ceil(Math.max(...vals)/step)*step,H=100,W=230,left=28,n=labels.length,slot=(W-left-6)/n,bw=Math.min(40,slot-10);
  let s=`<svg class="bchart" viewBox="0 0 ${W} 132" role="img" aria-label="A bar chart">`;
  const every=Math.ceil((max/step)/10);
  for(let k=0,v=0;v<=max;k++,v+=step){if(k%every)continue;const y=(12+H-(v/max)*H).toFixed(1);s+=`<line x1="${left}" x2="${W-4}" y1="${y}" y2="${y}" class="gl"/><text x="${left-4}" y="${y}" class="tk">${v}</text>`;}
  labels.forEach((lb,i)=>{const x=left+(slot-bw)/2+i*slot,h=(vals[i]/max)*H;s+=`<rect x="${x.toFixed(1)}" y="${(12+H-h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" style="fill:var(${COLS4[i%4]})" class="br"/><text x="${(x+bw/2).toFixed(1)}" y="126" class="bl">${lb}</text>`;});
  return `<div class="qvis">${s}</svg></div>`;
}
const picto=(labels,vals)=>`<div class="qvis picto" role="img" aria-label="A picture graph">${labels.map((l,i)=>`<div class="prow"><span class="plab">${l}</span><span class="picons">${('<i class="pic" style="background:var('+COLS4[i%4]+')"></i>').repeat(vals[i])}</span></div>`).join('')}<p class="pnote">Each ★ shape is 1.</p></div>`;
const tallyHTML=n=>`<div class="qvis tally" role="img" aria-label="Tally marks">${'<span class="t5">||||</span> '.repeat(Math.floor(n/5))}${n%5?'<span class="t1">'+'|'.repeat(n%5)+'</span>':''}</div>`;
const rulerSVG=L=>{
  let s=`<svg class="ruler" viewBox="0 0 190 52" role="img" aria-label="A ruler with a pencil"><rect x="6" y="4" width="${L*11}" height="14" rx="3" class="pencil"/><rect x="6" y="26" width="178" height="22" class="rl"/>`;
  for(let i=0;i<=16;i++){const x=6+i*11;s+=`<line x1="${x}" x2="${x}" y1="26" y2="${i%5===0?40:34}" class="tick"/>`+(i%5===0?`<text x="${x}" y="50" class="rt">${i}</text>`:'');}
  return `<div class="qvis">${s}</svg></div>`;
};
const lenBars=(lens)=>`<div class="qvis lenbars" role="img" aria-label="Four bars">${lens.map((l,i)=>`<div class="lrow"><b>${'ABCD'[i]}</b><span class="lbar" style="width:${l*9}%"></span></div>`).join('')}</div>`;

const nm=n=>n; // readability
const SIDES={triangle:3,square:4,rectangle:4,pentagon:5,hexagon:6};
const ALLSH=['circle','square','triangle','rectangle','pentagon','hexagon'];
const FACES={cube:6,cuboid:6,cylinder:2,cone:1};
const PROPS=[['Which shape has 3 sides?','triangle','A triangle has 3 sides.'],['Which shape has 4 equal sides?','square','A square has 4 equal sides.'],['Which shape has no corners?','circle','A circle is round and has no corners.'],['Which shape has 5 sides?','pentagon','A pentagon has 5 sides.'],['Which shape has 6 sides?','hexagon','A hexagon has 6 sides.'],['Which shape has 4 sides, 2 long and 2 short?','rectangle','A rectangle has 2 long sides and 2 short sides.']];
const unit=u=>n=>fmt(n)+' '+u;
const sideQ=()=>{const k=pick(Object.keys(SIDES));return mkN(`How many sides does this shape have?`,SIDES[k],`A ${k} has ${SIDES[k]} sides.`,{kind:'sentence',visual:shapeSVG(k),key:'sd-'+k});};
const nameQ=()=>{const k=pick(['circle','square','triangle','rectangle']);return mkS('What is this shape called?',k,strChoices(k,['circle','square','triangle','rectangle'],()=>'oval'),`This shape is a ${k}.`,{kind:'sentence',visual:shapeSVG(k),key:'nm-'+k});};
const solidQ=()=>{const k=pick(['sphere','cube','cylinder','cone']);const note={sphere:'It is round like a ball.',cube:'It has 6 square faces.',cylinder:'It looks like a can.',cone:'It looks like an ice cream cone.'}[k];return mkS('What is this solid called?',k,shuffle(['sphere','cube','cylinder','cone']),`This is a ${k}. ${note}`,{kind:'sentence',visual:solidSVG(k),key:'sl-'+k});};
const faceQ=()=>{const k=pick(Object.keys(FACES));return mkN(`How many flat faces does a ${k} have?`,FACES[k],`A ${k} has ${FACES[k]} flat face${FACES[k]>1?'s':''}.`,{kind:'sentence',visual:solidSVG(k),key:'fc-'+k});};
const propQ=()=>{const [q,a,e]=pick(PROPS);return mkS(q,a,strChoices(a,ALLSH,()=>'oval'),e,{kind:'sentence'});};
const perimQ=(lo,hi,u)=>()=>{const l=rnd(lo,hi),w=rnd(Math.max(2,Math.floor(lo/2)),l-1),p=2*(l+w);return mkN(`A rectangle is ${l} ${u} long and ${w} ${u} wide. What is its perimeter?`,p,`Add all four sides: ${l} + ${w} + ${l} + ${w} = ${p} ${u}.`,{kind:'sentence',visual:rectLabeled(l,w,u),fmt:unit(u),step:2,key:`pm-${l}-${w}`});};
const squareQ=()=>{const a=rnd(3,20);return mkN(`A square has sides of ${a} m. What is its perimeter?`,4*a,`A square has 4 equal sides: 4 × ${a} = ${4*a} m.`,{kind:'sentence',fmt:unit('m'),step:4,key:'sq'+a});};
const areaCountQ=()=>{const l=rnd(3,8),w=rnd(2,6);return mkN('How many squares cover this rectangle?',l*w,`There are ${w} rows of ${l} squares. ${l} × ${w} = ${l*w}.`,{kind:'sentence',visual:gridRect(l,w),key:`ar-${l}-${w}`});};
const ANG=[[30,'Acute'],[45,'Acute'],[60,'Acute'],[75,'Acute'],[90,'Right'],[110,'Obtuse'],[120,'Obtuse'],[135,'Obtuse'],[150,'Obtuse'],[180,'Straight']];
const angleQ=()=>{const [d,n]=pick(ANG);return mkS('What kind of angle is this?',n,shuffle(['Acute','Right','Obtuse','Straight']),{Acute:'An acute angle is smaller than a right angle (90°).',Right:'A right angle is exactly 90°, like the corner of a book.',Obtuse:'An obtuse angle is bigger than 90° but smaller than a straight line (180°).',Straight:'A straight angle is 180°, a straight line.'}[n],{kind:'sentence',visual:angleSVG(d),key:'an'+d});};
const areaRectQ=()=>{const l=rnd(5,25),w=rnd(3,15);return mkN(`A rectangle is ${l} cm long and ${w} cm wide. What is its area?`,l*w,`Area = length × width = ${l} × ${w} = ${l*w} square cm.`,{kind:'sentence',visual:rectLabeled(l,w,'cm'),fmt:unit('cm²'),step:l,key:`ae-${l}-${w}`});};
const triAngleQ=()=>{let a,b;do{a=rnd(30,80);b=rnd(25,100);}while(a+b>165);const c=180-a-b;return mkN(`Two angles of a triangle are ${a}° and ${b}°. What is the third angle?`,c,`The angles of a triangle add up to 180°. ${a} + ${b} = ${a+b}, and 180 − ${a+b} = ${c}.`,{kind:'sentence',fmt:n=>n+'°',step:5,key:`ta-${a}-${b}`});};
const triAreaQ=()=>{const b=rnd(4,20);let h=rnd(2,14);if(b%2&&h%2)h++;const A=b*h/2;return mkN(`A triangle has a base of ${b} cm and a height of ${h} cm. What is its area?`,A,`Area = base × height ÷ 2 = ${b} × ${h} ÷ 2 = ${A} square cm.`,{kind:'sentence',fmt:unit('cm²'),step:b>h?h:b,key:`tr-${b}-${h}`});};
const volQ=()=>{const l=rnd(2,9),w=rnd(2,9),h=rnd(2,9),v=l*w*h;return mkN(`A box is ${l} cm long, ${w} cm wide and ${h} cm tall. What is its volume?`,v,`Volume = length × width × height = ${l} × ${w} × ${h} = ${v} cubic cm.`,{kind:'sentence',fmt:unit('cm³'),step:l*w,key:`vo-${l}-${w}-${h}`});};
const missSideQ=()=>{const l=rnd(4,15),w=rnd(3,12),A=l*w;return mkN(`A rectangle has an area of ${A} cm² and a length of ${l} cm. What is its width?`,w,`Width = area ÷ length = ${A} ÷ ${l} = ${w} cm.`,{kind:'sentence',fmt:unit('cm'),key:`ms-${l}-${w}`});};
const circumQ=()=>{const r=pick([5,10,15,20,25,50]),t=r*628/10;return mkN(`A circle has a radius of ${r} cm. Use π = 3.14. What is its circumference?`,t,`Circumference = 2 × π × r = 2 × 3.14 × ${r} = ${D1(t)} cm.`,{kind:'sentence',fmt:n=>D1(n)+' cm',step:10,key:'cc'+r});};
const circAreaQ=()=>{const r=rnd(2,10),a=314*r*r;return mkN(`A circle has a radius of ${r} cm. Use π = 3.14. What is its area?`,a,`Area = π × r × r = 3.14 × ${r} × ${r} = ${D2(a)} square cm.`,{kind:'sentence',fmt:n=>D2(n)+' cm²',step:100,key:'ca'+r});};
const cubeQ=()=>{const a=rnd(2,10);if(Math.random()<.5)return mkN(`A cube has edges of ${a} cm. What is its volume?`,a**3,`Volume = ${a} × ${a} × ${a} = ${a**3} cubic cm.`,{kind:'sentence',fmt:unit('cm³'),step:a,key:'cv'+a});return mkN(`A cube has edges of ${a} cm. What is its surface area?`,6*a*a,`A cube has 6 square faces. Each face is ${a} × ${a} = ${a*a}, so 6 × ${a*a} = ${6*a*a} square cm.`,{kind:'sentence',fmt:unit('cm²'),step:a,key:'cs'+a});};

const longQ=()=>{const lens=shuffle([2,3,4,5,6,7,8,9]).slice(0,4),longest=Math.random()<.5,t=longest?Math.max(...lens):Math.min(...lens),ans='ABCD'[lens.indexOf(t)];return mkS(`Which bar is the ${longest?'longest':'shortest'}?`,ans,shuffle(['A','B','C','D']),`Bar ${ans} is the ${longest?'longest':'shortest'}.`,{kind:'sentence',visual:lenBars(lens),key:'lb'+lens.join('')+longest});};
const clockQ=(half)=>()=>{const h=rnd(1,12),m=half&&Math.random()<.6?30:0,ans=timeStr(h,m);const pool=[timeStr(h,m?0:30),timeStr(h+1,m),timeStr(h-1,m),timeStr(h+1,m?0:30),timeStr(h+5,m)];return mkS('What time does the clock show?',ans,strChoices(ans,pool,i=>timeStr(h+i+2,m)),m?`The short hand is just past ${h} and the long hand points to 6. It is ${ans}.`:`The long hand points to 12 and the short hand points to ${h}. It is ${ans}.`,{kind:'sentence',visual:clockSVG(h,m),key:`ck-${h}-${m}`});};
const clock5Q=()=>{const h=rnd(1,12),m=rnd(1,11)*5%60,ans=timeStr(h,m);const pool=[timeStr(h,(m+5)%60),timeStr(h,(m+55)%60),timeStr(h+1,m),timeStr(h-1,m),timeStr(m/5||12,(h*5)%60)];return mkS('What time does the clock show?',ans,strChoices(ans,pool,i=>timeStr(h+i+2,m)),`The short hand shows the hour: ${h}. The long hand points to ${m/5||12}, which is ${m} minutes. It is ${ans}.`,{kind:'sentence',visual:clockSVG(h,m),key:`c5-${h}-${m}`});};
const rulerQ=()=>{const L=rnd(3,15);return mkN('How long is the pencil?',L,`The pencil starts at 0 and ends at ${L}. It is ${L} cm long.`,{kind:'sentence',visual:rulerSVG(L),fmt:unit('cm'),key:'rl'+L});};
const UNITQ=[['How heavy is an apple?','g'],['How long is a pencil?','cm'],['How long is a classroom?','m'],['How heavy is a bag of rice?','kg'],['How much water is in a glass?','mL'],['How much water is in a bucket?','L']];
const unitQ=()=>{const [q,a]=pick(UNITQ);return mkS(`${q} Which unit fits best?`,a,strChoices(a,['g','kg','cm','m','mL','L'],()=>'km'),`We measure this with ${a}.`,{kind:'sentence'});};
const convQ=(type)=>()=>{const n=rnd(2,9);
  const T={mcm:[`${n} m = ? cm`,n*100,`1 m = 100 cm, so ${n} × 100 = ${n*100}.`,'cm',100],cmm:[`${n*100} cm = ? m`,n,`100 cm = 1 m, so ${n*100} ÷ 100 = ${n}.`,'m',1],
    kgg:[`${n} kg = ? g`,n*1000,`1 kg = 1,000 g, so ${n} × 1,000 = ${fmt(n*1000)}.`,'g',1000],lml:[`${n} L = ? mL`,n*1000,`1 L = 1,000 mL, so ${n} × 1,000 = ${fmt(n*1000)}.`,'mL',1000],gkg:[`${fmt(n*1000)} g = ? kg`,n,`1,000 g = 1 kg, so ${fmt(n*1000)} ÷ 1,000 = ${n}.`,'kg',1],
    kmm:[`${n} km = ? m`,n*1000,`1 km = 1,000 m, so ${n} × 1,000 = ${fmt(n*1000)}.`,'m',1000],mkm:[`${fmt(n*1000)} m = ? km`,n,`1,000 m = 1 km, so ${fmt(n*1000)} ÷ 1,000 = ${n}.`,'km',1],cmmm:[`${n} cm = ? mm`,n*10,`1 cm = 10 mm, so ${n} × 10 = ${n*10}.`,'mm',10]};
  const k=type==='len3'?pick(['mcm','cmm']):type==='w3'?pick(['kgg','lml','gkg']):pick(['kmm','mkm','cmmm','mcm']);const [t,a,e,u,st]=T[k];
  return mkN(t,a,e,{fmt:unit(u),step:st,key:'cv-'+k+n});};
const elapsedQ=(hours)=>()=>{const h=rnd(1,11),m=pick([0,15,30,45]);let d=hours?pick([75,80,90,100,110,120,135,150,165,180]):pick([15,20,25,30,35,40,45,50,60]);
  const tot=h*60+m+d,eh=Math.floor(tot/60),em=tot%60,ans=timeStr(eh,em);
  const pool=[timeStr(eh,(em+10)%60),timeStr(eh,(em+50)%60),timeStr(eh+1,em),timeStr(eh-1,em),timeStr(eh,(em+30)%60)];
  const dur=d>=60?`${Math.floor(d/60)} hour${d>=120?'s':''}${d%60?` ${d%60} minutes`:''}`:`${d} minutes`;
  return mkS(`A lesson starts at ${timeStr(h,m)}. It lasts ${dur}. At what time does it end?`,ans,strChoices(ans,pool,i=>timeStr(eh+i+2,em)),`${timeStr(h,m)} plus ${dur} is ${ans}.`,{kind:'sentence',key:`el-${h}-${m}-${d}`});};
const mixedQ=()=>{if(Math.random()<.5){const m=rnd(1,4),c=rnd(10,90),x=rnd(15,95),ans=m*100+c+x;return mkN(`${m} m ${c} cm + ${x} cm = ? cm`,ans,`${m} m ${c} cm = ${m*100+c} cm. Then ${m*100+c} + ${x} = ${ans} cm.`,{fmt:unit('cm'),step:10,key:`mx${m}${c}${x}`});}
  const L=rnd(2,5),ml=rnd(1,4)*100+rnd(0,1)*50,x=rnd(2,9)*100-100+100,ans=L*1000+ml-x;if(ans<=0)return mixedQ();return mkN(`${L} L ${ml} mL − ${x} mL = ? mL`,ans,`${L} L ${ml} mL = ${L*1000+ml} mL. Then ${L*1000+ml} − ${x} = ${ans} mL.`,{fmt:unit('mL'),step:100,key:`mq${L}${ml}${x}`});};
const durQ=()=>{const t=pick(['sm','hm','sm2']);const n=rnd(2,9);
  if(t==='sm')return mkN(`${n} minutes = ? seconds`,n*60,`1 minute = 60 seconds, so ${n} × 60 = ${n*60}.`,{fmt:unit('seconds'),step:60,key:'d1'+n});
  if(t==='hm'){const m=pick([15,30,45,20,40]);return mkN(`${n} hours ${m} minutes = ? minutes`,n*60+m,`${n} × 60 = ${n*60}, and ${n*60} + ${m} = ${n*60+m} minutes.`,{fmt:unit('minutes'),step:10,key:`d2${n}${m}`});}
  return mkN(`${fmt(n*60)} seconds = ? minutes`,n,`60 seconds = 1 minute, so ${n*60} ÷ 60 = ${n}.`,{fmt:unit('minutes'),key:'d3'+n});};
const speedQ=()=>{const s=rnd(4,12)*10,t=rnd(2,6);return mkN(`A car travels ${s*t} km in ${t} hours at a steady speed. What is its speed in km/h?`,s,`Speed = distance ÷ time = ${s*t} ÷ ${t} = ${s} km/h.`,{kind:'sentence',fmt:unit('km/h'),step:10,key:`sp${s}${t}`});};
const decConvQ=()=>{const x=rnd(11,99),k=pick(['km','kg','m']);const T={km:[`${D1(x)} km = ? m`,x*100,`1 km = 1,000 m. ${D1(x)} × 1,000 = ${fmt(x*100)} m.`,'m',100],kg:[`${D1(x)} kg = ? g`,x*100,`1 kg = 1,000 g. ${D1(x)} × 1,000 = ${fmt(x*100)} g.`,'g',100],m:[`${D1(x)} m = ? cm`,x*10,`1 m = 100 cm. ${D1(x)} × 100 = ${fmt(x*10)} cm.`,'cm',10]}[k];return mkN(T[0],T[1],T[2],{fmt:unit(T[3]),step:T[4],key:'dc'+k+x});};
const sdtQ=()=>{const s=rnd(4,12)*10,t=rnd(2,6),v=pick(['d','t','s']);
  if(v==='d')return mkN(`A bus drives at ${s} km/h for ${t} hours. How far does it go?`,s*t,`Distance = speed × time = ${s} × ${t} = ${s*t} km.`,{kind:'sentence',fmt:unit('km'),step:s,key:`sd${s}${t}`});
  if(v==='t')return mkN(`A train goes ${s*t} km at ${s} km/h. How many hours does it take?`,t,`Time = distance ÷ speed = ${s*t} ÷ ${s} = ${t} hours.`,{kind:'sentence',fmt:unit('hours'),key:`st${s}${t}`});
  return speedQ();};
const scaleQ=()=>{const k=pick([2,5,10,20]),n=rnd(3,12);return mkN(`On a map, 1 cm stands for ${k} km. Two towns are ${n} cm apart on the map. How far apart are they in real life?`,k*n,`${n} × ${k} = ${k*n} km.`,{kind:'sentence',fmt:unit('km'),step:k,key:`sc${k}${n}`});};
const ratioQ=()=>{const a=pick([2,3,4,5]),b=pick([3,5,7]),m=rnd(2,6);return mkN(`A recipe uses ${a} cups of flour for every ${b} cups of milk. How many cups of milk are needed for ${a*m} cups of flour?`,b*m,`${a*m} ÷ ${a} = ${m} batches. ${m} × ${b} = ${b*m} cups of milk.`,{kind:'sentence',key:`ra${a}${b}${m}`});};

const CATS=['Apples','Bananas','Grapes','Pears'],KIDS=['Red','Blue','Green','Yellow'];
const pic3=()=>{const c=shuffle(CATS).slice(0,3),v=[rnd(1,7),rnd(1,7),rnd(1,7)];return {c,v};};
const pictoCountQ=()=>{const {c,v}=pic3(),i=rnd(0,2);return mkN(`How many ${c[i].toLowerCase()} are there?`,v[i],`Count the shapes in the ${c[i].toLowerCase()} row: ${v[i]}.`,{kind:'sentence',visual:picto(c,v),key:'pc'+c.join('')+v.join('')+i});};
const pictoMostQ=()=>{let v;do{v=[rnd(1,8),rnd(1,8),rnd(1,8),rnd(1,8)];}while(new Set(v).size<4);const c=CATS,t=Math.random()<.5,best=t?Math.max(...v):Math.min(...v),ans=c[v.indexOf(best)];return mkS(`Which fruit has the ${t?'most':'fewest'}?`,ans,shuffle(c),`The ${ans.toLowerCase()} row has the ${t?'longest':'shortest'} line of shapes (${best}).`,{kind:'sentence',visual:picto(c,v),key:'pm'+v.join('')+t});};
const pictoDiffQ=()=>{const {c,v}=pic3();let [i,j]=[0,1];if(v[0]===v[1])v[0]=v[1]+rnd(1,3);if(v[0]<v[1]){const t=v[0];v[0]=v[1];v[1]=t;}return mkN(`How many more ${c[0].toLowerCase()} than ${c[1].toLowerCase()} are there?`,v[0]-v[1],`${v[0]} − ${v[1]} = ${v[0]-v[1]}.`,{kind:'sentence',visual:picto(c,v),key:'pd'+c.join('')+v.join('')});};
const barVals=(step,lo,hi)=>Array.from({length:4},()=>rnd(lo,hi)*step);
const barReadQ=(step,lo,hi)=>()=>{const v=barVals(step,lo,hi),i=rnd(0,3);return mkN(`How many children chose ${KIDS[i].toLowerCase()}?`,v[i],`Read the top of the ${KIDS[i].toLowerCase()} bar: ${v[i]}.`,{kind:'sentence',visual:barChart(KIDS,v,step),step:step,key:'br'+v.join('-')+i});};
const barSumQ=(step,lo,hi)=>()=>{const v=barVals(step,lo,hi),s=v.reduce((a,b)=>a+b,0);return mkN('How many children are there in all?',s,`Add the bars: ${v.join(' + ')} = ${s}.`,{kind:'sentence',visual:barChart(KIDS,v,step),step:step,key:'bs'+v.join('-')});};
const barDiffQ=(step,lo,hi)=>()=>{let v;do{v=barVals(step,lo,hi);}while(v[0]===v[1]);const [a,b]=v[0]>v[1]?[0,1]:[1,0];return mkN(`How many more children chose ${KIDS[a].toLowerCase()} than ${KIDS[b].toLowerCase()}?`,v[a]-v[b],`${v[a]} − ${v[b]} = ${v[a]-v[b]}.`,{kind:'sentence',visual:barChart(KIDS,v,step),step:step,key:'bd'+v.join('-')+a});};
const tallyQ=()=>{const n=rnd(6,24);return mkN('How many votes does the tally show?',n,`Each group with a line through it is 5. ${Math.floor(n/5)} × 5 = ${Math.floor(n/5)*5}${n%5?`, and ${n%5} more makes ${n}`:''}.`,{kind:'sentence',visual:tallyHTML(n),key:'ty'+n});};
const modeQ=()=>{const m=rnd(2,9);let arr=[m,m,m];while(arr.length<8){const x=rnd(1,9);if(x!==m&&arr.filter(y=>y===x).length<2)arr.push(x);}arr=shuffle(arr);const ans=String(m),pool=[...new Set(arr.map(String))];return mkS(`Find the mode: ${arr.join(', ')}`,ans,strChoices(ans,pool,i=>String(10+i)),`The mode is the number that appears most often. ${m} appears 3 times.`,{kind:'sentence',key:'mo'+arr.join('')});};
const rangeQ=()=>{const arr=Array.from({length:6},()=>rnd(3,40)),mx=Math.max(...arr),mn=Math.min(...arr);if(mx===mn)return rangeQ();return mkN(`Find the range: ${arr.join(', ')}`,mx-mn,`Range = biggest − smallest = ${mx} − ${mn} = ${mx-mn}.`,{kind:'sentence',step:2,key:'rg'+arr.join('')});};
const meanSet=(n,m)=>{let a;do{a=Array.from({length:n-1},()=>rnd(Math.max(1,m-6),m+6));a.push(n*m-a.reduce((x,y)=>x+y,0));}while(a[n-1]<1||a[n-1]>m+12);return shuffle(a);};
const meanQ=(lo,hi)=>()=>{const n=rnd(lo,hi),m=rnd(5,20),a=meanSet(n,m);return mkN(`Find the mean (average): ${a.join(', ')}`,m,`Add them: ${a.join(' + ')} = ${m*n}. Divide by ${n}: ${m*n} ÷ ${n} = ${m}.`,{kind:'sentence',key:'mn'+a.join('')});};
const medianOddQ=()=>{const n=pick([5,7]);let a;do{a=Array.from({length:n},()=>rnd(2,30));}while(new Set(a).size<n);const s=a.slice().sort((x,y)=>x-y),m=s[(n-1)/2];return mkN(`Find the median: ${a.join(', ')}`,m,`Put them in order: ${s.join(', ')}. The middle number is ${m}.`,{kind:'sentence',key:'md'+a.join('')});};
const medianEvenQ=()=>{const n=pick([4,6]);let a,s;do{a=Array.from({length:n},()=>rnd(2,30));s=a.slice().sort((x,y)=>x-y);}while(new Set(a).size<n||(s[n/2-1]+s[n/2])%2);const m=(s[n/2-1]+s[n/2])/2;return mkN(`Find the median: ${a.join(', ')}`,m,`In order: ${s.join(', ')}. The two middle numbers are ${s[n/2-1]} and ${s[n/2]}. Their mean is ${m}.`,{kind:'sentence',key:'me'+a.join('')});};
const missingMeanQ=(n)=>()=>{const m=rnd(6,25),a=meanSet(n,m),last=a.pop();return mkN(`The mean of ${n} numbers is ${m}. ${n-1} of them are ${a.join(', ')}. What is the other number?`,last,`${n} × ${m} = ${n*m} is the total. The known numbers add to ${n*m-last}. So the other number is ${n*m} − ${n*m-last} = ${last}.`,{kind:'sentence',key:'mm'+a.join('')+m});};
const scoresQ=()=>{const n=pick([4,5]),m=rnd(70,90),a=meanSet(n,m).map(x=>x+(m>=20?60:0));/* shifted */ const real=a.slice(0,n);const mean=Math.round(real.reduce((x,y)=>x+y,0)/n);const tot=real.reduce((x,y)=>x+y,0);if(tot%n)return scoresQ();return mkN(`A student scored ${real.join(', ')} on ${n} tests. What is the mean score?`,tot/n,`Add the scores: ${tot}. Divide by ${n}: ${tot} ÷ ${n} = ${tot/n}.`,{kind:'sentence',key:'sc'+real.join('')});};

const GEN2={
  bentuk:{1:[nameQ,sideQ,solidQ],2:[sideQ,faceQ,propQ],3:[perimQ(4,12,'cm'),areaCountQ,angleQ],4:[()=>Math.random()<.3?squareQ():perimQ(8,40,'m')(),areaRectQ,triAngleQ],5:[triAreaQ,volQ,missSideQ],6:[circumQ,circAreaQ,cubeQ]},
  ukur:{1:[longQ,clockQ(false),clockQ(true)],2:[rulerQ,clock5Q,unitQ],3:[convQ('len3'),elapsedQ(false),convQ('w3')],4:[convQ('len4'),elapsedQ(true),mixedQ],5:[durQ,speedQ,decConvQ],6:[sdtQ,scaleQ,ratioQ]},
  data:{1:[pictoCountQ,pictoMostQ,pictoDiffQ],2:[barReadQ(1,1,9),barSumQ(1,1,9),barDiffQ(1,1,9)],3:[barReadQ(2,1,6),tallyQ,barDiffQ(5,1,6)],4:[barSumQ(5,1,6),modeQ,rangeQ],5:[meanQ(3,5),medianOddQ,missingMeanQ(4)],6:[meanQ(5,6),medianEvenQ,scoresQ]}
};
GEN.bentuk=(l,g)=>GEN2.bentuk[g][l-1]();
GEN.ukur=(l,g)=>GEN2.ukur[g][l-1]();
GEN.data=(l,g)=>GEN2.data[g][l-1]();
const LD2={
  1:{bentuk:['Name the shape','Count the sides','Solid shapes'],ukur:['Longer or shorter','Clocks: o\'clock','Clocks: half past'],data:['Count the pictures','Which has the most?','How many more?']},
  2:{bentuk:['Count the sides','Flat faces','Which shape is it?'],ukur:['Measure in cm','Clocks: 5 minutes','Choose the unit'],data:['Read a bar chart','Add the bars','Compare the bars']},
  3:{bentuk:['Perimeter','Area with squares','Angles'],ukur:['m and cm','How long does it last?','kg, g, L and mL'],data:['Bars in 2s','Tally marks','Bars in 5s']},
  4:{bentuk:['Perimeter','Area of a rectangle','Angles in a triangle'],ukur:['km, m, cm, mm','Time with hours','Mixed units'],data:['Add the bars','Mode','Range']},
  5:{bentuk:['Area of a triangle','Volume of a box','Find a missing side'],ukur:['Time units','Speed','Decimals and units'],data:['Mean','Median','Missing number']},
  6:{bentuk:['Circumference','Area of a circle','Cubes'],ukur:['Speed, time, distance','Map scale','Ratio'],data:['Mean','Median of an even set','Test scores']}
};
for(const g in LD2)Object.assign(LEVEL_DESC[g],LD2[g]);

if(typeof module!=='undefined')module.exports={GEN,LEVEL_DESC,ADD,SUB,MUL,DIV};

