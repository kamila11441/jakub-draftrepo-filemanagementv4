const galleryEl=document.getElementById('gallery');
const countEl=document.getElementById('count');
const root=document.documentElement;

let photos=[],active='all',visibleLimit=12;

const still=matchMedia('(prefers-reduced-motion:reduce)').matches;
const themeMeta=document.querySelector('meta[name="theme-color"]');

const languageToggle=document.getElementById('languageToggle');
const locale={en:{nav:['Work','About','Contact','Manage ↗'],brand:'Public portfolio',heroMeta:'@jakyb11 | Warsaw | Poland',heroPlaceholder:'Selected frame',navLabel:'Main navigation',featured:'Featured frames',count:'00 photographs',work:'Selected work',filters:['All','People','Events','Editorial','Other'],about:'Looking closer.',aboutText:'I’m Jakub, a photographer drawn to people, places and the quiet moments in between. My work explores the way light, atmosphere and human connection shape a story.',contact:'Let’s talk.',contactText:'For commissions, collaborations or any inquiries, feel free to get in touch. I’m always open to new projects and ideas.',email:'Email',instagram:'Instagram',footer:'Independent photographer',top:'Back to top ↑',empty:'No photographs in this selection yet.',imageUnavailable:'Photo temporarily unavailable',view:'View',close:'Close',photographs:'photographs',showMore:'Show more',infoLabels:['Title','Model','Description','Date']},pl:{nav:['Prace','O mnie','Kontakt','Zarządzaj ↗'],brand:'Portfolio',heroMeta:'@jakyb11 | Warszawa | Polska',heroPlaceholder:'Wybrane zdjęcie',navLabel:'Nawigacja główna',featured:'Wybrane kadry',count:'00 zdjęć',work:'Wybrane prace',filters:['Wszystkie','Ludzie','Wydarzenia','Edytorial','Inne'],about:'Patrzeć uważniej.',aboutText:'Jestem fotografem zainteresowanym ludźmi, miejscami i spokojnymi chwilami pomiędzy. W moich zdjęciach odkrywam, jak światło, atmosfera i relacje międzyludzkie budują opowieść.',contact:"Let's talk.",contactText:'W sprawie zleceń, współpracy lub pytań napisz do mnie. Chętnie podejmę nowe projekty i pomysły.',email:'E-mail',instagram:'Instagram',footer:'Niezależny fotograf',top:'Wróć na górę ↑',empty:'Brak zdjęć w tym wyborze.',imageUnavailable:'Zdjęcie chwilowo niedostępne',view:'Zobacz',close:'Zamknij',photographs:'zdjęć',showMore:'Pokaż więcej',infoLabels:['Tytuł','Model','Opis','Data']}};
function setLanguage(lang){
  try{
  lang=locale[lang]?lang:'en';
  const t=locale[lang]||locale.en;
  document.documentElement.lang=lang in locale?lang:'en';
  const put=(selector,value)=>{const el=document.querySelector(selector);if(el)el.textContent=value;};
  const attr=(selector,name,value)=>{const el=document.querySelector(selector);if(el)el.setAttribute(name,value);};
  if(languageToggle){languageToggle.textContent=lang==='en'?'PL':'EN';languageToggle.setAttribute('aria-label',lang==='en'?'Przełącz język na polski':'Switch language to English');}
  put('.bar>span',t.brand);attr('.bar nav','aria-label',t.navLabel);put('.hero-text p',t.heroMeta);put('#heroPlaceholder',t.heroPlaceholder);attr('.strip','aria-label',t.featured);put('#count',t.count);
  document.querySelectorAll('.bar nav a').forEach((a,i)=>{if(t.nav[i])a.textContent=t.nav[i];});
  put('.work-head h2',t.work);document.querySelectorAll('.filter').forEach((b,i)=>{if(t.filters[i])b.textContent=t.filters[i];});
  put('.about h2',t.about);put('#aboutText',t.aboutText);put('.contact h2',t.contact);put('.panel-row p',t.contactText);
  const links=document.querySelectorAll('.links a');if(links[0])links[0].textContent=t.email;if(links[1])links[1].textContent=t.instagram;
  put('.footer span:nth-child(2)',t.footer);put('#showMore',t.showMore);put('.footer a',t.top);put('.cursor i',t.view);put('.lb-close',t.close);attr('.lb','aria-label',lang==='en'?'Photograph viewer':'Przeglądarka zdjęć');
  try{localStorage.setItem('jk-portfolio-language',document.documentElement.lang);}catch(e){}
  }catch(error){console.error('Language update failed:',error);}
}
let currentLanguage=(()=>{try{return localStorage.getItem('jk-portfolio-language')==='pl'?'pl':'en'}catch(e){return'en'}})();
document.querySelector('.footer a[href="#top"]').addEventListener('click',e=>{e.preventDefault();document.getElementById('top').scrollIntoView({behavior:still?'auto':'smooth',block:'start'});history.replaceState(null,'',location.pathname+location.search)});


