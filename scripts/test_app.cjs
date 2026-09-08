// Run with node --test scripts/test_app.cjs. No dependencies or browser data used.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const dataContext={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/questions.js'),'utf8'),dataContext);
const bank=dataContext.window.DJPB_QUESTION_BANK;
const storeKey=`djpb-study-progress-${bank.progressVersion || bank.version}`;

function launch(storage=new Map(),hash=''){
  let html='',nodes=[];
  const listeners={};
  const basic=()=>({dataset:{},classList:{add(){},remove(){}},addEventListener(event,fn){this[`on${event}`]=fn;},focus(){},tagName:'BUTTON'});
  const app={...basic(),tagName:'MAIN'};
  const fixed={app,toast:{...basic()},themeToggle:basic()};
  Object.defineProperty(app,'innerHTML',{get:()=>html,set(value){
    html=value;
    nodes=[...value.matchAll(/<(button|input|article|section|div|select)\b([^>]*)>/g)].map(m=>{
      const el={...basic(),tagName:m[1].toUpperCase()};
      for(const a of m[2].matchAll(/([\w-]+)="([^"]*)"/g)){
        if(a[1].startsWith('data-'))el.dataset[a[1].slice(5)]=a[2];else el[a[1]]=a[2];
      }
      return el;
    });
  }});
  const matches=(el,selector)=>{
    const attr=selector.match(/^\[data-([\w-]+)(?:="([^"]*)")?\]$/);
    if(attr)return attr[1] in el.dataset && (attr[2]===undefined || el.dataset[attr[1]]===attr[2]);
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
  const window={DJPB_QUESTION_BANK:bank,scrollY:0,addEventListener:(event,fn)=>listeners[event]=fn,
    scrollTo:({top})=>window.scrollY=top};
  const context={window,document,location,history:{scrollRestoration:'auto',replaceState(a,b,h){currentHash=h;},back(){}},
    localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},
    matchMedia:()=>({matches:false}),setTimeout:()=>0,clearTimeout(){},confirm:()=>true};
  vm.runInNewContext(fs.readFileSync(path.join(root,'assets/app.js'),'utf8'),context);
  return {storage,window,location,get html(){return html;},click(id){assert.ok(document.getElementById(id)?.onclick,id);document.getElementById(id).onclick();},
    answer(key){document.querySelector(`[data-answer="${key}"]`).onclick();},
    saved:()=>JSON.parse(storage.get(storeKey)),
    startQuiz(){document.getElementById('quizCount').value='10';document.getElementById('shuffleOpt').checked=false;this.click('startQuiz');}};
}

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
