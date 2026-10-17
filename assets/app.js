// Progressive enhancement: live calculator (re-sorts the board) and live eligibility filters.
// Without JS the page still works: precomputed $5,000 values and prebuilt filter pages served for the GET form.
// Every page (including /f/ pages) renders all offers; this script shows/hides rows, so filters see the full list.
(function(){var C=window.OCcalc,tb=document.querySelector('#board tbody');if(!tb)return;
var rows=[].slice.call(tb.querySelectorAll('tr[data-offer]')),data=rows.map(function(tr){return JSON.parse(tr.getAttribute('data-offer'))}),byId={};
rows.forEach(function(tr,i){byId[data[i].id]=tr});
var form=document.getElementById('calc-form'),inp=document.getElementById('deposit'),ff=document.querySelector('form.filters');
var MINL={any:'Any','1000':'≤ $1k','5000':'≤ $5k','25000':'≤ $25k'},TL={all:'All',brokerage:'Brokerage',crypto:'Crypto',cash:'Cash'};
function field(k){return ff?ff.elements.namedItem(k):null}
function val(k,def){var f=field(k);return f?f.value:def}
function deposit(){var d=parseFloat(String(inp.value).replace(/[^0-9.]/g,''));return d>=0&&isFinite(d)?d:5000}
function fmt(){var raw=String(inp.value).replace(/[^0-9.]/g,'');if(raw==='')return;var p=raw.split('.'),i=(p[0]||'0').replace(/^0+(?=\d)/,'');
inp.value=i.replace(/\B(?=(\d{3})+(?!\d))/g,',')+(p.length>1?'.'+p.slice(1).join('').slice(0,2):'')}
function fill(td,parts){while(td.firstChild)td.removeChild(td.firstChild);parts.forEach(function(p){if(!p.c){td.appendChild(document.createTextNode(p.t));return}
var s=document.createElement('span');s.className=p.c;s.textContent=p.t;td.appendChild(s)})}
function visible(){return data.filter(function(o){return !byId[o.id].hidden})}
function calc(){var d=deposit(),vis=visible(),R=C.rank(vis,d),RA=C.rank(data,d),seen={};
var put=function(o,Rx){var tr=byId[o.id],td=tr.querySelector('td.net'),a=tr.querySelector('td.a');td.className=C.cls(o.id,Rx);fill(td,C.parts(o.id,Rx));
var ab=!!Rx.apyBest[o.id];a.classList.toggle('best',ab);var l=a.querySelector('.best-l');if(ab&&!l){l=document.createElement('span');l.className='best-l';l.textContent='Best';a.appendChild(l)}else if(!ab&&l)a.removeChild(l);
tb.appendChild(tr);seen[o.id]=1};
R.order.forEach(function(o){put(o,R)});var RH={res:RA.res,order:RA.order,best:null,apyBest:{}};RA.order.forEach(function(o){if(!seen[o.id])put(o,RH)});
var t=C.status(d),s=document.getElementById('calc-at'),c=document.getElementById('sort-at');if(s)s.textContent=t;if(c)c.textContent=t.split('; ')[1].replace(/\.$/,'')}
// Filters: same rules as build.js. State hides only explicit exclusions; empty result shows everything with a note.
function filt(){if(!ff)return;var t=val('type','all'),m=val('min','any'),st=val('state','any');
var ok=data.filter(function(o){return(t==='all'||o.category===t)&&(m==='any'||(o.minDeposit||0)<=+m)&&(st==='any'||(o.stateExclusions||[]).indexOf(st)<0)});
var none=!ok.length,show=none?data:ok,ids={};show.forEach(function(o){ids[o.id]=1});rows.forEach(function(tr,i){tr.hidden=!ids[data[i].id]});
var n=document.getElementById('fnote'),sh=document.getElementById('showing'),active=t!=='all'||m!=='any'||st!=='any';
if(sh)sh.textContent='Showing '+show.length+' of '+data.length+' offers';
if(n){n.hidden=!active;n.textContent=none?'No offers fit; showing all.':'Filtered: '+TL[t]+' · min deposit '+MINL[m]+(st!=='any'?' · '+st:'')+'. Offers with an unstated minimum are included.'}
calc()}
form.addEventListener('submit',function(e){e.preventDefault();fmt();calc()});inp.addEventListener('input',calc);inp.addEventListener('blur',fmt);
if(ff){var KEYS=['state','type','min'].filter(field),q=new URLSearchParams(location.search);
KEYS.forEach(function(k){var v=q.get(k),f=field(k);if(v&&[].some.call(f.options,function(o){return o.value===v}))f.value=v});
ff.addEventListener('submit',function(e){e.preventDefault();filt();var u=new URLSearchParams();KEYS.forEach(function(k){u.set(k,val(k))});history.replaceState(null,'','/?'+u)});
KEYS.forEach(function(k){field(k).addEventListener('change',filt)})}
var dq=new URLSearchParams(location.search).get('deposit');if(dq!=null&&dq!==''){inp.value=dq;fmt()}
filt();if(!ff)calc()})();
