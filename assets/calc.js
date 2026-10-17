// Shared net-value maths + Net cell markup (browser + build.js).
// Net, 1 yr = cash bonus + deposit x APY x 1 yr + booster - 1 yr of fees.
(function(g){function net(o,d){if(o.minDeposit!=null&&d<o.minDeposit)return{low:true};
var v=(o.bonusCash||0)+d*(o.apy||0)/100;if(o.boosterApy)v+=Math.min(d,o.boosterCap||d)*o.boosterApy/100*(o.boosterDays||0)/365;
var feeKnown=o.annualFee!=null;if(feeKnown)v-=o.annualFee;return{value:Math.round(v*100)/100,feeKnown:feeKnown}}
function money(v){return(v<0?'−$':'$')+Math.abs(v).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
// Order: non-negative by value desc, then negatives (desc), then "deposit too low". BEST = highest with a known fee and value >= 0.
// If the highest overall has an unstated fee it gets the gray "Highest, fee not stated" label instead.
function rank(list,d){var res={};list.forEach(function(o){res[o.id]=net(o,d)});
var key=function(r){return r.low?2:r.value<0?1:0};
var order=list.slice().sort(function(a,b){var ra=res[a.id],rb=res[b.id];return key(ra)-key(rb)||((rb.value||0)-(ra.value||0))});
var best=null,top=null;order.forEach(function(o){var r=res[o.id];if(r.low||r.value<0)return;if(top==null)top=o.id;if(best==null&&r.feeKnown)best=o.id});
return{res:res,order:order,best:best,highNoFee:(top&&top!==best&&!res[top].feeKnown)?top:null}}
function cls(id,R){var r=R.res[id];return 'n b net'+(id===R.best?' best':'')+(!r.low&&r.value<0?' neg':'')}
function cell(id,R){var r=R.res[id];if(r.low)return '<span class="low">Deposit too low</span>';
var h=money(r.value);if(!r.feeKnown)h+='<span class="fee-ns">before fee (not stated)</span>';if(r.value<0)h+='<span class="neg-l">costs more than it earns</span>';
if(id===R.best)h+='<span class="best-l">Best</span><span class="tax">taxable</span>';if(id===R.highNoFee)h+='<span class="hi-l">Highest, fee not stated</span>';return h}
function status(d){var m=money(d).replace('.00','');return 'Showing net value for a '+m+' deposit; board sorted by Net, 1 yr at the '+m+' deposit, highest first.'}
var api={net:net,money:money,rank:rank,cls:cls,cell:cell,status:status};if(typeof module!=='undefined')module.exports=api;else g.OCcalc=api})(this);
