import {captureAttribution,track,bindAnalytics} from './analytics.js';
const TELEGRAM='https://t.me/meetmind_app_bot';

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
    timer=setInterval(()=>{
      index=(index+1)%tabs.length;
      select(tabs[index],'auto');
    },3000);
  };

  tabs.forEach(tab=>tab.addEventListener('click',()=>{
    select(tab,'manual');
    start();
  }));

  const area=panel.closest('.usecase-layout')||panel.parentElement;
  area?.addEventListener('mouseenter',stop);
  area?.addEventListener('mouseleave',start);
  area?.addEventListener('focusin',stop);
  area?.addEventListener('focusout',e=>{
    if(!area.contains(e.relatedTarget))start();
  });

  document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
  start();
}

function initVideo(){
  const video=document.querySelector('[data-product-video]');
  if(!video)return;
  const source=video.querySelector('source');
  if(!source?.getAttribute('src'))return;
  video.load();
  video.addEventListener('error',()=>track('video_error'));
  video.addEventListener('play',()=>track('video_play'));
}

captureAttribution();
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
