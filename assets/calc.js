// Shared net-value maths (browser + build.js). Net, 1 yr = cash bonus + deposit x APY x 1 yr + booster - 1 yr of fees.
(function(g){function net(o,d){if(o.minDeposit!=null&&d<o.minDeposit)return{low:true};
var v=(o.bonusCash||0)+d*(o.apy||0)/100;if(o.boosterApy)v+=Math.min(d,o.boosterCap||d)*o.boosterApy/100*(o.boosterDays||0)/365;
var feeKnown=o.annualFee!=null;if(feeKnown)v-=o.annualFee;return{value:Math.round(v*100)/100,feeKnown:feeKnown}}
function money(v){return(v<0?'−$':'$')+Math.abs(v).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
var api={net:net,money:money};if(typeof module!=='undefined')module.exports=api;else g.OCcalc=api})(this);
