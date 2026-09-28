export function selKey(header){
  // extract actual selector: last non-empty line that is not a comment
  const noComments = header.replace(/\/\*[\s\S]*?\*\//g, '\n');
  const lns = noComments.split('\n').map(s=>s.trim()).filter(Boolean);
  const last = lns.length ? lns[lns.length-1] : '';
  return last.replace(/\s+/g,' ').trim();
}
export function leadingTrivia(header){
  // everything except the final selector line (comments preserved)
  const lns = header.split('\n');
  // find last line that contains non-comment text
  let idx = -1;
  for(let i=lns.length-1;i>=0;i--){
    const stripped = lns[i].replace(/\/\*.*?\*\//g,'').trim();
    if(stripped!==''){ idx=i; break; }
  }
  if(idx<=0) return '';
  return lns.slice(0,idx).join('\n');
}
export function cleanHeader(header){
  // selector line only (used for key + stable render we keep original full)
  return selKey(header);
}
export function mergeBodies(firstBody, lastBody){
  function decls(body){
    const noC = body.replace(/\/\*[\s\S]*?\*\//g,'');
    const parts = noC.split(';');
    const list = [];
    for(const p of parts){
      const t = p.trim();
      if(!t) continue;
      const ci = t.indexOf(':');
      if(ci===-1) continue;
      const prop = t.slice(0,ci).trim().toLowerCase();
      const val = t.slice(ci+1).trim();
      list.push([prop, val]);
    }
    return list;
  }
  const order = [];
  const map = new Map();
  for(const [p,v] of decls(firstBody)){
    if(!map.has(p)) order.push(p);
    map.set(p,v);
  }
  for(const [p,v] of decls(lastBody)){
    if(!map.has(p)) order.push(p);
    map.set(p,v);
  }
  return order.map(p=>`  ${p}: ${map.get(p)};`).join('\n');
}