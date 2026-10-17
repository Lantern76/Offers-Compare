// Fails if any internal href/src in dist/*.html does not resolve to a file.
const fs=require('fs'),path=require('path');const root='dist',bad=[];
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(x=>x.isDirectory()?walk(path.join(d,x.name)):[path.join(d,x.name)]);
for(const f of walk(root).filter(f=>f.endsWith('.html'))){const h=fs.readFileSync(f,'utf8');
for(const m of h.matchAll(/\s(?:href|src)="([^"]*)"/g)){let u=m[1].replace(/&amp;/g,'&');
if(!u||/^[a-z][a-z0-9+.-]*:/i.test(u)||u.startsWith('//')||u.startsWith('#'))continue;
u=decodeURIComponent(u.split('#')[0].split('?')[0]);if(!u)continue;
const t=u.startsWith('/')?path.join(root,u):path.join(path.dirname(f),u);
const tt=fs.existsSync(t)&&fs.statSync(t).isDirectory()?path.join(t,'index.html'):t;if(!fs.existsSync(tt)||!fs.statSync(tt).isFile())bad.push(`${f}: ${m[1]}`)}}
if(bad.length){console.error(`Broken internal links (${bad.length}):\n`+bad.join('\n'));process.exit(1)}
console.log('All internal href/src in dist resolve to files.');