const buzz=ms=>{
  try{
    if(!still&&navigator.vibrate&&matchMedia('(pointer:coarse)').matches){
      navigator.vibrate(ms);
    }
  }catch(e){}
};

function pathFor(src){
  if(!src)return '';
  if(/^https?:\/\//i.test(src))return src;
  return src.replace(/^\/+/,'');
}

const io=still||!('IntersectionObserver' in window)?null:new IntersectionObserver(es=>{
  es.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
},{rootMargin:'0px 0px -6% 0px',threshold:.08});

function metadataFor(p){const labels=(locale[currentLanguage]||locale.en).infoLabels;return [
  ['title',labels[0],p.title,p.showTitle],['model',labels[1],p.model,p.showModel],['description',labels[2],p.description,p.showDescription],['date',labels[3],p.date,p.showDate]
].filter(([,label,value,show])=>String(value||'').trim()&&show!==false).map(([key,label,value])=>[label,String(value).trim()]);}

function draw(){
  const items=photos.filter(p=>
    active==='all'||
    String(p.category||'other').toLowerCase()===active.toLowerCase()
  );

  countEl.textContent=
    `${String(items.length).padStart(2,'0')} ${(locale[currentLanguage]||locale.en).photographs}`;

  galleryEl.innerHTML='';
  galleryEl.style.transform='none';
  document.getElementById('showMore').hidden=items.length<=visibleLimit;

  if(!items.length){
    galleryEl.style.gridTemplateColumns='1fr';
    galleryEl.innerHTML='<div class="empty"></div>';galleryEl.querySelector('.empty').textContent=(locale[currentLanguage]||locale.en).empty;
    return;
  }

  const minColumnWidth=280,gap=24;
  const columnCount=innerWidth<=760
    ?2
    :Math.max(1,Math.floor((galleryEl.clientWidth+gap)/(minColumnWidth+gap)));

  galleryEl.style.gridTemplateColumns=`repeat(${columnCount},minmax(0,1fr))`;

  const columns=Array.from({length:columnCount},()=>{
    const col=document.createElement('div');
    col.className='gallery-column';
    galleryEl.appendChild(col);
    return col;
  });

  const visibleItems=items.slice(0,visibleLimit);
  const entries=visibleItems.map(p=>({p,thumb:null}));

  visibleItems.forEach((p,i)=>{
    const tile=document.createElement('article');
    tile.className='tile';

    const visual=document.createElement('div');
    visual.className='tile-visual';

    const a=document.createElement('a');
    a.href=pathFor(p.image);
    a.target='_blank';
    a.rel='noopener noreferrer';
    a.setAttribute('aria-label',p.alt||'Open photograph');

    const img=document.createElement('img');
    img.src=pathFor(p.image);
    img.alt=p.alt||'';
    img.loading='lazy';
    img.decoding='async';

    let imageRetries=0;
    img.onerror=()=>{
      if(imageRetries<2){imageRetries++;const retryUrl=new URL(img.src);retryUrl.searchParams.set('retry',String(Date.now()));img.src=retryUrl.href;return;}
      img.hidden=true;visual.classList.add('image-failed');
      let fallback=visual.querySelector('.image-fallback');
      if(!fallback){fallback=document.createElement('div');fallback.className='image-fallback';fallback.textContent=(locale[currentLanguage]||locale.en).imageUnavailable;visual.appendChild(fallback);}
    };

    entries[i].thumb=img;
    a.addEventListener('click',e=>lbClick(e,entries,i));

    a.appendChild(img);
    visual.appendChild(a);
    tile.appendChild(visual);

    const details=metadataFor(p);
    if(details.length){const info=document.createElement('div');info.className='tile-info';details.forEach(([label,value])=>{const row=document.createElement('div');row.className='meta-row';const key=document.createElement('strong');key.textContent=label+':';const text=document.createElement('span');text.textContent=value;row.append(key,text);info.appendChild(row);});tile.appendChild(info);}

    columns[i%columnCount].appendChild(tile);

    if(io)io.observe(tile);
    else tile.classList.add('in');
  });
}

/* LIGHTBOX */

const lb=document.getElementById('lb');
const lbImg=document.getElementById('lbImg');
const lbTitle=document.getElementById('lbTitle');
const lbCat=document.getElementById('lbCat');
const lbNo=document.getElementById('lbNo');

let lbList=[],lbI=0,lbOpen=false,lbFrom=null,tx=0;

function lbClick(e,list,i){
  if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button)return;
  e.preventDefault();
  openLB(list,i);
}

