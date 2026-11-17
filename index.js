const galleryEl=document.getElementById('gallery');
const countEl=document.getElementById('count');
const workModal=document.getElementById('workModal');
const workModalGrid=document.getElementById('workModalGrid');
const workModalModel=document.getElementById('workModalModel');
const showMoreButton=document.getElementById('showMore');
const root=document.documentElement;

// Chrome may restore the browser's previous scroll offset while the pinned
// intro is being measured, leaving the scrubbed hero in its black end frame.
if('scrollRestoration' in history)history.scrollRestoration='manual';

let photos=[],active='all',visibleLimit=12,modalEntries=[],modalActive='all',modalActiveModel='';

const still=matchMedia('(prefers-reduced-motion:reduce)').matches;
const themeMeta=document.querySelector('meta[name="theme-color"]');

const languageToggle=document.getElementById('languageToggle');
const locale={en:{nav:['Work','About','Contact','Manage ↗'],brand:'Public portfolio',heroMeta:'@jakyb11 | Warsaw | Poland',heroPlaceholder:'Selected frame',irisKicker:'PHOTOGRAPHER · WARSAW, POLAND',irisTitle:'Jakub Kowalski',irisCopy:'Portraits, places and the quiet moments in between.',transitionCta:'Explore selected work ↓',navLabel:'Main navigation',featured:'Featured frames',count:'00 photographs',work:'Selected work',filters:['All','People','Events','Editorial','Other'],about:'Looking closer.',aboutText:'I’m Jakub, a photographer drawn to people, places and the quiet moments in between. My work explores the way light, atmosphere and human connection shape a story.',contactKicker:'Portraiture · Warsaw, Poland',contact:'Let’s talk.',contactText:'For commissions, collaborations or any inquiries, feel free to get in touch. I’m always open to new projects and ideas.',email:'Email',instagram:'Instagram',footer:'Independent photographer',top:'Back to top ↑',empty:'No photographs in this selection yet.',imageUnavailable:'Photo temporarily unavailable',view:'View',close:'Close',photographs:'photographs',showMore:'Show more',infoLabels:['Title','Model','Description','Date']},pl:{nav:['Prace','O mnie','Kontakt','Zarządzaj ↗'],brand:'Portfolio',heroMeta:'@jakyb11 | Warszawa | Polska',heroPlaceholder:'Wybrane zdjęcie',irisKicker:'FOTOGRAF · WARSZAWA, POLSKA',irisTitle:'Jakub Kowalski',irisCopy:'Portrety, miejsca i spokojne chwile pomiędzy.',transitionCta:'Zobacz wybrane prace ↓',navLabel:'Nawigacja główna',featured:'Wybrane kadry',count:'00 zdjęć',work:'Wybrane prace',filters:['Wszystkie','Ludzie','Wydarzenia','Edytorial','Inne'],about:'Patrzeć uważniej.',aboutText:'Jestem fotografem zainteresowanym ludźmi, miejscami i spokojnymi chwilami pomiędzy. W moich zdjęciach odkrywam, jak światło, atmosfera i relacje międzyludzkie budują opowieść.',contactKicker:'Portrety · Warszawa, Polska',contact:"Let's talk.",contactText:'W sprawie zleceń, współpracy lub pytań napisz do mnie. Chętnie podejmę nowe projekty i pomysły.',email:'E-mail',instagram:'Instagram',footer:'Niezależny fotograf',top:'Wróć na górę ↑',empty:'Brak zdjęć w tym wyborze.',imageUnavailable:'Zdjęcie chwilowo niedostępne',view:'Zobacz',close:'Zamknij',photographs:'zdjęć',showMore:'Pokaż więcej',infoLabels:['Tytuł','Model','Opis','Data']}};
locale.en.allModels='All models';
locale.pl.allModels='Wszystkie modele';
function setLanguage(lang){
  try{
  lang=locale[lang]?lang:'en';
  const t=locale[lang]||locale.en;
  document.documentElement.lang=lang in locale?lang:'en';
  const put=(selector,value)=>{const el=document.querySelector(selector);if(el)el.textContent=value;};
  const attr=(selector,name,value)=>{const el=document.querySelector(selector);if(el)el.setAttribute(name,value);};
  if(languageToggle){languageToggle.textContent=lang==='en'?'PL':'EN';languageToggle.setAttribute('aria-label',lang==='en'?'Przełącz język na polski':'Switch language to English');}
  put('.bar>span',t.brand);attr('.bar nav','aria-label',t.navLabel);put('#irisKicker',t.irisKicker);put('#irisTitle',t.irisTitle);put('#irisCopy',t.irisCopy);put('#transitionCta',t.transitionCta);attr('.strip','aria-label',t.featured);put('#count',t.count);
  document.querySelectorAll('.bar nav a').forEach((a,i)=>{if(t.nav[i])a.textContent=t.nav[i];});
  put('.work-head h2',t.work);put('#workModalTitle',t.work);put('#workModalEyebrow',lang==='pl'?'PEŁNE ARCHIWUM':'COMPLETE ARCHIVE');put('#closeWorkModal',`${t.close} ×`);document.querySelectorAll('.filter').forEach((b,i)=>{if(t.filters[i])b.textContent=t.filters[i];});
  document.querySelectorAll('.work-modal-filter').forEach((b,i)=>{if(t.filters[i])b.textContent=t.filters[i];});
  const allModelsOption=document.getElementById('workModalModelAll');if(allModelsOption)allModelsOption.textContent=t.allModels;
  const modelFilter=document.getElementById('workModalModel');if(modelFilter)modelFilter.setAttribute('aria-label',lang==='pl'?'Filtruj według modelu':'Filter by model');
  put('.about h2',t.about);put('#aboutText',t.aboutText);put('.contact-kicker',t.contactKicker);put('.contact h2',t.contact);put('.panel-row p',t.contactText);
  const links=document.querySelectorAll('.links a');if(links[0])links[0].textContent=t.email;if(links[1])links[1].textContent=t.instagram;
  put('#showMore',t.showMore);put('.footer a',t.top);put('.cursor i',t.view);put('.lb-close',t.close);attr('.lb','aria-label',lang==='en'?'Photograph viewer':'Przeglądarka zdjęć');
  try{localStorage.setItem('jk-portfolio-language',document.documentElement.lang);}catch(e){}
  }catch(error){console.error('Language update failed:',error);}
}
let currentLanguage=(()=>{try{return localStorage.getItem('jk-portfolio-language')==='pl'?'pl':'en'}catch(e){return'en'}})();
document.querySelector('.footer a[href="#top"]').addEventListener('click',e=>{e.preventDefault();window.scrollTo({top:0,behavior:still?'auto':'smooth'});history.replaceState(null,'',location.pathname+location.search)});


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
  const previousRects=new Map([...galleryEl.querySelectorAll('.tile')].map(tile=>[tile.dataset.key,tile.getBoundingClientRect()]));
  if(window.ScrollTrigger){
    ScrollTrigger.getAll().forEach(trigger=>{
      if(trigger.trigger&&galleryEl.contains(trigger.trigger))trigger.kill();
    });
  }
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
    if(window.ScrollTrigger)requestAnimationFrame(()=>ScrollTrigger.refresh());
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
    tile.dataset.key=p.image;

    const visual=document.createElement('div');
    visual.className='tile-visual';
    const lakePortrait=p.image.includes('DSC_0903-6.JPG');
    if(lakePortrait)visual.classList.add('lake-emerge');

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
    if(lakePortrait){const waterline=document.createElement('span');waterline.className='lake-waterline';waterline.setAttribute('aria-hidden','true');visual.appendChild(waterline);}
    tile.appendChild(visual);

    const details=metadataFor(p);
    if(details.length){const info=document.createElement('div');info.className='tile-info';details.forEach(([label,value])=>{const row=document.createElement('div');row.className='meta-row';const key=document.createElement('strong');key.textContent=label+':';const text=document.createElement('span');text.textContent=value;row.append(key,text);info.appendChild(row);});tile.appendChild(info);}

    columns[i%columnCount].appendChild(tile);

    if(io)io.observe(tile);
    else tile.classList.add('in');
  });
  if(window.gsap&&!still){
    const tiles=[...galleryEl.querySelectorAll('.tile')];
    tiles.forEach((tile,i)=>{
      const old=previousRects.get(tile.dataset.key);
      if(old){
        const now=tile.getBoundingClientRect(),delta=old.top-now.top;
        if(Math.abs(delta)>2)gsap.fromTo(tile,{y:delta},{y:0,duration:.65,ease:'power2.out',overwrite:true});
      }else{
        const columnStagger=(i%columnCount)*3;
        gsap.fromTo(tile,
          {y:64,opacity:0,clipPath:'inset(0% 0% 9% 0%)'},
          {y:0,opacity:1,clipPath:'inset(0% 0% 0% 0%)',ease:'none',
            scrollTrigger:{trigger:tile,start:`top ${92-columnStagger}%`,end:'top 54%',scrub:.75,invalidateOnRefresh:true}}
        );
      }
      const img=tile.querySelector('img');
      if(img&&!tile.querySelector('.lake-emerge'))gsap.to(img,{yPercent:7,ease:'none',scrollTrigger:{trigger:tile,start:'top bottom',end:'bottom top',scrub:.7}});
    });
    galleryEl.querySelectorAll('.lake-emerge').forEach(visual=>{
      const image=visual.querySelector('img');
      const waterline=visual.querySelector('.lake-waterline');
      gsap.timeline({scrollTrigger:{trigger:visual,start:'top 88%',end:'center 45%',scrub:.7,invalidateOnRefresh:true}})
        .fromTo(image,{clipPath:'inset(100% 0% 0% 0%)',yPercent:12,scale:1.12},{clipPath:'inset(0% 0% 0% 0%)',yPercent:0,scale:1,duration:1,ease:'none'},0)
        .fromTo(waterline,{bottom:'0%',opacity:0},{bottom:'100%',opacity:.9,duration:.82,ease:'none'},.08)
        .to(waterline,{opacity:0,duration:.16,ease:'none'},.78);
    });
  }
  if(window.ScrollTrigger)requestAnimationFrame(()=>ScrollTrigger.refresh());
}

