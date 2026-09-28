import fs from 'node:fs';
export function parseTop(css){
  const items=[];
  let i=0, n=css.length, buf='';
  const pushBuf=()=>{
    if(buf.trim()!==''){ items.push({type:'trivia', text:buf}); }
    buf='';
  };
  while(i<n){
    if(css[i]==='/' && css[i+1]==='*'){
      const end=css.indexOf('*/',i+2);
      const cend=end===-1?n:end+2;
      buf+=css.slice(i,cend); i=cend; continue;
    }
    if(css[i]==='{'){
      const header=buf.trim();
      let depth=1, j=i+1;
      while(j<n && depth>0){
        if(css[j]==='/' && css[j+1]==='*'){
          const e=css.indexOf('*/',j+2); j=(e===-1?n:e+2); continue;
        }
        if(css[j]==='{') depth++;
        else if(css[j]==='}') depth--;
        j++;
      }
      const body=css.slice(i+1,j-1);
      const full=buf+css.slice(i,j);
      const bare=buf.replace(/\/\*[\s\S]*?\*\//g,'').trim();
      if(bare.startsWith('@')) items.push({type:'at', header, body, full});
      else items.push({type:'rule', header, body, full});
      buf=''; i=j; continue;
    }
    if(css[i]===';'){
      buf+=css[i]; i++;
      if(/^@/.test(buf.trim())){
        items.push({type:'atline', header:buf.trim(), body:null, full:buf});
        buf='';
      }
      continue;
    }
    buf+=css[i]; i++;
  }
  pushBuf();
  return items;
}
export function normBody(s){
  return s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\s+/g,' ').trim();
}
export function normSel(s){
  return s.replace(/\/\*[\s\S]*?\*\//g,' ').replace(/\s+/g,' ').trim();
}
