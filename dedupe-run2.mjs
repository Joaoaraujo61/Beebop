import fs from 'node:fs';
import { parseTop, normBody } from './dedupe-lib.mjs';
import { selKey, mergeBodies } from './dedupe-lib2.mjs';
function renderItems(items){
  return items.map(o=>{
    if(o.type==='trivia') return o.text;
    if(o.type==='atline') return o.full;
    if(o.type==='rule') return o.full;
    if(o.type==='at'){
      if(o._kids) return o.header+' {\n'+renderItems(o._kids)+'\n}\n';
      return o.full;
    }
    return o.full||'';
  }).join('\n');
}
function dedupeItems(items){
  const out=[];
  const rIdx=new Map(), aIdx=new Map();
  const reindex=()=>{
    rIdx.clear(); aIdx.clear();
    out.forEach((o,k)=>{
      if(o.type==='rule') rIdx.set('R|'+selKey(o.header),k);
      else if(o.type==='at' && /@media|@supports/i.test(selKey(o.header)))
        aIdx.set('A|'+selKey(o.header),k);
    });
  };
  for(const it of items){
    if(it.type==='rule'){
      const key='R|'+selKey(it.header);
      if(normBody(it.body)===''){
        // keep structural empty rules that document intent? -> drop only
        // the known no-op focus placeholder
        if(/input\s*:\s*focus/i.test(selKey(it.header))) continue;
      }
      if(rIdx.has(key)){
        const idx=rIdx.get(key), prev=out[idx];
        if(normBody(prev.body)===normBody(it.body)) continue;
        const merged = mergeBodies(prev.body, it.body);
        const i = prev.full.indexOf('{');
        const j = prev.full.lastIndexOf('}');
        const full = prev.full.slice(0,i+1)+'\n'+merged+'\n'+prev.full.slice(j);
        out[idx]={...prev, body:merged, full};
      } else { rIdx.set(key,out.length); out.push(it); }
    } else if(it.type==='at' && /@media|@supports/i.test(selKey(it.header))){
      const key='A|'+selKey(it.header);
      const kids=dedupeItems(parseTop(it.body));
      const nb=renderItems(kids);
      const cur={...it, body:nb, full:it.header+'{'+nb+'}', _kids:kids};
      if(aIdx.has(key)){
        const idx=aIdx.get(key), prev=out[idx];
        const pk=prev._kids || parseTop(prev.body);
        const mk=dedupeItems([...pk, ...kids]);
        const mb=renderItems(mk);
        out[idx]={...it, body:mb, full:it.header+'{'+mb+'}', _kids:mk};
      } else { aIdx.set(key,out.length); out.push(cur); }
    } else if(it.type==='at'){
      const key='A|'+selKey(it.header)+'|'+normBody(it.body);
      if(rIdx.has(key) || aIdx.has(key)) continue;
      // keyframes: mesmo nome+corpo deve aparecer uma vez
      if(/@keyframes/i.test(selKey(it.header))){
        const k2='KF|'+selKey(it.header);
        if(rIdx.has(k2)) continue;
        rIdx.set(k2,out.length);
      }
      rIdx.set(key,out.length); aIdx.set(key,out.length); out.push(it);
    } else out.push(it);
  }
  const seen=new Set(), fin=[];
  for(const o of out){
    if(o.type==='trivia'){
      const k=o.text.trim();
      if(!k) continue;
      if(seen.has(k)) continue;
      seen.add(k); fin.push(o);
    } else fin.push(o);
  }
  return fin;
}
{
  const raw=fs.readFileSync('css/responsive.css','utf8');
  const lns=raw.split(/\r?\n/);
  const idx=lns.findIndex((l,i)=>i>10 && l.includes('css/responsive.css'));
  console.log('responsive split at line '+(idx+1));
  const second=lns.slice(idx).join('\n');
  const dd=dedupeItems(parseTop(second));
  let out2=renderItems(dd);
  out2=out2.replace(/\n{4,}/g,'\n\n\n');
  if(!out2.endsWith('\n')) out2+='\n';
  fs.writeFileSync('css/responsive.css',out2);
  console.log('responsive: '+lns.length+' -> '+out2.split('\n').length);
}
{
  const raw=fs.readFileSync('css/components.css','utf8');
  const items=parseTop(raw);
  console.log('components top items='+items.length);
  const dd=dedupeItems(items);
  let out2=renderItems(dd);
  out2=out2.replace(/\n{4,}/g,'\n\n\n');
  if(!out2.endsWith('\n')) out2+='\n';
  fs.writeFileSync('css/components.css',out2);
  console.log('components '+raw.split('\n').length+' -> '+out2.split('\n').length);
  console.log('items '+items.length+' -> '+dd.length);
}
console.log('done');
