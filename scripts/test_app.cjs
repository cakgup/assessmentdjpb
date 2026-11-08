// Run with node --test scripts/test_app.cjs. No dependencies or browser data used.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const dataContext={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/questions.js'),'utf8'),dataContext);
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/learning.js'),'utf8'),dataContext);
const bank=dataContext.window.DJPB_QUESTION_BANK;
const storeKey=`djpb-study-progress-${bank.progressVersion || bank.version}`;

function launch(storage=new Map(),hash=''){
  let html='',nodes=[];
  const listeners={};
  const basic=()=>({dataset:{},classList:{add(){},remove(){},toggle(){}},setAttribute(k,v){this[k]=v;},getAttribute(k){return this[k];},removeAttribute(k){delete this[k];},scrollIntoView(){},addEventListener(event,fn){this[`on${event}`]=fn;},focus(){},tagName:'BUTTON'});
  const app={...basic(),tagName:'MAIN'};
  const fixed={app,toast:{...basic()},themeToggle:basic()};
  Object.defineProperty(app,'innerHTML',{get:()=>html,set(value){
    html=value;
    nodes=[...value.matchAll(/<(button|input|article|section|div|select|span|p|textarea|details)\b([^>]*)>/g)].map(m=>{
      const el={...basic(),tagName:m[1].toUpperCase()};
      for(const a of m[2].matchAll(/([\w-]+)="([^"]*)"/g)){
        if(a[1].startsWith('data-'))el.dataset[a[1].slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=a[2];else el[a[1]]=a[2];
      }
      return el;
    });
  }});
  const matches=(el,selector)=>{
    if(selector==='#app details')return el.tagName==='DETAILS';
    const attr=selector.match(/^\[data-([\w-]+)(?:="([^"]*)")?\]$/);
    if(attr){const key=attr[1].replace(/-([a-z])/g,(_,c)=>c.toUpperCase());return key in el.dataset && (attr[2]===undefined || el.dataset[key]===attr[2]);}
    return selector.startsWith('.') && (el.class||'').split(' ').includes(selector.slice(1));
  };
  const document={documentElement:{dataset:{}},activeElement:app,
    getElementById:id=>fixed[id] || nodes.find(n=>n.id===id),
    querySelectorAll:selector=>nodes.filter(n=>matches(n,selector)),
    querySelector:selector=>nodes.find(n=>matches(n,selector))};
  // packageGrid is a nested target; only its card event binding needs emulation.
  const grid={...basic(),querySelectorAll:()=>[]};
  const originalGet=document.getElementById;
  document.getElementById=id=>id==='packageGrid'?grid:originalGet(id);
  const location={};let currentHash=hash;
  Object.defineProperty(location,'hash',{get:()=>currentHash,set(v){currentHash=v;listeners.hashchange?.();}});
  const window={DJPB_QUESTION_BANK:bank,DJPB_LEARNING:dataContext.window.DJPB_LEARNING,scrollY:0,addEventListener:(event,fn)=>listeners[event]=fn,
    scrollTo:({top})=>window.scrollY=top};
  let historyIndex=0;const historyEntries=[{state:null,hash}];
  const history={scrollRestoration:'auto',get state(){return historyEntries[historyIndex].state;},
    replaceState(state,b,h){currentHash=h;historyEntries[historyIndex]={state,hash:h};},
    pushState(state,b,h){historyEntries.splice(historyIndex+1);historyEntries.push({state,hash:h});historyIndex++;currentHash=h;},
    back(){if(historyIndex){historyIndex--;currentHash=historyEntries[historyIndex].hash;listeners.popstate?.();}},
    forward(){if(historyIndex<historyEntries.length-1){historyIndex++;currentHash=historyEntries[historyIndex].hash;listeners.popstate?.();}}};
  const context={window,document,location,history,
    localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},
    matchMedia:()=>({matches:false}),setTimeout:()=>0,clearTimeout(){},confirm:()=>true};
  vm.runInNewContext(fs.readFileSync(path.join(root,'assets/oral-data.js'),'utf8'),context);
  vm.runInNewContext(fs.readFileSync(path.join(root,'assets/oral.js'),'utf8'),context);
  vm.runInNewContext(fs.readFileSync(path.join(root,'assets/app.js'),'utf8'),context);
  return {storage,window,location,document,history,
    reference(hash){app.onclick({button:0,preventDefault(){},target:{closest:()=>({getAttribute:()=>hash})}});},
    scroll(top){window.scrollY=top;listeners.scroll?.();},
    get html(){return html;},get gridHTML(){return grid.innerHTML;},filter(value){nodes.find(n=>n.dataset.filter===value).onclick();},search(value){document.getElementById('homeSearch').oninput({target:{value}});},click(id){assert.ok(document.getElementById(id)?.onclick,id);document.getElementById(id).onclick();},
    answer(key){document.querySelector(`[data-answer="${key}"]`).onclick();},
    saved:()=>JSON.parse(storage.get(storeKey)),
    startQuiz(){document.getElementById('quizCount').value='10';document.getElementById('shuffleOpt').checked=false;this.click('startQuiz');}};
}

