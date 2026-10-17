// Shared net-value maths + Net cell parts (browser + build.js).
// Net, 1 yr = cash bonus + deposit x APY x 1 yr + booster - 1 yr of fees.
(function(g){function net(o,d){if(o.minDeposit!=null&&d<o.minDeposit)return{low:true};
var v=(o.bonusCash||0)+d*(o.apy||0)/100;if(o.boosterApy)v+=Math.min(d,o.boosterCap||d)*o.boosterApy/100*(o.boosterDays||0)/365;
var feeKnown=o.annualFee!=null;if(feeKnown)v-=o.annualFee;return{value:Math.round(v*100)/100,feeKnown:feeKnown}}
function money(v){return(v<0?'−$':'$')+Math.abs(v).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
// Ties break by id (ascending) so the order is stable. Order: known fee & net >= 0 (desc), unstated fee (desc), known fee & net < 0 (desc), deposit too low.
// BEST (net) = highest non-negative net with a known fee. BEST appears only in the Net, 1 yr column.
// Rows with an unstated fee are never BEST or "Highest".
function ok(r){return r&&!r.low&&r.feeKnown&&r.value>=0}
function rank(list,d){var res={};list.forEach(function(o){res[o.id]=net(o,d)});
var key=function(r){return r.low?3:!r.feeKnown?1:r.value<0?2:0};
var order=list.slice().sort(function(a,b){var ra=res[a.id],rb=res[b.id];return key(ra)-key(rb)||((rb.value||0)-(ra.value||0))||(a.id<b.id?-1:a.id>b.id?1:0)});
var best=null;order.forEach(function(o){if(best==null&&ok(res[o.id]))best=o.id});
return{res:res,order:order,best:best}}
function cls(id,R){var r=R.res[id];return 'n b net'+(id===R.best?' best':'')+(!r.low&&r.value<0?' neg':'')+(!r.low&&!r.feeKnown?' unk':'')}
// Cell content as [{t:text,c:className|''}] so the browser can build it with textContent (no innerHTML).
function parts(id,R){var r=R.res[id];if(r.low)return[{t:'Deposit too low',c:'low'}];
if(!r.feeKnown)return[{t:'Up to',c:'upto'},{t:money(r.value),c:''},{t:'fee unknown',c:'unk-l'}];
var p=[{t:money(r.value),c:''}];if(r.value<0)p.push({t:'costs more than it earns',c:'neg-l'});
if(id===R.best)p.push({t:'Best',c:'best-l'},{t:'taxable',c:'tax'});return p}
function cell(id,R){var esc=function(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;')};
return parts(id,R).map(function(p){return p.c?'<span class="'+p.c+'">'+esc(p.t)+'</span>':esc(p.t)}).join('')}
function status(d){var m=money(d).replace('.00','');return 'Showing net value for a '+m+' deposit; board sorted by Net, 1 yr at the '+m+' deposit, highest first.'}
var api={net:net,money:money,rank:rank,cls:cls,parts:parts,cell:cell,status:status};if(typeof module!=='undefined')module.exports=api;else g.OCcalc=api})(this);