function lbFlip(){
  const t=lbList[lbI].thumb;
  if(still||!t)return;

  const a=t.getBoundingClientRect();
  const b=lbImg.getBoundingClientRect();

  if(!a.width||!b.width)return;

  lbImg.style.transition='none';
  lbImg.style.transform=
    `translate(${a.left-b.left}px,${a.top-b.top}px) scale(${a.width/b.width},${a.height/b.height})`;

  void lbImg.offsetWidth;

  lbImg.style.transition='transform .65s cubic-bezier(.2,.7,.2,1)';
  lbImg.style.transform='none';
}

function lbShow(i,first){
  lbI=(i+lbList.length)%lbList.length;

  const p=lbList[lbI].p;
  const c=String(p.category||'Other');

  lbTitle.textContent=metadataFor(p).map(([label,value])=>label+': '+value).join(' · ');
  lbNo.textContent=`${String(lbI+1).padStart(2,'0')} / ${String(lbList.length).padStart(2,'0')}`;

  lbImg.alt=p.alt||'';
  lbImg.style.transition='none';
  lbImg.style.transform='none';
  lbImg.style.opacity=0;

  const done=()=>{
    lbImg.onload=null;
    void lbImg.offsetWidth;
    lbImg.style.transition='';
    lbImg.style.opacity=1;
    if(first)lbFlip();
  };

  lbImg.onload=done;
  lbImg.src=pathFor(p.image);

  if(lbImg.complete&&lbImg.naturalWidth)done();
}

function openLB(list,i){
  lbList=list;
  lbOpen=true;
  buzz(10);
  lbFrom=document.activeElement;

  lb.hidden=false;
  root.classList.add('lock');

  lb.querySelectorAll('.lb-prev,.lb-next').forEach(b=>{
    b.hidden=list.length<2;
  });

  lbShow(i,true);

  requestAnimationFrame(()=>{
    lb.classList.add('open');
    lb.querySelector('.lb-close').focus({preventScroll:true});
  });
}

function closeLB(fast){
  if(!lbOpen)return;

  lbOpen=false;
  lb.classList.remove('open');
  root.classList.remove('lock');

  const t=lbList[lbI].thumb;
  let ms=420;

  if(fast){
    lbImg.style.transition='transform .42s cubic-bezier(.5,0,.8,.4),opacity .3s';
    lbImg.style.transform=`translate3d(0,${innerHeight}px,0)`;
    lbImg.style.opacity=0;
    ms=440;
  }else if(!still&&t){
    const a=t.getBoundingClientRect();
    const b=lbImg.getBoundingClientRect();

    if(a.width&&b.width&&a.bottom>0&&a.top<innerHeight&&a.right>0&&a.left<innerWidth){
      lbImg.style.transition='transform .55s cubic-bezier(.5,0,.2,1)';
      lbImg.style.transform=
        `translate(${a.left-b.left}px,${a.top-b.top}px) scale(${a.width/b.width},${a.height/b.height})`;
      ms=580;
    }
  }

  setTimeout(()=>{
    if(!lbOpen){
      lb.hidden=true;
      lbImg.removeAttribute('src');
    }
  },ms);

  if(lbFrom&&lbFrom.focus)lbFrom.focus({preventScroll:true});
}

