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
// Keep published deep links stable when the source renumbers its topik-* headings.
const stableAnchors=JSON.parse(fs.readFileSync(path.join(root,'source/materi-anchors.json'),'utf8'));
const anchorMigration=new Map();
for(const s of sections)for(const m of s.html.matchAll(/<h[1-6]\b[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h[1-6]>/g)){
  const key=s.id+'|'+plain(m[2]);
  const id=stableAnchors[key] || 'materi-'+require('node:crypto').createHash('sha256').update(key).digest('hex').slice(0,16);
  anchorMigration.set(m[1],id);
}
for(const s of sections)s.html=s.html.replace(/\b(id|href)="([^\"]+)"/g,(all,attr,value)=>{
  const original=attr==='href'&&value.startsWith('#')?value.slice(1):attr==='id'?value:null;
  return original&&anchorMigration.has(original)?`${attr}="${attr==='href'?'#':''}${anchorMigration.get(original)}"`:all;
}).replace(/class="process-code-link"/g,'class="case-reference"');
const targets=new Map();
for(const s of sections)for(const m of s.html.matchAll(/\bid="([^"]+)"/g)){
  if(targets.has(m[1]))throw Error('Duplicate content ID: '+m[1]);
  targets.set(m[1],{section:s.id,id:m[1]});
}
// The source uses short case links alongside the newer V4 heading identifiers.
for(const [id,target] of targets){const m=id.match(/^bank-v4-(k-\d+)--/);if(m)targets.set(m[1],target);}
// Process-business codes belong to this chapter; IB-01 elsewhere is a different case.
const processCodes=new Map();
for(const [id,target] of targets){
  const m=id.match(/^proses-kppn-((?:pb|cm|ib|kd)-\d{2})--/);
  if(m)processCodes.set(m[1].toUpperCase(),target);
}
sections[2].html=sections[2].html.replace(/<td\b[^>]*>[\s\S]*?<\/td>/g,cell=>{
  let insideLink=false;
  return cell.split(/(<[^>]+>)/g).map(token=>{
    if(token.startsWith('<')){if(/^<a\b/i.test(token))insideLink=true;if(/^<\/a\b/i.test(token))insideLink=false;return token;}
    if(insideLink)return token;
    return token.replace(/\b(?:PB|CM|IB|KD)-\d{2}\b/g,code=>{
      const target=processCodes.get(code);if(!target)throw Error('Unknown process reference: '+code);
      return `<a class="case-reference" href="#${target.id}" aria-label="Buka referensi belajar ${code}">${code}</a>`;
    });
  }).join('');
});
sections[2].html=sections[2].html.replace(/(<h2 id="proses-kppn-4a-[^"]*">[\s\S]*?<\/h2>)/,
  '$1<p class="reference-help">Klik kode untuk membuka proses atau kasus terkait. PB = Process Business; CM = Case Micro; IB = In-Basket; KD = Kasus Pendalaman. Kode ini merupakan referensi belajar internal, bukan kode resmi DJPb, SPAN, atau MyIntress.</p>');
const references=new Map();
function register(code,target){if(!references.has(code))references.set(code,[]);references.get(code).push(target);}
for(const s of sections){
  register(`M${s.id}`,{section:s.id,id:s.html.match(/<h[1-6]\b[^>]*id="([^"]+)"/)?.[1]});
  for(const h of s.html.matchAll(/<h[1-6]\b[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h[1-6]>/g)){
    const title=plain(h[2]);
    const code=title.match(/^(?:M\d\.\d+|(?:PB|CM|KD|IB|K)-\d{2})\b/)?.[0];
    if(code)register(code,{section:s.id,id:h[1]});
    if(s.id===3){const fa=title.match(/^M3\.\d+ (FA-\d{2})\b/);if(fa)register(fa[1],{section:s.id,id:h[1]});}
  }
}
// M2 was expanded into the process-business chapter; preserve its older topic references.
for(const [code,prefix] of Object.entries({'M2.1':'proses-kppn-2-','M2.2':'proses-kppn-11-','M2.3':'proses-kppn-pb-25--','M2.6':'proses-kppn-bagian-b--'})){
  const target=[...targets.values()].find(t=>t.id.startsWith(prefix));if(!target)throw Error('Missing migrated topic '+code);register(code,target);
}
let linked=0;
function linkReferences(html,section){
  const blocked=[];
  return html.split(/(<[^>]+>)/g).map(token=>{
    if(token.startsWith('<')){
      const tag=token.match(/^<(\/?)([a-z][a-z0-9]*)\b/i);
      if(tag && /^(a|pre|script|style|h[1-6])$/i.test(tag[2])){if(tag[1])blocked.pop();else blocked.push(tag[2]);}
      return token;
    }
    if(blocked.length)return token;
    return token.replace(/\b(?:(?:PB|CM|KD|IB|FA|K)-\d{2}|M[0-7](?:\.\d+)?)(?:\/\d{2})?\b/g,full=>{
      const [code,short]=full.split('/');
      function make(label,key){
        const candidates=references.get(key);if(!candidates)throw Error('Unresolved learning code '+key);
        const target=candidates.find(t=>t.section===section)||candidates.find(t=>key.startsWith('IB-')&&t.section===5)||candidates[0];
        linked++;
        return `<a class="case-reference" href="#${target.id}" aria-label="Buka pembahasan ${key}">${label}</a>`;
      }
      return make(code,code)+(short?'/'+make(short,code.replace(/\d{2}$/,short)):'');
    });
  }).join('');
}
for(const s of sections){
  s.html=linkReferences(s.html,s.id);
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
const referenceTargets=Object.fromEntries([...references].map(([code,items])=>[code,items.find(t=>code.startsWith('IB-')&&t.section===5)||items[0]]));
const data={version:'materi-html-v4',edition:'materi.html · EWS MyIntress',sections,questions,checklist,referenceTargets};
fs.writeFileSync(path.join(root,'assets/oral-data.js'),`// Generated from source/materi.html by scripts/build_oral.cjs.\nwindow.DJPB_ORAL_DATA = ${JSON.stringify(data)};\n`);
console.log(`Imported ${sections.length} modules, ${questions.length} cases and ${checklist.length} checklist items from materi.html.`);
console.log(`Linked ${linked} additional learning-code references across all modules.`);
