// Pure learning metrics: local calendar days, unique daily questions, and earned XP.
(() => {
  const packageMeta=[
    ['puzzle','Fundamental','Dasar perbendaharaan & clue peserta','violet'],
    ['wallet','PNBP & Treasury','Deviasi · MP PNBP · Retur · Rekonsiliasi','blue'],
    ['landmark','Transfer ke Daerah','DAU · DBH · DAK Fisik · Dana Desa','teal'],
    ['briefcase','Investasi & Layanan','Investasi · UMi · SIKP · SRG · BLU','orange'],
    ['wallet','Kas & Rekening','TSA · TNP · Rekening pemerintah · MPN','blue'],
    ['chart','Akuntansi Pemerintah','Pelaporan · Piutang · Pertanggungjawaban','violet'],
    ['document','Pelaksanaan Anggaran','Pejabat perbendaharaan · Tagihan · UP','orange'],
    ['layers','Sistem & Teknologi','SPAN · SAKTI · MPN · Keamanan informasi','teal'],
    ['landmark','Keuangan Negara','Kewenangan · Prinsip · Kerugian negara','violet'],
  ];
  const paths={
    home:'M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z',
    book:'M3 5c4-1 6 0 9 2 3-2 5-3 9-2v14c-4-1-6 0-9 2-3-2-5-3-9-2V5Zm9 2v14',
    arrow:'M5 12h14m-5-5 5 5-5 5',play:'m9 5 10 7-10 7V5Z',
    search:'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
    bell:'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4',
    moon:'M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z',
    sun:'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
    menu:'M4 6h16M4 12h16M4 18h16',close:'m6 6 12 12M6 18 18 6',
    repeat:'M20 7a8 8 0 0 0-14-2L3 8m0-5v5h5m-4 9a8 8 0 0 0 14 2l3-3m0 5v-5h-5',
    bookmark:'M6 3h12v18l-6-4-6 4V3Z',target:'M21 12a9 9 0 1 1-9-9m5 9a5 5 0 1 1-5-5m0 5 9-9m-1 5h-4V4',
    bolt:'m13 2-9 12h7l-1 8L21 9h-8V2Z',
    fire:'M13 2c1 6 7 7 7 13a8 8 0 0 1-16 0c0-4 3-6 4-8 0 4 2 4 3 5 3-3 3-6 2-10Z',
    check:'m5 12 4 4L19 6',trophy:'M8 3h8v6a4 4 0 0 1-8 0V3Zm0 2H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4m-4 1v6m-4 2h8',
    star:'m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6Z',
    wallet:'M3 6h16v14H3V6Zm1 0V3h13v3m2 5h-5v5h5m-2-2h.01',
    landmark:'m2 8 10-6 10 6H2Zm2 13h16M6 11v7m6-7v7m6-7v7',
    puzzle:'M8 3H3v6c5-2 5 6 0 4v8h7c-2-5 6-5 4 0h7v-7c-5 2-5-6 0-4V3h-7c2 5-6 5-6 0Z',
    briefcase:'M8 6V3h8v3M3 6h18v14H3V6Zm0 6c6 4 12 4 18 0m-9 0v4',
    chart:'M4 3v18h17M8 16v-5m5 5V6m5 10V9',
    document:'M5 2h9l5 5v15H5V2Zm9 0v6h5M9 12h6m-6 4h6',
    layers:'m2 7 10-5 10 5-10 5L2 7Zm0 5 10 5 10-5M2 17l10 5 10-5',
    clock:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-5v5l3 2',
    info:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 11v6m0-10v.01',
  };
  function icon(name){return `<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.book}"/></svg>`;}
  function dayKey(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
  function migrate(progress,packages){
    const ids=new Set(packages.flatMap(p=>p.questions.map(q=>q.id)));
    const saved=progress.practice || {};
    const practice={days:{...saved.days},seen:{...saved.seen}};
    for(const [id,rec] of Object.entries(progress.answers || {})){
      if(!ids.has(id))continue;
      const needsHistory=!practice.seen[id];
      practice.seen[id]={correct:!!(practice.seen[id]?.correct || rec.correct)};
      if(needsHistory && rec.ts && Number.isFinite(new Date(rec.ts).getTime())){
        const day=dayKey(new Date(rec.ts));practice.days[day]=[...new Set([...(practice.days[day] || []),id])];
      }
    }
    return practice;
  }
  function record(progress,id,correct,now=new Date()){
    const p=progress.practice,day=dayKey(now);
    p.days[day]=[...new Set([...(p.days[day] || []),id])];
    award(progress,id,correct);
  }
  function award(progress,id,correct){
    const p=progress.practice;p.seen[id]={correct:!!(p.seen[id]?.correct || correct)};
  }
  function summary(progress,now=new Date()){
    const p=progress.practice || {days:{},seen:{}};
    const today=dayKey(now),daily=(p.days[today] || []).length;
    const target=Number(progress.dailyGoal) || 10;
    const seen=Object.values(p.seen),xp=seen.length*10+seen.filter(r=>r.correct).length*5;
    const levels=[['Treasury Rookie',0],['Treasury Explorer',300],['Treasury Analyst',1000],['Treasury Specialist',2000],['Treasury Master',3500]];
    const index=levels.findLastIndex(l=>xp>=l[1]),level=levels[index],next=levels[index+1];
    let streak=0,cursor=new Date(now);cursor.setHours(12,0,0,0);
    if(!daily)cursor.setDate(cursor.getDate()-1);
    while((p.days[dayKey(cursor)] || []).length){streak++;cursor.setDate(cursor.getDate()-1);}
    const week=Array.from({length:7},(_,i)=>{const date=new Date(now);date.setDate(date.getDate()-6+i);return {day:dayKey(date),label:date.toLocaleDateString('id-ID',{weekday:'short'}),count:(p.days[dayKey(date)] || []).length};});
    return {daily,target,xp,level:level[0],next:next?.[1],levelPct:next?Math.min(100,Math.round((xp-level[1])/(next[1]-level[1])*100)):100,streak,week};
  }
  function mastery(value){return value>=95?'Mastered':value>=85?'Strong':value>=70?'Good':value>=50?'Developing':'Perlu review';}
  function status(done,correct,total){
    if(!done)return {id:'new',label:'Belum dimulai',icon:'book'};
    if(done<total)return {id:'ongoing',label:'Sedang dipelajari',icon:'clock'};
    if(correct/total>=.95)return {id:'mastered',label:'Mastered',icon:'star'};
    return {id:'review',label:'Selesai · perlu review',icon:'repeat'};
  }
  window.DJPB_LEARNING={packageMeta,icon,dayKey,migrate,record,award,summary,mastery,status};
})();
