import {captureAttribution,track,bindAnalytics} from './analytics.js';
const TELEGRAM='https://t.me/meetmind_app_bot';
const TELEGRAM_REPORT_FALLBACK='https://raw.githubusercontent.com/meetmind-app/meetmind-landing/853e3e0481c56c726a094360b9c64e728ccb0dbd/assets/product/9A103CB6-3894-42B3-A2A0-2BA4E09415FC.png';

function initProductImages(){
  document.querySelectorAll('img').forEach(img=>{
    const src=img.getAttribute('src')||'';
    if(src.includes('assets/product/telegram-report.webp')){
      img.src=TELEGRAM_REPORT_FALLBACK;
      img.addEventListener('error',()=>track('product_image_error',{asset:'telegram-report'}),{once:true});
    }
  });
}

function initHeroLabels(){
  const style=document.createElement('style');
  style.textContent=`
    .hero-stage .floating-tag{z-index:8!important;background:#fff!important;color:#172033!important;border:2px solid rgba(109,74,255,.32)!important;box-shadow:0 10px 28px rgba(15,23,42,.18)!important;font-size:13px!important;font-weight:900!important;padding:10px 14px!important;letter-spacing:-.01em}
    .hero-stage .tag-web{border-color:rgba(37,99,235,.35)!important}
    .hero-stage .tag-tg{border-color:rgba(22,163,106,.42)!important}
    .hero-stage .tag-pdf{border-color:rgba(109,74,255,.42)!important}
    @media(max-width:760px){
      .hero-stage .floating-tag{display:block!important;font-size:11px!important;padding:7px 10px!important;white-space:nowrap!important}
      .hero-stage .tag-web{inset-inline-end:1%!important;inset-block-start:1%!important}
      .hero-stage .tag-tg{inset-inline-start:1%!important;inset-block-end:35%!important}
      .hero-stage .tag-pdf{inset-inline-start:29%!important;inset-block-end:28%!important}
    }
  `;
  document.head.appendChild(style);
}

function initKeyboardNavigation(){
  const onKey=e=>{if(e.key==='Tab')document.body.classList.add('keyboard-nav')};
  const onPointer=()=>document.body.classList.remove('keyboard-nav');
  window.addEventListener('keydown',onKey,{passive:true});
  window.addEventListener('pointerdown',onPointer,{passive:true});
}

function initTelegram(){
  const id=localStorage.getItem('meetmind_visitor_id')||'';
  const q=new URLSearchParams(location.search);
  const campaign=q.get('utm_campaign')||q.get('ref')||'';
  const start=[id,campaign].filter(Boolean).join('_').slice(0,60);
  document.querySelectorAll('[data-telegram]').forEach(a=>{
    a.href=start?`${TELEGRAM}?start=${encodeURIComponent(start)}`:TELEGRAM;
    a.target='_blank';
    a.rel='noopener noreferrer';
  });
}

function initHeader(){
  const menu=document.querySelector('[data-nav]'),burger=document.querySelector('[data-mobile-menu]');
  burger?.addEventListener('click',()=>{
    const open=menu.classList.toggle('mobile-open');
    burger.setAttribute('aria-expanded',String(open));
  });
  menu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>menu.classList.remove('mobile-open')));
}

function initLanguages(){
  const wrap=document.querySelector('[data-language]'),btn=wrap?.querySelector('button'),menu=wrap?.querySelector('[role="menu"]');
  if(!wrap||!btn||!menu)return;
  btn.addEventListener('click',()=>{
    const open=menu.hidden;
    menu.hidden=!open;
    btn.setAttribute('aria-expanded',String(open));
  });
  document.addEventListener('click',e=>{
    if(!wrap.contains(e.target)){
      menu.hidden=true;
      btn.setAttribute('aria-expanded','false');
    }
  });
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
    track('language_selected',{target_language:a.dataset.locale});
    const current=new URL(location.href);
    const target=new URL(a.href,location.href);
    for(const [k,v] of current.searchParams){
      if(k.startsWith('utm_')||k==='ref')target.searchParams.set(k,v);
    }
    a.href=target.href;
  }));
}

