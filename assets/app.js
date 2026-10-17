// Progressive enhancement: live calculator + client-side filters. The page works fully without this file.
(function(){var C=window.OCcalc,rows=[].slice.call(document.querySelectorAll('tr[data-offer]')),data=rows.map(function(tr){return JSON.parse(tr.getAttribute('data-offer'))});
function calc(d){var best=null,res={};data.forEach(function(o){var r=C.net(o,d);res[o.id]=r;if(!r.low&&r.feeKnown&&(best==null||r.value>res[best].value))best=o.id});
rows.forEach(function(tr){var id=JSON.parse(tr.getAttribute('data-offer')).id,r=res[id],td=tr.querySelector('td.net');if(!td)return;td.classList.toggle('best',id===best);
td.textContent='';if(r.low){var s=document.createElement('span');s.className='low';s.textContent='Deposit too low';td.appendChild(s);return}
td.appendChild(document.createTextNode(C.money(r.value)));if(!r.feeKnown){var f=document.createElement('span');f.className='fee-ns';f.textContent='before fee (not stated)';td.appendChild(f)}
if(id===best){var b=document.createElement('span');b.className='best-l';b.textContent='Best';td.appendChild(b);var t=document.createElement('span');t.className='tax';t.textContent='taxable';td.appendChild(t)}});
var lab=document.getElementById('calc-at');if(lab)lab.textContent='Showing net value for a '+C.money(d).replace('.00','')+' deposit.'}
var form=document.getElementById('calc-form'),inp=document.getElementById('deposit');
if(form){form.addEventListener('submit',function(e){e.preventDefault();var d=parseFloat(inp.value);if(d>=0)calc(d)});inp.addEventListener('input',function(){var d=parseFloat(inp.value);if(d>=0)calc(d)})}
})();
