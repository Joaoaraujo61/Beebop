import fs from 'node:fs';
function lines(p){ return fs.readFileSync(p,'utf8').split(/\r?\n/); }
const comp = lines('css/components.css');
// find ranges for early-only content: print lines 2400-2610 and 3277-3596 with numbers (these hold most early-only selectors)
const ranges = [[2420,2610],[2860,2960],[3040,3080],[3277,3596]];
let out = [];
ranges.forEach(([a,b])=>{
  out.push(`===== LINES ${a}-${b} =====`);
  comp.slice(a-1,b).forEach((l,i)=>out.push(`${a+i}:${l}`));
});
fs.writeFileSync('dedupe-extract.txt', out.join('\n'));
console.log('wrote extract '+out.length+' lines');
