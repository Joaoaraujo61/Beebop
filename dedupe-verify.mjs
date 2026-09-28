import fs from 'node:fs';
import { parseTop, normBody } from './dedupe-lib.mjs';
import { selKey } from './dedupe-lib2.mjs';
function walk(items, cb){
  for(const it of items){
    cb(it);
    if(it._kids) walk(it._kids, cb);
    else if(it.type==='at' && it.body) {
      try{ walk(parseTop(it.body), cb); }catch{}
    }
  }
}
for(const f of ['css/components.css','css/responsive.css','css/style.css']){
  const raw=fs.readFileSync(f,'utf8');
  const items=parseTop(raw);
  const seen=new Map(), dups=[];
  walk(items,(it)=>{
    if(it.type!=='rule') return;
    const k=selKey(it.header);
    if(!seen.has(k)) seen.set(k, normBody(it.body));
    else if(seen.get(k)!==normBody(it.body)) dups.push(k);
  });
  console.log(f+' conflicting-dup-rules='+dups.length);
  dups.slice(0,20).forEach(k=>console.log('  DUP> '+k));
}
// cross-file: responsive selectors also defined in components?
const csel=new Set(), rsel=new Set();
walk(parseTop(fs.readFileSync('css/components.css','utf8')), (it)=>{
  if(it.type==='rule') csel.add(selKey(it.header));
});
walk(parseTop(fs.readFileSync('css/responsive.css','utf8')), (it)=>{
  if(it.type==='rule') rsel.add(selKey(it.header));
});
console.log('cross overlap responsive-in-components: '+[...rsel].filter(k=>csel.has(k)).length);
[...rsel].filter(k=>csel.has(k)).slice(0,30).forEach(k=>console.log('  OVERLAP> '+k));