lb.addEventListener('click',e=>{
  const k=e.target.closest('[data-lb]');

  if(k){
    const a=k.dataset.lb;
    if(a==='close')closeLB();
    else lbShow(lbI+(a==='next'?1:-1));
  }else if(e.target===lb||e.target.classList.contains('lb-stage')){
    closeLB();
  }
});

let ty=0,axis='',dragY=0;

lb.addEventListener('touchstart',e=>{
  tx=e.touches[0].clientX;
  ty=e.touches[0].clientY;
  axis='';
  dragY=0;
},{passive:true});

lb.addEventListener('touchmove',e=>{
  if(e.touches.length>1)return;

  const mx=e.touches[0].clientX-tx;
  const my=e.touches[0].clientY-ty;

  if(!axis&&(Math.abs(mx)>8||Math.abs(my)>8)){
    axis=Math.abs(my)>Math.abs(mx)?'y':'x';
  }

  if(axis==='y'){
    dragY=Math.max(0,my);
    lb.style.transition='none';
    lbImg.style.transition='none';
    lbImg.style.transform=
      `translate3d(0,${dragY}px,0) scale(${1-Math.min(dragY,400)/2400})`;
    lb.style.opacity=String(1-Math.min(dragY,320)/420);
  }
},{passive:true});

lb.addEventListener('touchend',e=>{
  const dx=e.changedTouches[0].clientX-tx;

  if(axis==='y'){
    lb.style.transition='';
    lb.style.opacity='';

    if(dragY>110){
      buzz(8);
      closeLB(true);
    }else{
      lbImg.style.transition='transform .3s cubic-bezier(.2,.7,.2,1)';
      lbImg.style.transform='none';
    }

    dragY=0;
    axis='';
    return;
  }

  if(Math.abs(dx)>50&&lbList.length>1){
    lbShow(lbI+(dx<0?1:-1));
  }
},{passive:true});

addEventListener('keydown',e=>{
  if(!lbOpen)return;

  if(e.key==='Escape')closeLB();
  else if(e.key==='ArrowRight'&&lbList.length>1)lbShow(lbI+1);
  else if(e.key==='ArrowLeft'&&lbList.length>1)lbShow(lbI-1);
  else if(e.key==='Tab'){
    const f=[...lb.querySelectorAll('button')].filter(b=>!b.hidden);
    const i=f.indexOf(document.activeElement);
    e.preventDefault();
    f[(i+(e.shiftKey?-1:1)+f.length)%f.length].focus();
  }
});

/* FEATURED FILM STRIP */

const stripEl=document.getElementById('strip');
const stripTrack=document.getElementById('stripTrack');
const stripNo=document.getElementById('stripNo');
const stripBar=document.getElementById('stripBar');

let stripEntries=[],stripDist=0,stripIdx=-1;

const swipeMQ=matchMedia('(max-width:760px)');

function capOf(p){
  return p.alt||(p.image||'').split('/').pop();
}

function buildStrip(){
  const list=photos.slice(1,9);
  stripTrack.innerHTML='';

  if(list.length<3){
    stripEl.hidden=true;
    return;
  }

  stripEl.hidden=false;
  setMode();

  stripEntries=list.map(p=>({p,thumb:null}));

  stripEntries.forEach((en,i)=>{
    const a=document.createElement('a');
    a.className='frame';
    a.href=pathFor(en.p.image);
    a.target='_blank';
    a.rel='noopener noreferrer';
    a.setAttribute('aria-label',capOf(en.p));

    const img=document.createElement('img');
    img.src=pathFor(en.p.image);
    img.alt=en.p.alt||'';
    img.decoding='async';
    img.onload=layoutStrip;
    img.onerror=()=>{
      a.style.display='none';
      layoutStrip();
    };

    en.thumb=img;
    a.addEventListener('click',e=>lbClick(e,stripEntries,i));
    a.appendChild(img);
    stripTrack.appendChild(a);
  });

  stripIdx=-1;
  layoutStrip();
}