function populateWorkModal(){
  workModalGrid.innerHTML='';
  modalEntries=photos.map(p=>({p,thumb:null,item:null}));
  const t=locale[currentLanguage]||locale.en;
  const models=new Map();
  photos.forEach(p=>{
    const name=String(p.model||'').trim();
    if(name&&!models.has(name.toLocaleLowerCase()))models.set(name.toLocaleLowerCase(),name);
  });
  const allOption=document.createElement('option');
  allOption.id='workModalModelAll';allOption.value='';allOption.textContent=t.allModels;
  workModalModel.replaceChildren(allOption);
  [...models.entries()].sort((a,b)=>a[1].localeCompare(b[1],currentLanguage)).forEach(([key,name])=>{
    const option=document.createElement('option');option.value=key;option.textContent=name;workModalModel.appendChild(option);
  });
  workModalModel.disabled=models.size===0;

  modalEntries.forEach((entry,i)=>{
    const p=entry.p;
    const item=document.createElement('article');
    item.className='work-modal-item';
    item.dataset.category=String(p.category||'other').toLowerCase();
    entry.item=item;
    const visual=document.createElement('div');
    visual.className='work-modal-visual';
    const link=document.createElement('a');
    link.href=pathFor(p.image);
    link.setAttribute('aria-label',`${t.view} ${i+1} / ${photos.length}`);
    const img=document.createElement('img');
    img.src=pathFor(p.image);
    img.alt=p.alt||'';
    img.loading='lazy';
    img.decoding='async';
    img.onerror=()=>{img.hidden=true;};
    entry.thumb=img;
    link.addEventListener('click',e=>{
      if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button)return;
      e.preventDefault();
      const visibleEntries=modalEntries.filter(candidate=>{
        const category=String(candidate.p.category||'other').toLowerCase();
        const model=String(candidate.p.model||'').trim().toLocaleLowerCase();
        return(modalActive==='all'||category===modalActive)&&(!modalActiveModel||model===modalActiveModel);
      });
      const visibleIndex=visibleEntries.indexOf(entry);
      workModal.close();
      requestAnimationFrame(()=>openLB(visibleEntries,visibleIndex));
    });
    link.appendChild(img);
    visual.appendChild(link);
    item.appendChild(visual);

    const details=metadataFor(p);
    if(details.length){
      const info=document.createElement('div');
      info.className='work-modal-info';
      details.forEach(([label,value])=>{
        const row=document.createElement('div');row.className='meta-row';
        const key=document.createElement('strong');key.textContent=label+':';
        const text=document.createElement('span');text.textContent=value;
        row.append(key,text);info.appendChild(row);
      });
      item.appendChild(info);
    }
    workModalGrid.appendChild(item);
  });
  applyWorkModalFilter();
}

