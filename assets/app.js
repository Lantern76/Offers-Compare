// Progressive enhancement: live calculator (re-sorts the board) and live eligibility filters.
// Without JS the page still works: precomputed $5,000 values and prebuilt filter pages served for the GET form.
(function(){var C=window.OCcalc,tb=document.querySelector('#board tbody');if(!tb)return;
var rows=[].slice.call(tb.querySelectorAll('tr[data-offer]')),data=rows.map(function(tr){return JSON.parse(tr.getAttribute('data-offer'))}),byId={};
rows.forEach(function(tr,i){byId[data[i].id]=tr});
var form=document.getElementById('calc-form'),inp=document.getElementById('deposit'),ff=document.querySelector('form.filters');
var MINL={any:'Any','1000':'≤ $1k','5000':'≤ $5k','25000':'≤ $25k'},TL={all:'All',brokerage:'Brokerage',crypto:'Crypto',cash:'Cash'};
function deposit(){var d=parseFloat(inp.value);return d>=0&&isFinite(d)?d:5000}
function calc(d){var R=C.rank(data,d);R.order.forEach(function(o){var tr=byId[o.id],td=tr.querySelector('td.net');td.className=C.cls(o.id,R);td.innerHTML=C.cell(o.id,R);tb.appendChild(tr)});
var t=C.status(d),s=document.getElementById('calc-at'),c=document.getElementById('sort-at');if(s)s.textContent=t;if(c)c.textContent=t.split('; ')[1].replace(/\.$/,'')}
// Filters: same rules as build.js. State hides only explicit exclusions; empty result shows everything with a note.
function filt(){if(!ff)return;var t=ff.type.value,m=ff.min.value,st=ff.state.value;
var ok=data.filter(function(o){return(t==='all'||o.category===t)&&(m==='any'||(o.minDeposit||0)<=+m)&&(st==='any'||(o.stateExclusions||[]).indexOf(st)<0)});
var none=!ok.length,show=none?data:ok,ids={};show.forEach(function(o){ids[o.id]=1});rows.forEach(function(tr,i){tr.hidden=!ids[data[i].id]});
var n=document.getElementById('fnote'),sh=document.getElementById('showing'),active=t!=='all'||m!=='any'||st!=='any';
if(sh)sh.textContent='Showing '+show.length+' of '+data.length+' offers';
if(n){n.hidden=!active;n.textContent=none?'No offers fit; showing all.':'Filtered: '+TL[t]+' · min deposit '+MINL[m]+(st!=='any'?' · '+st:'')+'. Offers with an unstated minimum are included.'}}
form.addEventListener('submit',function(e){e.preventDefault();calc(deposit())});inp.addEventListener('input',function(){calc(deposit())});
if(ff){var q=new URLSearchParams(location.search);['state','type','min'].forEach(function(k){var v=q.get(k);if(v&&ff[k].querySelector('option[value="'+CSS.escape(v)+'"]'))ff[k].value=v});
ff.addEventListener('submit',function(e){e.preventDefault();filt();var u=new URLSearchParams({state:ff.state.value,type:ff.type.value,min:ff.min.value});history.replaceState(null,'','/?'+u)});
['state','type','min'].forEach(function(k){ff[k].addEventListener('change',filt)});if(q.has('state')||q.has('type')||q.has('min'))filt()}})();