function setMode(){
  const sw=swipeMQ.matches;

  stripEl.classList.toggle('swipe',sw);
  stripEl.classList.toggle('plain',still&&!sw);

  if(sw||still){
    stripEl.style.height='';
    stripTrack.style.transform='';
  }

  if(!sw)stripTrack.scrollLeft=0;
}

function setStripUI(pr){
  stripBar.style.transform=`scaleX(${pr.toFixed(4)})`;

  const n=stripEntries.length;
  const idx=Math.min(n-1,Math.round(pr*(n-1)));

  if(idx!==stripIdx){
    if(stripIdx!==-1)buzz(6);
    stripIdx=idx;
    stripNo.textContent=`${String(idx+1).padStart(2,'0')} / ${String(n).padStart(2,'0')}`;
  }
}

function swipeFrame(){
  const m=stripTrack.scrollWidth-stripTrack.clientWidth;
  setStripUI(m>0?Math.min(1,Math.max(0,stripTrack.scrollLeft/m)):0);
}

function layoutStrip(){
  if(stripEl.hidden)return;

  if(stripEl.classList.contains('swipe')){
    swipeFrame();
    return;
  }

  if(stripEl.classList.contains('plain'))return;

  stripDist=Math.max(0,stripTrack.scrollWidth-innerWidth);
  stripEl.style.height=(stripDist+innerHeight)+'px';
  stripFrame();
}

function stripFrame(){
  if(
    stripEl.hidden||
    stripEl.classList.contains('plain')||
    stripEl.classList.contains('swipe')
  )return;

  const r=stripEl.getBoundingClientRect();
  const span=r.height-innerHeight;
  const pr=span>0?Math.min(1,Math.max(0,-r.top/span)):0;

  stripTrack.style.transform=`translate3d(${(-pr*stripDist).toFixed(1)}px,0,0)`;
  stripBar.style.transform=`scaleX(${pr.toFixed(4)})`;

  const n=stripEntries.length;
  const idx=Math.min(n-1,Math.round(pr*(n-1)));

  if(idx!==stripIdx){
    stripIdx=idx;
    stripNo.textContent=`${String(idx+1).padStart(2,'0')} / ${String(n).padStart(2,'0')}`;
  }
}

stripTrack.addEventListener('scroll',()=>{
  if(stripEl.classList.contains('swipe'))swipeFrame();
},{passive:true});

const handleSwipeChange=()=>{
  stripIdx=-1;
  setMode();
  layoutStrip();
  stripFrame();
};
if(swipeMQ.addEventListener)swipeMQ.addEventListener('change',handleSwipeChange);
else if(swipeMQ.addListener)swipeMQ.addListener(handleSwipeChange);

/* DESKTOP VIEW CURSOR */

if(matchMedia('(hover:hover) and (pointer:fine)').matches&&!still){
  const cur=document.getElementById('cursor');

  let x=0,y=0,cx=0,cy=0,raf=0,seen=false;

  function loop(){
    cx+=(x-cx)*.2;
    cy+=(y-cy)*.2;

    cur.style.transform=`translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0)`;

    raf=(Math.abs(x-cx)>.2||Math.abs(y-cy)>.2)
      ?requestAnimationFrame(loop)
      :0;
  }

  addEventListener('pointermove',e=>{
    if(e.pointerType!=='mouse')return;

    x=e.clientX;
    y=e.clientY;

    if(!seen){
      seen=true;
      cx=x;
      cy=y;
      root.classList.add('cursor-on');
    }

    const hot=!lbOpen&&e.target.closest&&e.target.closest('.tile-visual a,.frame');
    cur.classList.toggle('big',!!hot);

    if(!raf)raf=requestAnimationFrame(loop);
  });

  document.addEventListener('mouseleave',()=>{
    cur.classList.remove('big');
  });
}

/* ABOUT: WORDS LIGHT UP AS YOU SCROLL */

const aboutP=document.getElementById('aboutText');

