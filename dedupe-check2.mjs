import fs from 'node:fs';
function lines(p){ return fs.readFileSync(p,'utf8').split(/\r?\n/); }
function norm(s){ return s.replace(/\s+/g,' ').trim(); }
const comp = lines('css/components.css');
const resp = lines('css/responsive.css');
// responsive diff first half vs second half
const r1 = resp.slice(0,271).map(norm).filter(Boolean);
const r2 = resp.slice(271).map(norm).filter(Boolean);
const set2 = new Set(r2);
let onlyInFirst = r1.filter(l=>!set2.has(l));
console.log('responsive only in first (normalized non-empty):');
onlyInFirst.forEach(l=>console.log(' 1ST> '+l));
const set1 = new Set(r1);
let onlyInSecond = r2.filter(l=>!set1.has(l));
console.log('responsive only in second:');
onlyInSecond.forEach(l=>console.log(' 2ND> '+l));
// components: compare block 4020-4096 (second drawer with search_wrap) vs 2750-2824 (first drawer with search_form)
console.log('--- comp drawer1 2749-2824 ---');
comp.slice(2748,2824).forEach((l,i)=>console.log(`${2749+i}:${l}`));
