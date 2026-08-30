const KEY='meetmind_landing_utm';
const GA_MEASUREMENT_ID='G-Q91DN4PQTY';

function initGA(){
  if(window.gtag)return;

  window.dataLayer=window.dataLayer||[];
  window.gtag=function(){window.dataLayer.push(arguments)};

  const script=document.createElement('script');
  script.async=true;
  script.src=`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.gtag('js',new Date());
  window.gtag('config',GA_MEASUREMENT_ID,{send_page_view:false});
}

function getVisitor(){
  let id=localStorage.getItem('meetmind_visitor_id');
  if(!id){
    id=crypto.randomUUID?.()||`web_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('meetmind_visitor_id',id);
  }
  return id;
}

export function captureAttribution(){
  const p=new URLSearchParams(location.search);
  const keys=['utm_source','utm_medium','utm_campaign','utm_term','utm_content','ref'];
  let data={};

  try{
    data=JSON.parse(localStorage.getItem(KEY)||'{}');
  }catch{}

  for(const k of keys){
    if(p.get(k))data[k]=p.get(k);
  }

  if(document.referrer&&!data.referrer)data.referrer=document.referrer;

  localStorage.setItem(KEY,JSON.stringify(data));
  return data;
}

function attrs(){
  try{
    return JSON.parse(localStorage.getItem(KEY)||'{}');
  }catch{
    return{};
  }
}

export function track(name,props={}){
  const event={
    event_name:name,
    client_timestamp:new Date().toISOString(),
    anonymous_id:getVisitor(),
    language:document.documentElement.lang||'en',
    page:location.pathname,
    ...attrs(),
    ...props
  };

  if(window.MEETMIND_ANALYTICS_DEBUG){
    console.info('[MeetMind landing]',event);
  }

  window.dispatchEvent(
    new CustomEvent('meetmind:analytics',{detail:event})
  );

  if(window.gtag){
    const {event_name,...gaParams}=event;
    window.gtag('event',name,gaParams);
  }

  return event;
}

export function bindAnalytics(){
  initGA();

  document.querySelectorAll('[data-track]').forEach(el=>
    el.addEventListener('click',()=>
      track(el.dataset.track,{
        href:el.getAttribute('href')||null
      })
    )
  );

  document.querySelectorAll('details').forEach(el=>
    el.addEventListener('toggle',()=>{
      if(el.open){
        track('faq_opened',{
          question:el.querySelector('summary')?.textContent?.trim()
        });
      }
    })
  );

  const seen=new Set();

  const obs=new IntersectionObserver(
    entries=>entries.forEach(e=>{
      if(e.isIntersecting&&e.target.id&&!seen.has(e.target.id)){
        seen.add(e.target.id);
        track('section_viewed',{section:e.target.id});
      }
    }),
    {threshold:.45}
  );

  document.querySelectorAll('main section[id]').forEach(s=>obs.observe(s));
}
