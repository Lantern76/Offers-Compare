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
var err=document.getElementById('dep-err'),last=5000,stat=document.getElementById('calc-at');
function usd(d){return '$'+d.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}).replace('.00','')}
// Valid: digits with optional comma grouping and at most one dot (2 decimals). '-', 'e', repeated dots etc. are rejected, not stripped.
// One leading $ is allowed (people paste "$25,000"); it is stripped before validating and parsing.
function clean(){return String(inp.value).trim().replace(/^\$\s*/,'')}
function check(){var v=clean(),m='';
if(v==='')m='Enter a deposit amount, like 5,000.';else if(/-/.test(v))m='Deposit can\'t be negative. Enter an amount like 5,000.';
else if(/e/i.test(v))m='Use plain digits, not "e" notation. Enter an amount like 5,000.';else if((v.match(/\./g)||[]).length>1)m='Use only one decimal point, like 5,000.50.';
else if(!/^\d[\d,]*(\.\d{0,2})?$/.test(v))m='Use digits only, with an optional comma and up to 2 decimals, like 5,000.50.';
if(err){err.hidden=!m;err.textContent=m}
// Error is announced once via the existing polite live region (#calc-at); .err is the visible, aria-describedby text.
if(m){inp.setAttribute('aria-invalid','true');if(stat){while(stat.firstChild)stat.removeChild(stat.firstChild);var h=document.createElement('span');h.className='sr';h.textContent=m+' ';stat.appendChild(h);stat.appendChild(document.createTextNode('Still showing '+usd(last)+'.'))}}
else{var was=inp.hasAttribute('aria-invalid');inp.removeAttribute('aria-invalid');if(was&&stat)stat.textContent=C.status(last)}return !m}
function deposit(){var d=parseFloat(clean().replace(/,/g,''));return d>=0&&isFinite(d)?d:5000}
function fmt(){if(!check())return;var raw=clean().replace(/,/g,'');var p=raw.split('.'),i=(p[0]||'0').replace(/^0+(?=\d)/,'');
inp.value=i.replace(/\B(?=(\d{3})+(?!\d))/g,',')+(p.length>1?'.'+p.slice(1).join('').slice(0,2):'')}
function fill(td,parts){while(td.firstChild)td.removeChild(td.firstChild);parts.forEach(function(p){if(!p.c){td.appendChild(document.createTextNode(p.t));return}
var s=document.createElement('span');s.className=p.c;s.textContent=p.t;td.appendChild(s)})}
function visible(){return data.filter(function(o){return !byId[o.id].hidden})}
function calc(){if(!check())return;var d=deposit();last=d;var vis=visible(),R=C.rank(vis,d),RA=C.rank(data,d),seen={};
var put=function(o,Rx){var tr=byId[o.id],td=tr.querySelector('td.net');td.className=C.cls(o.id,Rx);fill(td,C.parts(o.id,Rx));
tb.appendChild(tr);seen[o.id]=1};
R.order.forEach(function(o){put(o,R)});var RH={res:RA.res,order:RA.order,best:null};RA.order.forEach(function(o){if(!seen[o.id])put(o,RH)});
var t=C.status(d),s=stat,c=document.getElementById('sort-at');if(s)s.textContent=t;if(c)c.textContent=t.split('; ')[1].replace(/\.$/,'')}
// Filters: same rules as build.js. State hides only explicit exclusions; empty result shows everything with a note.
function filt(){if(!ff)return;var t=val('type','all'),m=val('min','any'),st=val('state','any');
var ok=data.filter(function(o){return(t==='all'||o.category===t)&&(m==='any'||(o.minDeposit||0)<=+m)&&(st==='any'||(o.stateExclusions||[]).indexOf(st)<0)});
var none=!ok.length,show=none?data:ok,ids={};show.forEach(function(o){ids[o.id]=1});rows.forEach(function(tr,i){tr.hidden=!ids[data[i].id]});
var n=document.getElementById('fnote'),sh=document.getElementById('showing'),active=none||t!=='all'||m!=='any';// State filter is hidden: it still applies and stays in the URL, but is never shown in the banner.
if(sh)sh.textContent='Showing '+show.length+' of '+data.length+' offers';
if(n){n.hidden=!active;n.textContent=none?'No offers fit; showing all.':'Filtered: '+TL[t]+' · min deposit '+MINL[m]+'. Offers with an unstated minimum are included.'}
calc()}
form.addEventListener('submit',function(e){e.preventDefault();if(!check()){inp.focus();return}fmt();calc()});inp.addEventListener('input',function(){if(check())calc()});inp.addEventListener('blur',fmt);
if(ff){var KEYS=['state','type','min'].filter(field),q=new URLSearchParams(location.search);
KEYS.forEach(function(k){var v=q.get(k),f=field(k);if(!v)return;if(f.options?[].some.call(f.options,function(o){return o.value===v}):/^(any|[A-Z]{2})$/.test(v))f.value=v});
ff.addEventListener('submit',function(e){e.preventDefault();filt();var u=new URLSearchParams();KEYS.forEach(function(k){u.set(k,val(k))});history.replaceState(null,'','/?'+u)});
KEYS.forEach(function(k){if(field(k).type!=='hidden')field(k).addEventListener('change',filt)})}
var dq=new URLSearchParams(location.search).get('deposit');if(dq!=null&&dq!==''){inp.value=dq;fmt()}
filt();if(!ff)calc()})();