function applyWorkModalFilter(){
  let visible=0;
  modalEntries.forEach(entry=>{
    const model=String(entry.p.model||'').trim().toLocaleLowerCase();
    const show=(modalActive==='all'||entry.item?.dataset.category===modalActive)&&(!modalActiveModel||model===modalActiveModel);
    if(entry.item)entry.item.hidden=!show;
    if(show)visible++;
  });
  const t=locale[currentLanguage]||locale.en;
  document.getElementById('workModalCount').textContent=`${visible} ${t.photographs}`;
}

function openWorkModal(){
  modalActive='all';
  modalActiveModel='';
  document.querySelectorAll('.work-modal-filter').forEach((button,index)=>{
    button.classList.toggle('active',index===0);
    button.setAttribute('aria-pressed',String(index===0));
  });
  populateWorkModal();
  root.classList.add('lock');
  if(lenis)lenis.stop();
  if(!workModal.open)workModal.showModal();
  document.getElementById('closeWorkModal').focus({preventScroll:true});
}

showMoreButton.addEventListener('click',openWorkModal);
document.getElementById('closeWorkModal').addEventListener('click',()=>workModal.close());
workModal.addEventListener('close',()=>{if(lenis)lenis.start();});
workModal.addEventListener('close',()=>root.classList.remove('lock'));
workModal.addEventListener('click',e=>{if(e.target===workModal)workModal.close();});
document.getElementById('workModalFilters').addEventListener('click',e=>{
  const button=e.target.closest('.work-modal-filter');
  if(!button)return;
  modalActive=button.dataset.category;
  document.querySelectorAll('.work-modal-filter').forEach(candidate=>{
    const selected=candidate===button;
    candidate.classList.toggle('active',selected);
    candidate.setAttribute('aria-pressed',String(selected));
  });
  applyWorkModalFilter();
  document.querySelector('.work-modal-scroll').scrollTop=0;
});
workModalModel.addEventListener('change',()=>{
  modalActiveModel=workModalModel.value;
  applyWorkModalFilter();
  document.querySelector('.work-modal-scroll').scrollTop=0;
});

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

