(() => {
  const DATA = window.DJPB_QUESTION_BANK;
  const app = document.getElementById('app');
  const toast = document.getElementById('toast');
  const themeToggle = document.getElementById('themeToggle');
  // Answer positions change between editions; keep each revision's progress separate.
  const STORE = `djpb-study-progress-${DATA.progressVersion || DATA.version}`;
  const THEME = 'djpb-study-theme';

  const state = {
    progress: loadProgress(),
    session: null,
    homeSearch: '',
  };

  function loadProgress(){
    try {
      const saved=JSON.parse(localStorage.getItem(STORE)) || {};
      return {...saved,answers:saved.answers || {},bookmarks:saved.bookmarks || {}};
    }
    catch { return {answers:{},bookmarks:{}}; }
  }
  function saveProgress(){
    try { localStorage.setItem(STORE, JSON.stringify(state.progress)); }
    catch { showToast('Progres tidak dapat disimpan. Periksa izin atau ruang penyimpanan browser.'); }
  }
  function showTop(){
    app.focus({preventScroll:true});
    window.scrollTo({top:0,left:0,behavior:'instant'});
  }
  function rememberLocation(hash){ state.progress.lastLocation=hash;saveProgress(); }
  function studyLocation(pkg){
    const number=state.progress.positions?.[pkg.id];
    const q=pkg.questions.find(q=>q.number===number) || pkg.questions.find(q=>!answerRec(q.id)) || pkg.questions[0];
    return `#/study/${pkg.id}/${q.number}`;
  }
  function resumeLocation(){
    const saved=state.progress.lastLocation;
    if(saved && /^#\/(study\/\d+\/\d+|quiz\/(all|\d+)|results\/(quiz|review|\d+)|review\/(wrong|bookmarks))$/.test(saved))return saved;
    // Older progress has no position; resume the most recently answered question.
    const last=allQuestions().filter(q=>answerRec(q.id)).sort((a,b)=>(answerRec(b.id).ts||0)-(answerRec(a.id).ts||0))[0];
    return last ? `#/study/${last.packageId}/${last.number}` : null;
  }
  function saveQuiz(){
    const s=state.session;
    state.progress.quiz=s ? {...s,questions:s.questions.map(q=>q.id)} : null;
    if(s)state.progress.lastLocation=`#/quiz/${s.pkgId}`;
    saveProgress();
  }
  function restoreQuiz(){
    const saved=state.progress.quiz;
    if(!saved || !Array.isArray(saved.questions) || !saved.questions.length)return null;
    const questions=saved.questions.map(getQ);
    if(questions.some(q=>!q) || !Number.isInteger(saved.index) || saved.index<0 || saved.index>=questions.length)return null;
    return {...saved,questions,answers:saved.answers || {}};
  }
  function esc(s=''){ return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function normalize(s=''){ return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); }
  function showToast(msg){ toast.textContent=msg; toast.classList.add('show'); clearTimeout(showToast.t); showToast.t=setTimeout(()=>toast.classList.remove('show'),1800); }
  function allQuestions(){ return DATA.packages.flatMap(p=>p.questions.map(q=>({...q,packageId:p.id,packageTitle:p.title}))); }
  function getPkg(id){ return DATA.packages.find(p=>p.id===Number(id)); }
  function getQ(id){ for(const p of DATA.packages){ const q=p.questions.find(x=>x.id===id); if(q) return {...q,packageId:p.id,packageTitle:p.title}; } return null; }
  function answerRec(qid){ return state.progress.answers[qid] || null; }
  function pkgStats(pkg){
    const rows=pkg.questions.map(q=>answerRec(q.id)).filter(Boolean);
    const correct=rows.filter(r=>r.correct).length;
    return {done:rows.length,correct,accuracy:rows.length?Math.round(correct/rows.length*100):0};
  }
  function overallStats(){
    const qs=allQuestions(); const rows=qs.map(q=>answerRec(q.id)).filter(Boolean); const correct=rows.filter(r=>r.correct).length;
    return {total:qs.length,done:rows.length,correct,wrong:rows.length-correct,accuracy:rows.length?Math.round(correct/rows.length*100):0,bookmarks:Object.keys(state.progress.bookmarks).filter(k=>state.progress.bookmarks[k]).length};
  }
  function setTheme(theme){ document.documentElement.dataset.theme=theme; try { localStorage.setItem(THEME,theme); } catch {} themeToggle.textContent=theme==='dark'?'☀':'◐'; }
  let savedTheme;try { savedTheme=localStorage.getItem(THEME); } catch {}
  setTheme(savedTheme || (matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'));
  themeToggle.addEventListener('click',()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'));

  function go(hash){ if(location.hash===hash)route();else location.hash=hash; }
  window.addEventListener('hashchange', route);

  function renderHome(){
    const s=overallStats(); const pct=Math.round(s.done/s.total*100);
    app.innerHTML=`
      <section class="hero">
        <div class="hero-card">
          <div class="eyebrow">Latihan mandiri DJPb</div>
          <h1>Belajar lebih fokus, ulangi yang masih salah.</h1>
          <p>270 soal dalam 9 paket. Pelajari materi, pilih jawaban, dan tinjau pembahasannya. Posisi belajar dan sesi try out tersimpan otomatis di browser ini.</p>
          <div class="hero-actions">
            <button class="primary-btn" id="continueBtn">${resumeLocation()?'Lanjutkan belajar':'Mulai belajar'}</button>
            <button class="ghost-btn" id="quizAllBtn">Try Out Acak</button>
            <button class="ghost-btn" id="reviewWrongBtn">Ulangi yang salah</button>
          </div>
        </div>
        <div class="hero-card stats-card">
          <h2 class="stats-heading">Progres belajar Anda</h2>
          <div class="stat"><strong>${s.done}/${s.total}</strong><span>Soal dikerjakan</span></div>
          <div class="stat"><strong>${s.accuracy}%</strong><span>Akurasi</span></div>
          <div class="stat"><strong>${s.wrong}</strong><span>Perlu diulang</span></div>
          <div class="stat"><strong>${s.bookmarks}</strong><span>Ditandai</span></div>
          <div class="progress-ring"><div class="bar"><i style="width:${pct}%"></i></div><div class="progress-label"><span>Progress keseluruhan</span><strong>${pct}%</strong></div></div>
        </div>
      </section>
      <div class="section-head">
        <div><h2>Pilih paket</h2><p>Belajar berurutan atau cari topik tertentu.</p></div>
        <input id="homeSearch" class="search" type="search" placeholder="Cari soal/topik…" value="${esc(state.homeSearch)}" aria-label="Cari soal">
      </div>
      <section id="packageGrid" class="package-grid"></section>
      <div class="section-head"><div><h2>Mode review</h2><p>Fokus pada soal yang perlu perhatian.</p></div></div>
      <section class="package-grid">
        <button type="button" class="package-card" data-review="wrong"><div class="package-number">Review Salah</div><h3>Ulangi semua soal yang terakhir dijawab salah.</h3><div class="mini-stats"><span>${s.wrong} soal</span></div></button>
        <button type="button" class="package-card" data-review="bookmarks"><div class="package-number">Bookmark</div><h3>Kumpulkan soal penting untuk diulang cepat.</h3><div class="mini-stats"><span>${s.bookmarks} soal</span></div></button>
        <button type="button" class="package-card" data-review="reset"><div class="package-number">Reset Progress</div><h3>Hapus progres lokal dan mulai kembali dari awal.</h3><div class="mini-stats"><span>Tidak mengubah bank soal</span></div></button>
      </section>`;

    renderPackageGrid();
    document.getElementById('homeSearch').addEventListener('input',e=>{state.homeSearch=e.target.value;renderPackageGrid();});
    document.getElementById('quizAllBtn').onclick=()=>go('#/quiz/all');
    document.getElementById('reviewWrongBtn').onclick=()=>go('#/review/wrong');
    document.getElementById('continueBtn').onclick=()=>{
      go(resumeLocation() || studyLocation(DATA.packages[0]));
    };
    document.querySelectorAll('[data-review]').forEach(el=>el.onclick=()=>{
      const kind=el.dataset.review;
      if(kind==='reset'){
        if(confirm('Hapus seluruh progres jawaban, bookmark, posisi belajar, dan sesi try out di browser ini?')){ state.progress={answers:{},bookmarks:{}};state.session=null;saveProgress();showToast('Progress direset');renderHome(); }
      } else go(`#/review/${kind}`);
    });
  }

  function renderPackageGrid(){
    const box=document.getElementById('packageGrid'); if(!box)return;
    const term=normalize(state.homeSearch.trim());
    const filtered=DATA.packages.filter(p=>!term || normalize(p.title).includes(term) || p.questions.some(q=>normalize(q.question+' '+q.explanation).includes(term)));
    if(!filtered.length){box.innerHTML='<div class="empty" style="grid-column:1/-1">Tidak ada paket atau soal yang cocok dengan pencarian.</div>';return;}
    box.innerHTML=filtered.map(p=>{const s=pkgStats(p);const pct=Math.round(s.done/p.questions.length*100);return `
      <article class="package-card" data-pkg="${p.id}" tabindex="0" role="button">
        <div class="package-top"><div class="package-number">Paket ${p.id}</div><span class="pill">${p.questions.length} soal</span></div>
        <h3>${esc(p.title)}</h3>
        <div class="mini-stats"><span>${s.done}/${p.questions.length} dikerjakan</span><span>${s.accuracy}% akurasi</span></div>
        <div class="mini-bar"><i style="width:${pct}%"></i></div>
      </article>`}).join('');
    box.querySelectorAll('[data-pkg]').forEach(el=>{const open=()=>go(studyLocation(getPkg(el.dataset.pkg)));el.onclick=open;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}}});
  }

  function renderStudy(pkgId, qnum, customQuestions=null, customTitle=null){
    const pkg=getPkg(pkgId); if(!pkg && !customQuestions){go('#/');return;}
    const questions=customQuestions || pkg.questions;
    let idx=customQuestions ? Math.max(0, Math.min(Number(qnum)-1, questions.length-1)) : questions.findIndex(q=>q.number===Number(qnum));
    if(idx<0) idx=0;
    const q=questions[idx];
    if(!customQuestions){
      state.progress.positions={...state.progress.positions,[pkg.id]:q.number};
      rememberLocation(`#/study/${pkg.id}/${q.number}`);
    }else{
      state.progress.review={...state.progress.review,index:idx};saveProgress();
    }
    const rec=answerRec(q.id);
    const isBookmarked=!!state.progress.bookmarks[q.id];
    const title=customTitle || `Paket ${pkg.id}`;
    app.innerHTML=`
      <div class="toolbar">
        <div class="crumb"><button id="homeBtn">Beranda</button><span>›</span><strong>${esc(title)}</strong></div>
        <div class="mode-tabs"><button class="active">Belajar</button><button id="quizTab">Try Out</button></div>
      </div>
      <div class="question-layout">
        <article class="question-card">
          <div class="q-meta"><span class="pill">${esc(customTitle || `Paket ${pkg.id}`)}</span><span class="q-number">Soal ${idx+1} dari ${questions.length}</span></div>
          <h1 class="q-title">${esc(q.question)}</h1>
          <div class="options">${q.options.map(o=>{
            let cls='option'; if(rec){ if(o.key===q.answer) cls+=' correct'; else if(o.key===rec.selected && !rec.correct) cls+=' wrong'; }
            return `<button class="${cls}" data-answer="${o.key}" ${rec?'disabled':''}><span class="option-key">${o.key}</span><span>${esc(o.text)}</span></button>`}).join('')}</div>
          <div id="feedback">${rec?feedbackHtml(q,rec):''}</div>
          <div class="question-actions">
            <button id="bookmarkBtn" class="ghost-btn bookmark ${isBookmarked?'active':''}">${isBookmarked?'★ Ditandai':'☆ Tandai soal'}</button>
            <div class="nav-actions">
              <button id="prevBtn" class="ghost-btn" ${idx===0?'disabled':''}>← Sebelumnya</button>
              <button id="nextBtn" class="primary-btn">${idx===questions.length-1?'Selesai & Lihat Hasil':'Berikutnya →'}</button>
            </div>
          </div>
          <div class="fab-help">Shortcut: tekan 1–4 untuk memilih jawaban, ←/→ untuk berpindah soal.</div>
        </article>
        <aside class="side-panel">
          <h3>Navigasi soal</h3>
          <div class="question-map">${questions.map((x,i)=>{const r=answerRec(x.id);let c='map-item';if(r)c+=r.correct?' done':' wrong';if(i===idx)c+=' current';return `<button class="${c}" data-i="${i}">${i+1}</button>`}).join('')}</div>
          <div class="side-row"><span>Dikerjakan</span><strong>${questions.filter(x=>answerRec(x.id)).length}/${questions.length}</strong></div>
          <div class="side-row"><span>Benar</span><strong>${questions.filter(x=>answerRec(x.id)?.correct).length}</strong></div>
        </aside>
      </div>`;
    document.getElementById('homeBtn').onclick=()=>go('#/');
    document.getElementById('quizTab').onclick=()=>go(customQuestions?'#/quiz/all':`#/quiz/${pkg.id}`);
    document.querySelectorAll('[data-answer]').forEach(btn=>btn.onclick=()=>selectAnswer(q,btn.dataset.answer,customQuestions,pkg,idx,customTitle));
    document.getElementById('bookmarkBtn').onclick=()=>{state.progress.bookmarks[q.id]=!state.progress.bookmarks[q.id];saveProgress();renderStudy(pkgId,idx+1,customQuestions,customTitle);showToast(state.progress.bookmarks[q.id]?'Soal ditandai':'Tanda dihapus');};
    const nav=(newIdx)=>{
      if(customQuestions){renderStudy(pkgId,newIdx+1,customQuestions,customTitle);showTop();}
      else go(`#/study/${pkg.id}/${questions[newIdx].number}`);
    };
    document.getElementById('prevBtn').onclick=()=>nav(idx-1);
    document.getElementById('nextBtn').onclick=()=>{
      if(idx<questions.length-1){nav(idx+1);return;}
      if(customQuestions){state.progress.reviewResult={title,questions:questions.map(q=>q.id)};state.progress.review=null;saveProgress();}
      go(customQuestions?'#/results/review':`#/results/${pkg.id}`);
    };
    document.querySelectorAll('.map-item').forEach(b=>b.onclick=()=>nav(Number(b.dataset.i)));
    app.focus({preventScroll:true});
    window.onkeydown=(e)=>{
      if(['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName))return;
      if(!rec && ['1','2','3','4'].includes(e.key)){const b=document.querySelector(`[data-answer="${'ABCD'[Number(e.key)-1]}"]`);if(b)b.click();}
      if(e.key==='ArrowLeft'&&idx>0)nav(idx-1); if(e.key==='ArrowRight'&&idx<questions.length-1)nav(idx+1);
    };
  }

  function feedbackHtml(q,rec){return `<div class="feedback ${rec.correct?'correct':'wrong'}"><strong>${rec.correct?'✓ Jawaban benar':'✕ Belum tepat'}</strong><div><b>Jawaban:</b> ${q.answer}. ${esc(q.answerText)}</div><p><b>Pembahasan:</b> ${esc(q.explanation).replace(/\n/g,'<br>')}</p></div>`;}
  function selectAnswer(q,key,customQuestions,pkg,idx,customTitle){
    const correct=key===q.answer; state.progress.answers[q.id]={selected:key,correct,ts:Date.now()}; saveProgress();
    renderStudy(pkg?.id||q.packageId||'review',idx+1,customQuestions,customTitle); showToast(correct?'Benar ✓':'Belum tepat — lihat pembahasan');
  }

  function renderQuizSetup(pkgId){
    const pkg = pkgId==='all'?null:getPkg(pkgId); const total=pkg?pkg.questions.length:allQuestions().length;
    app.innerHTML=`<div class="toolbar"><div class="crumb"><button id="homeBtn">Beranda</button><span>›</span><strong>Try Out</strong></div></div>
      <section class="quiz-setup"><div class="eyebrow">Mode tanpa kunci langsung</div><h2>${pkg?`Try Out Paket ${pkg.id}`:'Try Out Acak Semua Paket'}</h2><p class="muted">Jawaban dan pembahasan ditampilkan setelah sesi selesai.</p>
        <div class="field"><label>Jumlah soal</label><select id="quizCount">${[10,20,30,50,total].filter((v,i,a)=>v<=total&&a.indexOf(v)===i).map(v=>`<option value="${v}">${v===total?'Semua ':''}${v} soal</option>`).join('')}</select></div>
        <label class="check-row"><input id="shuffleOpt" type="checkbox" checked> Acak urutan soal</label>
        <div class="hero-actions"><button id="startQuiz" class="primary-btn">Mulai Try Out</button><button id="backBtn" class="ghost-btn">Batal</button></div>
      </section>`;
    document.getElementById('homeBtn').onclick=()=>go('#/');document.getElementById('backBtn').onclick=()=>history.back();
    document.getElementById('startQuiz').onclick=()=>startQuiz(pkgId,Number(document.getElementById('quizCount').value),document.getElementById('shuffleOpt').checked);
  }

  function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function startQuiz(pkgId,count,doShuffle){
    let qs=pkgId==='all'?allQuestions():getPkg(pkgId).questions.map(q=>({...q,packageId:Number(pkgId),packageTitle:getPkg(pkgId).title}));
    if(doShuffle)qs=shuffle(qs);qs=qs.slice(0,count);
    state.session={type:'quiz',pkgId,questions:qs,index:0,answers:{},started:Date.now()};saveQuiz();go(`#/quiz/${pkgId}`);
  }
  function renderQuizQuestion(){
    const s=state.session;if(!s){go('#/');return;}saveQuiz();const i=s.index,q=s.questions[i],chosen=s.answers[q.id];
    app.innerHTML=`<div class="toolbar"><div class="crumb"><button id="exitQuiz">Keluar</button><span>›</span><strong>Try Out</strong></div><span class="pill">${i+1}/${s.questions.length}</span></div>
      <article class="question-card" style="max-width:860px;margin:0 auto"><div class="q-meta"><span class="pill">${q.packageId?`Paket ${q.packageId}`:'Try Out'}</span><span class="q-number">${Object.keys(s.answers).length} dijawab</span></div><h1 class="q-title">${esc(q.question)}</h1>
      <div class="options">${q.options.map(o=>`<button class="option ${chosen===o.key?'selected':''}" data-answer="${o.key}"><span class="option-key">${o.key}</span><span>${esc(o.text)}</span></button>`).join('')}</div>
      <div class="question-actions"><button id="prevQ" class="ghost-btn" ${i===0?'disabled':''}>← Sebelumnya</button><div class="nav-actions">${i===s.questions.length-1?'<button id="finishQuiz" class="primary-btn">Selesai & Lihat Hasil</button>':'<button id="nextQ" class="primary-btn">Berikutnya →</button>'}</div></div></article>`;
    document.getElementById('exitQuiz').onclick=()=>{if(confirm('Simpan sesi dan kembali ke beranda? Anda dapat melanjutkannya nanti.')){saveQuiz();go('#/');}};
    document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{s.answers[q.id]=b.dataset.answer;renderQuizQuestion();});
    if(i>0)document.getElementById('prevQ').onclick=()=>{s.index--;renderQuizQuestion();showTop();};
    if(i<s.questions.length-1)document.getElementById('nextQ').onclick=()=>{s.index++;renderQuizQuestion();showTop();};
    else document.getElementById('finishQuiz').onclick=finishQuiz;
  }
  function finishQuiz(){
    const s=state.session;if(!s)return;
    for(const q of s.questions){
      const selected=s.answers[q.id];
      if(selected)state.progress.answers[q.id]={selected,correct:selected===q.answer,ts:Date.now()};
    }
    state.progress.quizResult={...s,questions:s.questions.map(q=>q.id),finished:Date.now()};
    state.session=null;saveQuiz();go('#/results/quiz');
  }

  function renderResults(kind){
    const quiz=kind==='quiz' ? state.progress.quizResult : null;
    const review=kind==='review' ? state.progress.reviewResult : null;
    const pkg=getPkg(kind);
    const questions=pkg?.questions || (quiz || review)?.questions.map(getQ).filter(Boolean);
    if(!questions?.length){go('#/');return;}
    const title=quiz?'Hasil Try Out':review?`Hasil ${review.title}`:`Hasil Belajar Paket ${pkg.id}`;
    const results=questions.map(q=>{
      const selected=quiz ? quiz.answers[q.id] || null : answerRec(q.id)?.selected || null;
      return {q,selected,correct:selected===q.answer};
    });
    const correct=results.filter(r=>r.correct).length;
    const answered=results.filter(r=>r.selected).length;
    const wrong=answered-correct,empty=questions.length-answered;
    const score=Math.round(correct/questions.length*100);
    rememberLocation(`#/results/${kind}`);
    app.innerHTML=`<div class="toolbar"><div class="crumb"><button id="homeBtn">Beranda</button><span>›</span><strong>${esc(title)}</strong></div></div>
      <section class="panel result-panel"><div class="eyebrow">${quiz?'Try out selesai':'Ringkasan belajar'}</div><h1>Nilai ${score}</h1>
      <p class="muted">${correct} jawaban benar dari ${questions.length} soal. Nilai dihitung dari seluruh soal, termasuk yang belum dijawab.${quiz?'':' Ringkasan ini menggunakan jawaban terakhir yang tersimpan.'}</p>
      <div class="result-grid"><div class="result-stat"><strong>${correct}</strong><span>Benar</span></div><div class="result-stat"><strong>${wrong}</strong><span>Salah</span></div><div class="result-stat"><strong>${empty}</strong><span>Belum dijawab</span></div><div class="result-stat"><strong>${answered}/${questions.length}</strong><span>Dikerjakan</span></div></div>
      <p class="muted">${quiz?`Durasi sesi: ${Math.round((quiz.finished-quiz.started)/60000)} menit (termasuk waktu jeda).`:""}</p>
      <div class="hero-actions">${pkg && empty?'<button id="completeBtn" class="primary-btn">Kerjakan yang belum dijawab</button>':''}${quiz?'<button id="retryBtn" class="primary-btn">Ulangi Try Out</button>':''}<button id="home2" class="ghost-btn">Kembali ke Beranda</button></div></section>
      <div class="section-head"><div><h2>Pembahasan</h2><p>Tinjau jawaban dan pembahasan setiap soal.</p></div></div>
      <section class="review-list">${results.map((r,i)=>`<article class="review-item ${r.correct?'correct':r.selected?'wrong':'unanswered'}"><strong>${i+1}. ${esc(r.q.question)}</strong><p class="muted">Jawaban Anda: ${r.selected?`${r.selected}. ${esc(r.q.options.find(o=>o.key===r.selected)?.text||'')}`:'Belum dijawab'}</p><p><b>Kunci:</b> ${r.q.answer}. ${esc(r.q.answerText)}</p><p><b>Pembahasan:</b> ${esc(r.q.explanation).replace(/\n/g,'<br>')}</p></article>`).join('')}</section>`;
    document.getElementById('homeBtn').onclick=document.getElementById('home2').onclick=()=>go('#/');
    if(pkg && empty)document.getElementById('completeBtn').onclick=()=>go(`#/study/${pkg.id}/${results.find(r=>!r.selected).q.number}`);
    if(quiz)document.getElementById('retryBtn').onclick=()=>startQuiz(quiz.pkgId,questions.length,true);
  }

  function renderReview(kind){
    let qs=allQuestions();let title='Review';
    if(kind==='wrong'){qs=qs.filter(q=>answerRec(q.id)&&!answerRec(q.id).correct);title='Review soal yang salah';}
    if(kind==='bookmarks'){qs=qs.filter(q=>state.progress.bookmarks[q.id]);title='Soal yang ditandai';}
    if(!qs.length){app.innerHTML=`<div class="toolbar"><div class="crumb"><button id="homeBtn">Beranda</button><span>›</span><strong>${esc(title)}</strong></div></div><div class="empty"><h3>Tidak ada soal di daftar ini.</h3><p>${kind==='wrong'?'Kerjakan soal dulu atau pertahankan jawaban benar Anda.':'Gunakan tombol “Tandai soal” saat belajar.'}</p></div>`;document.getElementById('homeBtn').onclick=()=>go('#/');return;}
    const saved=state.progress.review;
    if(saved?.kind===kind){
      const stored=saved.questions.map(getQ).filter(Boolean);
      if(stored.length)qs=stored;
    }
    const index=saved?.kind===kind ? Math.min(saved.index || 0,qs.length-1) : 0;
    state.progress.review={kind,questions:qs.map(q=>q.id),index};
    rememberLocation(`#/review/${kind}`);
    renderStudy(qs[0].packageId,index+1,qs,title);
  }

  function route(){
    routeContent();showTop();
  }
  function routeContent(){
    window.onkeydown=null;const parts=(location.hash||'#/').replace(/^#\//,'').split('/').filter(Boolean);
    if(!parts.length){renderHome();return;}
    if(parts[0]==='study'){renderStudy(parts[1],parts[2]||1);return;}
    if(parts[0]==='quiz'){
      const pkgId=parts[1] || 'all';
      if(pkgId!=='all' && !getPkg(pkgId)){go('#/');return;}
      if(state.session && String(state.session.pkgId)===pkgId)renderQuizQuestion();else renderQuizSetup(pkgId);
      return;
    }
    if(parts[0]==='results'){renderResults(parts[1]);return;}
    if(parts[0]==='review'){renderReview(parts[1]||'wrong');return;}
    go('#/');
  }
  state.session=restoreQuiz();
  if('scrollRestoration' in history)history.scrollRestoration='manual';
  if(!location.hash || location.hash==='#/'){
    const saved=resumeLocation();
    if(saved)history.replaceState(null,'',saved);
  }
  route();
})();
