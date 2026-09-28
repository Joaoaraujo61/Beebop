import fs from 'node:fs';
import { parseTop, normBody } from './dedupe-lib.mjs';
import { selKey } from './dedupe-lib2.mjs';
const raw = fs.readFileSync('css/components.css','utf8');
const items = parseTop(raw);
const kfs = items.filter(i=>i.type==='at' && /keyframes/i.test(selKey(i.header)));
console.log('kf blocks='+kfs.length);
kfs.forEach((k,i)=>{
  console.log(`#${i+1} selKey=${JSON.stringify(selKey(k.header))} bodyNorm=${JSON.stringify(normBody(k.body))} headerRaw=${JSON.stringify(k.header.slice(-120))}`);
});
