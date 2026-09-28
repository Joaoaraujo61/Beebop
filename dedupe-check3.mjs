import fs from 'node:fs';
function lines(p){ return fs.readFileSync(p,'utf8').split(/\r?\n/); }
const comp = lines('css/components.css');
const early = comp.slice(0, 3596); // lines 1-3596
const late = comp.slice(3596); // lines 3597-6299
function selectors(arr){
  const map = new Map();
  arr.forEach((l,i)=>{
    const t = l.trim();
    if(!t || t.startsWith('/*') || t.startsWith('*') || t.startsWith('//')) return;
    // capture selector before {
    const m = t.match(/^([^{}]+)\{\s*$/);
    if(m){
      let sel = m[1].trim().replace(/\s+/g,' ');
      if(sel.startsWith('@')) return; // skip @media/@supports
      if(!map.has(sel)) map.set(sel, []);
      map.get(sel).push(i);
    }
  });
  return map;
}
const e = selectors(early), l = selectors(late);
console.log(`early selectors=${e.size} late selectors=${l.size}`);
let onlyEarly = [...e.keys()].filter(k=>!l.has(k));
console.log(`only in early (${onlyEarly.length}):`);
onlyEarly.forEach(k=>console.log(' EARLY-ONLY> '+k));
// also check late-only count
let onlyLate = [...l.keys()].filter(k=>!e.has(k));
console.log(`only in late (${onlyLate.length}):`);
onlyLate.forEach(k=>console.log(' LATE-ONLY> '+k));
// check responsive halves selector diff already known; also verify rest identical
const resp = lines('css/responsive.css');
const r1 = resp.slice(0,271).join('\n'), r2 = resp.slice(271).join('\n');
console.log('responsive len1='+r1.length+' len2='+r2.length);
