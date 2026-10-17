// Offers Compare static build: data/offers.json -> dist/*.html. Rules: official terms only, "Not stated" for anything the terms don't say.
const fs=require('fs'),C=require('./assets/calc.js');
const O='dist',EX=5000,TYPES={all:'All',brokerage:'Brokerage',crypto:'Crypto',cash:'Cash'},MINS={any:'Any',1000:'≤ $1k',5000:'≤ $5k',25000:'≤ $25k'};
const STATES='AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY'.split(' ');
const D=JSON.parse(fs.readFileSync(process.env.DATA_FILE||'data/offers.json','utf8'));
// Validation: collect all errors, exit non-zero before writing anything.
{const errs=[],seen=new Set(),E=(o,i,m)=>errs.push(`${o&&o.id||'#'+i}: ${m}`);
if(!Array.isArray(D))errs.push('top level must be an array');else D.forEach((o,i)=>{
for(const f of['id','provider','name','category','title','toEarn','catch','termsUrl','termsQuote','lastChecked','status'])if(o[f]==null||o[f]==='')E(o,i,`${f} required`);
if(o.id&&!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(o.id))E(o,i,'bad id');if(seen.has(o.id))E(o,i,'duplicate id');seen.add(o.id);
if(!['brokerage','crypto','cash'].includes(o.category))E(o,i,'category must be brokerage|crypto|cash');
if(!['verified','unverified','ends-soon'].includes(o.status))E(o,i,'status must be verified|unverified|ends-soon');
try{if(new URL(o.termsUrl).protocol!=='https:')E(o,i,'termsUrl must be https')}catch{E(o,i,'termsUrl invalid')}
if(o.lastChecked&&isNaN(Date.parse(o.lastChecked)))E(o,i,'lastChecked invalid');
for(const f of['bonusCash','apy','minDeposit','annualFee'])if(o[f]!=null&&typeof o[f]!=='number')E(o,i,`${f} must be a number or null (null = Not stated)`);
if(o.affiliate)E(o,i,'affiliate links are not allowed in V1');
if(o.stateExclusions!=null&&(!Array.isArray(o.stateExclusions)||o.stateExclusions.some(s=>!STATES.includes(s))))E(o,i,'stateExclusions must be null or an array of state codes')});
if(errs.length){console.error(`Data validation failed (${errs.length}):\n`+errs.map(x=>'  - '+x).join('\n'));process.exit(1)}}
fs.rmSync(O,{recursive:true,force:true});fs.mkdirSync(O,{recursive:true});fs.cpSync('assets',O+'/assets',{recursive:true});fs.copyFileSync('data/offers.json',O+'/offers.json');
const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const NS='<span class="ns">Not stated<span class="sr"> (terms don\'t say)</span></span>';
const ct=new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',month:'short',day:'numeric',year:'numeric'}),ctt=new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',hour:'numeric',minute:'2-digit'}),ut=new Intl.DateTimeFormat('en-GB',{timeZone:'UTC',hour:'2-digit',minute:'2-digit'});
const when=o=>{const d=new Date(o.lastChecked);return `<time datetime="${d.toISOString()}"><span class="nw">${ct.format(d)}</span> <span class="nw">${ctt.format(d)} CT (${ut.format(d)} UTC)</span></time>`};
const latest=D.reduce((a,o)=>Date.parse(o.lastChecked)>Date.parse(a.lastChecked)?o:a);
const chip=o=>o.status==='verified'?'<span class="chip ok">Verified</span>':o.status==='ends-soon'?'<span class="chip warn">Ends soon</span>':'<span class="chip warn">Unverified — check terms</span>';
const pct=v=>v==null?NS:v.toFixed(2)+'%',usd=v=>v==null?NS:'$'+v.toLocaleString('en-US');
const states=o=>o.stateExclusions==null?NS:o.stateExclusions.length?e(o.stateExclusions.join(', '))+' excluded':'None listed';
const CAT={brokerage:'Brokerage',crypto:'Crypto exchange',cash:'Cash APY'};
const page=({rel,type,min,st,list,note})=>{
const res=Object.fromEntries(list.map(o=>[o.id,C.net(o,EX)]));let best=null;for(const o of list){const r=res[o.id];if(!r.low&&r.feeKnown&&(best==null||r.value>res[best].value))best=o.id}
const rows=[...list].sort((a,b)=>(res[b.id].value??-1e9)-(res[a.id].value??-1e9));
const netCell=o=>{const r=res[o.id];if(r.low)return `<td class="n net"><span class="low">Deposit too low</span></td>`;
return `<td class="n net${o.id===best?' best':''}">${C.money(r.value)}${r.feeKnown?'':'<span class="fee-ns">before fee (not stated)</span>'}${o.id===best?'<span class="best-l">Best</span><span class="tax">taxable</span>':''}</td>`};
const bestApy=Math.max(...list.map(o=>o.apy||0));
const tr=o=>`<tr data-offer="${e(JSON.stringify({id:o.id,bonusCash:o.bonusCash,apy:o.apy,boosterApy:o.boosterApy,boosterDays:o.boosterDays,boosterCap:o.boosterCap,minDeposit:o.minDeposit,annualFee:o.annualFee}))}"><th scope="row">${e(o.name)}<small>${CAT[o.category]}</small></th>
<td class="bonus">${e(o.bonusText)}</td><td class="n a${o.apy===bestApy?' best':''}">${pct(o.apy)}${o.apy===bestApy?'<span class="best-l">Best</span>':''}</td>${netCell(o).replace('class="n net','class="n b net')}
<td class="earn">${e(o.toEarn)}</td><td class="fee">${e(o.feeText)}</td><td class="mind n">${usd(o.minDeposit)}</td><td>${states(o)}</td><td class="st">${chip(o)}</td><td class="when">${when(o)}</td><td class="terms"><a href="${e(o.termsUrl)}" rel="noopener">Terms ↗<span class="sr"> for ${e(o.name)} (official site)</span></a></td>
<td class="more"><details><summary>Details</summary><dl><dt>Bonus</dt><dd>${e(o.bonusText)}</dd><dt>To earn it</dt><dd>${e(o.toEarn)}</dd><dt>Fee</dt><dd>${e(o.feeText)}</dd><dt>Min deposit</dt><dd>${usd(o.minDeposit)}</dd><dt>States</dt><dd>${states(o)}</dd><dt>Checked</dt><dd>${when(o)}</dd><dt>Terms</dt><dd><a href="${e(o.termsUrl)}" rel="noopener">Official terms ↗</a></dd></dl></details></td></tr>`;
const sel=(n,opts,cur)=>`<select name="${n}" id="f-${n}">${Object.entries(opts).map(([v,l])=>`<option value="${v}"${String(cur)===v?' selected':''}>${e(l)}</option>`).join('')}</select>`;
const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self'; connect-src 'self'; form-action 'self'; base-uri 'none'">
<title>Offers Compare — brokerage, crypto and cash APY offers side by side</title><meta name="robots" content="noindex"><link rel="stylesheet" href="${rel}assets/style.css"></head><body>
<a class="skip" href="#board">Skip to the comparison</a>
<header class="wrap"><div class="brand"><a class="logo" href="${rel}" aria-label="Offers Compare home"><svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><rect x="1" y="1" width="20" height="20" fill="none" stroke="#17202B" stroke-width="2"/><path d="M5 8h12M5 12h12M5 16h7" stroke="#17202B" stroke-width="2"/><rect x="13" y="14" width="4" height="4" fill="#17694A"/></svg>Offers Compare</a>
<nav aria-label="Site"><a href="${rel}f/brokerage-any/">Brokerages</a><a href="${rel}f/crypto-any/">Crypto exchanges</a><a href="${rel}f/cash-any/">Cash APY</a><a href="${rel}how-we-rank/">How we rank</a></nav></div>
<h1>Brokerage &amp; crypto sign-up offers, side by side</h1><p class="byline"><span class="dw">by the DropWorthIt team</span> · updated <time datetime="${new Date(latest.lastChecked).toISOString()}">${ct.format(new Date(latest.lastChecked))}</time></p>
<p class="lede">Bonus, cash rate, what you must do to earn it, fees and status for each offer, linked to the official terms.</p></header>
<main class="wrap"><section class="disc" aria-label="Disclosure"><strong>Disclosure:</strong> no affiliate or paid links. The board sorts by net value at the deposit you choose. <a href="${rel}how-we-rank/">How we rank</a>. <strong>Not financial advice.</strong> Check the official terms before signing up.</section>
<section class="calc" aria-labelledby="calc-h"><h2 id="calc-h">What would I actually get?</h2>
<form id="calc-form" action="${rel}" method="get"><label for="deposit">Deposit ($)<input id="deposit" name="deposit" type="number" inputmode="decimal" min="0" step="1" value="${EX}"></label><button type="submit">Calculate</button></form>
<p class="formula">Net, 1 yr = cash bonus + (deposit × APY for one year) + any short promo booster − one year of fees. Parts the terms don't give a dollar value for (like free shares) count as $0.</p>
<p class="note" id="calc-at" aria-live="polite">Showing net value for a $5,000 example deposit. (With JavaScript off, the figures stay at this example.)</p></section>
<nav class="bar" aria-label="Account type"><span class="lbl">Show:</span>${Object.entries(TYPES).map(([k,l])=>`<a href="${rel}${k==='all'?'':`f/${k}-any/`}"${k===type&&min==='any'?' aria-current="page"':''}>${l==='All'?'All':l}</a>`).join('')}</nav>
<form class="filters" action="/" method="get" aria-label="Eligibility filters"><label for="f-state">State${sel('state',{any:'Any state',...Object.fromEntries(STATES.map(s=>[s,s]))},st)}</label><label for="f-type">Account type${sel('type',TYPES,type)}</label><label for="f-min">Min deposit${sel('min',MINS,min)}</label><button type="submit">Apply</button></form>
${note?`<p class="fnote" role="status">${note}</p>`:''}
<section class="board" id="board" tabindex="-1"><div class="checked"><span><strong>All offers checked</strong> ${when(latest)}</span><span>Sources: each offer's official terms page only.</span></div>
<table><caption><strong>Showing ${rows.length} of ${D.length} offers</strong> · sorted by Net, 1 yr at $5,000, highest first</caption>
<thead><tr><th scope="col">Offer</th><th scope="col" class="d-only">Sign-up bonus</th><th scope="col" class="n">Cash APY</th><th scope="col" class="n">Net, 1 yr</th><th scope="col">To earn it</th><th scope="col">Fee</th><th scope="col" class="n">Min deposit</th><th scope="col">State exclusions</th><th scope="col">Status</th><th scope="col">Last checked</th><th scope="col">Terms</th></tr></thead>
<tbody>${rows.map(tr).join('\n')}</tbody></table>
<p class="foot">Times in Central Time (CT), UTC in parentheses. "Not stated" = the official terms don't say. Green marks the best value in a column, nothing else. Offers with an unstated fee can't be BEST.</p></section>
<p class="combos">Quick filters (no JavaScript needed): ${['brokerage','crypto','cash'].flatMap(t=>Object.keys(MINS).filter(m=>m!=='any').map(m=>`<a href="${rel}f/${t}-${m}/">${TYPES[t]} ${e(MINS[m])}</a>`)).join('')}</p></main>
<footer class="wrap"><a href="${rel}how-we-rank/">How we rank</a><a href="${rel}offers.json">Offers JSON</a>
<p><strong>Not financial advice.</strong> Offers change; check the official terms before you sign up. The official terms page is the source of truth.</p>
<p>Bonuses are usually taxable income; you may get a 1099. Not tax advice.</p><p class="foot-by">Offers Compare · by the DropWorthIt team</p></footer>
<script src="${rel}assets/calc.js"></script><script src="${rel}assets/app.js"></script></body></html>`;
const dir=O+(type==='all'&&min==='any'?'':`/f/${type}-${min}`);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(dir+'/index.html',html)};
// Filtering: state hides only explicit exclusions. Empty result -> show all with a note (never an empty table).
const filt=(type,min,st)=>D.filter(o=>(type==='all'||o.category===type)&&(min==='any'||(o.minDeposit??0)<=+min)&&(st==='any'||!(o.stateExclusions||[]).includes(st)));
page({rel:'/',type:'all',min:'any',st:'any',list:D,note:''});const rewrites=[];
for(const t of Object.keys(TYPES))for(const m of Object.keys(MINS)){if(t==='all'&&m==='any')continue;let l=filt(t,m,'any'),note=`Filtered: ${TYPES[t]} · min deposit ${MINS[m]}. Offers with an unstated minimum are included. <a href="/">Show all</a>`;
if(!l.length){l=D;note='No offers fit; showing all.'}page({rel:'/',type:t,min:m,st:'any',list:l,note});
rewrites.push({source:'/',has:[{type:'query',key:'type',value:t},{type:'query',key:'min',value:m}],destination:`/f/${t}-${m}/`})}
// State choice: no offer here lists exclusions yet, so the type/min page is served; the note on how state works is on every page via "State exclusions".
fs.mkdirSync(O+'/how-we-rank',{recursive:true});fs.writeFileSync(O+'/how-we-rank/index.html',fs.readFileSync(O+'/index.html','utf8').replace(/<main[\s\S]*<\/main>/,`<main class="wrap"><h2>How we rank</h2><p>Every figure comes from the provider's official terms page, linked on each row with the date and time we checked it. If the terms don't say something, we show "Not stated" instead of guessing.</p><p>The table is sorted by Net, 1 yr: cash bonus + one year of APY on your deposit + any short promo booster − one year of fees. Non-cash bonuses (like free shares) count as $0 because their value isn't stated. An offer whose fee isn't stated can't be marked BEST.</p><p>State filter: an offer is hidden only when its official terms list your state as excluded. No affiliate or paid links are used. <a href="/">Back to the board</a></p></main>`));
fs.writeFileSync('vercel.json',JSON.stringify({rewrites,headers:[{source:'/(.*)',headers:[{key:'X-Robots-Tag',value:'noindex'},{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'strict-origin-when-cross-origin'}]}],outputDirectory:'dist',buildCommand:'node build.js'},null,1)+'\n');
console.log(`Built ${D.length} offers, ${rewrites.length} filter pages.`);
