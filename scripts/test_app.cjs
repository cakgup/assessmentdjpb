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
    nodes=[...value.matchAll(/<(button|input|article|section|div|select|span|p|textarea)\b([^>]*)>/g)].map(m=>{
      const el={...basic(),tagName:m[1].toUpperCase()};
      for(const a of m[2].matchAll(/([\w-]+)="([^"]*)"/g)){
        if(a[1].startsWith('data-'))el.dataset[a[1].slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=a[2];else el[a[1]]=a[2];
      }
      return el;
    });
  }});
  const matches=(el,selector)=>{
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
  const context={window,document,location,history:{scrollRestoration:'auto',replaceState(a,b,h){currentHash=h;},back(){}},
    localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},
    matchMedia:()=>({matches:false}),setTimeout:()=>0,clearTimeout(){},confirm:()=>true};
  vm.runInNewContext(fs.readFileSync(path.join(root,'assets/oral-data.js'),'utf8'),context);
  vm.runInNewContext(fs.readFileSync(path.join(root,'assets/oral.js'),'utf8'),context);
  vm.runInNewContext(fs.readFileSync(path.join(root,'assets/app.js'),'utf8'),context);
  return {storage,window,location,document,get html(){return html;},get gridHTML(){return grid.innerHTML;},filter(value){nodes.find(n=>n.dataset.filter===value).onclick();},search(value){document.getElementById('homeSearch').oninput({target:{value}});},click(id){assert.ok(document.getElementById(id)?.onclick,id);document.getElementById(id).onclick();},
    answer(key){document.querySelector(`[data-answer="${key}"]`).onclick();},
    saved:()=>JSON.parse(storage.get(storeKey)),
    startQuiz(){document.getElementById('quizCount').value='10';document.getElementById('shuffleOpt').checked=false;this.click('startQuiz');}};
}

test('oral guide includes every section, searches full content, and handles no results',()=>{
  const a=launch(new Map(),'#/ujian');
  assert.match(a.html,/Ujian di hadapan Eselon II/);
  assert.equal(a.window.DJPB_ORAL_DATA.sections.length,33);
  assert.equal(a.window.DJPB_ORAL_DATA.questions.length,20);
  assert.equal(a.window.DJPB_ORAL_DATA.checklist.length,21);
  const search=a.document.getElementById('oralSearch');
  search.oninput({target:{value:'DATA_UNAVAILABLE'}});
  assert.match(a.document.getElementById('oralSections').innerHTML,/#\/ujian\/materials\/33/);
  search.oninput({target:{value:'zzzz-no-match'}});
  assert.match(a.document.getElementById('oralSections').innerHTML,/Tidak ada materi/);
});

test('legacy oral links redirect to ujian while preserving the selected material',()=>{
  const a=launch(new Map(),'#/oral/materials/29');
  assert.equal(a.location.hash,'#/ujian/materials/29');
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
  const storage=new Map();const a=launch(storage,'#/ujian/materials/29');
  assert.match(a.html,/DELAPAN RULE/);
  assert.match(a.html,/<table>/);
  a.document.getElementById('oralRead').onchange({target:{checked:true}});
  a.location.hash='#/ujian/checklist';
  const check=a.document.querySelector('[data-oral-check="0"]');check.checked=true;check.onchange();
  assert.equal(a.saved().oral.read[29],true);
  assert.equal(a.saved().oral.checks[0],true);
  assert.deepEqual(a.saved().answers,{});
  const restored=launch(storage,'#/ujian/checklist');
  assert.match(restored.html,/1 \/ 21 butir/);
  restored.location.hash='#/ujian/materials/999';
  assert.match(restored.html,/33 bagian lengkap/);
});

test('oral practice offers all questions, concealed models and persisted escaped notes',()=>{
  const a=launch(new Map(),'#/ujian/practice/20');
  assert.match(a.html,/Pertanyaan 20 \/ 20/);
  assert.match(a.html,/<details class="oral-model">/);
  assert.doesNotMatch(a.html,/<details[^>]* open/);
  a.document.getElementById('oralNotes').oninput({target:{value:'<script>alert(1)</script> keputusan saya'}});
  const restored=launch(a.storage,'#/ujian/practice/20');
  assert.match(restored.html,/&lt;script&gt;alert\(1\)&lt;\/script&gt; keputusan saya/);
  assert.equal(a.saved().oral.notes[20],'<script>alert(1)</script> keputusan saya');
  a.location.hash='#/ujian/practice/999';
  assert.match(a.html,/Pertanyaan 1 \/ 20/);
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
  const app=launch(storage,'#/study/1/30');
  assert.match(app.html,/Selesai & Lihat Hasil/);app.click('nextBtn');
  assert.equal(app.location.hash,'#/results/1');
  assert.match(app.html,/Nilai 3/);
  assert.match(app.html,/<strong>28<\/strong><span>Belum dijawab/);
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
    assert.equal(pkg.questions.length,30);
    for(const q of pkg.questions){
      assert.ok(q.question.endsWith('?'),q.id);
      assert.doesNotMatch(q.question,/Fakta\/isu|Pilih opsi|Pimpinan meminta|second opinion|^Kasus:/);
      assert.equal(q.options.find(o=>o.key===q.answer).text,q.answerText,q.id);
    }
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