function initLanguageBand(){
  const band=document.querySelector('.language-band');
  if(!band)return;
  const text=band.querySelector('span');
  if(!text||text.classList.contains('language-list'))return;
  const flags={
    'Русский':'🇷🇺','English':'🇬🇧','Español':'🇪🇸','Português (Brasil)':'🇧🇷',
    'Türkçe':'🇹🇷','Bahasa Indonesia':'🇮🇩','हिन्दी':'🇮🇳','العربية':'🇸🇦',
    'O‘zbek':'🇺🇿','فارسی':'🇮🇷'
  };
  const names=text.textContent.split('·').map(x=>x.trim()).filter(Boolean);
  text.className='language-list';
  text.textContent='';
  names.forEach(name=>{
    const item=document.createElement('span');
    item.className='language-item';
    item.textContent=`${flags[name]||''} ${name}`.trim();
    text.appendChild(item);
  });
}

function initReveal(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){
    document.querySelectorAll('.reveal').forEach(x=>x.classList.add('is-visible'));
    return;
  }
  const io=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('is-visible');
      io.unobserve(e.target);
    }
  }),{threshold:.11});
  document.querySelectorAll('.reveal').forEach(x=>io.observe(x));
}

function initUseCases(){
  const tabs=[...document.querySelectorAll('[data-usecase-tab]')];
  const panel=document.querySelector('[data-usecase-panel]');
  if(!tabs.length||!panel)return;
  let index=Math.max(0,tabs.findIndex(t=>t.getAttribute('aria-selected')==='true'));
  let timer=null;
  const select=(tab,source='auto')=>{
    tabs.forEach(t=>t.setAttribute('aria-selected','false'));
    tab.setAttribute('aria-selected','true');
    panel.querySelector('h3').textContent=tab.dataset.title;
    panel.querySelector('p').textContent=tab.dataset.text;
    const keys=(tab.dataset.keywords||'').split('|').filter(Boolean);
    panel.querySelector('.usecase-keywords').innerHTML=keys.map(k=>`<span>${k}</span>`).join('');
    index=tabs.indexOf(tab);
    if(source==='manual')track('usecase_selected',{usecase:tab.dataset.key});
  };
  const stop=()=>{if(timer){clearInterval(timer);timer=null}};
  const start=()=>{
    stop();
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    timer=setInterval(()=>{index=(index+1)%tabs.length;select(tabs[index],'auto')},3000);
  };
  tabs.forEach(tab=>tab.addEventListener('click',()=>{select(tab,'manual');start()}));
  const area=panel.closest('.usecase-layout')||panel.parentElement;
  area?.addEventListener('mouseenter',stop);
  area?.addEventListener('mouseleave',start);
  area?.addEventListener('focusin',stop);
  area?.addEventListener('focusout',e=>{if(!area.contains(e.relatedTarget))start()});
  document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
  start();
}

function initVideo(){
  const frame=document.querySelector('.demo-frame');
  if(!frame)return;
  const oldImg=frame.querySelector('img');
  const oldPlay=frame.querySelector('.demo-play');
  const badge=frame.querySelector('.demo-badge');
  const video=document.createElement('video');
  video.setAttribute('playsinline','');
  video.setAttribute('muted','');
  video.muted=true;
  video.controls=true;
  video.preload='auto';
  video.poster='assets/poster/product-demo-poster-light.webp';
  video.dataset.productVideo='';
  const source=document.createElement('source');
  source.src='assets/video/lorevi-demo.mp4';
  source.type='video/mp4';
  video.appendChild(source);
  oldImg?.replaceWith(video);
  oldPlay?.remove();
  if(badge)badge.textContent='Product demo · 24 sec';
  const tryPlay=()=>{
    const p=video.play();
    if(p?.catch)p.catch(()=>{});
  };
  video.addEventListener('canplay',tryPlay,{once:true});
  video.addEventListener('loadeddata',tryPlay,{once:true});
  video.addEventListener('error',()=>track('video_error'));
  video.addEventListener('play',()=>track('video_play'),{once:true});
  video.load();
}

captureAttribution();
initProductImages();
initHeroLabels();
initKeyboardNavigation();
initTelegram();
initHeader();
initLanguages();
initLanguageBand();
initReveal();
initUseCases();
initVideo();
bindAnalytics();
track('page_view');
