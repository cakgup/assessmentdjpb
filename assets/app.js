(() => {
  const DATA = window.DJPB_QUESTION_BANK;
  const L = window.DJPB_LEARNING;
  const icon = L.icon;
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
    packageFilter: 'all',
  };

  state.progress.practice=L.migrate(state.progress,DATA.packages);

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
  function setTheme(theme){ document.documentElement.dataset.theme=theme; try { localStorage.setItem(THEME,theme); } catch {} themeToggle.innerHTML=icon(theme==='dark'?'sun':'moon');themeToggle.setAttribute('aria-label',theme==='dark'?'Aktifkan tema terang':'Aktifkan tema gelap'); }
  let savedTheme;try { savedTheme=localStorage.getItem(THEME); } catch {}
  setTheme(savedTheme || (matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'));
  themeToggle.addEventListener('click',()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'));

  function go(hash){ if(location.hash===hash)route();else location.hash=hash; }
  window.addEventListener('hashchange', route);

  function wireRoutes(){
    document.querySelectorAll('[data-route]').forEach(el=>el.onclick=()=>go(el.dataset.route));
  }
  function packageDetails(pkg){
    const stats=pkgStats(pkg),meta=L.packageMeta[pkg.id-1];
    return {...stats,meta,wrong:stats.done-stats.correct,status:L.status(stats.done,stats.correct,pkg.questions.length)};
  }
  function progressPanel(){
    const s=overallStats(),g=L.summary(state.progress),pct=Math.round(s.done/s.total*1000)/10;
    return `<aside class="progress-summary" aria-label="Ringkasan progres belajar">
      <div class="panel-kicker">PERJALANAN BELAJAR <span class="streak-badge">${icon('fire')}${g.streak} hari streak</span></div>
      <div class="progress-overview"><div class="score-ring" role="img" aria-label="${pct}% soal selesai" style="--pct:${pct}"><span><strong>${pct}<small>%</small></strong><span>Tuntas</span></span></div>
      <div class="progress-facts"><p>${icon('check')}<span><strong>${s.done}</strong> / ${s.total} soal selesai</span></p><p>${icon('repeat')}<span><strong>${s.wrong}</strong> soal perlu review</span></p><p>${icon('target')}<span><strong>${s.done?s.accuracy+'%':'—'}</strong> mastery <small>dari soal dijawab</small></span></p></div></div>
      <div class="xp-heading"><span>${icon('bolt')} ${g.level}</span><strong>${g.xp} XP</strong></div>
      <div class="bar xp-bar"><i style="width:${g.levelPct}%"></i></div><div class="xp-caption">${g.next?`${g.next-g.xp} XP menuju level berikutnya`:'Level tertinggi tercapai. Terus pertajam pemahamanmu.'}</div>
    </aside>`;
  }
  function currentLearningCopy(){
    const last=resumeLocation() || '',match=last.match(/^#\/study\/(\d+)\/(\d+)/);
    if(match)return `Terakhir: Paket ${match[1]} · Soal ${match[2]} dari ${getPkg(match[1])?.questions.length || 30}`;
    if(state.session)return `Try Out tersimpan · Soal ${state.session.index+1} dari ${state.session.questions.length}`;
    if(last.startsWith('#/results/'))return 'Sesi selesai. Lihat hasil atau pilih tantangan berikutnya.';
    return 'Mulai Paket 1 dan bangun Treasury Skill kamu.';
  }
  function insightContent(){
    const s=overallStats(),completed=DATA.packages.filter(p=>pkgStats(p).done===p.questions.length).length;
    if(s.done===s.total)return {icon:'trophy',title:'Semua paket selesai!',text:`${s.total} soal sudah kamu kerjakan. ${s.wrong?`${s.wrong} soal masih bisa kamu pertajam lewat review.`:'Pemahaman yang kuat. Coba try out untuk menjaganya.'}`,route:s.wrong?'#/review/wrong':'#/quiz/all',action:s.wrong?'Review jawaban':'Coba Try Out'};
    if(!s.done)return {icon:'book',title:'Perjalanan besarmu dimulai dari satu soal.',text:'Belum ada progres? Tidak apa-apa. Mulai dari materi dasar, satu langkah setiap hari.',route:studyLocation(DATA.packages[0]),action:'Mulai Paket 1'};
    if(s.wrong)return {icon:'repeat',title:`${s.wrong} soal, kesempatan baru untuk paham.`,text:`${completed?`${completed} paket sudah selesai. `:''}Tinjau pembahasan dan temukan konsep yang masih perlu perhatian.`,route:'#/review/wrong',action:'Mulai review'};
    return {icon:'star',title:'Awal yang baik. Pertahankan ritmenya.',text:`${s.done} soal dijawab benar. Lanjutkan materi berikutnya untuk memperluas penguasaanmu.`,route:resumeLocation() || '#/learn',action:'Lanjutkan belajar'};
  }
  function renderHome(){
    const s=overallStats(),g=L.summary(state.progress),insight=insightContent();
    const name=state.progress.profileName;
    app.innerHTML=`<section class="welcome"><div><div class="welcome-label">YOUR TREASURY JOURNEY</div><h1>Halo${name?', '+esc(name):''}, siap lanjut belajar? <span aria-hidden="true">✦</span></h1><p>Persiapan Assessment DJPb <span>·</span> ${new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long'})}</p></div><span class="welcome-note">${icon('check')} Progres tersimpan otomatis</span></section>
      <section class="hero-grid"><div class="hero-learning"><div class="hero-copy"><span class="quest-badge">${icon('bolt')} TREASURY QUEST</span><h2>Upgrade Treasury<br>Skill kamu<span class="hero-dot">.</span></h2><p>Kuasai materi DJPb, satu kasus demi satu kasus.</p><div class="hero-meta"><span>Assessment DJPb ${new Date().getFullYear()}</span><span>${s.total} soal · ${DATA.packages.length} paket</span></div><div class="hero-actions"><button class="primary-btn" id="continueBtn">${icon('play')}${resumeLocation()?'Lanjutkan belajar':'Mulai belajar'}</button><button class="hero-secondary" id="quizAllBtn">Try Out Acak ${icon('arrow')}</button></div><div class="last-learning">${icon('clock')}${currentLearningCopy()}</div></div><img class="hero-art" src="assets/treasury-team.svg" width="320" height="280" alt="Dua pegawai muda berdiskusi sambil belajar perbendaharaan menggunakan laptop"></div>${progressPanel()}</section>
      <section class="quick-section" aria-labelledby="quickTitle"><h2 class="section-label" id="quickTitle">${icon('bolt')} Satu langkah berikutnya</h2><div class="quick-grid">
        <button class="quick-card" data-route="#/quiz/all"><span class="quick-icon blue">${icon('target')}</span><span><strong>Try Out Acak</strong><small>${state.session?'Sesi tersimpan, siap dilanjutkan':'30 soal · uji pemahamanmu'}</small></span>${icon('arrow')}</button>
        <button class="quick-card" data-route="#/review/wrong"><span class="quick-icon orange">${icon('repeat')}</span><span><strong>Ulangi yang salah</strong><small>${s.wrong} soal untuk dipahami kembali</small></span>${icon('arrow')}</button>
        <button class="quick-card" data-route="#/review/bookmarks"><span class="quick-icon violet">${icon('bookmark')}</span><span><strong>Soal ditandai</strong><small>${s.bookmarks} soal dalam koleksimu</small></span>${icon('arrow')}</button>
      </div></section>
      <section class="daily-goal" aria-labelledby="goalTitle"><div class="goal-intro"><span class="goal-icon">${icon('target')}</span><div><h2 id="goalTitle">Sedikit setiap hari, berarti.</h2><p>${g.daily>=g.target?'Target hari ini tercapai. Kerja bagus!':`Tinggal ${g.target-g.daily} soal lagi untuk target hari ini.`}</p></div></div><div class="goal-meter"><div><span>Target hari ini</span><strong>${g.daily} / ${g.target} soal</strong></div><div class="bar"><i style="width:${Math.min(100,g.daily/g.target*100)}%"></i></div></div><label class="goal-setting"><span class="sr-only">Ubah target soal harian</span><select id="dailyGoal">${[5,10,20].map(n=>`<option value="${n}" ${g.target===n?'selected':''}>${n} soal / hari</option>`).join('')}<option value="custom" ${![5,10,20].includes(g.target)?'selected':''}>Target khusus</option></select></label></section>
      <section class="packages-section" id="packagesSection" aria-labelledby="packagesTitle"><div class="section-head"><div><span class="welcome-label">PILIH TANTANGANMU</span><h2 id="packagesTitle">Paket belajar</h2><p>Satu paket, selangkah lebih siap.</p></div><label class="search-box">${icon('search')}<span class="sr-only">Cari soal atau topik</span><input id="homeSearch" type="search" placeholder="Cari soal atau topik…" value="${esc(state.homeSearch)}"></label></div><div class="package-controls"><div class="filter-tabs" role="group" aria-label="Filter paket">${[['all','Semua'],['unfinished','Belum selesai'],['review','Perlu review'],['mastered','Sudah dikuasai']].map(([id,title])=>`<button data-filter="${id}" class="${state.packageFilter===id?'active':''}" aria-pressed="${state.packageFilter===id}">${title}</button>`).join('')}</div><span id="packageCount" class="package-count" role="status" aria-live="polite"></span></div><div id="packageGrid" class="package-grid"></div></section>
      <section class="insight-card"><span class="insight-icon">${icon(insight.icon)}</span><div><span class="welcome-label">LEARNING INSIGHT</span><h2>${insight.title}</h2><p>${insight.text}</p></div><button class="ghost-btn" data-route="${insight.route}">${insight.action} ${icon('arrow')}</button></section>`;
    renderPackageGrid();wireRoutes();
    document.getElementById('homeSearch').addEventListener('input',e=>{state.homeSearch=e.target.value;renderPackageGrid();});
    document.querySelectorAll('[data-filter]').forEach(el=>el.onclick=()=>{
      state.packageFilter=el.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b===el);b.setAttribute('aria-pressed',String(b===el));});
      renderPackageGrid();
    });
    document.getElementById('continueBtn').onclick=()=>go(resumeLocation() || studyLocation(DATA.packages[0]));
    document.getElementById('quizAllBtn').onclick=()=>go('#/quiz/all');
    document.getElementById('dailyGoal').onchange=e=>{
      if(e.target.value==='custom'){openProfile();e.target.value=String(g.target);return;}
      state.progress.dailyGoal=Number(e.target.value);saveProgress();renderHome();
    };
  }
  function renderPackageGrid(){
    const box=document.getElementById('packageGrid');if(!box)return;
    const term=normalize(state.homeSearch.trim());
    const filtered=DATA.packages.filter(p=>{
      const s=packageDetails(p),matches=!term || normalize(p.title+' '+s.meta[1]+' '+s.meta[2]).includes(term) || p.questions.some(q=>normalize(q.question+' '+q.explanation+' '+q.options.map(o=>o.text).join(' ')).includes(term));
      return matches && (state.packageFilter==='all' || state.packageFilter==='unfinished' && s.done<p.questions.length || state.packageFilter==='review' && s.wrong>0 || state.packageFilter==='mastered' && s.status.id==='mastered');
    });
    document.getElementById('packageCount').textContent=`${filtered.length} paket`;
    if(!filtered.length){box.innerHTML='<div class="empty"><h3>Belum ada paket yang cocok.</h3><p>Coba kata kunci lain atau pilih filter Semua.</p></div>';return;}
    box.innerHTML=filtered.map(p=>{
      const s=packageDetails(p),[symbol,title,topics,color]=s.meta,pct=Math.round(s.done/p.questions.length*100);
      const action=!s.done?'Mulai belajar':s.done===p.questions.length?'Lihat hasil':'Lanjutkan';
      return `<button class="package-card ${color}" data-pkg="${p.id}" aria-label="Paket ${p.id}: ${esc(title)}. ${s.status.label}. ${action}"><span class="package-top"><span>PAKET ${String(p.id).padStart(2,'0')}</span><span>${p.questions.length} SOAL</span></span><span class="package-identity"><span class="package-icon">${icon(symbol)}</span><span class="package-title">${title}</span></span><span class="package-description">${topics}</span><span class="status-badge ${s.status.id}">${icon(s.status.icon)}${s.status.label}</span><span class="package-progress-label"><span>${s.done} / ${p.questions.length} soal</span><strong>${pct}%</strong></span><span class="bar"><i style="width:${pct}%"></i></span><span class="package-bottom"><span class="mastery-caption">${s.done?`<strong>${s.accuracy}%</strong> Mastery`:'Mulai perjalananmu'}${s.wrong?`<small>${s.wrong} soal perlu review</small>`:''}</span><span class="card-cta">${action}${icon('arrow')}</span></span></button>`;
    }).join('');
    box.querySelectorAll('[data-pkg]').forEach(el=>el.onclick=()=>{
      const pkg=getPkg(el.dataset.pkg);go(pkgStats(pkg).done===pkg.questions.length?`#/results/${pkg.id}`:studyLocation(pkg));
    });
  }
  function renderReviewHub(){
    const s=overallStats();
    app.innerHTML=`<section class="page-heading"><span class="welcome-label">PAHAMI, BUKAN SEKADAR HAFAL</span><h1>Ruang review</h1><p>Kembali ke konsep yang perlu perhatian. Setiap ulasan adalah kesempatan untuk lebih paham.</p></section><div class="quick-grid review-hub"><button class="quick-card" data-route="#/review/wrong"><span class="quick-icon orange">${icon('repeat')}</span><span><strong>Jawaban yang belum tepat</strong><small>${s.wrong} soal · baca kembali pembahasannya</small></span>${icon('arrow')}</button><button class="quick-card" data-route="#/review/bookmarks"><span class="quick-icon violet">${icon('bookmark')}</span><span><strong>Koleksi soal ditandai</strong><small>${s.bookmarks} soal yang ingin kamu pelajari lagi</small></span>${icon('arrow')}</button></div>${!s.wrong&&!s.bookmarks?'<div class="empty"><h2>Ruang review masih kosong.</h2><p>Mulai belajar atau tandai soal penting saat mengerjakan paket.</p><button class="primary-btn" data-route="#/learn">Pilih paket belajar</button></div>':''}`;wireRoutes();
  }
  function renderProgress(){
    const s=overallStats(),g=L.summary(state.progress),completed=DATA.packages.filter(p=>pkgStats(p).done===p.questions.length).length;
    const max=Math.max(g.target,...g.week.map(d=>d.count));
    app.innerHTML=`<section class="page-heading"><span class="welcome-label">SETIAP LANGKAH BERARTI</span><h1>Perjalanan belajarmu</h1><p>Lihat kebiasaan yang terbangun dan materi yang semakin kamu kuasai.</p></section><div class="progress-page-grid">${progressPanel()}<section class="activity-panel"><h2>Ritme 7 hari terakhir</h2><p class="muted">Jumlah soal unik yang dikerjakan setiap hari.</p><div class="week-chart">${g.week.map(d=>`<div><strong>${d.count}</strong><div class="week-track"><i style="height:${d.count/max*100}%"></i></div><span>${d.label}</span></div>`).join('')}</div></section></div><div class="section-head"><div><h2>Milestone kecil, langkah besar</h2><p>Apresiasi untuk proses belajarmu.</p></div></div><div class="achievement-grid">${[['book','Langkah pertama','Kerjakan satu soal',s.done>=1],['target','Ritme harian','Capai target belajar hari ini',g.daily>=g.target],['trophy','Satu paket tuntas','Selesaikan seluruh soal dalam satu paket',completed>=1]].map(([i,title,desc,earned])=>`<article class="achievement ${earned?'earned':''}"><span>${icon(i)}</span><div><h3>${title}</h3><p>${desc}</p><small>${earned?'✓ Tercapai':'Belum tercapai'}</small></div></article>`).join('')}</div><section class="metric-explainer"><h2>Bagaimana progres dihitung?</h2><p><strong>Mastery</strong> adalah persentase jawaban terakhir yang benar dari soal yang sudah dijawab. Paket berstatus Mastered setelah semua soal dikerjakan dan mastery minimal 95%.</p><p><strong>XP</strong>: 10 poin untuk setiap soal unik yang pernah dikerjakan, ditambah 5 poin sekali saat dijawab benar. Mengulang soal tidak menggandakan XP. <strong>Streak</strong> menghitung hari belajar berturut-turut sesuai tanggal lokal.</p><p>Label mastery: 0–49% Perlu review · 50–69% Developing · 70–84% Good · 85–94% Strong · 95–100% Mastered. Gamifikasi ini untuk latihan mandiri, bukan nilai assessment resmi.</p></section>`;
  }
  function openDialog(title,content){
    const dialog=document.getElementById('utilityDialog');
    dialog.innerHTML=`<div class="dialog-heading"><h2 id="dialogTitle">${title}</h2><button class="icon-btn" id="closeDialog" aria-label="Tutup">${icon('close')}</button></div>${content}`;
    document.getElementById('closeDialog').onclick=()=>dialog.close();dialog.showModal();
  }
  function openProfile(){
    const g=L.summary(state.progress);
    openDialog('Ruang belajarmu',`<p class="muted">Preferensi tersimpan di browser ini. Tidak memerlukan akun.</p><form id="profileForm"><div class="field"><label for="profileName">Nama panggilan</label><input id="profileName" maxlength="32" value="${esc(state.progress.profileName || '')}" placeholder="Bagaimana kami menyapamu?"></div><div class="field"><label for="profileGoal">Target soal per hari</label><input id="profileGoal" type="number" min="1" max="270" required value="${g.target}"></div><button class="primary-btn" type="submit">Simpan preferensi</button></form><hr><p class="muted">Menghapus progres akan menghapus jawaban, bookmark, posisi, serta aktivitas belajar edisi ini.</p><button class="danger-btn" id="resetProgress" type="button">Reset progres belajar</button>`);
    document.getElementById('profileForm').onsubmit=e=>{
      e.preventDefault();const target=Number(document.getElementById('profileGoal').value);
      if(!Number.isInteger(target)||target<1||target>270)return;
      state.progress.profileName=document.getElementById('profileName').value.trim();state.progress.dailyGoal=target;saveProgress();document.getElementById('utilityDialog').close();route();showToast('Preferensi belajar disimpan.');
    };
    document.getElementById('resetProgress').onclick=()=>{
      if(!confirm('Hapus seluruh progres, jawaban, bookmark, sesi, dan aktivitas belajar edisi ini?'))return;
      state.progress={answers:{},bookmarks:{},practice:{days:{},seen:{}}};state.session=null;saveProgress();document.getElementById('utilityDialog').close();go('#/');showToast('Progres belajar direset.');
    };
  }
  function initializeNavigation(){
    const skip=document.querySelector('.skip-link');if(skip)skip.onclick=e=>{e.preventDefault();showTop();};
    document.querySelectorAll('[data-nav]').forEach(el=>el.addEventListener('click',()=>{
      document.getElementById('menuToggle').setAttribute('aria-expanded','false');document.getElementById('mainNav').classList.remove('is-open');
    }));
    for(const [id,symbol] of [['navSearch','search'],['notificationsBtn','bell'],['menuToggle','menu']]){
      const el=document.getElementById(id);if(el)el.innerHTML=icon(symbol);
    }
    const menu=document.getElementById('menuToggle');
    if(menu)menu.onclick=()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));document.getElementById('mainNav').classList.toggle('is-open',open);};
    const profile=document.getElementById('profileBtn');if(profile)profile.onclick=openProfile;
    const search=document.getElementById('navSearch');if(search)search.onclick=()=>{go('#/learn');setTimeout(()=>document.getElementById('homeSearch')?.focus(),0);};
    const notifications=document.getElementById('notificationsBtn');if(notifications)notifications.onclick=()=>{
      const s=overallStats(),g=L.summary(state.progress);
      openDialog('Kabar belajarmu',`<div class="notification-item">${icon('target')}<div><strong>${g.daily>=g.target?'Target harian tercapai':'Target hari ini'}</strong><p>${g.daily} dari ${g.target} soal sudah dikerjakan.</p></div></div><div class="notification-item">${icon('repeat')}<div><strong>${s.wrong} soal perlu review</strong><p>${s.wrong?'Luangkan waktu untuk memahami kembali pembahasannya.':'Lanjutkan belajar untuk memperluas penguasaan materi.'}</p></div></div>`);
    };
  }
  function updateNavigation(){
    const section=(location.hash || '#/').split('/')[1];
    const active=section==='study'||section==='learn'?'learn':section==='quiz'?'quiz':section==='review'?'review':section==='progress'||section==='results'?'progress':'home';
    document.querySelectorAll('[data-nav]').forEach(el=>{el.classList.toggle('active',el.dataset.nav===active);if(el.dataset.nav===active)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});
    const menu=document.getElementById('menuToggle');if(menu){menu.setAttribute('aria-expanded','false');document.getElementById('mainNav').classList.remove('is-open');}
    const profile=document.getElementById('profileBtn');if(profile)profile.textContent=(state.progress.profileName || 'Treasury Student').split(/\s+/).slice(0,2).map(n=>n[0]).join('').toUpperCase();
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
          <div class="question-map">${questions.map((x,i)=>{const r=answerRec(x.id);let c='map-item';if(r)c+=r.correct?' done':' wrong';if(i===idx)c+=' current';return `<button class="${c}" data-i="${i}" aria-label="Soal ${i+1}, ${r?(r.correct?'benar':'salah'):'belum dijawab'}" ${i===idx?'aria-current="step"':''}>${i+1}${r?`<span class="map-state" aria-hidden="true">${r.correct?'✓':'×'}</span>`:''}</button>`}).join('')}</div>
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
    const correct=key===q.answer; L.record(state.progress,q.id,correct);state.progress.answers[q.id]={selected:key,correct,ts:Date.now()}; saveProgress();
    renderStudy(pkg?.id||q.packageId||'review',idx+1,customQuestions,customTitle); showToast(correct?'Benar ✓':'Belum tepat — lihat pembahasan');
  }

  function renderQuizSetup(pkgId){
    const pkg = pkgId==='all'?null:getPkg(pkgId); const total=pkg?pkg.questions.length:allQuestions().length;
    app.innerHTML=`<div class="toolbar"><div class="crumb"><button id="homeBtn">Beranda</button><span>›</span><strong>Try Out</strong></div></div>
      <section class="quiz-setup"><div class="eyebrow">Mode tanpa kunci langsung</div><h2>${pkg?`Try Out Paket ${pkg.id}`:'Try Out Acak Semua Paket'}</h2><p class="muted">Jawaban dan pembahasan ditampilkan setelah sesi selesai.</p>
        <div class="field"><label>Jumlah soal</label><select id="quizCount">${[10,20,30,50,total].filter((v,i,a)=>v<=total&&a.indexOf(v)===i).map(v=>`<option value="${v}" ${v===30?'selected':''}>${v===total?'Semua ':''}${v} soal</option>`).join('')}</select></div>
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
    document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{s.answers[q.id]=b.dataset.answer;L.record(state.progress,q.id,false);renderQuizQuestion();});
    if(i>0)document.getElementById('prevQ').onclick=()=>{s.index--;renderQuizQuestion();showTop();};
    if(i<s.questions.length-1)document.getElementById('nextQ').onclick=()=>{s.index++;renderQuizQuestion();showTop();};
    else document.getElementById('finishQuiz').onclick=finishQuiz;
  }
  function finishQuiz(){
    const s=state.session;if(!s)return;
    for(const q of s.questions){
      const selected=s.answers[q.id];
      if(selected){L.award(state.progress,q.id,selected===q.answer);state.progress.answers[q.id]={selected,correct:selected===q.answer,ts:Date.now()};}
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
    routeContent();updateNavigation();showTop();
    if(location.hash==='#/learn')document.getElementById('packagesSection')?.scrollIntoView({block:'start',behavior:'instant'});
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
    if(parts[0]==='review'){if(parts[1])renderReview(parts[1]);else renderReviewHub();return;}
    if(parts[0]==='learn'){renderHome();return;}
    if(parts[0]==='progress'){renderProgress();return;}
    go('#/');
  }
  initializeNavigation();
  state.session=restoreQuiz();
  if('scrollRestoration' in history)history.scrollRestoration='manual';
  if(!location.hash || location.hash==='#/'){
    const saved=resumeLocation();
    if(saved)history.replaceState(null,'',saved);
  }
  route();
})();
