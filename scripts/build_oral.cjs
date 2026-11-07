// Import the study chapters, not the source page navigation or scripts.
// Optional source: node scripts/build_oral.cjs "C:/path/to/materi.html"
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const snapshot=path.join(root,'source/materi.html');
if(process.argv[2])fs.copyFileSync(path.resolve(process.argv[2]),snapshot);
const source=fs.readFileSync(snapshot,'utf8');
const decode=s=>s.replace(/&#(x[0-9a-f]+|\d+);/gi,(_,n)=>String.fromCodePoint(n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):Number(n))).replace(/&(amp|lt|gt|quot|apos|nbsp);/g,(_,n)=>({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '}[n]));
const plain=s=>decode(s.replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim();
const chapters=[];
for(const match of source.matchAll(/<section\b[^>]*class="chapter\b[^"]*"[^>]*data-index="(\d+)"[^>]*>/g)){
  const start=match.index+match[0].length;let depth=1,end=-1;
  const tags=/<\/?section\b[^>]*>/g;tags.lastIndex=start;let t;
  while((t=tags.exec(source))){depth+=t[0].startsWith('</')?-1:1;if(depth===0){end=t.index;break;}}
  if(end<0)throw Error('Unclosed chapter '+match[1]);
  const html=source.slice(start,end);
  // Fail closed if future source edits introduce executable markup.
  if(/<(script|iframe|object|embed|style|link|base)\b|\son\w+\s*=|(?:href|src)\s*=\s*["']\s*(?:javascript|data|file):/i.test(html))throw Error('Unsupported active content in chapter '+match[1]);
  chapters[Number(match[1])]=html;
}
if(chapters.length!==11||chapters.some(c=>!c))throw Error('Expected all 11 source chapters');
const sections=chapters.slice(2,10).map((html,id)=>({id,title:plain(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || ''),html}));
sections[0].html+=chapters[0]+chapters[1];
sections[2].title='PROSES BISNIS KPPN — FONDASI DAN 27 PROSES BISNIS';
sections[7].html+=chapters[10];
const targets=new Map();
for(const s of sections)for(const m of s.html.matchAll(/\bid="([^"]+)"/g)){
  if(targets.has(m[1]))throw Error('Duplicate content ID: '+m[1]);
  targets.set(m[1],{section:s.id,id:m[1]});
}
// The source uses short case links alongside the newer V4 heading identifiers.
for(const [id,target] of targets){const m=id.match(/^bank-v4-(k-\d+)--/);if(m)targets.set(m[1],target);}
for(const s of sections){
  s.html=s.html.replace(/href="#([^"]+)"/g,(_,anchor)=>{
    const target=targets.get(anchor);if(!target)throw Error('Unresolved source anchor: '+anchor);
    return `href="#/ujian/materials/${target.section}/${target.id}"`;
  }).replace(/<table\b[^>]*>/g,'<div class="oral-table" tabindex="0" role="region" aria-label="Tabel materi"><table>').replace(/<\/table>/g,'</table></div>');
  s.text=plain(s.html);
}
const caseMatches=[...sections[4].html.matchAll(/<h3\b[^>]*>(K-(\d+)\s*—\s*([\s\S]*?))<\/h3>/g)];
const questions=caseMatches.map((m,i)=>{
  const body=sections[4].html.slice(m.index+m[0].length,caseMatches[i+1]?.index ?? sections[4].html.length);
  const html=body.split('<details')[0].trim();
  if(!html.includes('Situasi:')||!html.includes('Probing penguji:'))throw Error('Incomplete practice prompt '+m[2]);
  return {id:Number(m[2]),title:plain(m[3]),html};
});
const checklist=[...sections[7].html.matchAll(/<li>\s*<input\b[^>]*type="checkbox"[^>]*>\s*([\s\S]*?)<\/li>/g)].map(m=>m[1]);
if(questions.length!==30||questions.some((q,i)=>q.id!==i+1)||checklist.length!==21)throw Error('Unexpected case/checklist counts');
const data={version:'materi-html-v4',edition:'materi.html · EWS MyIntress',sections,questions,checklist};
fs.writeFileSync(path.join(root,'assets/oral-data.js'),`// Generated from source/materi.html by scripts/build_oral.cjs.\nwindow.DJPB_ORAL_DATA = ${JSON.stringify(data)};\n`);
console.log(`Imported ${sections.length} modules, ${questions.length} cases and ${checklist.length} checklist items from materi.html.`);
