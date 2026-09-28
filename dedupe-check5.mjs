import fs from 'node:fs';
function lines(p){ return fs.readFileSync(p,'utf8').split(/\r?\n/); }
const comp = lines('css/components.css');
// Parse top-level rule blocks with brace matching (ignore @-inner splitting for now)
function parseBlocks(ls){
  const blocks=[];
  let buf=[], depth=0, start=0, inBlock=false, header=[];
  for(let i=0;i<ls.length;i++){
    const l=ls[i];
    const opens=(l.match(/\{/g)||[]).length, closes=(l.match(/\}/g)||[]).length;
    if(!inBlock){
      if(opens>0){
        // selector = buffered comments + this line up to {
        const sel = (header.join('\n')+'\n'+l).trim();
        buf=[...header, l]; header=[];
        depth=opens-closes; inBlock=true; start=i;
        if(depth===0){ blocks.push({sel, body:buf.join('\n'), start, end:i}); buf=[]; inBlock=false; }
      } else {
        if(l.trim()==='' || l.trim().startsWith('/*') || l.trim().startsWith('*') || l.trim().startsWith('*/')) header.push(l);
        else if(l.trim()!=='') { /* stray */ header.push(l); }
        else header.push(l);
        if(header.length>40) header=header.slice(-40);
      }
    } else {
      buf.push(l); depth+=opens-closes;
      if(depth<=0){ blocks.push({sel:'', body:buf.join('\n'), start:start??i, end:i}); buf=[]; inBlock=false; depth=0; }
    }
  }
  return blocks;
}
// Simpler: selector key = last non-comment line before/with { 
function keyOf(block){
  const ls=block.body.split('\n');
  for(let i=ls.length-1;i>=0;i--){
    const t=ls[i].trim();
    if(!t||t.startsWith('/*')||t.startsWith('*')||t.startsWith('//')) continue;
    if(t.includes('{')) return t.replace(/\s+/g,' ').trim();
  }
  return ls.join('\n').slice(0,80);
}
const blocks=parseBlocks(comp);
console.log('total blocks='+blocks.length);
// count selector frequency
const freq=new Map();
blocks.forEach(b=>{
  const k=keyOf(b);
  // only style rules (skip pure comments)
  if(!k.includes('{')) return;
  freq.set(k,(freq.get(k)||0)+1);
});
const dups=[...freq.entries()].filter(([k,v])=>v>1);
console.log('distinct selectors='+freq.size+' duplicated='+dups.length);
dups.slice(0,60).forEach(([k,v])=>console.log(` x${v} ${k}`));
// check bodies equal for top dups: header{
const hBlocks=blocks.filter(b=>keyOf(b)==='header{');
console.log('header blocks='+hBlocks.length);
hBlocks.forEach((b,i)=>console.log(`--- header #${i+1} lines ${b.start+1}-${b.end+1} len=${b.body.length} ---`));
