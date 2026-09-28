import fs from 'node:fs';
const comp = fs.readFileSync('css/components.css','utf8').split(/\r?\n/);
const resp = fs.readFileSync('css/responsive.css','utf8').split(/\r?\n/);
let out = [];
out.push(`components lines=${comp.length}`);
out.push(`responsive lines=${resp.length}`);
// responsive: compare first half vs second half
const rMid = resp.findIndex((l,i)=>i>10 && l.includes('css/responsive.css'));
out.push(`responsive second header at line=${rMid+1} text=${JSON.stringify(resp[rMid])}`);
// show first media blocks
out.push('--- responsive 1-30 ---');
resp.slice(0,30).forEach((l,i)=>out.push(`${i+1}:${l}`));
out.push('--- responsive 272-300 ---');
resp.slice(271,300).forEach((l,i)=>out.push(`${272+i}:${l}`));
// components: find header markers
comp.forEach((l,i)=>{ if(l.trim()==='header{') out.push(`header{ at ${i+1}`); });
comp.forEach((l,i)=>{ if(l.includes('/*--------- Header ---------*/')) out.push(`Header comment at ${i+1}`); });
comp.forEach((l,i)=>{ if(l.includes('/*--------- Footer ---------*/')) out.push(`Footer comment at ${i+1}`); });
comp.forEach((l,i)=>{ if(l.includes('/*--------- Hero ---------*/')) out.push(`Hero comment at ${i+1}`); });
comp.forEach((l,i)=>{ if(l.includes('/*--------- Music Card ---------*/')) out.push(`MusicCard comment at ${i+1}`); });
// check where duplicate starts: find second occurrence of "/*--------- Header ---------*/" after line 3000?
// compare line 2611 block vs 3599 block first 20 lines
out.push('--- comp 2611-2630 ---');
comp.slice(2610,2630).forEach((l,i)=>out.push(`${2611+i}:${l}`));
out.push('--- comp 3599-3618 ---');
comp.slice(3598,3618).forEach((l,i)=>out.push(`${3599+i}:${l}`));
// end marker: last 30 lines
out.push('--- comp last 30 ---');
comp.slice(-30).forEach((l,i)=>out.push(`${comp.length-29+i}:${l}`));
// check if comp[3596..] duplicates comp[0..]: compare normalized
function norm(s){return s.trim().replace(/\s+/g,' ');}
let match=0;
for(let i=0;i<200;i++){ if(norm(comp[i]||'')===norm(comp[3596+i]||'')) match++; }
out.push(`first200 vs second-half-start200 normalized equal=${match}/200`);
// compare comp[2610..2800] vs comp[3598..3788]
let m2=0;
for(let i=0;i<190;i++){ if(norm(comp[2610+i]||'')===norm(comp[3598+i]||'')) m2++; }
out.push(`2611-2800 vs 3599-3788 normalized equal=${m2}/190`);
fs.writeFileSync('dedupe-report.txt', out.join('\n'));
console.log('wrote report');
