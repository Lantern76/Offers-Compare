// Progressive enhancement: live calculator that re-sorts the board. The page works fully without this file.
(function(){var C=window.OCcalc,tb=document.querySelector('#board tbody');if(!tb)return;
var rows=[].slice.call(tb.querySelectorAll('tr[data-offer]')),data=rows.map(function(tr){return JSON.parse(tr.getAttribute('data-offer'))}),byId={};
rows.forEach(function(tr,i){byId[data[i].id]=tr});
function calc(d){var R=C.rank(data,d);R.order.forEach(function(o){var tr=byId[o.id],td=tr.querySelector('td.net');td.className=C.cls(o.id,R);td.innerHTML=C.cell(o.id,R);tb.appendChild(tr)});
var t=C.status(d),s=document.getElementById('calc-at'),c=document.getElementById('sort-at');if(s)s.textContent=t;if(c)c.textContent=t.split('; ')[1].replace(/\.$/,'')}
var form=document.getElementById('calc-form'),inp=document.getElementById('deposit');
function go(){var d=parseFloat(inp.value);if(d>=0&&isFinite(d))calc(d)}
form.addEventListener('submit',function(e){e.preventDefault();go()});inp.addEventListener('input',go)})();