let lenis=null;
if(!still&&window.Lenis){
  try{
    lenis=new Lenis({duration:1.05,smoothWheel:true,syncTouch:false,gestureOrientation:'vertical'});
    lenis.on('scroll',()=>{tick();if(window.ScrollTrigger)ScrollTrigger.update();});
    if(window.gsap){gsap.ticker.add(t=>lenis.raf(t*1000));gsap.ticker.lagSmoothing(0);}
    window.portfolioLenis=lenis;
  }catch(error){console.warn('Smooth scrolling unavailable:',error);}
}
if(!still&&window.gsap&&window.ScrollTrigger){
  gsap.registerPlugin(ScrollTrigger);
  root.classList.add('gsap-ready');
  const ctaWrap=document.querySelector('.transition-cta');
  const ctaLink=document.getElementById('transitionCta');
  const setTransitionCta=visible=>{
    if(ctaWrap)ctaWrap.classList.toggle('is-visible',visible);
    if(ctaLink){ctaLink.tabIndex=visible?0:-1;ctaLink.setAttribute('aria-hidden',String(!visible));}
  };
  gsap.timeline({scrollTrigger:{trigger:'#top',start:'top top',end:'+=165%',pin:true,pinSpacing:true,scrub:.75,anticipatePin:1,invalidateOnRefresh:true,onUpdate:self=>setTransitionCta(self.progress>=.68&&self.progress<1)}})
    .to('.hero-iris',{scale:1.04,duration:.18,ease:'none'},0)
    .fromTo('.iris-copy',{y:34,opacity:0},{y:0,opacity:1,duration:.16,ease:'none'},.18)
    .to('.iris-copy',{y:-28,opacity:0,duration:.12,ease:'none'},.54)
    .to('.hero-iris',{scale:14,duration:.68,ease:'none'},.18)
    .to('.hero-iris',{opacity:0,duration:.14,ease:'none'},.88);

  const eyeVideo=document.querySelector('.contact-eye-video');
  const contactStage=document.querySelector('.contact-panel-stage');
  const blackout=document.querySelector('.contact-eye-blackout');
  const isChrome=/Chrome|Chromium/.test(navigator.userAgent)&&!/Edg|OPR/.test(navigator.userAgent);
  const eyeScrub=isChrome ? 0.12 : 0.7;
  let eyeTrigger,videoPriming=false;
  const primeEyeVideo=()=>{
    if(!eyeVideo||videoPriming||eyeVideo.dataset.primed)return;
    videoPriming=true;
    const playback=eyeVideo.play();
    if(playback&&typeof playback.then==='function'){
      playback.then(()=>{
        eyeVideo.pause();
        eyeVideo.dataset.primed='true';
        videoPriming=false;
        if(eyeTrigger)updateEyeTransition(eyeTrigger);
      }).catch(()=>{videoPriming=false;});
    }else{
      eyeVideo.pause();
      eyeVideo.dataset.primed='true';
      videoPriming=false;
    }
  };
  const updateEyeTransition=self=>{
    const progress=self.progress;
    const reveal=Math.max(0,Math.min(1,(progress-.72)/.16));
    if(contactStage){
      contactStage.style.pointerEvents=reveal>.98?'auto':'none';
      contactStage.inert=reveal<.98;
      contactStage.setAttribute('aria-hidden',String(reveal<.98));
    }
  };
  const eyeTimeline=gsap.timeline({scrollTrigger:{trigger:'#contact-eye',start:'top top',end:'+=140%',pin:true,pinSpacing:true,scrub:eyeScrub,anticipatePin:1,invalidateOnRefresh:true,onEnter:primeEyeVideo,onUpdate:updateEyeTransition,onRefresh:updateEyeTransition}});
  eyeTrigger=eyeTimeline.scrollTrigger;
  eyeVideo?.addEventListener('loadedmetadata',()=>{
    if(Number.isFinite(eyeVideo.duration)&&eyeVideo.duration>0){
      eyeTimeline
        .to(eyeVideo,{currentTime:eyeVideo.duration,duration:.72,ease:'none'},0)
        .fromTo(blackout,{opacity:0},{opacity:1,duration:.2,ease:'none'},.52)
        .fromTo(contactStage,{opacity:0},{opacity:1,duration:.16,ease:'none'},.72)
        .to({}, {duration:.12},.88);
    }
    ScrollTrigger.refresh();
    if(eyeTrigger)updateEyeTransition(eyeTrigger);
  },{once:true});
  eyeVideo?.addEventListener('loadeddata',()=>{if(eyeTrigger)updateEyeTransition(eyeTrigger);if(eyeTrigger?.isActive)primeEyeVideo();},{once:true});
  eyeVideo?.addEventListener('canplay',()=>{if(eyeTrigger)updateEyeTransition(eyeTrigger);},{once:true});
  eyeVideo?.load();

  document.querySelectorAll('a[href="#contact-panel"]').forEach(link=>link.addEventListener('click',event=>{
    event.preventDefault();
    const destination=eyeTrigger.end;
    if(lenis)lenis.scrollTo(destination,{duration:.9});
    else scrollTo({top:destination,behavior:still?'auto':'smooth'});
    history.replaceState(null,'','#contact-panel');
  }));

  gsap.fromTo('.work-head',{y:48,opacity:0},{y:0,opacity:1,ease:'none',scrollTrigger:{trigger:'.work-head',start:'top 88%',end:'top 50%',scrub:.75,invalidateOnRefresh:true}});
}
window.addEventListener('pageshow',()=>{
  if(location.hash!=='#top')return;
  if(lenis)lenis.scrollTo(0,{immediate:true});
  else window.scrollTo(0,0);
  if(window.ScrollTrigger)requestAnimationFrame(()=>ScrollTrigger.refresh());
},{once:true});
if(still||!window.gsap||!window.ScrollTrigger){
  const panel=document.querySelector('.contact-panel-stage');
  const video=document.querySelector('.contact-eye-video');
  const scene=document.querySelector('.contact-eye-scene');
  const blackout=document.querySelector('.contact-eye-blackout');
  if(panel){panel.inert=false;panel.setAttribute('aria-hidden','false');panel.style.opacity='1';panel.style.pointerEvents='auto';}
  // If an animation library fails to load (or motion is reduced), keep the eye
  // poster visible as a still image instead of leaving a blank black scene.
  if(video)video.style.display='none';
  if(scene){scene.style.height='auto';scene.style.minHeight='0';scene.style.paddingTop='45svh';scene.style.backgroundSize='100% 45svh';scene.style.backgroundPosition='top center';}
  if(panel){panel.style.position='relative';panel.style.inset='auto';panel.style.minHeight='100svh';panel.style.background='var(--ink)';}
  if(blackout)blackout.style.opacity='0';
}
let ticking=false;

function frame(){
  ticking=false;

  const h=innerHeight;

  root.style.setProperty(
    '--p',
    Math.min(1,Math.max(0,(lenis?lenis.scroll:scrollY)/h)).toFixed(4)
  );

  if(themeMeta){
    themeMeta.content=scrollY<h*(root.classList.contains('gsap-ready')?1.8:.6)?'#0d0e10':'#f3f4f6';
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

/* Show more opens the complete collection in the accessible work dialog. */

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
    if(window.ScrollTrigger)ScrollTrigger.refresh();

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
