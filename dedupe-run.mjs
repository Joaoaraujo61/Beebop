import fs from 'node:fs';
import { parseTop, normSel, normBody } from './dedupe-lib.mjs';
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
      if(o.type==='rule') rIdx.set('R|'+normSel(o.header),k);
      else if(o.type==='at' && /@media|@supports/i.test(o.header))
        aIdx.set('A|'+normSel(o.header),k);
    });
  };
  for(const it of items){
    if(it.type==='rule'){
      const key='R|'+normSel(it.header);
      if(normBody(it.body)==='') continue; // drop empty rules
      if(rIdx.has(key)){
        const idx=rIdx.get(key), prev=out[idx];
        if(normBody(prev.body)===normBody(it.body)) continue;
        out[idx]=it; // keep FIRST position, LAST body (no reorder)
      } else { rIdx.set(key,out.length); out.push(it); }
    } else if(it.type==='at' && /@media|@supports/i.test(it.header)){
      const key='A|'+normSel(it.header);
      const kids=dedupeItems(parseTop(it.body));
      const nb=renderItems(kids);
      const cur={...it, body:nb, full:it.header+'{'+nb+'}', _kids:kids};
      if(aIdx.has(key)){
        const idx=aIdx.get(key), prev=out[idx];
        const pk=prev._kids || parseTop(prev.body);
        const mk=dedupeItems([...pk, ...kids]);
        const mb=renderItems(mk);
        out.splice(idx,1); reindex();
        aIdx.set(key,out.length);
        out.push({...it, body:mb, full:it.header+'{'+mb+'}', _kids:mk});
      } else { aIdx.set(key,out.length); out.push(cur); }
    } else if(it.type==='at'){
      const key='A|'+normSel(it.header)+'|'+normBody(it.body);
      if(rIdx.has(key)) continue;
      rIdx.set(key,out.length); out.push(it);
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
  let out=renderItems(dd);
  out=out.replace(/\n{4,}/g,'\n\n\n');
  if(!out.endsWith('\n')) out+='\n';
  fs.copyFileSync('css/responsive.css','css/responsive.css.bak');
  fs.writeFileSync('css/responsive.css',out);
  console.log('responsive: '+lns.length+' -> '+out.split('\n').length);
}
{
  const raw=fs.readFileSync('css/components.css','utf8');
  const items=parseTop(raw);
  console.log('components top items='+items.length);
  const dd=dedupeItems(items);
  let out=renderItems(dd);
  out=out.replace(/\n{4,}/g,'\n\n\n');
  if(!out.endsWith('\n')) out+='\n';
  fs.copyFileSync('css/components.css','css/components.css.bak');
  fs.writeFileSync('css/components.css',out);
  console.log('components lines '+raw.split('\n').length+' -> '+out.split('\n').length);
  console.log('components items '+items.length+' -> '+dd.length);
}
console.log('done');
