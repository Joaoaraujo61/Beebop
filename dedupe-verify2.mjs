import fs from 'node:fs';
import { parseTop, normBody } from './dedupe-lib.mjs';
import { selKey } from './dedupe-lib2.mjs';
function scopeWalk(items, cb, scope='TOP'){
  for(const it of items){
    if(it.type==='rule') cb(it, scope);
    else if(it.type==='at'){
      const inner = it._kids ? it._kids : parseTop(it.body||'');
      scopeWalk(inner, cb, selKey(it.header));
    }
  }
}
for(const f of ['css/components.css']){
  const raw=fs.readFileSync(f,'utf8');
  const items=parseTop(raw);
  const map=new Map();
  scopeWalk(items,(it,scope)=>{
    const k=scope+' || '+selKey(it.header);
    if(!map.has(k)) map.set(k,[]);
    map.get(k).push(normBody(it.body).slice(0,60));
  });
  const dups=[...map.entries()].filter(([k,v])=>v.length>1);
  console.log(f+' same-scope dupes='+dups.length);
  dups.slice(0,40).forEach(([k,v])=>console.log('  '+k+' x'+v.length));
}
// coverage: selectors in bak must exist in new (for components)
for(const [bak, cur] of [['css/components.css.bak','css/components.css'],['css/responsive.css.bak','css/responsive.css']]){
  try{
    const b=fs.readFileSync(bak,'utf8'), c=fs.readFileSync(cur,'utf8');
    const bs=new Set(), cs=new Set();
    scopeWalk(parseTop(b),(it,s)=>bs.add(selKey(it.header)));
    scopeWalk(parseTop(c),(it,s)=>cs.add(selKey(it.header)));
    const missing=[...bs].filter(k=>!cs.has(k));
    console.log(bak+' selectors='+bs.size+' '+cur+' selectors='+cs.size+' missing='+missing.length);
    missing.slice(0,40).forEach(k=>console.log('  MISSING> '+k));
  }catch(e){ console.log('skip '+bak+' '+e.message); }
}
// keyframes check
{
  const raw=fs.readFileSync('css/components.css','utf8');
  const items=parseTop(raw);
  items.filter(i=>i.type==='at' && /keyframes/i.test(selKey(i.header))).forEach(i=>{
    console.log('KF '+selKey(i.header)+' len='+i.body.length);
  });
}