aboutP.innerHTML=aboutP.textContent.trim()
  .split(/\s+/)
  .map(w=>`<span class="w">${w}</span>`)
  .join(' ');

const words=[...aboutP.querySelectorAll('.w')];

/* SCROLL EFFECTS
   Gallery parallax has been removed.
   Gallery columns no longer move vertically.
*/

let ticking=false;

function frame(){
  ticking=false;

  const h=innerHeight;

  root.style.setProperty(
    '--p',
    Math.min(1,Math.max(0,scrollY/h)).toFixed(4)
  );

  if(themeMeta){
    themeMeta.content=scrollY<h*.6?'#0d0e10':'#f3f4f6';
  }

  /* Keep selected work stationary beneath its heading. */
  galleryEl.style.transform='none';

  galleryEl.querySelectorAll('.gallery-column').forEach(c=>{
    c.style.transform='';
  });

  stripFrame();

  const r=aboutP.getBoundingClientRect();
  const prog=Math.min(
    1,
    Math.max(0,(h*.85-r.top)/(r.height+h*.35))
  );

  const n=Math.round(prog*words.length);

  words.forEach((w,i)=>{
    w.classList.toggle('on',still||i<n);
  });
}

function tick(){
  if(!ticking){
    ticking=true;
    requestAnimationFrame(frame);
  }
}

addEventListener('scroll',tick,{passive:true});

if('IntersectionObserver' in window){
  new IntersectionObserver(([e])=>{
    document.getElementById('filters').classList.toggle('show',e.isIntersecting);
  },{rootMargin:'-15% 0px -10% 0px'}).observe(document.getElementById('work'));
}else{document.getElementById('filters').classList.add('show');}

let resizeFrame;

addEventListener('resize',()=>{
  cancelAnimationFrame(resizeFrame);

  resizeFrame=requestAnimationFrame(()=>{
    draw();
    layoutStrip();
    tick();
  });
});

document.getElementById('showMore').addEventListener('click',()=>{visibleLimit+=12;draw();});

/* CATEGORY FILTERS */

document.getElementById('filters').addEventListener('click',e=>{
  const button=e.target.closest('button[data-category]');
  if(!button)return;

  buzz(8);

  active=button.dataset.category;
  visibleLimit=12;

  document.querySelectorAll('.filter').forEach(b=>{
    b.classList.toggle('active',b===button);
  });

  draw();
  tick();
});

/* LOAD PHOTOGRAPHS */

const galleryUrl=location.protocol==='file:'?'https://kamila11441.github.io/jakub-draftrepo-filemanagementv4/content/gallery.json':new URL('content/gallery.json',new URL('.',location.href)).href;
async function fetchGallery(){
  let lastError;
  for(let attempt=0;attempt<3;attempt++){
    try{
      const response=await fetch(`${galleryUrl}?v=${Date.now()}&attempt=${attempt}`,{cache:'no-store'});
      if(!response.ok)throw Error('Could not load gallery (HTTP '+response.status+')');
      return await response.json();
    }catch(error){lastError=error;if(attempt<2)await new Promise(resolve=>setTimeout(resolve,400*(attempt+1)));}
  }
  throw lastError;
}
fetchGallery()
  .then(data=>{
    photos=Array.isArray(data)?data:(data.photos||[]);

    draw();
    buildStrip();

    if(photos[0]?.image){
      const hero=document.getElementById('heroImg');

      hero.onerror=()=>{hero.hidden=true;document.getElementById('heroPlaceholder').style.display='flex';};
      hero.src=pathFor(photos[0].image);
      hero.hidden=false;

      document.getElementById('heroPlaceholder').style.display='none';
    }

    tick();
  })
  .catch(err=>{
    console.error('Gallery could not be loaded:',err);

    photos=[];
    countEl.textContent='Unavailable';

    galleryEl.innerHTML=
      '<div class="empty">The gallery could not be loaded. Check that <code>content/gallery.json</code> exists in the published site.</div>';
  });

if(languageToggle)languageToggle.addEventListener('click',()=>{currentLanguage=currentLanguage==='en'?'pl':'en';setLanguage(currentLanguage)});
setLanguage(currentLanguage);
frame();