test('oral guide includes every section, searches full content, and handles no results',()=>{
  const a=launch(new Map(),'#/ujian');
  assert.match(a.html,/Ujian di hadapan Eselon II/);
  assert.equal(a.window.DJPB_ORAL_DATA.sections.length,8);
  assert.equal(a.window.DJPB_ORAL_DATA.questions.length,30);
  assert.equal(a.window.DJPB_ORAL_DATA.checklist.length,21);
  const search=a.document.getElementById('oralSearch');
  search.oninput({target:{value:'M7.5'}});
  assert.match(a.document.getElementById('oralSections').innerHTML,/#\/ujian\/materials\/7/);
  search.oninput({target:{value:'zzzz-no-match'}});
  assert.match(a.document.getElementById('oralSections').innerHTML,/Tidak ada materi/);
});

test('legacy oral links redirect to ujian while preserving the selected material',()=>{
  const a=launch(new Map(),'#/oral/materials/3');
  assert.equal(a.location.hash,'#/ujian/materials/3');
  assert.match(a.html,/DELAPAN RULE/);
});

test('recovery home bypasses automatic resume without deleting saved progress',()=>{
  const saved={answers:{p1q2:{selected:'D',correct:true,ts:1}},bookmarks:{p1q2:true},lastLocation:'#/study/1/2'};
  const storage=new Map([[storeKey,JSON.stringify(saved)]]);
  const a=launch(storage,'#/home');
  assert.equal(a.location.hash,'#/home');
  assert.match(a.html,/TREASURY QUEST/);
  assert.equal(a.saved().answers.p1q2.selected,'D');
  assert.equal(a.saved().bookmarks.p1q2,true);
});

test('oral reading and checklist progress persist without changing assessment answers',()=>{
  const storage=new Map();const a=launch(storage,'#/ujian/materials/3');
  assert.match(a.html,/DELAPAN RULE/);
  assert.match(a.html,/<table>/);
  a.document.getElementById('oralRead').onchange({target:{checked:true}});
  a.location.hash='#/ujian/checklist';
  const check=a.document.querySelector('[data-oral-check="0"]');check.checked=true;check.onchange();
  assert.equal(a.saved().ujianV3.read[3],true);
  assert.equal(a.saved().ujianV3.checks[0],true);
  assert.deepEqual(a.saved().answers,{});
  const restored=launch(storage,'#/ujian/checklist');
  assert.match(restored.html,/1 \/ 21 butir/);
  restored.location.hash='#/ujian/materials/999';
  assert.match(restored.html,/8 modul lengkap/);
});

test('V3 practice shows case situations and probing without model answers, and persists notes',()=>{
  const a=launch(new Map(),'#/ujian/practice/20');
  assert.match(a.html,/Kasus K-20 \/ 30/);
  assert.match(a.html,/Situasi:/);
  assert.match(a.html,/Probing penguji:/);
  assert.doesNotMatch(a.html,/Lihat model jawaban|class="oral-model"/);
  assert.doesNotMatch(a.html,/<details[^>]* open/);
  a.document.getElementById('oralNotes').oninput({target:{value:'<script>alert(1)</script> keputusan saya'}});
  const restored=launch(a.storage,'#/ujian/practice/20');
  assert.match(restored.html,/&lt;script&gt;alert\(1\)&lt;\/script&gt; keputusan saya/);
  assert.equal(a.saved().ujianV3.notes[20],'<script>alert(1)</script> keputusan saya');
  a.location.hash='#/ujian/practice/999';
  assert.match(a.html,/Kasus K-01 \/ 30/);
  a.click('oralRandom');
  assert.notEqual(a.location.hash,'#/ujian/practice/1');
});

test('editorial update preserves the previous progress namespace and answers',()=>{
  assert.equal(storeKey,'djpb-study-progress-case-analitis-4be2f51c00e6242a');
  const storage=new Map([[storeKey,JSON.stringify({answers:{p1q2:{selected:'D',correct:true,ts:1}},bookmarks:{p1q2:true}})]]);
  const app=launch(storage);
  assert.equal(app.location.hash,'#/study/1/2');
  assert.match(app.html,/Jawaban benar/);
  assert.equal(app.saved().bookmarks.p1q2,true);
});

test('HTML source preserves 27 process cards, V4 answers, references and valid cross-topic links',()=>{
  const a=launch(new Map(),'#/ujian/materials/2');
  const data=a.window.DJPB_ORAL_DATA;
  assert.equal(data.version,'materi-html-v4');
  assert.equal((data.sections[2].html.match(/<h2 id="proses-kppn-pb-\d+/g)||[]).length,27);
  assert.equal((data.sections[2].html.match(/<h3 id="proses-kppn-cm-\d+/g)||[]).length,24);
  assert.equal((data.sections[4].html.match(/class="case-answer"/g)||[]).length,30);
  assert.match(data.sections[4].html,/JAWABAN LENGKAP \(V4\)/);
  assert.match(data.sections[7].html,/REFERENSI, PEMBATASAN/);
  for(const section of data.sections){
    assert.doesNotMatch(section.html,/<script|file:\/\/\/|src="\.\//);
    for(const link of section.html.matchAll(/href="#\/ujian\/materials\/(\d+)\/([^"]+)"/g)){
      assert.ok(data.sections[Number(link[1])].html.includes(`id="${link[2]}"`),link[2]);
    }
  }
  a.location.hash='#/ujian/materials/4/bank-v4-k-01--halaman-iii-dipa-menyimpang-satker-meminta-revisi-angka';
  assert.match(a.html,/Buka kunci jawaban dan pembahasan/);
});

test('every exam module and case opens, saves independently, and restores on revisit',()=>{
  const a=launch(new Map(),'#/ujian');
  for(let id=0;id<8;id++){
    a.location.hash=`#/ujian/materials/${id}`;
    assert.match(a.html,new RegExp(`Modul ${id} · ${id+1} dari 8`));
    a.document.getElementById('oralRead').onchange({target:{checked:true}});
  }
  for(let id=1;id<=30;id++){
    a.location.hash=`#/ujian/practice/${id}`;
    assert.match(a.html,new RegExp(`Kasus K-${String(id).padStart(2,'0')} / 30`));
    a.document.getElementById('oralNotes').oninput({target:{value:`Catatan khusus kasus ${id}`}});
    a.click('oralRandom');
    assert.notEqual(a.location.hash,`#/ujian/practice/${id}`);
  }
  const reopened=launch(a.storage,'#/ujian/practice/30');
  assert.match(reopened.html,/Catatan khusus kasus 30/);
  assert.equal(Object.keys(reopened.saved().ujianV3.read).length,8);
  assert.equal(Object.keys(reopened.saved().ujianV3.notes).length,30);
  reopened.location.hash='#/ujian/checklist';
  for(const el of reopened.document.querySelectorAll('[data-oral-check]')){el.checked=true;el.onchange();}
  assert.equal(reopened.document.getElementById('oralCheckCount').textContent,'21 / 21 butir dikuasai');
  const first=reopened.document.querySelector('[data-oral-check="0"]');first.checked=false;first.onchange();
  assert.equal(reopened.document.getElementById('oralCheckCount').textContent,'20 / 21 butir dikuasai');
});

test('process index codes link to the matching local cases, not similarly numbered in-basket modules',()=>{
  const a=launch(new Map(),'#/ujian/materials/2');
  const html=a.window.DJPB_ORAL_DATA.sections[2].html;
  const table=html.slice(html.indexOf('id="proses-kppn-4a-'),html.indexOf('id="proses-kppn-4b-'));
  const refs=[...table.matchAll(/class="case-reference" href="#\/ujian\/materials\/(\d+)\/([^"]+)"[^>]*>([^<]+)<\/a>/g)];
  assert.ok(refs.length>=54);
  for(const ref of refs){
    assert.equal(ref[1],'2');
    assert.ok(ref[2].startsWith('proses-kppn-'+ref[3].toLowerCase()+'--'));
    assert.ok(html.includes(`id="${ref[2]}"`));
  }
  assert.match(table,/bukan kode resmi DJPb, SPAN, atau MyIntress/);
  const supplier=table.match(/<tr>\s*<td>[\s\S]*?>PB-03<\/a>[\s\S]*?<\/tr>/)?.[0];
  assert.ok(supplier?.includes('>CM-09</a>'));
  assert.ok(supplier?.includes('>CM-11</a>'));
  const payroll=refs.find(r=>r[3]==='IB-01');
  assert.ok(payroll[2].includes('pukul-0815-span-lambat'));
});

test('reading return and browser history restore scroll and open dropdowns for each visit',()=>{
  const a=launch(new Map(),'#/ujian/materials/2');
  assert.doesNotMatch(a.html,/id="examBack"/);
  a.document.querySelectorAll('#app details')[3].open=true;
  a.scroll(1450);
  a.reference('#/ujian/materials/2/proses-kppn-cm-11--retur');
  assert.match(a.html,/id="examBack"/);
  a.scroll(3200);
  a.reference('#/ujian/materials/5');
  a.scroll(610);
  a.click('examBack');
  assert.equal(a.window.scrollY,3200);
  a.history.back();
  assert.equal(a.location.hash,'#/ujian/materials/2');
  assert.equal(a.window.scrollY,1450);
  assert.equal(a.document.querySelectorAll('#app details')[3].open,true);
  assert.doesNotMatch(a.html,/id="examBack"/);
  a.history.forward();
  assert.equal(a.window.scrollY,3200);
});

test('all learning-code mentions outside headings and code blocks are linked with valid contextual targets',()=>{
  const a=launch(new Map(),'#/ujian');const data=a.window.DJPB_ORAL_DATA;
  for(const part of [...data.sections,...data.questions,...data.checklist.map(html=>({html}))]){
    const body=part.html.replace(/<h([1-6])\b[^>]*>[\s\S]*?<\/h\1>/g,'').replace(/<pre\b[^>]*>[\s\S]*?<\/pre>/g,'');
    assert.doesNotMatch(body,/<a\b[^>]*>(?:(?!<\/a>)[\s\S])*<a\b/,'Nested links');
    const unlinked=body.replace(/<a\b[^>]*>[\s\S]*?<\/a>/g,'').replace(/<[^>]*>/g,'');
    assert.doesNotMatch(unlinked,/\b(?:(?:PB|CM|KD|IB|FA|K)-\d{2}|M[0-7](?:\.\d+)?)\b/);
    for(const m of body.matchAll(/href="#\/ujian\/materials\/(\d+)\/([^"]+)"/g))assert.ok(data.sections[Number(m[1])].html.includes(`id="${m[2]}"`));
  }
  assert.match(data.sections[2].html,/href="#\/ujian\/materials\/2\/proses-kppn-ib-01/);
  assert.match(data.sections[7].html,/href="#\/ujian\/materials\/5\/topik-73/);
  assert.match(data.sections[7].html,/href="#\/ujian\/materials\/2\/proses-kppn-2-/);
  assert.match(a.html,/href="#\/ujian\/materials\/0\/topik-5">M0<\/a>/);
});

test('partial or malformed exam progress cannot break the menu',()=>{
  for(const value of [null,[],true,{read:null,checks:'invalid',notes:[]}]){
    const storage=new Map([[storeKey,JSON.stringify({ujianV3:value,answers:{},bookmarks:{}})]]);
    const a=launch(storage,'#/ujian/practice/1');
    assert.match(a.html,/Kasus K-01/);
    a.document.getElementById('oralNotes').oninput({target:{value:'Catatan baru'}});
    assert.equal(a.saved().ujianV3.notes[1],'Catatan baru');
    a.location.hash='#/ujian/tidak-ada';
    assert.match(a.html,/8 modul lengkap/);
  }
});

test('V3 keeps V2 notes separate and supports module zero and the last case',()=>{
  const legacy={read:{3:true},checks:{0:true},notes:{1:'Jawaban untuk pertanyaan V2'}};
  const storage=new Map([[storeKey,JSON.stringify({oral:legacy,answers:{},bookmarks:{}})]]);
  const a=launch(storage,'#/ujian/materials/0');
  assert.match(a.html,/RESUME RINGKAS MAKALAH/);
  assert.doesNotMatch(a.html,/Modul sebelumnya/);
  a.document.getElementById('oralRead').onchange({target:{checked:true}});
  assert.deepEqual(a.saved().oral,legacy);
  assert.equal(a.saved().ujianV3.read[0],true);
  a.location.hash='#/ujian/practice/1';
  assert.doesNotMatch(a.html,/Jawaban untuk pertanyaan V2/);
  a.location.hash='#/ujian/practice/30';
  assert.match(a.html,/Kasus K-30 \/ 30/);
  assert.match(a.html,/Konflik tim/);
  assert.match(a.html,/#\/ujian\/practice\/1/);
  assert.doesNotMatch(a.html,/Lembar penilaian|Kunci pembahasan/);
  const data=a.window.DJPB_ORAL_DATA;
  assert.deepEqual(Array.from(data.sections,s=>s.id),[0,1,2,3,4,5,6,7]);
  for(const q of data.questions){
    assert.match(q.html,/Situasi:/);
    assert.match(q.html,/Probing penguji:/);
    assert.doesNotMatch(q.html,/Jawaban saya|Jawaban kandidat|Keputusan Administrator/);
  }
});

test('next scrolls to top and a new visit restores even an unanswered position',()=>{
  const app=launch(new Map(),'#/study/2/8');app.window.scrollY=900;app.click('nextBtn');
  assert.equal(app.window.scrollY,0);
  assert.equal(app.location.hash,'#/study/2/9');
  const reopened=launch(app.storage);
  assert.equal(reopened.location.hash,'#/study/2/9');
  reopened.click('homeBtn');assert.match(reopened.html,/Lanjutkan belajar/);
  reopened.click('continueBtn');assert.equal(reopened.location.hash,'#/study/2/9');
});

test('last study question opens results with correct, wrong, and unanswered totals',()=>{
  const storage=new Map([[storeKey,JSON.stringify({answers:{p1q1:{selected:'A',correct:true},p1q2:{selected:'A',correct:false}},bookmarks:{}})]]);
  const app=launch(storage,'#/study/1/40');
  assert.match(app.html,/Selesai & Lihat Hasil/);app.click('nextBtn');
  assert.equal(app.location.hash,'#/results/1');
  assert.match(app.html,/Nilai 3/);
  assert.match(app.html,/<strong>38<\/strong><span>Belum dijawab/);
  assert.match(app.html,/<strong>1<\/strong><span>Salah/);
  assert.match(launch(storage).html,/Hasil Belajar Paket 1/);
  app.click('completeBtn');assert.equal(app.location.hash,'#/study/1/3');
});

test('try out answers, order, position, and results survive closing and reopening',()=>{
  const app=launch(new Map(),'#/quiz/1');app.startQuiz();app.answer('A');app.click('nextQ');
  app.window.scrollY=800;app.click('nextQ');assert.equal(app.window.scrollY,0);
  let reopened=launch(app.storage);
  assert.equal(reopened.location.hash,'#/quiz/1');
  assert.match(reopened.html,/3\/10/);
  assert.equal(reopened.saved().quiz.answers.p1q1,'A');
  assert.deepEqual(reopened.saved().quiz.questions,app.saved().quiz.questions);
  reopened.click('exitQuiz');reopened.click('continueBtn');assert.match(reopened.html,/3\/10/);
  for(let i=2;i<9;i++)reopened.click('nextQ');
  reopened.click('finishQuiz');
  assert.equal(reopened.saved().quiz,null);
  assert.match(reopened.html,/Nilai 10/);
  assert.match(launch(app.storage).html,/Hasil Try Out/);
  reopened.click('retryBtn');
  assert.equal(reopened.location.hash,'#/quiz/1');
  assert.match(launch(app.storage).html,/1\/10/);
});

test('all questions have concise stems, valid keys, and no generic case wrappers',()=>{
  assert.equal(bank.packages.length,9);
  for(const pkg of bank.packages){
    assert.equal(pkg.questions.length,40);
    for(const q of pkg.questions){
      assert.ok(q.question.endsWith('?'),q.id);
      assert.doesNotMatch(q.question,/Fakta\/isu|Pilih opsi|Pimpinan meminta|second opinion|^Kasus:/);
      assert.equal(q.options.find(o=>o.key===q.answer).text,q.answerText,q.id);
    }
  }
});

test('all nine packages contain ten unique leadership questions with explanations for every option',()=>{
  const seen=new Set();
  assert.equal(bank.packages.flatMap(p=>p.questions).length,360);
  for(const pkg of bank.packages){
    const extra=pkg.questions.slice(30);
    assert.deepEqual(Array.from(extra,q=>q.number),[31,32,33,34,35,36,37,38,39,40]);
    const keys={A:0,B:0,C:0,D:0};
    for(const q of extra){
      assert.equal(q.kind,'leadership-case');
      assert.ok(q.caseRef);
      assert.ok(!seen.has(q.question),q.id);seen.add(q.question);
      assert.equal(new Set(q.options.map(o=>o.text)).size,4);
      for(const key of 'ABCD')assert.ok(q.explanation.includes(`${key}. `),q.id);
      keys[q.answer]++;
    }
    assert.ok(Object.values(keys).every(n=>n>=2&&n<=3));
  }
});

test('leadership shortcut, answer feedback and package continuation include appended questions',()=>{
  for(let id=1;id<=9;id++){
    const a=launch(new Map(),`#/study/${id}/30`);
    a.click('nextBtn');assert.equal(a.location.hash,`#/study/${id}/31`);
    assert.match(a.html,/STUDI KASUS/);
    const q=bank.packages[id-1].questions[30];a.answer(q.answer);
    assert.match(a.html,/Bedah opsi dan jebakan/);
    assert.equal(a.saved().answers[q.id].correct,true);
    a.location.hash=`#/study/${id}/1`;a.click('leadershipStart');
    assert.equal(a.location.hash,`#/study/${id}/31`);
  }
});


test('package filters combine mastery, completion, and topic search',()=>{
  const answers={};
  for(const q of bank.packages[1].questions)answers[q.id]={selected:q.answer,correct:true};
  answers.p1q1={selected:'B',correct:false};
  const app=launch(new Map([[storeKey,JSON.stringify({answers,bookmarks:{}})]]),'#/learn');
  app.filter('mastered');assert.match(app.gridHTML,/PNBP & Treasury/);assert.doesNotMatch(app.gridHTML,/Fundamental/);
  app.filter('review');assert.match(app.gridHTML,/Fundamental/);assert.doesNotMatch(app.gridHTML,/data-pkg="2"/);
  app.search('zznonexistent');assert.match(app.gridHTML,/Belum ada paket yang cocok/);
  app.search('');app.filter('unfinished');assert.doesNotMatch(app.gridHTML,/data-pkg="2"/);
  app.filter('all');assert.equal((app.gridHTML.match(/data-pkg=/g)||[]).length,9);
});

test('daily activity uses local dates, earns XP once, and retains completed correct awards',()=>{
  const L=dataContext.window.DJPB_LEARNING;
  const p={answers:{},practice:{days:{},seen:{}}};
  const yesterday=new Date(2026,8,7,23,55),today=new Date(2026,8,8,0,5);
  L.record(p,'p1q1',false,yesterday);L.record(p,'p1q1',true,yesterday);L.record(p,'p1q1',false,yesterday);
  assert.equal(L.summary(p,yesterday).xp,15);assert.equal(L.summary(p,yesterday).daily,1);
  L.record(p,'p1q2',false,today);
  const stats=L.summary(p,today);assert.equal(stats.daily,1);assert.equal(stats.streak,2);assert.equal(stats.xp,25);
  assert.equal(L.summary(p,new Date(2026,8,10)).streak,0);
  L.award(p,'p1q1',true);assert.equal(L.summary(p,today).daily,1);
});

test('existing answers migrate once without inventing new activity on later quiz completion',()=>{
  const L=dataContext.window.DJPB_LEARNING;
  const p={answers:{p1q1:{correct:true,ts:new Date(2026,8,7,10).getTime()}}};
  p.practice=L.migrate(p,bank.packages);
  assert.equal(L.summary(p,new Date(2026,8,7,12)).daily,1);
  p.answers.p1q1.ts=new Date(2026,8,8,12).getTime();p.practice=L.migrate(p,bank.packages);
  assert.equal(L.summary(p,new Date(2026,8,8,12)).daily,0);
  assert.equal(L.summary(p,new Date(2026,8,8,12)).xp,15);
  assert.equal(L.status(1,1,30).id,'ongoing');assert.equal(L.status(30,29,30).id,'mastered');
  assert.equal(L.status(30,20,30).id,'review');assert.equal(L.status(0,0,30).id,'new');
});
