/* Text helpers shared by the app, the voice pipeline and the tests.
   They are pure functions (no DOM) so Node can import them too. */
const spoken=t=>String(t).replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&#39;/g,"'").replace(/&amp;/g,'&').replace(/=\s*\?/g,' equals what').replace(/×/g,' times ').replace(/÷/g,' divided by ').replace(/−/g,' minus ').replace(/\+/g,' plus ').replace(/=/g,' equals ').replace(/(\d+)\/(\d+)/g,'$1 over $2').replace(/%/g,' percent').replace(/(\d) r (\d)/g,'$1 remainder $2').replace(/\s+/g,' ').trim();
/* ---------- speech tokens: text -> words the recorded voice can say ---------- */
const SP_ONES=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
const SP_TENS=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
function numWords(n){
  if(n<20)return SP_ONES[n];
  if(n<100)return SP_TENS[Math.floor(n/10)]+(n%10?' '+SP_ONES[n%10]:'');
  if(n<1000)return SP_ONES[Math.floor(n/100)]+' hundred'+(n%100?' '+numWords(n%100):'');
  if(n<1e6)return numWords(Math.floor(n/1000))+' thousand'+(n%1000?' '+numWords(n%1000):'');
  return numWords(Math.floor(n/1e6))+' million'+(n%1e6?' '+numWords(n%1e6):'');
}
const SP_UNITS={'km/h':'kilometers per hour','cm²':'square centimeters','cm³':'cubic centimeters','mL':'milliliters','km':'kilometers','kg':'kilograms','cm':'centimeters','mm':'millimeters','m':'meters','g':'grams','L':'liters'};
function speechTokens(raw){
  let t=spoken(raw);
  t=t.replace(/\$(\d[\d,]*)(?:\.(\d\d))?/g,(m,d,c)=>d+' dollars'+(c&&+c?' and '+(+c)+' cents':''));
  t=t.replace(/(\d),(?=\d{3})/g,'$1');
  t=t.replace(/(\d{1,2}):(\d\d)/g,(m,h,mi)=>h+' '+(+mi===0?"o'clock":+mi<10?'oh '+(+mi):String(+mi)));
  t=t.replace(/(?<![A-Za-z'])(km\/h|cm²|cm³|mL|km|kg|cm|mm|m|g|L)(?![A-Za-z²³])/g,(m,u)=>' '+SP_UNITS[u]+' ');
  t=t.replace(/°/g,' degrees').replace(/π/g,' pi ');
  t=t.replace(/(\d+)\.(\d+)/g,(m,a,b)=>a+' point '+b.split('').join(' '));
  t=t.replace(/\d+/g,m=>{const n=parseInt(m,10);return n>=1e9?m.split('').map(c=>SP_ONES[+c]).join(' '):numWords(n);});
  const out=[];
  (t.toLowerCase().match(/[a-z]+(?:'[a-z]+)?|[,.?!:;]/g)||[]).forEach(x=>out.push(x));
  return out;
}

const hashStr=t=>{let h=5381;for(let i=0;i<t.length;i++)h=((h<<5)+h+t.charCodeAt(i))>>>0;return h.toString(36);};
if(typeof module!=='undefined')module.exports={spoken,numWords,speechTokens,hashStr,SP_UNITS};
