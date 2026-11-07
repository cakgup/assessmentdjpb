(() => {
  const data = window.DJPB_ORAL_DATA;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const link = (route, label) => `<a class="ghost-btn" href="#/ujian/${route}">${label}</a>`;
  window.DJPB_ORAL = {render(app, parts, progress, save) {
    const state = progress.oral ||= {read:{},checks:{},notes:{}};
    const mode = parts[1] || 'materials';
    const header = `<section class="page-heading"><span class="pill">PERSIAPAN UJIAN MAKALAH</span><h1>Ujian di hadapan Eselon II DJPb</h1><p>Penguatan EWS MyIntress berbasis risiko · Perspektif kandidat Kepala KPPN.</p></section>
      <nav class="oral-tabs" aria-label="Persiapan ujian">${[['materials','Materi & rencana belajar'],['practice','Latihan lisan'],['checklist','Checklist kesiapan']].map(([id,title])=>`<a class="ghost-btn ${mode===id?'active':''}" href="#/ujian/${id}" ${mode===id?'aria-current="page"':''}>${title}</a>`).join('')}</nav>`;
    if(mode==='practice') {
      const q=data.questions.find(q=>q.id===Number(parts[2])) || data.questions[0];
      app.innerHTML=header+`<section class="panel oral-reader"><div class="q-meta"><span class="pill">Pertanyaan ${q.id} / 20</span><span>Target jawaban: 1–3 menit</span></div><label for="oralQuestion">Pilih pertanyaan</label><select id="oralQuestion">${data.questions.map(x=>`<option value="${x.id}" ${x.id===q.id?'selected':''}>${x.id}. ${esc(x.title)}</option>`).join('')}</select><h2>${esc(q.title)}</h2><p class="muted">Jawab dengan suara lantang sebelum membuka model jawaban. Susun fakta → keputusan → delegasi → risiko → ukuran hasil.</p><label for="oralNotes">Catatan jawaban Anda (tersimpan di browser)</label><textarea id="oralNotes" rows="6" placeholder="Keputusan saya, alasan, PIC, tenggat, dan bukti hasil…">${esc(state.notes[q.id] || '')}</textarea><p id="oralSaveStatus" role="status"></p><details class="oral-model"><summary>Lihat model jawaban dan probing</summary>${q.html}</details><div class="hero-actions">${link(`practice/${q.id===20?1:q.id+1}`,'Pertanyaan berikutnya →')}<button class="primary-btn" id="oralRandom">Acak pertanyaan</button></div><p class="muted">Evaluasi mandiri: apakah diagnosis, prioritas, kewenangan, delegasi, integritas, dan monitoring sudah jelas? Gunakan rubrik 1–5 di Bagian 31; ini bukan nilai asesmen resmi.</p>${link('materials/31','Buka kasus & rubrik penilaian')}</section>`;
      document.getElementById('oralQuestion').onchange=e=>{location.hash=`#/ujian/practice/${e.target.value}`;};
      document.getElementById('oralNotes').oninput=e=>{state.notes[q.id]=e.target.value;save();document.getElementById('oralSaveStatus').textContent='Catatan diperbarui. Penyimpanan mengikuti izin browser.';};
      document.getElementById('oralRandom').onclick=()=>{location.hash=`#/ujian/practice/${(q.id+Math.floor(Math.random()*19))%20+1}`;};
      return;
    }
    if(mode==='checklist') {
      const count=()=>data.checklist.filter((_,i)=>state.checks[i]).length;
      app.innerHTML=header+`<section class="panel"><h2>Siap menjelaskan tanpa catatan?</h2><p id="oralCheckCount" role="status">${count()} / 21 butir dikuasai</p><p class="muted">Centang setelah mampu menjelaskan secara lisan. Setiap butir memiliki pendalaman di Bagian 27. Checklist merupakan penilaian diri, bukan jaminan kelulusan.</p><div class="oral-checks">${data.checklist.map((s,i)=>`<label><input type="checkbox" data-oral-check="${i}" ${state.checks[i]?'checked':''}><span>${s}</span></label>`).join('')}</div>${link('materials/27','Pelajari 21 jawaban pendalaman')}</section>`;
      document.querySelectorAll('[data-oral-check]').forEach(el=>el.onchange=()=>{state.checks[el.dataset.oralCheck]=el.checked;save();document.getElementById('oralCheckCount').textContent=`${count()} / 21 butir dikuasai`;});return;
    }
    const section=data.sections.find(s=>s.id===Number(parts[2]));
    if(section) {
      app.innerHTML=header+`<article class="panel oral-reader"><div class="toolbar">${link('materials','← Semua materi')}<span class="pill">Bagian ${section.id} / 33</span></div><h2>${esc(section.title)}</h2><div class="oral-prose">${section.html}</div><label class="check-row"><input id="oralRead" type="checkbox" ${state.read[section.id]?'checked':''}> Tandai bagian ini sudah dipelajari</label><div class="hero-actions">${section.id>1?link(`materials/${section.id-1}`,'← Bagian sebelumnya'):''}${section.id<33?link(`materials/${section.id+1}`,'Bagian berikutnya →'):link('practice','Mulai latihan lisan')}</div></article>`;
      document.getElementById('oralRead').onchange=e=>{state.read[section.id]=e.target.checked;save();};return;
    }
    app.innerHTML=header+`<section class="panel"><h2>Dari penguasaan materi ke keputusan pimpinan</h2><p>33 bagian lengkap · ${data.sections.filter(s=>state.read[s.id]).length} sudah dipelajari · 20 latihan pertanyaan · 21 checklist.</p><div class="oral-plan"><div><strong>H-3 · Cerita besar & proses bisnis</strong><p>Bagian 1–12 dan 27. Latih inti makalah 60 detik serta peta kewenangan.</p>${link('materials/1','Mulai dari inti makalah')}</div><div><strong>H-2 · Rancangan & business rule</strong><p>Bagian 13–19 dan 29. Kuasai FA-01–FA-08, kualitas data, dan pengujian.</p>${link('materials/29','Pelajari delapan rule')}</div><div><strong>H-1 · Simulasi sidang</strong><p>Bagian 20–23, 30–33. Latih presentasi, probing, dan keputusan Kepala KPPN.</p>${link('practice','Latihan pertanyaan penguji')}</div></div><label for="oralSearch">Cari materi di seluruh isi panduan</label><input id="oralSearch" type="search" placeholder="Contoh: FA-01, delegasi, RPATA…"><p id="oralResultCount" role="status"></p><div id="oralSections" class="oral-sections"></div></section>`;
    const results=query=>{
      const found=data.sections.filter(s=>(s.title+' '+s.text).toLocaleLowerCase('id').includes(query.toLocaleLowerCase('id')));
      document.getElementById('oralResultCount').textContent=`${found.length} bagian ditemukan`;
      document.getElementById('oralSections').innerHTML=found.length?found.map(s=>`<a class="oral-section" href="#/ujian/materials/${s.id}"><span class="pill">${String(s.id).padStart(2,'0')}</span><span>${esc(s.title)}<small>${state.read[s.id]?'✓ Sudah dipelajari':'Buka materi'}</small></span><span aria-hidden="true">→</span></a>`).join(''):'<p>Tidak ada materi yang cocok. Coba istilah lain.</p>';
    };
    document.getElementById('oralSearch').oninput=e=>results(e.target.value.trim());results('');
  }};
})();
