'use strict';
/* =====================================================================
   BRAIN ROT APP
   ===================================================================== */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const rf=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>{n=Math.max(0,Math.round(n));if(n>=1e6){const v=n/1e6;return (v>=10?v.toFixed(0):v.toFixed(1)).replace(/\.0$/,'')+'M'}if(n>=1e4)return (n/1e3).toFixed(0)+'K';if(n>=1e3)return (n/1e3).toFixed(1).replace(/\.0$/,'')+'K';return String(n)};
const comma=n=>Math.round(n).toLocaleString('en-US');
const avBg=h=>`hsl(${hashStr(h)%360} 62% 42%)`;
const uid=()=>Math.random().toString(36).slice(2,9);
const repop=(el,cls='pop')=>{if(!el)return;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls)};
const ago=ts=>{const s=(Date.now()-ts)/1000;if(s<60)return 'now';if(s<3600)return Math.floor(s/60)+'m';if(s<86400)return Math.floor(s/3600)+'h';return Math.floor(s/86400)+'d'};
const store={get(k,d){try{const v=localStorage.getItem('brainrot_'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem('brainrot_'+k,JSON.stringify(v))}catch(e){}},clear(){try{Object.keys(localStorage).filter(k=>k.startsWith('brainrot_')).forEach(k=>localStorage.removeItem(k))}catch(e){}}};

/* ---------------- state ---------------- */
const DEF_SET={tvVoice:'en',sound:true,voices:true,music:true,sfx:true,vVol:.9,mVol:.5,fVol:.8,vSpeed:1,vPitch:1,subs:'en',textSize:'m',reduceMotion:false,autoScroll:false,hideDark:false,restricted:false,private:false,comments:'everyone',dms:'everyone',gifts:'everyone',activity:true,publicLikes:false,hideCounts:false,nLikes:true,nComments:true,nFollows:true,nLive:true,nMentions:true,limit:0,breaks:0};
const SET=Object.assign({},DEF_SET,store.get('set',{}));
const saveSet=()=>store.set('set',SET);
const today=()=>new Date().toDateString();
const S={coins:store.get('coins',500),following:store.get('following',[]),posts:store.get('posts',[]),spent:store.get('spent',0),me:Object.assign({av:'🫠',handle:'you',name:'You',bio:'Certified scroller. Professional rotter.'},store.get('me',{})),followers:store.get('followers',3),bonusDay:store.get('bonusDay',''),liked:store.get('liked',[]),saved:store.get('saved',[]),blocked:store.get('blocked',[]),hidden:store.get('hidden',[]),txns:store.get('txns',[]),dms:store.get('dms',null),dmUnread:store.get('dmUnread',{}),rot:store.get('rot',{day:today(),ms:0}),loggedOut:store.get('loggedOut',false),gifted:store.get('gifted',[])};
const SAVE_KEYS=['coins','following','posts','spent','me','followers','bonusDay','liked','saved','blocked','hidden','txns','dms','dmUnread','rot','loggedOut','gifted'];
const save=()=>SAVE_KEYS.forEach(k=>store.set(k,S[k]));
if(S.rot.day!==today())S.rot={day:today(),ms:0,warned:0};
const meH=()=>S.me.handle,meAt=()=>'@'+S.me.handle;
const isFollowing=h=>S.following.some(f=>f.h===h);
const isBlocked=h=>S.blocked.includes(h);
const room=$('#room');

/* ---------------- toast / coins ---------------- */
let toastT;function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>el.classList.remove('show'),2200)}
function updCoins(){$$('.coinval').forEach(e=>e.textContent=comma(S.coins));$$('.gift').forEach(g=>g.classList.toggle('poor',+g.dataset.c>S.coins))}
function addTxn(label,amount,e){S.txns.unshift({ts:Date.now(),label,amount,e:e||'🪙'});if(S.txns.length>80)S.txns.length=80}
function addCoins(n,why){S.coins+=n;addTxn(why,n,'🪙');save();updCoins()}

/* =====================================================================
   SOUND UI
   ===================================================================== */
function setSoundUI(){
  const on=SET.sound;
  $$('.sndb').forEach(b=>{b.classList.toggle('on',on);b.classList.toggle('off',!on);b.setAttribute('aria-label',on?'Mute sound':'Turn sound on');b.innerHTML=on?'<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>':'<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>'});
}
function soundOn(){SET.sound=true;saveSet();setSoundUI();return AU.unlock().then(ok=>{if(!ok){toast('Your browser blocked sound. Tap the speaker again and check your volume.');return false}AU.applyVol();updPlay(true);return true})}
function soundOff(){SET.sound=false;saveSet();setSoundUI();AU.cut();Music.stop();if(AU.el)try{AU.el.pause()}catch(e){}}
document.addEventListener('click',e=>{const b=e.target.closest('.sndb');if(!b)return;if(SET.sound&&AU.ok()){soundOff();toast('Sound off')}else soundOn().then(ok=>{if(ok){AU.sfx('tada');if(Room.L)api.say(`Oh! Hello ${meAt()}! Can you hear me now?`);toast('Sound on. On iPhone, flip the silent switch off.')}})});
['pointerdown','touchend','keydown'].forEach(ev=>document.addEventListener(ev,()=>{if(SET.sound&&AU.ctx&&AU.ctx.state!=='running')AU.unlock()},{capture:true,passive:true}));

/* =====================================================================
   STORY ENGINE
   ===================================================================== */
const I={
 heart:'<svg viewBox="0 0 24 24"><path d="M12 21s-7.6-4.6-9.6-9.4C.9 7.9 3.4 4.4 7 4.4c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.6 0 6.1 3.5 4.6 7.2C19.6 16.4 12 21 12 21z"/></svg>',
 comment:'<svg viewBox="0 0 24 24"><path d="M12 3.4c5.1 0 9.2 3.5 9.2 7.8S17.1 19 12 19c-1 0-2-.1-3-.4l-5.2 2.1 1.4-4.3C3.8 15 2.8 13.2 2.8 11.2 2.8 6.9 6.9 3.4 12 3.4z"/></svg>',
 save:'<svg viewBox="0 0 24 24"><path d="M6 3.5h12a1 1 0 0 1 1 1V21l-7-4.6L5 21V4.5a1 1 0 0 1 1-1z"/></svg>',
 gift:'<svg viewBox="0 0 24 24"><g class="st"><rect x="4" y="10" width="16" height="10.5" rx="1.5"/><rect x="3" y="7" width="18" height="3.5" rx="1"/><path d="M12 7v13.5M12 7c-1.4-2.8-4.6-3.2-5-1.4S9.2 7 12 7zm0 0c1.4-2.8 4.6-3.2 5-1.4S14.8 7 12 7z"/></g></svg>',
 share:'<svg viewBox="0 0 24 24"><path d="M13.2 4.6 21.4 12l-8.2 7.4v-4.2c-5.3 0-8.4 1.4-10.6 5.1 0-6.3 3.3-11.4 10.6-11.4z"/></svg>',
 pause:'<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
 note:'<svg viewBox="0 0 24 24"><path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/></svg>',
 eye:'<svg viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
 sheart:'<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.3-8.9-8.7C1.7 7.8 4 4.6 7.3 4.6c1.9 0 3.3 1 4.7 2.8 1.4-1.8 2.8-2.8 4.7-2.8 3.3 0 5.6 3.2 4.2 6.7C19 15.7 12 20 12 20z"/></svg>',
 back:'<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
 chev:'<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>',
 dots:'<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>',
 menu:'<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
 lock:'<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
 search:'<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>',
 play:'<svg viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z"/></svg>',
 x:'<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>'
};
const BEHIND=['table','stars','sun'];
function storyHTML(v){
  const ovs=new Set(v.ov||[]);v.beats.forEach(b=>(b.ov||[]).forEach(o=>ovs.add(o)));
  const ovHTML=k=>[...ovs].filter(o=>BEHIND.includes(o)===k).map(o=>`<div class="ov ov-${o}" data-ov="${o}"></div>`).join('');
  const deco=(v.deco||[]).map(d=>`<span class="dc" style="left:${d[1]}%;top:${d[2]}%;font-size:${Math.round(96*(d[3]||1))}px;opacity:${d[4]??1}">${d[0]}</span>`).join('');
  let acts='',i=0;for(const k in v.cast){acts+=`<span class="ac" data-k="${k}"><i style="animation-delay:${(-i*.7).toFixed(1)}s">${v.cast[k].e}</i></span>`;i++}
  return `<div class="shk"><div class="cam"><div class="sbg"></div>${ovHTML(true)}<div class="decos">${deco}</div><div class="amb"></div><div class="crowd"></div>${acts}${ovHTML(false)}<div class="parts"></div></div></div>
  <div class="tt2" hidden></div><div class="hud" hidden><b></b><div class="hb"><i></i><span></span></div></div><div class="tmr" hidden></div>
  <div class="ttl2"></div><div class="sub2"></div><div class="bub2"></div><div class="imp"></div>
  <div class="lbx t"></div><div class="lbx b"></div><div class="cov"><span></span></div><div class="fl"></div><div class="smo">SLOW MO</div>${v.tv?`<div class="tvfx"><div class="scan"></div><div class="chn"><b>CH ${v.ch}</b><span>${esc(v.show)}</span></div><div class="static"></div></div>`:''}`;
}
function legacyHTML(v){
  const mt=v.top?`<div class="mt">${esc(v.top)}</div>`:'',mb=v.bottom?`<div class="mb">${esc(v.bottom)}</div>`:'';
  if(v.kind==='rain'){let d='';for(let i=0;i<16;i++)d+=`<span class="drop" style="left:${(i*6.2+rand(-3,3)).toFixed(1)}%;animation-duration:${rf(2.2,4.4).toFixed(2)}s;animation-delay:${(-Math.random()*4).toFixed(2)}s;--r:${rand(-200,200)}deg;font-size:calc(var(--s)*${rand(32,58)}px)">${v.a}</span>`;return d+mt+mb}
  return `${mt}<div class="center"><span class="actor a-${esc(v.anim)}"><i>${v.a}</i></span></div>${mb}`;
}
function placeActor(c,k,tr){
  const a=c._st[k],el=c._r.acts[k];
  const ox=parseFloat(el.style.left);
  el.style.transitionDuration=tr+'ms';
  el.style.left=a.x+'%';el.style.top=a.y+'%';el.style.opacity=a.o;
  el.style.transform=`translate(-50%,-50%) rotate(${a.r}deg) scale(${a.s*a.f},${a.s})`;
  if(el._e!==a.e){el.firstChild.textContent=a.e;el._e=a.e}
  if(tr>=400&&!isNaN(ox)&&Math.abs(ox-a.x)>=6&&Math.abs(a.r)<1){el.classList.add('walk');clearTimeout(el._wt);el._wt=setTimeout(()=>el.classList.remove('walk'),tr)}
}
function setCam(c,cam,tr){
  const s=c._r.cam.style;s.transformOrigin='0 0';s.transition=`transform ${tr}ms cubic-bezier(.3,.7,.3,1)`;
  if(cam){const z=cam.z;const tx=clamp(50-cam.x*z,100-100*z,0),ty=clamp(50-cam.y*z,100-100*z,0);s.transform=`translate(${tx}%,${ty}%) scale(${z})`;c._cam={z,tx,ty}}
  else{s.transform='translate(0,0) scale(1)';c._cam=null}
}
function setOv(c,list){for(const k in c._r.ovs)c._r.ovs[k].classList.toggle('on',list.includes(k))}
function setHud(c,h){const R=c._r;if(!h){R.hud.hidden=true;return}R.hud.hidden=false;if(h.n)$('b',R.hud).textContent=h.n;if(h.hp!=null){$('.hb i',R.hud).style.width=h.hp+'%';$('.hb span',R.hud).textContent=h.hp+'%'}}
function setCrowd(c,cr){
  const R=c._r;if(!cr){R.crowd.innerHTML='';R.crowd.className='crowd';return}
  if(cr.e){const have=R.crowd.children.length;for(let i=have;i<cr.n;i++){const s=document.createElement('span');s.textContent=cr.e;s.style.left=rf(4,96)+'%';s.style.top=rf(10,95)+'%';s.style.animationDelay=`${((i-have)*.04).toFixed(2)}s,${(-Math.random()).toFixed(2)}s`;R.crowd.appendChild(s)}}
  if(cr.mode){R.crowd.classList.toggle('cheer',cr.mode==='cheer');R.crowd.classList.toggle('flee',cr.mode==='flee')}
}
function setAmb(c,a){const R=c._r;R.amb.innerHTML='';if(!a)return;for(let i=0;i<a.n;i++){const s=document.createElement('span');s.textContent=a.e;s.className=a.up?'up':'';s.style.left=rf(2,98)+'%';s.style.fontSize=rand(18,a.up?30:40)+'px';s.style.animationDuration=rf(a.up?4:2.4,a.up?7:4.6).toFixed(2)+'s';s.style.animationDelay=(-Math.random()*5).toFixed(2)+'s';s.style.setProperty('--r',rand(-200,200)+'deg');R.amb.appendChild(s)}}
function partAt(c,p,txt,cls){const s=document.createElement('span');s.className=cls;s.textContent=txt;s.style.left=p.x+'%';s.style.top=p.y+'%';c._r.parts.appendChild(s);return s}
function sburst(c,[e,t,n]){const p=typeof t==='string'?c._st[t]:t;for(let i=0;i<n;i++){const s=partAt(c,p,e,'pt');const a=Math.random()*Math.PI*2,d=rand(50,150);s.style.setProperty('--dx',Math.cos(a)*d+'px');s.style.setProperty('--dy',Math.sin(a)*d+'px');s.style.setProperty('--r',rand(-180,180)+'deg');s.style.fontSize=rand(22,40)+'px';setTimeout(()=>s.remove(),1050)}}
function emote(c,k,e){const a=c._st[k];if(!a||!a.o)return;const H=c.clientHeight||700;const s=partAt(c,{x:a.x+4*a.s,y:a.y-(54*a.s)/H*100},e,'emo');setTimeout(()=>s.remove(),1500)}
function posBubble(c,k){
  const a=c._st[k],R=c._r,W=c.clientWidth,H=c.clientHeight,cam=c._cam;
  let X=a.x,Y=a.y,z=1;if(cam){z=cam.z;X=cam.tx+a.x*z;Y=cam.ty+a.y*z}
  const half=46*a.s*z;let top=Y/100*H-half-6;const below=top<120;if(below)top=Y/100*H+half+10;
  R.bub.classList.toggle('below',below);
  const bw=R.bub.offsetWidth;const ax=X/100*W;const left=Math.max(bw/2+10,Math.min(W-bw/2-72,ax));
  R.bub.style.left=left+'px';R.bub.style.top=top+'px';R.bub.style.setProperty('--tx',Math.max(-bw/2+16,Math.min(bw/2-16,ax-left))+'px');
}
function storyReset(c){
  const v=c._v,R=c._r;c._st={};
  for(const k in v.cast){c._st[k]={s:1,r:0,f:1,o:1,...v.cast[k]};placeActor(c,k,0)}
  R.sbg.style.background=v.bg;setCam(c,null,0);setOv(c,v.ov||[]);c.classList.remove('lbon','slow');
  setHud(c,null);R.tmr.hidden=true;setCrowd(c,null);setAmb(c,v.amb||null);R.decos.hidden=false;
  R.tt.textContent=v.top||'';R.tt.hidden=!v.top;R.smo.classList.remove('on');R.parts.innerHTML='';
  ['bub','sub','ttl'].forEach(k=>R[k].classList.remove('show'));R.cov.classList.remove('on');
  for(const k in R.acts)R.acts[k].classList.remove('talk','walk');
  if(v.tv){const st=$('.static',c);if(st)repop(st,'go')}
}
function bubbleText(t,v){
  if(v&&v.lang==='en')return esc(t);
  if(SET.subs==='sim')return esc(simlish(t).disp);
  if(SET.subs==='both')return `<span class="bsim">${esc(simlish(t).disp)}</span>${esc(t)}`;
  return esc(t);
}
function applyBeat(c,b,quiet){
  const R=c._r,tr=b.tr??600;
  clearTimeout(c._talkT);for(const k in R.acts)R.acts[k].classList.remove('talk');
  R.bub.classList.remove('show');R.sub.classList.remove('show');R.ttl.classList.remove('show');
  R.cov.classList.toggle('on',!!b.card);if(b.card)R.cov.firstChild.textContent=b.card;
  if(b.bg)R.sbg.style.background=b.bg;
  if(b.decoOff)R.decos.hidden=true;
  if('lb' in b)c.classList.toggle('lbon',!!b.lb);
  if('ov' in b)setOv(c,b.ov);
  if('amb' in b)setAmb(c,b.amb);
  if('cam' in b)setCam(c,b.cam,b.ctr??tr);
  if(b.set)for(const k in b.set){const u=b.set[k];Object.assign(c._st[k],u);placeActor(c,k,u.tr??tr)}
  if('tt' in b){R.tt.textContent=b.tt;R.tt.hidden=!b.tt}
  if('hud' in b)setHud(c,b.hud);
  if('timer' in b){R.tmr.hidden=!b.timer;if(b.timer){R.tmr.textContent=b.timer;repop(R.tmr)}}
  if('crowd' in b)setCrowd(c,b.crowd);
  if(b.title){R.ttl.textContent=b.title;repop(R.ttl,'show')}
  if(b.sub){R.sub.textContent=b.sub;repop(R.sub,'show')}
  [].concat(b.fx||[]).forEach(f=>{
    if(f==='shake'||f==='bigshake'){if(!SET.reduceMotion){R.shk.classList.remove('shake','bigshake');void R.shk.offsetWidth;R.shk.classList.add(f)}}
    else if(f==='flash'){if(!SET.reduceMotion)repop(R.fl,'go')}
    else if(f==='impact'){if(!SET.reduceMotion)repop(R.imp,'go')}
    else if(f==='slowmo'){R.smo.classList.add('on');c.classList.add('slow')}
    else if(f==='noslow'){R.smo.classList.remove('on');c.classList.remove('slow')}
  });
  if(quiet){if(b.say&&SET.subs!=='off'){R.bub.innerHTML=bubbleText(b.say[1],c._v);R.bub.classList.add('show');posBubble(c,b.say[0])}return}
  if(b.burst)sburst(c,b.burst);
  if(b.em){const list=Array.isArray(b.em[0])?b.em:[b.em];list.forEach(([k,e],i)=>setTimeout(()=>emote(c,k,e),i*120))}
  if(b.mus)Music.start(b.mus);
  if(b.sfx)AU.sfx(b.sfx);
  if(b.say){
    const [k,t]=b.say;
    if(SET.subs!=='off'){R.bub.innerHTML=bubbleText(t,c._v);repop(R.bub,'show');posBubble(c,k)}
    const el=R.acts[k];el.classList.add('talk');const d=c._v.lang==='en'?AU.speakEN(t,c._v._en[k],c._v._vox[k]):AU.speak(t,c._v._vox[k]);c._talkT=setTimeout(()=>el.classList.remove('talk'),Math.min(b.ms-120,Math.max(450,d*1000)));
  }
}

/* =====================================================================
   FEEDS
   ===================================================================== */
const allowed=v=>!isBlocked(v.by)&&!S.hidden.includes(v.id)&&!(SET.hideDark&&v.g==='dark')&&!(SET.restricted&&(v.g==='dark'||v.g==='scary'));
function inst(b){
  const likes=b.mine?(b.likes||0):Math.floor(10**(4+((hashStr(b.id)%1000)/1000)*2.6))+rand(0,999);
  return {...b,uid:uid(),av:b.av||(b.cast?CR(b.by).av:b.a),likes:likes+(S.liked.includes(b.id)?1:0),liked:S.liked.includes(b.id),
    comments:b.mine?(b.comments||0):Math.max(12,Math.floor(likes/(18+hashStr(b.id)%40))),shares:b.mine?(b.shares||0):Math.floor(likes/(9+hashStr(b.id+'s')%30)),
    sound:b.sound||`original sound - ${b.by}`,dur:b.dur||8000,userComments:b.userComments||[]};
}
let deck=[],lastId='';
function nextFY(){
  const pool=STORIES.filter(allowed);if(!pool.length)return null;
  if(!deck.length){deck=shuffle(pool.slice());if(deck.length>1&&deck[deck.length-1].id===lastId)deck.unshift(deck.pop())}
  let s=deck.pop();while(s&&!allowed(s))s=deck.pop();if(!s)return nextFY();lastId=s.id;return inst(s);
}
function nextFO(){const hs=S.following.map(f=>f.h);const pool=STORIES.filter(s=>hs.includes(s.by)&&allowed(s));if(!pool.length)return null;return inst(pick(pool))}
const FEEDS=[];
function makeFeed(root,gen){
  const f={root,gen,cards:[],active:null};FEEDS.push(f);
  f.io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting&&e.intersectionRatio>=.6)setActive(f,e.target)})},{root,threshold:[.6]});
  f.fill=n=>{for(let i=0;i<n;i++){const v=gen();if(!v)break;addCard(f,v)}};
  f.reset=()=>{f.cards.forEach(c=>f.io.unobserve(c));f.cards=[];f.active=null;root.innerHTML='';root.scrollTop=0};
  root.addEventListener('click',onFeedClick);
  return f;
}
function addCard(f,v,before){const c=buildCard(v);if(before)f.root.insertBefore(c,before);else f.root.appendChild(c);initCard(c);f.io.observe(c);if(before)f.cards.splice(f.cards.indexOf(before),0,c);else f.cards.push(c);return c}
const FY=makeFeed($('#feed-fy'),nextFY);
const FO=makeFeed($('#feed-fo'),nextFO);
let homeTab='fy',foDirty=true,view='home',splashOn=true;
const curFeed=()=>homeTab==='fy'?FY:FO;
function setActive(f,card){
  if(f.active===card)return;
  if(f.active)f.active.classList.remove('playing','paused');
  f.active=card;card.classList.add('playing');
  if(f===playCtx())P.load(card);
  if(f.cards.indexOf(card)>f.cards.length-4)f.fill(5);
}
function buildCard(v){
  const el=document.createElement('article');el.className='card';el._v=v;
  const live=LIVES.find(l=>l.h===v.by);const fol=isFollowing(v.by);
  el.innerHTML=`<div class="scene k-${v.kind}"${v.kind==='story'?'':` style="background:${v.bg}"`}>${v.kind==='story'?storyHTML(v):legacyHTML(v)}</div>
  <div class="pausefx">${I.pause}</div>
  <aside class="rail">
    <div class="avw"><button class="av${live?' live':''}" data-act="avatar" type="button" style="background:${avBg(v.by)}" aria-label="@${esc(v.by)}">${esc(v.av)}</button>${live?'<span class="livetag">LIVE</span>':''}${v.mine?'':`<button class="fol${fol?' on':''}" data-act="follow" type="button" aria-label="Follow @${esc(v.by)}">${fol?'✓':'+'}</button>`}</div>
    <button class="rb like${v.liked?' on':''}" data-act="like" type="button" aria-label="Like">${I.heart}<span>${SET.hideCounts?'Like':fmt(v.likes)}</span></button>
    <button class="rb" data-act="comments" type="button" aria-label="Comments">${I.comment}<span>${fmt(v.comments)}</span></button>
    <button class="rb sv${S.saved.includes(v.id)?' on':''}" data-act="save" type="button" aria-label="Save">${I.save}<span>Save</span></button>
    <button class="rb" data-act="gift" type="button" aria-label="Send a gift">${I.gift}<span>Gift</span></button>
    <button class="rb" data-act="share" type="button" aria-label="Share">${I.share}<span>${fmt(v.shares)}</span></button>
    <div class="disc">${esc(v.av)}</div>
  </aside>
  <div class="meta">${v.series?`<button class="spill" type="button" data-act="series">📺 Interdimensional TV · Ep ${v.ep}</button>`:''}<button class="who" type="button" data-act="profile">@${esc(v.by)}${v.mine?' <em>· you</em>':''}</button><p class="capt" data-act="more">${esc(v.cap)} <b>${esc(v.tags)}</b></p><div class="snd">${I.note}<div class="mq"><span>${esc(v.sound)} &nbsp;•&nbsp; ${esc(v.sound)} &nbsp;•&nbsp;</span></div></div></div>
  <div class="prog"><i></i></div>`;
  el._prog=$('.prog i',el);
  if(v.kind==='story'){
    const R={shk:$('.shk',el),cam:$('.cam',el),sbg:$('.sbg',el),decos:$('.decos',el),amb:$('.amb',el),crowd:$('.crowd',el),parts:$('.parts',el),tt:$('.tt2',el),hud:$('.hud',el),tmr:$('.tmr',el),ttl:$('.ttl2',el),sub:$('.sub2',el),bub:$('.bub2',el),imp:$('.imp',el),cov:$('.cov',el),fl:$('.fl',el),smo:$('.smo',el),acts:{},ovs:{}};
    $$('.ac',el).forEach(a=>R.acts[a.dataset.k]=a);$$('.ov',el).forEach(o=>R.ovs[o.dataset.ov]=o);el._r=R;
  }
  return el;
}
function initCard(c){if(c._v.kind==='story'){storyReset(c);applyBeat(c,c._v.beats[0],true)}}

/* ---------- player ---------- */
const P={card:null,t:0,idx:-1,paused:false,last:0};
P.load=c=>{AU.cut();P.card=c;P.t=0;P.idx=-1;P.paused=false;if(c){c.classList.remove('paused');c._prog.style.transform='scaleX(0)';if(c._v.kind==='story')storyReset(c);if(c._v.tv)AU.sfx('static');Music.start(c._v.mus||'silly')}};
function playCtx(){if(splashOn||S.loggedOut||!room.hidden||$('#remind:not([hidden])'))return null;const top=OV.stack[OV.stack.length-1];if(top)return top.feed||null;return view==='home'?curFeed():null}
function updPlay(force){
  const f=playCtx();FEEDS.forEach(x=>x.root.classList.toggle('idle',x!==f));
  if(!f||!f.active){AU.cut();if(room.hidden)Music.stop();return}
  if(P.card!==f.active||force)P.load(f.active);
}
function tick(now){
  const dt=P.last?Math.min(100,now-P.last):0;P.last=now;
  const f=playCtx();const c=P.card;
  if(c&&f&&f.active===c&&!P.paused&&!document.hidden){
    const v=c._v;P.t+=dt;
    if(P.t>=v.dur){
      if((SET.autoScroll||f.surf)&&f.cards.indexOf(c)<f.cards.length-1){f.root.scrollBy({top:f.root.clientHeight,behavior:'smooth'});P.t=v.dur-1}
      else{P.t=0;P.idx=-1;if(v.kind==='story')storyReset(c);AU.cut()}
    }
    c._prog.style.transform=`scaleX(${Math.min(1,P.t/v.dur).toFixed(4)})`;
    if(v.kind==='story'){let i=0;while(i<v._cum.length&&P.t>=v._cum[i])i++;if(i<v.beats.length&&i!==P.idx){P.idx=i;applyBeat(c,v.beats[i])}}
  }
  if(Room.L)Room.tick(dt,now);
  if(!document.hidden&&!splashOn&&!S.loggedOut)rotTick(dt);
  requestAnimationFrame(tick);
}

/* ---------- card interactions ---------- */
let tapT=null,lastTap=0;
function onFeedClick(e){
  const card=e.target.closest('.card');if(!card)return;
  const v=card._v;const btn=e.target.closest('[data-act]');
  if(btn){
    const act=btn.dataset.act;
    if(act==='like')toggleLike(card);
    else if(act==='follow'){const on=toggleFollow(v.by,v.av);toast(on?`Following @${v.by}`:`Unfollowed @${v.by}`)}
    else if(act==='comments')openComments(v,card);
    else if(act==='save')toggleSave(v);
    else if(act==='gift')openGift({type:'video',h:v.by,av:v.av,v});
    else if(act==='share')openShare(v,card);
    else if(act==='avatar'||act==='profile'){if(v.mine){goView('me');return}const l=LIVES.find(x=>x.h===v.by);if(l&&act==='avatar')openLive(l);else openProfile(v.by)}
    else if(act==='more')btn.classList.toggle('open');
    else if(act==='series')openSeries(v.ep-1);
    return;
  }
  const now=Date.now();
  if(now-lastTap<300){clearTimeout(tapT);tapT=null;lastTap=0;const r=card.getBoundingClientRect();heartAt(card,e.clientX-r.left,e.clientY-r.top);if(!v.liked)toggleLike(card)}
  else{lastTap=now;tapT=setTimeout(()=>{tapT=null;if(card!==P.card)return;P.paused=!P.paused;card.classList.toggle('paused',P.paused);if(P.paused){AU.cut();Music.stop()}else Music.start(v.mus||'silly')},280)}
}
function heartAt(card,x,y){const h=document.createElement('div');h.className='hfx';h.style.left=x+'px';h.style.top=y+'px';h.style.setProperty('--r',rand(-25,25)+'deg');h.innerHTML=I.heart;card.appendChild(h);setTimeout(()=>h.remove(),950)}
function toggleLike(card){
  const v=card._v;v.liked=!v.liked;v.likes+=v.liked?1:-1;
  if(v.liked){if(!S.liked.includes(v.id))S.liked.unshift(v.id)}else S.liked=S.liked.filter(x=>x!==v.id);save();
  $$('.card').forEach(c=>{if(c._v.id===v.id){c._v.liked=v.liked;const b=$('.rb.like',c);b.classList.toggle('on',v.liked);$('span',b).textContent=SET.hideCounts?'Like':fmt(c._v.likes)}});
}
function toggleSave(v){const on=!S.saved.includes(v.id);if(on)S.saved.unshift(v.id);else S.saved=S.saved.filter(x=>x!==v.id);save();$$('.card').forEach(c=>{if(c._v.id===v.id)$('.rb.sv',c).classList.toggle('on',on)});toast(on?'Saved to your profile':'Removed from saved')}
function toggleFollow(h,av){
  const i=S.following.findIndex(f=>f.h===h);
  if(i>=0)S.following.splice(i,1);else{S.following.push({h,av:av||CR(h).av});addNote('follows',av||CR(h).av,`You followed <b>@${esc(h)}</b>.`)}
  save();foDirty=true;updFoCount();const on=isFollowing(h);
  $$('.card').forEach(c=>{if(c._v.by===h){const b=$('.fol',c);if(b){b.classList.toggle('on',on);b.textContent=on?'✓':'+'}}});
  $$(`[data-folh="${CSS.escape(h)}"]`).forEach(b=>{b.classList.toggle('on',on);b.textContent=on?'Following':'Follow'});
  return on;
}
function updFoCount(){$('#foCount').textContent=S.following.length?S.following.length:''}
function hideFeedsFor(pred){FEEDS.forEach(f=>{f.cards.filter(c=>pred(c._v)).forEach(c=>{if(c===f.active)f.root.scrollBy({top:f.root.clientHeight});setTimeout(()=>{f.io.unobserve(c);c.remove();f.cards=f.cards.filter(x=>x!==c)},450)})})}

/* =====================================================================
   SHEETS
   ===================================================================== */
let openSheet=null;
function showSheet(id){if(openSheet&&openSheet.id!==id)openSheet.classList.remove('open');openSheet=$('#'+id);openSheet.classList.add('open');$('#backdrop').hidden=false}
function closeSheet(){if(openSheet)openSheet.classList.remove('open');openSheet=null;$('#backdrop').hidden=true}
$('#backdrop').addEventListener('click',closeSheet);
document.addEventListener('click',e=>{if(e.target.closest('[data-close]'))closeSheet();const o=e.target.closest('[data-open]');if(!o)return;const w=o.dataset.open;if(w==='coins'){renderPacks();showSheet('sh-coins')}else if(w==='create')openCreate()});
function genSheet(title,html,onClick){$('#genTitle').textContent=title;const b=$('#genBody');b.innerHTML=html;b.onclick=onClick||null;showSheet('sh-gen')}
function confirmBox(title,body,ok,fn,danger){genSheet(title,`<p class="cbody">${body}</p><div class="cbtns"><button class="btn ghost" type="button" data-close>Cancel</button><button class="btn${danger?' danger':''}" type="button" id="cOk">${esc(ok)}</button></div>`,e=>{if(e.target.closest('#cOk')){closeSheet();fn()}})}

/* comments */
let cmV=null,cmCard=null;
function genComments(v){
  if(v._cm)return v._cm;const list=[];
  (v.cm||[]).forEach((t,i)=>list.push({u:pick(CNAMES),a:pick(CAV),t,l:Math.floor(10**(3.6+Math.random()*1.2)/(i+1)),ago:pick(['1h','3h','6h']),top:i===0}));
  const used=new Set();for(let i=0;i<10;i++){let t;do{t=pick(COMMENTS)}while(used.has(t));used.add(t);list.push({u:pick(CNAMES),a:pick(CAV),t,l:Math.floor(10**(1+Math.random()*2.6)),ago:pick(['2m','14m','1h','3h','1d'])})}
  list.sort((a,b)=>b.l-a.l);v._cm=list;return list;
}
function openComments(v,card){
  cmV=v;cmCard=card;$('#cmTitle').textContent=`${comma(v.comments)} comments`;
  const off=v.mine&&SET.comments==='off';
  const list=[...v.userComments,...(v.mine?[]:genComments(v))];
  $('#clist').innerHTML=(off?`<p class="fine notice">${I.lock} You turned comments off for your videos. Change it in Settings → Privacy.</p>`:'')+(list.length?list.map(c=>`<div class="cm${c.me?' mine':''}"><div class="ca">${esc(c.a)}</div><div class="cb"><div class="cu">${c.me?esc(meH()):esc(c.u)}${c.top?'<i>· top comment</i>':''}${c.creator?'<i>· creator</i>':''}</div><div class="ct">${esc(c.t)}</div><div class="cmeta">${esc(c.ago)} · Reply</div></div><button class="clk" type="button" aria-label="Like comment">${I.sheart}<span>${fmt(c.l)}</span></button></div>`).join(''):`<p class="fine" style="text-align:center;margin:20px 0">No comments yet. Be the first to say something unhinged.</p>`);
  $('#cform').hidden=off;showSheet('sh-comments');
}
$('#clist').addEventListener('click',e=>{const b=e.target.closest('.clk');if(!b)return;const on=b.classList.toggle('on');const s=$('span',b);const n=parseInt(s.dataset.n||s.textContent.replace(/\D/g,''))||0;const nv=on?n+1:Math.max(0,n-1);s.dataset.n=nv;s.textContent=fmt(nv)});
$('#cform').addEventListener('submit',e=>{
  e.preventDefault();const inp=$('#cinput');const t=inp.value.trim();if(!t||!cmV)return;
  cmV.userComments.unshift({me:true,a:S.me.av,t,l:0,ago:'now'});cmV.comments++;inp.value='';
  if(cmCard)$('[data-act="comments"] span',cmCard).textContent=fmt(cmV.comments);
  const v=cmV,card=cmCard;openComments(v,card);
  if(!v.mine&&Math.random()<.5)setTimeout(()=>{v.userComments.unshift({u:v.by,a:v.av,t:pick(['LMAOOO thank you','you get it 😭','pinning this','real','ok this made my day','stop 😭']),l:rand(20,900),ago:'now',creator:true});if(cmV===v&&openSheet&&openSheet.id==='sh-comments')openComments(v,card);addNote('comments',v.av,`<b>@${esc(v.by)}</b> replied to your comment.`)},rand(2500,5000));
});

/* share */
function openShare(v,card){
  const sv=S.saved.includes(v.id);
  genSheet('Share',`<div class="sgrid">
    <button class="sopt" data-s="copy" type="button"><span>🔗</span>Copy link</button>
    <button class="sopt" data-s="save" type="button"><span>${sv?'✅':'🔖'}</span>${sv?'Saved':'Save'}</button>
    <button class="sopt" data-s="dm" type="button"><span>✉️</span>Send to</button>
    ${v.mine?'<button class="sopt" data-s="del" type="button"><span>🗑️</span>Delete</button>':`<button class="sopt" data-s="ni" type="button"><span>🙈</span>Not interested</button><button class="sopt" data-s="report" type="button"><span>🚩</span>Report</button><button class="sopt" data-s="block" type="button"><span>⛔</span>Block</button>`}
  </div>`,e=>{
    const b=e.target.closest('.sopt');if(!b)return;const s=b.dataset.s;
    if(s==='copy'){const link=`brainrot.fake/@${v.by}/${v.id}`;const done=()=>{v.shares++;if(card)$('[data-act="share"] span',card).textContent=fmt(v.shares);toast('Link copied. It leads nowhere, like all great journeys.')};closeSheet();try{navigator.clipboard.writeText(link).then(done,()=>toast(link))}catch(err){toast(link)}}
    else if(s==='save'){closeSheet();toggleSave(v)}
    else if(s==='dm'){const fr=S.following.slice(0,8);genSheet('Send to',fr.length?`<div class="slist">${fr.map(f=>`<button class="srow" data-h="${esc(f.h)}" type="button"><span class="sav" style="background:${avBg(f.h)}">${f.av}</span>@${esc(f.h)}</button>`).join('')}</div>`:'<p class="fine">Follow someone first. Then you can send them brain rot.</p>',ev=>{const r=ev.target.closest('.srow');if(!r)return;closeSheet();dmSend(r.dataset.h,`[shared a video: ${v.cap}]`,true);toast(`Sent to @${r.dataset.h}`)})}
    else if(s==='ni'){closeSheet();S.hidden.push(v.id);save();hideFeedsFor(x=>x.id===v.id);toast("Got it. You'll see less like this.")}
    else if(s==='report')openReport(v.by);
    else if(s==='block')confirmBlock(v.by);
    else if(s==='del')confirmBox('Delete video?','This removes it from your profile. It was art. Are you sure?','Delete',()=>{S.posts=S.posts.filter(p=>p.id!==v.id);save();hideFeedsFor(x=>x.id===v.id);toast('Video deleted')},true);
  });
}
function openReport(h){genSheet('Report',`<div class="slist">${['Too funny','Made me cry (in a bad way)','Spam','Pretending to be a duck','Something else'].map(r=>`<button class="srow" type="button">${esc(r)}</button>`).join('')}</div>`,e=>{if(e.target.closest('.srow')){closeSheet();toast('Thanks. Our team of three raccoons will review it.')}})}
function confirmBlock(h){confirmBox(`Block @${h}?`,`They won't show up in your feed, lives, or messages. You can unblock them in Settings → Privacy.`,'Block',()=>{if(!S.blocked.includes(h))S.blocked.push(h);S.following=S.following.filter(f=>f.h!==h);save();updFoCount();foDirty=true;hideFeedsFor(x=>x.by===h);toast(`Blocked @${h}`);if(OV.stack.length&&OV.stack[OV.stack.length-1].h===h)popOv()},true)}

/* gifts */
let giftTarget=null;
const LIVEHINT={runner:{199:'rocket mode',500:'extra life',1000:'extra life'},rpg:{1:'heal',5:'heal',10:'+12 dmg',25:'+12 dmg',99:'meteor',199:'meteor',500:'full heal',1000:'full heal'},horror:{25:'jumpscare',99:'jumpscare',199:'jumpscare',500:'jumpscare',1000:'jumpscare'},fish:{199:'epic bait',500:'epic bait',1000:'legendary bait'},chess:{25:'bread',99:'bread',199:'bread',500:'bread',1000:'bread'},sing:{1:'throw rose',99:'high note',199:'high note',500:'high note',1000:'high note'},dj:{99:'trigger drop',199:'trigger drop',500:'trigger drop',1000:'trigger drop'},kart:{25:'banana shield',99:'banana shield',199:'turbo',500:'turbo',1000:'turbo'},workout:{1:'+5 reps',5:'+5 reps',10:'+5 reps',25:'+10 reps',99:'+10 reps',199:'+25 reps',500:'+25 reps',1000:'+25 reps'}};
function renderGiftGrid(){const L=giftTarget&&giftTarget.type==='live'?giftTarget.L:null;const hints=L?(LIVEHINT[L.type]||{}):{};
  $('#ggrid').innerHTML=GIFTS.map((g,i)=>`<button class="gift" type="button" data-i="${i}" data-c="${g.c}"><span class="ge">${g.e}</span><span class="gn">${g.n}</span><span class="gc"><span class="coin">B</span>${comma(g.c)}</span><span class="gd">${L?(L.type==='cook'?'into the pot':hints[g.c]||''):''}</span></button>`).join('')}
function openGift(t){if(t.type==='video'&&t.v&&t.v.mine){toast("You can't gift yourself. We checked.");return}giftTarget=t;$('#giftTo').textContent=`Gift @${t.h}`;renderGiftGrid();updCoins();showSheet('sh-gift')}
$('#ggrid').addEventListener('click',e=>{const b=e.target.closest('.gift');if(b)sendGift(GIFTS[+b.dataset.i])});
function sendGift(g){
  if(!giftTarget)return;
  if(S.coins<g.c){toast(`You need ${comma(g.c-S.coins)} more coins for a ${g.n}. Grab a free pack.`);renderPacks();showSheet('sh-coins');return}
  S.coins-=g.c;S.spent+=g.c;addTxn(`${g.n} to @${giftTarget.h}`,-g.c,g.e);S.gifted.unshift({e:g.e,n:g.n,c:g.c,to:giftTarget.h,ts:Date.now()});if(S.gifted.length>60)S.gifted.length=60;save();updCoins();AU.sfx('coin');
  giftFX(g,{name:'You',av:S.me.av},true);
  if(giftTarget.type==='live')Room.gift(g,meAt(),true);
  else if(g.c>=99)addNote('system',g.e,`You sent a <b>${g.n}</b> to <b>@${esc(giftTarget.h)}</b>. They are framing it.`);
}
const combos={};
function giftFX(g,from,mine){
  const fx=$('#fx');const key=from.name+g.n;const now=Date.now();let c=combos[key];
  if(c&&now-c.t<2600&&c.el.isConnected){c.n++;c.t=now;const x=$('.gx',c.el);x.textContent='x'+c.n;repop(x,'bump');clearTimeout(c.timer)}
  else{const el=document.createElement('div');el.className='gban'+(mine?'':' lane2');el.innerHTML=`<span class="gav">${esc(from.av)}</span><span class="gtx"><b>${esc(from.name)}</b><small>sent ${esc(g.n)}</small></span><span class="gem">${g.e}</span><span class="gx">x1</span>`;fx.appendChild(el);c=combos[key]={el,n:1,t:now}}
  c.timer=setTimeout(()=>{c.el.classList.add('out');setTimeout(()=>c.el.remove(),400)},2600);
  if(g.c>=99){const b=document.createElement('div');b.className='gbig';b.textContent=g.e;fx.appendChild(b);setTimeout(()=>b.remove(),2050);if(g.c>=500)burst(g.e,18)}
  else{const f=document.createElement('div');f.className='gfloat';f.textContent=g.e;f.style.left=(40+Math.random()*20)+'%';fx.appendChild(f);setTimeout(()=>f.remove(),1550)}
}
function burst(e,n){const fx=$('#fx');for(let i=0;i<n;i++){const s=document.createElement('span');s.className='burst';s.textContent=e;const ang=Math.PI*2*i/n,dist=rand(110,200);s.style.setProperty('--dx',Math.cos(ang)*dist+'px');s.style.setProperty('--dy',Math.sin(ang)*dist+'px');s.style.setProperty('--r',rand(-180,180)+'deg');fx.appendChild(s);setTimeout(()=>s.remove(),1350)}}
function renderPacks(){$('#packs').innerHTML=PACKS.map((p,i)=>`<button class="pack" type="button" data-i="${i}"><span class="pa"><span class="coin">B</span>${comma(p.a)}</span><span class="pn">${p.n}</span><span class="pf2">Free · fake</span></button>`).join('')}
$('#packs').addEventListener('click',e=>{const b=e.target.closest('.pack');if(!b)return;const p=PACKS[+b.dataset.i];addCoins(p.a,`${p.n} pack (free)`);burst('🪙',12);AU.sfx('coin');toast(`+${comma(p.a)} Brain Coins. Spend them irresponsibly.`)});

/* create */
const STARS=['🦆','🐸','🧠','🦝','🍞','🗿','🐈','🥔','🦀','👻','🐌','🫠','🐙','🦖'];
const VIBES=[['spin','Spin'],['bounce','Bounce'],['shake','Shake'],['zoom','Dramatic zoom'],['wobble','Wobble'],['slide','Slide'],['rain','Make it rain']];
const PBG=['linear-gradient(165deg,#ff7eb3,#7a5cff)','linear-gradient(165deg,#3de0ff,#2b4cff)','linear-gradient(165deg,#ffd23f,#ff6b3d)','linear-gradient(165deg,#5cff9d,#1f8f7a)','linear-gradient(165deg,#c77dff,#3a0ca3)','linear-gradient(165deg,#ff9a3d,#d6246e)'];
const draft={a:'🦆',vibe:'spin',bg:PBG[0]};
$('#crStar').innerHTML=STARS.map(s=>`<button class="pk" type="button" data-s="${s}">${s}</button>`).join('');
$('#crVibe').innerHTML=VIBES.map(([k,n])=>`<button class="chip" type="button" data-v="${k}">${n}</button>`).join('');
function draftVideo(){const top=$('#crTop').value.trim(),bottom=$('#crBot').value.trim();return{kind:draft.vibe==='rain'?'rain':'solo',a:draft.a,anim:draft.vibe==='rain'?'wobble':draft.vibe,top:top||'your top text here',bottom,bg:draft.bg}}
function renderMini(){$$('#crStar .pk').forEach(b=>b.classList.toggle('on',b.dataset.s===draft.a));$$('#crVibe .chip').forEach(b=>b.classList.toggle('on',b.dataset.v===draft.vibe));const d=draftVideo();$('#mini').innerHTML=`<div class="scene" style="background:${d.bg}">${legacyHTML(d)}</div>`}
function openCreate(){draft.bg=pick(PBG);$('#crErr').textContent='';renderMini();showSheet('sh-create')}
$('#crStar').addEventListener('click',e=>{const b=e.target.closest('.pk');if(b){draft.a=b.dataset.s;renderMini()}});
$('#crVibe').addEventListener('click',e=>{const b=e.target.closest('.chip');if(b){draft.vibe=b.dataset.v;renderMini()}});
['crTop','crBot'].forEach(id=>$('#'+id).addEventListener('input',()=>{$('#crErr').textContent='';renderMini()}));
$('#crPost').addEventListener('click',()=>{
  const top=$('#crTop').value.trim();if(!top){$('#crErr').textContent='Add top text so people know what they are looking at.';$('#crTop').focus();return}
  const d=draftVideo();const capRaw=$('#crCap').value.trim();
  const post={...d,id:'p'+uid(),by:meH(),av:S.me.av,mine:true,cap:capRaw||'my first masterpiece',tags:capRaw.includes('#')?'':'#brainrot',likes:0,comments:0,shares:0,sound:`original sound - ${meH()}`,mus:'silly',ts:Date.now()};
  S.posts.unshift(post);save();['crTop','crBot','crCap'].forEach(id=>$('#'+id).value='');
  closeSheet();goView('home');setHomeTab('fy');const v=inst(post);v.likes=0;insertNext(FY,v);toast('Posted. The algorithm is thinking about it.');growPost(post,v);
});
function insertNext(f,v){const ref=f.active;const c=addCard(f,v,ref?ref.nextSibling:null);requestAnimationFrame(()=>f.root.scrollTo({top:c.offsetTop,behavior:'smooth'}))}
function growPost(post,v){
  let n=0;const fans=['farm.gossip','pigeon_intel','duck_ceo','cheese.cartel','fox.gg','potato_w_anxiety','detective_doug','bowl_life'];
  const t=setInterval(()=>{
    n++;const add=Math.floor(rand(3,40)*Math.pow(SET.private?1.15:1.35,n));v.likes+=add;post.likes=v.likes;if(SET.comments!=='off'){v.comments+=rand(0,3);post.comments=v.comments}
    $$('.card').forEach(c=>{if(c._v===v){$('.rb.like span',c).textContent=SET.hideCounts?'Like':fmt(v.likes);$('[data-act="comments"] span',c).textContent=fmt(v.comments)}});
    if(n===3||n===8||n===14){const f=pick(fans);addNote('likes',CR(f).av,`<b>@${esc(f)}</b> liked your video "${esc(post.top)}"`);if(SET.private)addNote('follows',CR(f).av,`<b>@${esc(f)}</b> requested to follow you.`,{req:f});else S.followers+=rand(1,12)}
    if(n===6&&SET.comments!=='off')addNote('comments','💬',`<b>@${esc(pick(CNAMES))}</b> commented: "${esc(pick(['this is peak','i cannot stop watching','who made this?? oh you did','TEN OUT OF TEN']))}"`);
    if(n===10)addNote('likes','📈',`Your video hit <b>${fmt(v.likes)}</b> likes. Fame is near (it is not).`);
    save();if(n>=18)clearInterval(t);
  },1500);
}

/* =====================================================================
   OVERLAYS
   ===================================================================== */
const OV={stack:[]};
function pushOv(el,opts={}){el.classList.add('ovp');el.style.zIndex=40+OV.stack.length;$('#ovs').appendChild(el);void el.offsetWidth;el.classList.add('in');OV.stack.push({el,...opts});updPlay()}
function popOv(){const o=OV.stack.pop();if(!o)return;if(o.onClose)o.onClose();o.el.classList.remove('in');setTimeout(()=>o.el.remove(),260);if(o.feed){o.feed.reset();FEEDS.splice(FEEDS.indexOf(o.feed),1)}updPlay()}
function ovPage(title,body,right){const el=document.createElement('section');el.innerHTML=`<header class="ovh"><button class="ib" type="button" data-pop aria-label="Back">${I.back}</button><h2>${esc(title)}</h2><span class="ovr">${right||''}</span></header><div class="ovb">${body}</div>`;return el}
document.addEventListener('click',e=>{if(e.target.closest('[data-pop]'))popOv()});

/* viewer */
function openViewer(list,idx,opts={}){
  const el=document.createElement('section');el.className='viewer';el.innerHTML=`<button class="ib vback" type="button" data-pop aria-label="Back">${I.back}</button>${opts.title?`<button class="vtitle${opts.surf?' on':''}" type="button">${esc(opts.title)} · <span>${opts.surf?'Channel surf ON':'Channel surf OFF'}</span></button>`:''}<div class="feed"></div>`;
  const root=$('.feed',el);let i=0;const gen=()=>{if(i<list.length)return inst(list[i++]);return opts.only?null:nextFY()};
  const f=makeFeed(root,gen);f.surf=!!opts.surf;pushOv(el,{feed:f});f.fill(list.length+2);
  const vt=$('.vtitle',el);if(vt)vt.addEventListener('click',()=>{f.surf=!f.surf;vt.classList.toggle('on',f.surf);$('span',vt).textContent=f.surf?'Channel surf ON':'Channel surf OFF';toast(f.surf?'Channels flip by themselves now':'Channel surf off')});
  requestAnimationFrame(()=>{root.scrollTop=idx*root.clientHeight});
}
function posterHTML(v,i){const c=Object.values(v.cast||{});const e1=c[0]?c[0].e:v.a,e2=c[1]?c[1].e:'';const likes=Math.floor(10**(4+((hashStr(v.id)%1000)/1000)*2.6));
  return `<button class="poster" type="button" data-i="${i}"><span class="pbg" style="background:${v.bg}"></span><span class="pe1">${e1}</span>${e2?`<span class="pe2">${e2}</span>`:''}${v.top?`<span class="ptop">${esc(v.top)}</span>`:''}<span class="plk">▶ ${fmt(likes*7)}</span></button>`}
function postsGrid(list,empty){if(!list.length)return `<p class="fine center">${empty}</p>`;return `<div class="pgrid">${list.map((v,i)=>v.kind==='story'?posterHTML(v,i):`<button class="poster" type="button" data-i="${i}"><span class="pbg" style="background:${v.bg}"></span><span class="pe1">${v.a}</span><span class="ptop">${esc(v.top)}</span><span class="plk">♥ ${fmt(v.likes||0)}</span></button>`).join('')}</div>`}
function bindGrid(container,list){container.addEventListener('click',e=>{const p=e.target.closest('.poster');if(p&&container.contains(p))openViewer(list,+p.dataset.i)})}

function openSeries(i){openViewer(SERIES_EPS,i||0,{surf:true,only:false,title:'📺 Interdimensional TV'})}
/* creator profile */
function openProfile(h){
  if(h===meH()){goView('me');return}
  const c=CR(h);const vids=STORIES.filter(s=>s.by===h);const live=LIVES.find(l=>l.h===h);const bl=isBlocked(h);const fol=isFollowing(h);
  const likes=vids.reduce((a,v)=>a+Math.floor(10**(4+((hashStr(v.id)%1000)/1000)*2.6)),0)+c.followers*3;
  const el=ovPage('@'+h,`<div class="prof">
    <div class="pfav2${live?' live':''}" style="background:${avBg(h)}">${c.av}</div>${live?'<span class="livetag big">LIVE</span>':''}
    <h3>${esc(c.name)}</h3><p class="phandle">@${esc(h)}</p>
    <div class="stats"><div><b>${fmt(37+hashStr(h)%400)}</b><span>Following</span></div><div><b>${fmt(c.followers+(fol?1:0))}</b><span>Followers</span></div><div><b>${fmt(likes)}</b><span>Likes</span></div></div>
    ${bl?`<p class="fine">You blocked this account.</p><div class="pbtns"><button class="btn" type="button" id="pUnblock">Unblock</button></div>`:`<div class="pbtns"><button class="btn fbtn${fol?' on':''}" type="button" data-folh="${esc(h)}">${fol?'Following':'Follow'}</button><button class="btn ghost" type="button" id="pMsg">Message</button>${live?'<button class="btn live" type="button" id="pLive">Watch live</button>':''}${h==='dimension_tv'?'<button class="btn live" type="button" id="pSeries">📺 Watch from Ep 1</button>':''}</div>
    <p class="pbio">${esc(c.bio)}</p>`}
  </div>${bl?'':`<div class="ptabs"><span class="on">Videos</span></div><div class="pvids">${postsGrid(vids,live?'This creator only streams live. Catch them now.':'No videos yet.')}</div>`}`,`<button class="ib" type="button" id="pMore" aria-label="More">${I.dots}</button>`);
  pushOv(el,{h});
  if(!bl){bindGrid($('.pvids',el),vids);$('.fbtn',el).addEventListener('click',()=>{const on=toggleFollow(h,c.av);toast(on?`Following @${h}`:`Unfollowed @${h}`)});$('#pMsg',el).addEventListener('click',()=>openThread(h));if(live)$('#pLive',el).addEventListener('click',()=>openLive(live));const ps=$('#pSeries',el);if(ps)ps.addEventListener('click',()=>openSeries(0))}
  else $('#pUnblock',el).addEventListener('click',()=>{S.blocked=S.blocked.filter(x=>x!==h);save();popOv();openProfile(h);toast(`Unblocked @${h}`);resetFeeds()});
  $('#pMore',el).addEventListener('click',()=>genSheet('@'+h,`<div class="slist"><button class="srow" data-a="share" type="button">🔗 Share profile</button><button class="srow" data-a="report" type="button">🚩 Report</button><button class="srow" data-a="block" type="button">${bl?'✅ Unblock':'⛔ Block'}</button></div>`,e=>{const r=e.target.closest('.srow');if(!r)return;const a=r.dataset.a;if(a==='share'){closeSheet();try{navigator.clipboard.writeText(`brainrot.fake/@${h}`).then(()=>toast('Profile link copied'),()=>toast(`brainrot.fake/@${h}`))}catch(err){toast(`brainrot.fake/@${h}`)}}else if(a==='report')openReport(h);else if(a==='block'){if(bl){closeSheet();S.blocked=S.blocked.filter(x=>x!==h);save();popOv();openProfile(h);resetFeeds()}else confirmBlock(h)}}));
}

/* live list */
function openLiveList(){
  const cats=['All',...new Set(LIVES.map(l=>l.cat))];let cat='All';
  const el=ovPage('Live now',`<div class="chips" id="lcats">${cats.map(c=>`<button class="chip${c==='All'?' on':''}" type="button" data-c="${esc(c)}">${esc(c)}</button>`).join('')}</div><div class="lgrid" id="lgrid2"></div>`);
  const render=()=>{const list=LIVES.filter(l=>!isBlocked(l.h)&&(cat==='All'||l.cat===cat));$('#lgrid2',el).innerHTML=list.map(l=>liveCardHTML(l)).join('')};
  pushOv(el);render();
  $('#lcats',el).addEventListener('click',e=>{const b=e.target.closest('.chip');if(!b)return;cat=b.dataset.c;$$('#lcats .chip',el).forEach(x=>x.classList.toggle('on',x===b));render()});
  $('#lgrid2',el).addEventListener('click',e=>{const b=e.target.closest('.lcard');if(b)openLive(LIVES.find(l=>l.h===b.dataset.h))});
}
function liveCardHTML(l){l.viewers=Math.max(400,l.viewers+rand(-900,1200));return `<button class="lcard" type="button" data-h="${esc(l.h)}"><div class="lthumb" style="background:${l.bg}"><span class="big">${l.a}</span><span class="pr">${l.p}</span><span class="lb">LIVE</span><span class="lcat">${esc(l.cat)}</span><span class="lv">${I.eye}${fmt(l.viewers)}</span></div><span class="lt">${esc(l.t)}</span><span class="lh">@${esc(l.h)}</span></button>`}

/* follow lists */
function openFollowList(kind){
  let rows;
  if(kind==='following')rows=S.following.map(f=>({h:f.h,av:f.av,name:CR(f.h).name,real:1}));
  else{const n=Math.min(40,S.followers);rows=[...Array(n)].map((_,i)=>{const h=CNAMES[i%CNAMES.length]+(i>=CNAMES.length?i:'');return {h,av:CAV[i%CAV.length],name:h}})}
  const el=ovPage(kind==='following'?'Following':'Followers',rows.length?`<div class="ulist">${rows.map(r=>`<div class="urow"><button class="uav" type="button" data-h="${esc(r.h)}" style="background:${avBg(r.h)}">${r.av}</button><button class="umid" type="button" data-h="${esc(r.h)}"><b>${esc(r.name)}</b><span>@${esc(r.h)}</span></button>${r.real?`<button class="btn sm fbtn on" type="button" data-folh="${esc(r.h)}">Following</button>`:''}</div>`).join('')}${kind==='followers'&&S.followers>40?`<p class="fine center">and ${comma(S.followers-40)} more fake people</p>`:''}</div>`:`<p class="fine center">${kind==='following'?'You are not following anyone yet. Tap + on a creator.':'No followers yet. Post something.'}</p>`);
  pushOv(el);
  el.addEventListener('click',e=>{const fb=e.target.closest('.fbtn');if(fb){toggleFollow(fb.dataset.folh);return}const u=e.target.closest('[data-h]');if(u&&kind==='following')openProfile(u.dataset.h)});
}

/* DMs */
function initDMs(){if(S.dms)return;S.dms={};DM_SEED.forEach(([h,t],i)=>{S.dms[h]=[{me:0,t,ts:Date.now()-(i+1)*3600e3*(i+1),voice:i===1}];S.dmUnread[h]=1});save()}
function dmUnreadTotal(){return Object.values(S.dmUnread).reduce((a,b)=>a+b,0)}
function dmSend(h,t,silent){
  (S.dms[h]=S.dms[h]||[]).push({me:1,t,ts:Date.now()});save();
  if(isBlocked(h))return;
  const delay=rand(1400,2800);
  setTimeout(()=>{setTyping(h,true)},500);
  setTimeout(()=>{setTyping(h,false);const pool=DM_REPLY[h]||DM_GENERIC;let r=pick(pool);if(/\?/.test(t)&&Math.random()<.5)r=pick(['Yes. Absolutely. No.','Great question. Next.','Maybe. Depends on the ducks.']);S.dms[h].push({me:0,t:r,ts:Date.now(),voice:Math.random()<.35});
    const open=OV.stack.length&&OV.stack[OV.stack.length-1].thread===h;if(!open){S.dmUnread[h]=(S.dmUnread[h]||0)+1;if(!silent)toast(`@${h} replied`)}save();updBadge();refreshThread(h);renderInbox()},delay+500);
}
function setTyping(h,on){const top=OV.stack[OV.stack.length-1];if(top&&top.thread===h){const t=$('.typing',top.el);if(t)t.hidden=!on;scrollThread(top.el)}}
function scrollThread(el){const m=$('.msgs',el);if(m)m.scrollTop=m.scrollHeight}
function msgHTML(h,m,i){
  if(m.me)return `<div class="dm me"><div class="db">${esc(m.t)}</div></div>`;
  const sim=simlish(m.t).disp;
  if(m.voice)return `<div class="dm"><span class="dav" style="background:${avBg(h)}">${CR(h).av}</span><div class="db voice"><button class="vplay" type="button" data-i="${i}">${I.play}</button><span class="wave">▂▅▇▅▃▆▂▇▅▃</span><span class="vdur">0:0${Math.min(9,Math.ceil(m.t.split(' ').length/2.5))}</span><button class="tr" type="button" data-i="${i}">See translation</button><span class="trx" hidden>${esc(m.t)}</span></div></div>`;
  return `<div class="dm"><span class="dav" style="background:${avBg(h)}">${CR(h).av}</span><div class="db"><span class="sim">${esc(sim)}</span><button class="tr" type="button" data-i="${i}">See translation</button><span class="trx" hidden>${esc(m.t)}</span></div></div>`;
}
function openThread(h){
  initDMs();const c=CR(h);S.dmUnread[h]=0;save();updBadge();
  const el=ovPage('',`<div class="msgs"></div><div class="typing" hidden><span class="dav" style="background:${avBg(h)}">${c.av}</span><span class="dots3"><i></i><i></i><i></i></span></div><form class="inrow dmform"><input class="inp" maxlength="200" placeholder="Message @${esc(h)}" autocomplete="off" id="dmIn"><button class="btn" type="submit">Send</button></form>`);
  $('h2',el).innerHTML=`<button class="thd" type="button"><span class="dav" style="background:${avBg(h)}">${c.av}</span><span><b>${esc(c.name)}</b><small>@${esc(h)}</small></span></button>`;
  el.classList.add('thread');pushOv(el,{thread:h});refreshThread(h);
  $('.thd',el).addEventListener('click',()=>openProfile(h));
  $('.dmform',el).addEventListener('submit',e=>{e.preventDefault();const i=$('#dmIn',el);const t=i.value.trim();if(!t)return;if(isBlocked(h)){toast(`You blocked @${h}. Unblock to message.`);return}i.value='';dmSend(h,t);refreshThread(h)});
  $('.msgs',el).addEventListener('click',e=>{const tr=e.target.closest('.tr');if(tr){const x=tr.nextElementSibling;x.hidden=!x.hidden;tr.textContent=x.hidden?'See translation':'Hide translation';return}const vp=e.target.closest('.vplay');if(vp){const m=S.dms[h][+vp.dataset.i];if(!AU.ok()){toast('Turn sound on to hear voice messages');return}AU.cut();AU.speak(m.t,voiceFor(c.av));vp.classList.add('on');setTimeout(()=>vp.classList.remove('on'),2500)}});
}
function refreshThread(h){const top=OV.stack.find(o=>o.thread===h);if(!top)return;$('.msgs',top.el).innerHTML=`<p class="fine center">This is the start of your chat with @${esc(h)}. Messages are fake and stay on this device.</p>`+(S.dms[h]||[]).map((m,i)=>msgHTML(h,m,i)).join('');scrollThread(top.el)}

/* =====================================================================
   VIEWS
   ===================================================================== */
function goView(n){
  if(!room.hidden)closeLive();while(OV.stack.length)popOv();
  view=n;closeSheet();
  ['home','disc','inbox','me'].forEach(k=>$('#v-'+k).hidden=k!==n);
  $$('.tb').forEach(b=>b.classList.toggle('on',b.dataset.view===n));
  if(n==='disc')renderDisc();if(n==='inbox')renderInbox();if(n==='me')renderMe();
  updPlay();
}
$$('.tb').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.view==='home'&&view==='home'&&!OV.stack.length){const r=curFeed().root;r.scrollBy({top:r.clientHeight,behavior:'smooth'});return}goView(b.dataset.view)}));
$('#btnLive').addEventListener('click',openLiveList);
$('#btnSearch').addEventListener('click',()=>{goView('disc');setTimeout(()=>$('#dq').focus(),50)});
function setHomeTab(t){
  homeTab=t;$('#tab-fy').classList.toggle('on',t==='fy');$('#tab-fo').classList.toggle('on',t==='fo');
  FY.root.hidden=t!=='fy';FO.root.hidden=t!=='fo';
  if(t==='fo'&&foDirty){FO.reset();foDirty=false;FO.fill(5);if(!FO.cards.length){FO.root.innerHTML=`<div class="empty"><span class="big">🦗</span><h3>Nobody here yet</h3><p>${S.following.length?'The creators you follow only stream live right now. Follow someone from For You to fill this up.':"Tap the + on any creator's face to follow them. Their videos will show up here."}</p><button class="btn" type="button" id="goFY">Browse For You</button></div>`;$('#goFY').addEventListener('click',()=>setHomeTab('fy'))}}
  updPlay();
}
$('#tab-fy').addEventListener('click',()=>setHomeTab('fy'));
$('#tab-fo').addEventListener('click',()=>setHomeTab('fo'));
function resetFeeds(){deck=[];FY.reset();FY.fill(5);foDirty=true;if(homeTab==='fo')setHomeTab('fo');updPlay(true)}

/* discover */
function renderDisc(q){
  const d=$('#v-disc');
  if(!$('#dq')){d.innerHTML=`<div class="dhead"><div class="logo big">Brain Rot</div></div><label class="search">${I.search}<input id="dq" type="search" placeholder="Search creators, videos, #tags" autocomplete="off"></label><div id="dres"></div>`;
    $('#dq').addEventListener('input',e=>renderDisc(e.target.value));
    d.addEventListener('click',discClick)}
  q=(q??$('#dq').value).trim().toLowerCase();const out=$('#dres');
  if(!q){
    const trend=STORIES.filter(allowed).slice().sort((a,b)=>hashStr(b.id+'t')%100-hashStr(a.id+'t')%100);out._list=trend;
    const crs=[...new Set(STORIES.map(s=>s.by))].filter(h=>!isBlocked(h)).sort((a,b)=>CR(b).followers-CR(a).followers).slice(0,6);
    out.innerHTML=`<button class="sbanner" type="button" data-series><span class="sbtv">📺</span><span class="sbtx"><small>NEW SERIES</small><b>Interdimensional TV</b><span>14 channels from other dimensions. Real English. Zero sense.</span></span><span class="sbgo">Watch Ep 1</span></button><div class="sec">Trending tags</div><div class="chips">${TRENDING.map(t=>`<button class="chip" type="button" data-tag="${t}">${t}</button>`).join('')}</div>
    <div class="sec">Live now <button class="seeall" type="button" data-all="live">See all</button></div><div class="hrow">${LIVES.filter(l=>!isBlocked(l.h)).map(l=>liveCardHTML(l)).join('')}</div>
    <div class="sec">Creators to follow</div><div class="ulist">${crs.map(h=>{const c=CR(h);const f=isFollowing(h);return `<div class="urow"><button class="uav" type="button" data-h="${esc(h)}" style="background:${avBg(h)}">${c.av}</button><button class="umid" type="button" data-h="${esc(h)}"><b>${esc(c.name)}</b><span>${fmt(c.followers)} followers</span></button><button class="btn sm fbtn${f?' on':''}" type="button" data-folh="${esc(h)}">${f?'Following':'Follow'}</button></div>`}).join('')}</div>
    <div class="sec">Trending videos</div>${postsGrid(trend,'')}`;
    return;
  }
  const tag=q.startsWith('#')?q:null;
  const qw=q.replace(/^#/,'');const vids=STORIES.filter(s=>allowed(s)&&(`${s.cap} ${s.tags} ${s.top||''} ${s.by} ${CR(s.by).name} ${s.beats.map(b=>b.say?b.say[1]:'').join(' ')}`.toLowerCase().includes(qw)||(tag&&s.tags.includes(tag))));
  const crs=Object.keys(CREATORS).filter(h=>!isBlocked(h)&&(h.includes(q)||CR(h).name.toLowerCase().includes(q)));
  const lv=LIVES.filter(l=>!isBlocked(l.h)&&(l.t.toLowerCase().includes(q)||l.h.includes(q)||l.cat.toLowerCase().includes(q)));
  out._list=vids;
  out.innerHTML=(crs.length?`<div class="sec">Creators</div><div class="ulist">${crs.slice(0,8).map(h=>{const c=CR(h);const f=isFollowing(h);return `<div class="urow"><button class="uav" type="button" data-h="${esc(h)}" style="background:${avBg(h)}">${c.av}</button><button class="umid" type="button" data-h="${esc(h)}"><b>${esc(c.name)}</b><span>@${esc(h)}</span></button><button class="btn sm fbtn${f?' on':''}" type="button" data-folh="${esc(h)}">${f?'Following':'Follow'}</button></div>`}).join('')}</div>`:'')+
    (lv.length?`<div class="sec">Live</div><div class="hrow">${lv.map(liveCardHTML).join('')}</div>`:'')+
    `<div class="sec">Videos</div>${postsGrid(vids,`Nothing found for "${esc(q)}". Try #kevin.`)}`;
}
function discClick(e){
  const out=$('#dres');
  if(e.target.closest('[data-series]')){openSeries(0);return}
  const t=e.target.closest('[data-tag]');if(t){$('#dq').value=t.dataset.tag;renderDisc();return}
  if(e.target.closest('[data-all="live"]')){openLiveList();return}
  const fb=e.target.closest('.fbtn');if(fb){const h=fb.dataset.folh;const on=toggleFollow(h);toast(on?`Following @${h}`:`Unfollowed @${h}`);return}
  const lc=e.target.closest('.lcard');if(lc){openLive(LIVES.find(l=>l.h===lc.dataset.h));return}
  const u=e.target.closest('[data-h]');if(u){openProfile(u.dataset.h);return}
  const p=e.target.closest('.poster');if(p)openViewer(out._list,+p.dataset.i);
}

/* inbox */
const notes=[];let inTab='act',actFilter='all';
const NCAT={likes:'nLikes',comments:'nComments',follows:'nFollows',live:'nLive',mentions:'nMentions'};
function addNote(cat,a,html,opts={}){if(NCAT[cat]&&!SET[NCAT[cat]])return;notes.unshift({cat,a,html,ts:Date.now(),new:true,...opts});updBadge();if(view==='inbox'&&!OV.stack.length)renderInbox()}
function noteUnread(){return notes.filter(n=>n.new).length}
function updBadge(){const n=noteUnread()+dmUnreadTotal();const b=$('#nbadge');b.hidden=!n;b.textContent=n>9?'9+':n}
function seedNotes(){
  const base=[
    ['system','📺','New series: <b>Interdimensional TV</b>. 14 channels, real English, zero sense.',{series:1}],
    ['live','🦊','<b>@fox.gg</b> is live: LAVA JUMPER no-death run (attempt 437)',{live:'fox.gg'}],
    ['live','🦉','<b>@professor_hoot</b> is live: TRIVIA NIGHT. Answer for real coins.',{live:'professor_hoot'}],
    ['mentions','🐔','<b>@farm.gossip</b> mentioned you: "has anyone seen kevin? '+meAt()+' you were there"'],
    ['likes','🐭','<b>@cheese.cartel</b> liked your comment: "phase 4 is so real"'],
    ['follows','🦆','<b>@duck_ceo</b> started following you'],
    ['system','🧠','You have been rotting for a while. Your brain says hi.']
  ];
  base.forEach((n,i)=>notes.push({cat:n[0],a:n[1],html:n[2],ts:Date.now()-(i+1)*9e5*(i+1),new:i<3,...(n[3]||{})}));
  if(S.bonusDay!==today())notes.unshift({cat:'system',a:'🪙',html:'Daily bonus: <b>+100 Brain Coins</b> are waiting for you',ts:Date.now(),bonus:true,new:true});
}
function renderInbox(){
  const v=$('#v-inbox');if(!v||view!=='inbox')return;initDMs();
  const threads=Object.keys(S.dms).filter(h=>!isBlocked(h)).sort((a,b)=>{const la=S.dms[a][S.dms[a].length-1],lb=S.dms[b][S.dms[b].length-1];return lb.ts-la.ts});
  const filters=[['all','All'],['likes','Likes'],['comments','Comments'],['follows','Followers'],['mentions','Mentions'],['live','Live']];
  const list=notes.filter(n=>actFilter==='all'||n.cat===actFilter);
  v.innerHTML=`<div class="ph"><h1>Inbox</h1></div><div class="seg"><button type="button" data-t="act" class="${inTab==='act'?'on':''}">Activity${noteUnread()?` <i>${noteUnread()}</i>`:''}</button><button type="button" data-t="msg" class="${inTab==='msg'?'on':''}">Messages${dmUnreadTotal()?` <i>${dmUnreadTotal()}</i>`:''}</button></div>`+
  (inTab==='act'?`<div class="chips">${filters.map(([k,n])=>`<button class="chip${actFilter===k?' on':''}" type="button" data-f="${k}">${n}</button>`).join('')}</div><div class="notes">${list.length?list.map((n,i)=>`<button class="note${n.new?' new':''}" type="button" data-n="${notes.indexOf(n)}"><span class="nav">${n.a}</span><span class="nt">${n.html}</span>${n.bonus?'<span class="cta">Collect</span>':n.series?'<span class="cta live">Watch</span>':n.live?'<span class="cta live">Watch</span>':n.req?'<span class="cta">Approve</span>':`<span class="ago">${ago(n.ts)}</span>`}</button>`).join(''):'<p class="fine center">Nothing here yet.</p>'}</div>`
  :`${SET.dms!=='everyone'?`<p class="fine notice">${I.lock} ${SET.dms==='off'?'Nobody can message you. Turn this on in Settings → Privacy.':'Only people you follow can message you.'}</p>`:''}<div class="threads">${threads.map(h=>{const m=S.dms[h][S.dms[h].length-1];const c=CR(h);return `<button class="thr" type="button" data-h="${esc(h)}"><span class="tav" style="background:${avBg(h)}">${c.av}</span><span class="tmid"><b>${esc(c.name)}</b><span>${m.me?'You: ':''}${m.voice?'🎤 Voice message':esc(m.me?m.t:simlish(m.t).disp)}</span></span><span class="tend"><small>${ago(m.ts)}</small>${S.dmUnread[h]?`<i>${S.dmUnread[h]}</i>`:''}</span></button>`}).join('')}</div>`);
  if(inTab==='act')setTimeout(()=>{notes.forEach(n=>n.new=false);updBadge()},1800);
}
$('#v-inbox').addEventListener('click',e=>{
  const t=e.target.closest('[data-t]');if(t){inTab=t.dataset.t;renderInbox();return}
  const f=e.target.closest('[data-f]');if(f){actFilter=f.dataset.f;renderInbox();return}
  const th=e.target.closest('.thr');if(th){openThread(th.dataset.h);return}
  const b=e.target.closest('.note');if(!b)return;const n=notes[+b.dataset.n];
  if(n.bonus){n.bonus=false;n.html='Daily bonus collected: <b>+100 Brain Coins</b>';S.bonusDay=today();addCoins(100,'Daily bonus');burst('🪙',10);toast('+100 Brain Coins');renderInbox()}
  else if(n.live){const l=LIVES.find(x=>x.h===n.live);if(l)openLive(l)}
  else if(n.series)openSeries(0);
  else if(n.req){S.followers++;n.html=`You approved <b>@${esc(n.req)}</b>.`;n.req=null;save();renderInbox();toast('Follow request approved')}
});

/* profile */
let meTab='videos';
function renderMe(){
  const likes=S.posts.reduce((s,p)=>s+(p.likes||0),0);
  const lists={videos:S.posts,liked:S.liked.map(id=>STORIES.find(s=>s.id===id)).filter(Boolean),saved:S.saved.map(id=>STORIES.find(s=>s.id===id)||S.posts.find(p=>p.id===id)).filter(Boolean)};
  const tabs=[['videos','Videos'],['liked','Liked'],['saved','Saved'],['gifts','Gifts']];
  let body='';
  if(meTab==='gifts')body=S.gifted.length?`<div class="txns">${S.gifted.map(g=>`<div class="tx"><span class="te">${g.e}</span><span class="tm"><b>${esc(g.n)}</b> to @${esc(g.to)}</span><span class="tv neg">-${comma(g.c)}</span></div>`).join('')}</div>`:'<p class="fine center">You have not gifted anything yet. Generosity is free (the coins are too).</p>';
  else body=(meTab==='liked'?`<p class="fine center">${I.lock} ${SET.publicLikes?'Your liked videos are public.':'Only you can see your liked videos.'}</p>`:'')+postsGrid(lists[meTab],meTab==='videos'?'':'Nothing here yet.');
  $('#v-me').innerHTML=`<header class="meh"><span></span><b>${SET.private?I.lock:''}${esc(S.me.name)}</b><button class="ib" type="button" id="meSet" aria-label="Settings">${I.menu}</button></header>
  <div class="pf"><button class="pfav" id="meAv" type="button" aria-label="Change avatar">${esc(S.me.av)}${SET.activity?'<i class="dot"></i>':''}</button><h2>@${esc(meH())}</h2>
  <div class="stats"><button type="button" data-fl="following"><b>${comma(S.following.length)}</b><span>Following</span></button><button type="button" data-fl="followers"><b>${fmt(S.followers)}</b><span>Followers</span></button><div><b>${fmt(likes)}</b><span>Likes</span></div></div>
  <div class="pbtns"><button class="btn ghost" type="button" id="meEdit">Edit profile</button><button class="btn ghost" type="button" id="meWallet">Wallet · <span class="coinval">${comma(S.coins)}</span></button></div>
  <p class="pbio">${esc(S.me.bio)}</p></div>
  <div class="ptabs">${tabs.map(([k,n])=>`<button type="button" data-mt="${k}" class="${meTab===k?'on':''}">${n}</button>`).join('')}</div>
  <div class="mebody">${meTab==='videos'&&!S.posts.length?`<div class="empty2"><span>🎬</span><p class="fine">You haven't posted anything yet. Pick a star, add some text, and let it rot.</p><button class="btn" type="button" data-open="create">Make a video</button></div>`:body}</div>`;
  const mb=$('.mebody');mb._list=lists[meTab]||[];
}
$('#v-me').addEventListener('click',e=>{
  if(e.target.closest('#meSet')){openSettings();return}
  if(e.target.closest('#meEdit')||e.target.closest('#meAv')){openEditProfile();return}
  if(e.target.closest('#meWallet')){openWallet();return}
  const fl=e.target.closest('[data-fl]');if(fl){openFollowList(fl.dataset.fl);return}
  const t=e.target.closest('[data-mt]');if(t){meTab=t.dataset.mt;renderMe();return}
  const p=e.target.closest('.poster');if(p)openViewer($('.mebody')._list,+p.dataset.i);
});

/* edit profile */
const AVS=['🫠','🤪','😎','🥸','👽','🤖','🐸','🦆','🧠','🍞','🦝','👻','🐙','🦖','🐔','🦊','🐼','🦄','🍕','🌵','💀','🤡','🐧','🦀'];
function openEditProfile(){
  let av=S.me.av;
  const el=ovPage('Edit profile',`<div class="form">
    <div class="center"><span class="pfav" id="epAv">${esc(av)}</span></div>
    <div class="avpick">${AVS.map(a=>`<button type="button" class="pk${a===av?' on':''}" data-a="${a}">${a}</button>`).join('')}</div>
    <div class="fld"><label for="epName">Name</label><input class="inp sq" id="epName" maxlength="30" value="${esc(S.me.name)}"></div>
    <div class="fld"><label for="epUser">Username</label><input class="inp sq" id="epUser" maxlength="20" value="${esc(S.me.handle)}" autocapitalize="off"><span class="hint">Letters, numbers, dots and underscores. 3 to 20 characters.</span></div>
    <div class="fld"><label for="epBio">Bio</label><input class="inp sq" id="epBio" maxlength="80" value="${esc(S.me.bio)}"></div>
    <div class="err" id="epErr"></div><button class="btn wide" type="button" id="epSave">Save</button></div>`);
  pushOv(el);
  $('.avpick',el).addEventListener('click',e=>{const b=e.target.closest('.pk');if(!b)return;av=b.dataset.a;$('#epAv',el).textContent=av;$$('.avpick .pk',el).forEach(x=>x.classList.toggle('on',x===b))});
  $('#epSave',el).addEventListener('click',()=>{
    const name=$('#epName',el).value.trim(),user=$('#epUser',el).value.trim().toLowerCase(),bio=$('#epBio',el).value.trim();
    if(!name){$('#epErr',el).textContent='Add a name. Any name. Even "Steve".';return}
    if(!/^[a-z0-9._]{3,20}$/.test(user)){$('#epErr',el).textContent='Usernames use 3 to 20 letters, numbers, dots or underscores.';return}
    if(CREATORS[user]){$('#epErr',el).textContent=`@${user} is taken by a real fake creator. Try another.`;return}
    const old=S.me.handle;S.me={...S.me,av,name,handle:user,bio};S.posts.forEach(p=>{if(p.by===old){p.by=user;p.av=av}});save();popOv();renderMe();toast('Profile saved');
  });
}

/* wallet */
function openWallet(){
  const el=ovPage('Wallet',`<div class="wallet"><span class="coin big">B</span><div class="wv"><b class="coinval">${comma(S.coins)}</b><span>Brain Coins · ${comma(S.spent)} gifted so far</span></div><button class="btn gold" type="button" data-open="coins">Get coins</button></div>
  <p class="fine">Brain Coins are pretend. Packs are free, nothing is ever charged, and coins can't be cashed out.</p>
  <div class="sec">History</div><div class="txns">${S.txns.length?S.txns.map(t=>`<div class="tx"><span class="te">${t.e}</span><span class="tm">${esc(t.label)}<small>${ago(t.ts)} ago</small></span><span class="tv ${t.amount<0?'neg':'pos'}">${t.amount<0?'':'+'}${comma(t.amount)}</span></div>`).join(''):'<p class="fine center">No transactions yet.</p>'}</div>`);
  pushOv(el);
}

/* settings */
function sRow(r){
  if(r.t==='toggle')return `<button class="srow2" type="button" data-tog="${r.k}"><span class="sl"><b>${esc(r.n)}</b>${r.d?`<small>${esc(r.d)}</small>`:''}</span><span class="sw${SET[r.k]?' on':''}"><i></i></span></button>`;
  if(r.t==='choice'){const o=r.o.find(x=>x[0]===SET[r.k]);return `<button class="srow2" type="button" data-ch="${r.k}"><span class="sl"><b>${esc(r.n)}</b>${r.d?`<small>${esc(r.d)}</small>`:''}</span><span class="sv">${esc(o?o[1]:'')}</span>${I.chev}</button>`}
  if(r.t==='slider')return `<div class="srow2 sld"><span class="sl"><b>${esc(r.n)}</b></span><input type="range" min="${r.min}" max="${r.max}" step="${r.st}" value="${SET[r.k]}" data-sl="${r.k}" aria-label="${esc(r.n)}"><span class="sv" data-slv="${r.k}">${r.f(SET[r.k])}</span></div>`;
  if(r.t==='link')return `<button class="srow2" type="button" data-ln="${r.id}"><span class="sl"><b>${esc(r.n)}</b>${r.d?`<small>${esc(r.d)}</small>`:''}</span>${r.v?`<span class="sv">${esc(r.v())}</span>`:''}${I.chev}</button>`;
  if(r.t==='action')return `<button class="srow2${r.danger?' danger':''}" type="button" data-ac="${r.id}"><span class="sl"><b>${esc(r.n)}</b>${r.d?`<small>${esc(r.d)}</small>`:''}</span></button>`;
  if(r.t==='value')return `<div class="srow2"><span class="sl"><b>${esc(r.n)}</b></span><span class="sv">${esc(r.v())}</span></div>`;
}
const pct=v=>Math.round(v*100)+'%';
const rotMin=()=>Math.floor(S.rot.ms/60000);
const SETTINGS=[
 ['Account',[{t:'link',id:'edit',n:'Edit profile',d:'Name, username, bio, avatar'},{t:'link',id:'wallet',n:'Wallet',v:()=>comma(S.coins)+' coins'},{t:'action',id:'logout',n:'Log out'}]],
 ['Privacy',[{t:'toggle',k:'private',n:'Private account',d:'New followers have to request to follow you'},{t:'toggle',k:'activity',n:'Activity status',d:'Show a green dot when you are online'},{t:'toggle',k:'publicLikes',n:'Public liked videos',d:'Let others see the videos you like'},{t:'choice',k:'comments',n:'Who can comment',o:[['everyone','Everyone'],['followers','Followers'],['off','No one']]},{t:'choice',k:'dms',n:'Who can message you',o:[['everyone','Everyone'],['friends','People you follow'],['off','No one']]},{t:'choice',k:'gifts',n:'Who can send you gifts',o:[['everyone','Everyone'],['followers','Followers'],['off','No one']]},{t:'link',id:'blocked',n:'Blocked accounts',v:()=>String(S.blocked.length)}]],
 ['Content',[{t:'choice',k:'subs',n:'Subtitles',d:'What the speech bubbles show',o:[['en','English'],['sim','Simlish only'],['both','Simlish + English'],['off','Off']]},{t:'toggle',k:'hideDark',n:'Hide dark humor',d:'Skip videos tagged dark'},{t:'toggle',k:'restricted',n:'Restricted mode',d:'Also hides scary videos'},{t:'toggle',k:'hideCounts',n:'Hide like counts'},{t:'toggle',k:'autoScroll',n:'Auto-scroll',d:'Go to the next video when one ends'},{t:'action',id:'unhide',n:'Reset "Not interested"',d:'Show videos you hid again'}]],
 ['Sound',[{t:'toggle',k:'sound',n:'Sound'},{t:'toggle',k:'voices',n:'Voices'},{t:'toggle',k:'music',n:'Background music'},{t:'toggle',k:'sfx',n:'Sound effects'},{t:'slider',k:'vVol',n:'Voice volume',min:0,max:1,st:.05,f:pct},{t:'slider',k:'mVol',n:'Music volume',min:0,max:1,st:.05,f:pct},{t:'slider',k:'fVol',n:'Effects volume',min:0,max:1,st:.05,f:pct},{t:'slider',k:'vSpeed',n:'Voice speed',min:.7,max:1.4,st:.05,f:v=>v.toFixed(2)+'x'},{t:'slider',k:'vPitch',n:'Voice pitch',min:.7,max:1.4,st:.05,f:v=>v.toFixed(2)+'x'},{t:'choice',k:'tvVoice',n:'Interdimensional TV voices',d:'Real English uses your device voice',o:[['en','English (device voice)'],['sim','Simlish']]},{t:'action',id:'testvoice',n:'Test voice',d:'Hear a sample of Simlish'},{t:'action',id:'testen',n:'Test English voice',d:'Hear the Interdimensional TV voice'}]],
 ['Display',[{t:'choice',k:'textSize',n:'Text size',o:[['s','Small'],['m','Medium'],['l','Large']]},{t:'toggle',k:'reduceMotion',n:'Reduce motion',d:'No screen shakes or flashes'}]],
 ['Notifications',[{t:'toggle',k:'nLikes',n:'Likes'},{t:'toggle',k:'nComments',n:'Comments'},{t:'toggle',k:'nFollows',n:'New followers'},{t:'toggle',k:'nLive',n:'Live alerts'},{t:'toggle',k:'nMentions',n:'Mentions'}]],
 ['Screen time',[{t:'value',n:'Rotted today',v:()=>rotMin()+' min'},{t:'choice',k:'limit',n:'Daily limit',d:'Get a reminder when you hit it',o:[[0,'Off'],[15,'15 min'],[30,'30 min'],[60,'1 hour'],[120,'2 hours']]},{t:'choice',k:'breaks',n:'Break reminders',o:[[0,'Off'],[10,'Every 10 min'],[20,'Every 20 min'],[30,'Every 30 min']]}]],
 ['Data',[{t:'link',id:'data',n:'Download your data'},{t:'action',id:'cache',n:'Clear cache'},{t:'action',id:'reset',n:'Reset app',d:'Deletes your profile, coins, posts and settings',danger:1}]],
 ['About',[{t:'link',id:'help',n:'Help center'},{t:'link',id:'rules',n:'Community guidelines'},{t:'link',id:'terms',n:'Terms of service'},{t:'value',n:'Version',v:()=>'Brain Rot 3.0 (fake)'}]]
];
function settingsHTML(){return SETTINGS.map(([g,rows])=>`<div class="sgroup"><div class="sgt">${g}</div>${rows.map(sRow).join('')}</div>`).join('')}
function openSettings(){
  const el=ovPage('Settings and privacy',settingsHTML());pushOv(el);
  const rerender=()=>{const y=$('.ovb',el).scrollTop;$('.ovb',el).innerHTML=settingsHTML();$('.ovb',el).scrollTop=y};
  el.addEventListener('click',e=>{
    const tg=e.target.closest('[data-tog]');if(tg){const k=tg.dataset.tog;SET[k]=!SET[k];saveSet();applySetting(k);rerender();return}
    const ch=e.target.closest('[data-ch]');if(ch){const k=ch.dataset.ch;const r=SETTINGS.flatMap(x=>x[1]).find(x=>x.k===k);genSheet(r.n,`<div class="slist">${r.o.map(([v,n])=>`<button class="srow${SET[k]===v?' on':''}" type="button" data-v="${v}">${esc(n)}${SET[k]===v?' ✓':''}</button>`).join('')}</div>`,ev=>{const b=ev.target.closest('.srow');if(!b)return;const raw=b.dataset.v;SET[k]=isNaN(+raw)||raw===''?raw:+raw;saveSet();closeSheet();applySetting(k);rerender()});return}
    const ln=e.target.closest('[data-ln]');if(ln){subPage(ln.dataset.ln);return}
    const ac=e.target.closest('[data-ac]');if(ac){settingAction(ac.dataset.ac,rerender)}
  });
  el.addEventListener('input',e=>{const s=e.target.closest('[data-sl]');if(!s)return;const k=s.dataset.sl;SET[k]=+s.value;saveSet();const r=SETTINGS.flatMap(x=>x[1]).find(x=>x.k===k);$(`[data-slv="${k}"]`,el).textContent=r.f(SET[k]);AU.applyVol()});
}
function applySetting(k){
  if(k==='sound'){SET.sound?soundOn():soundOff()}
  if(['voices','music','sfx'].includes(k)){AU.applyVol();if(k==='music'&&!SET.music)Music.stop()}
  if(['hideDark','restricted'].includes(k))resetFeeds();
  if(k==='hideCounts')$$('.card').forEach(c=>{$('.rb.like span',c).textContent=SET.hideCounts?'Like':fmt(c._v.likes)});
  if(k==='textSize'||k==='reduceMotion')applyRootClasses();
  if(k==='private'&&SET.private)toast('Your account is private. New followers will need your approval.');
}
function applyRootClasses(){const a=$('#app');a.classList.remove('ts-s','ts-l');if(SET.textSize!=='m')a.classList.add('ts-'+SET.textSize);a.classList.toggle('rm',SET.reduceMotion)}
function settingAction(id,rerender){
  if(id==='logout')confirmBox('Log out?','You can log back in right away. It is all fake anyway.','Log out',()=>{S.loggedOut=true;save();while(OV.stack.length)popOv();showLogin()});
  else if(id==='unhide'){S.hidden=[];save();resetFeeds();toast('Hidden videos are back')}
  else if(id==='testvoice'){if(!AU.ok()){toast('Turn Sound on first');return}AU.cut();AU.speak('Hello! I am speaking Simlish. Do you understand me? Good.',voiceFor(S.me.av))}
  else if(id==='testen'){if(!AU.ok()){toast('Turn Sound on first');return}if(!AU.canEN()){toast('This device has no English voice. Simlish will be used instead.')}AU.cut();AU.speakEN('Hello. I am a regular voice. I have a regular message. The moon is now bigger.',{p:1,r:1,seed:3},VOX.mid)}
  else if(id==='cache'){toast('Clearing...');setTimeout(()=>toast('Cleared 0 bytes. It was all fake.'),900)}
  else if(id==='reset')confirmBox('Reset Brain Rot?','This deletes your profile, coins, posts, follows, messages and settings on this device. It cannot be undone.','Reset everything',()=>{store.clear();location.reload()},true);
}
function subPage(id){
  if(id==='edit')return openEditProfile();
  if(id==='wallet')return openWallet();
  if(id==='blocked'){const el=ovPage('Blocked accounts',S.blocked.length?`<div class="ulist">${S.blocked.map(h=>`<div class="urow"><span class="uav" style="background:${avBg(h)}">${CR(h).av}</span><span class="umid"><b>${esc(CR(h).name)}</b><span>@${esc(h)}</span></span><button class="btn sm" type="button" data-ub="${esc(h)}">Unblock</button></div>`).join('')}</div>`:'<p class="fine center">You have not blocked anyone. Peaceful.</p>');pushOv(el);el.addEventListener('click',e=>{const b=e.target.closest('[data-ub]');if(!b)return;S.blocked=S.blocked.filter(x=>x!==b.dataset.ub);save();b.closest('.urow').remove();resetFeeds();toast(`Unblocked @${b.dataset.ub}`)});return}
  if(id==='data'){const data={profile:S.me,coins:S.coins,gifted_total:S.spent,following:S.following.map(f=>f.h),followers:S.followers,posts:S.posts.map(p=>({id:p.id,top:p.top,likes:p.likes})),liked:S.liked,saved:S.saved,blocked:S.blocked,minutes_rotted_today:rotMin(),settings:SET};const txt=JSON.stringify(data,null,2);const el=ovPage('Your data',`<p class="fine">Everything Brain Rot knows about you. It lives only in this browser.</p><pre class="code">${esc(txt)}</pre><button class="btn wide" type="button" id="cpData">Copy</button>`);pushOv(el);$('#cpData',el).addEventListener('click',()=>{try{navigator.clipboard.writeText(txt).then(()=>toast('Copied'),()=>{selectPre(el)})}catch(err){selectPre(el)}});return}
  const pages={
    help:['Help center',[['Why can I not hear anything?','Tap the speaker button on the home screen. On iPhone, also flip the silent switch off and turn the volume up.'],['Are Brain Coins real money?','No. Packs are free and nothing is ever charged. Coins only exist on this device.'],['What language are they speaking?','Simlish. Every English word has its own made-up word, so they always say the same thing the same way.'],['Can I post my own videos?','Yes. Tap the pink + button, pick a star and a vibe, add some text, and post.'],['How do I stop seeing a creator?','Open the share menu on their video and tap Block, or block them from their profile.']]],
    rules:['Community guidelines',[['Be kind','Unless you are a goose. Geese are exempt.'],['No spoilers','Do not spoil what happens to Kevin. We all know. Do not say it.'],['Respect the pigeon','He is rated 3000. He has earned it.'],['Gift responsibly','Never throw a goblin into soup without the chef\'s consent. Actually, consent is implied.'],['Touch grass','At least once a day. We will remind you if you set a limit.']]],
    terms:['Terms of service',[['1. Nothing is real','Every video, creator, live stream, coin and follower in Brain Rot is fake.'],['2. Your data','Your profile and settings are stored only in this browser. We never see them.'],['3. Coins','Brain Coins have no value. You cannot buy them or cash them out.'],['4. Brain rot','By using this app you accept some amount of brain rot. Results may vary.']]]
  };
  const p=pages[id];if(!p)return;const el=ovPage(p[0],`<div class="faq">${p[1].map(([q,a])=>`<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>`);pushOv(el);
}
function selectPre(el){const r=document.createRange();r.selectNodeContents($('.code',el));const s=getSelection();s.removeAllRanges();s.addRange(r);toast('Selected. Copy it from here.')}

/* =====================================================================
   SCREEN TIME, LOGIN, SPLASH
   ===================================================================== */
let sessionMs=0,lastBreak=0;
function rotTick(dt){
  S.rot.ms+=dt;sessionMs+=dt;
  if(Math.random()<.002)save();
  const m=S.rot.ms/60000;
  if(SET.limit&&m>=SET.limit&&!S.rot.warned){S.rot.warned=1;save();showRemind(`You have rotted for ${Math.floor(m)} minutes today.`,'That is your daily limit. Your brain would like a snack and some sunlight.')}
  else if(SET.breaks&&sessionMs-lastBreak>=SET.breaks*60000){lastBreak=sessionMs;showRemind('Time for a break?',`You have been scrolling for ${SET.breaks} minutes straight. Blink a few times. Drink some water.`)}
}
function showRemind(t,b){const r=$('#remind');$('#rmT').textContent=t;$('#rmB').textContent=b;r.hidden=false;updPlay()}
$('#rmKeep').addEventListener('click',()=>{$('#remind').hidden=true;updPlay(true)});
$('#rmGrass').addEventListener('click',()=>{$('#remind').hidden=true;burst('🌱',18);toast('Grass touched. Welcome back, champion.');updPlay(true)});
function showLogin(){const l=$('#login');$('#lgH').textContent=meAt();$('#lgAv').textContent=S.me.av;l.hidden=false;updPlay()}
$('#lgIn').addEventListener('click',()=>{S.loggedOut=false;save();$('#login').hidden=true;toast(`Welcome back, ${meAt()}`);updPlay(true)});
$('#lgOther').addEventListener('click',()=>{S.loggedOut=false;save();$('#login').hidden=true;openEditProfile();toast('Pick a new username')});
function startApp(withSound){
  $('#splash').classList.add('out');setTimeout(()=>$('#splash').hidden=true,450);splashOn=false;
  if(withSound)soundOn().then(ok=>{if(ok)AU.sfx('tada')});else{SET.sound=false;saveSet();setSoundUI()}
  if(S.loggedOut)showLogin();else updPlay(true);
}
$('#spGo').addEventListener('click',()=>startApp(true));
$('#spMute').addEventListener('click',()=>startApp(false));

/* ambient activity */
function ambient(){
  const r=Math.random();const fol=S.following.filter(f=>LIVES.some(l=>l.h===f.h));
  if(r<.3&&fol.length){const f=pick(fol);addNote('live',f.av,`<b>@${esc(f.h)}</b> went live: ${esc(LIVES.find(l=>l.h===f.h).t)}`,{live:f.h})}
  else if(r<.5&&S.posts.length){const h=pick(Object.keys(CREATORS));addNote('likes',CR(h).av,`<b>@${esc(h)}</b> liked your video "${esc(pick(S.posts).top)}"`)}
  else if(r<.62){const h=pick(Object.keys(CREATORS));if(SET.private)addNote('follows',CR(h).av,`<b>@${esc(h)}</b> requested to follow you.`,{req:h});else{S.followers++;save();addNote('follows',CR(h).av,`<b>@${esc(h)}</b> started following you`)}}
  else if(r<.72){const h=pick(Object.keys(CREATORS));addNote('mentions',CR(h).av,`<b>@${esc(h)}</b> mentioned you in a comment: "${esc(meAt())} ${esc(pick(['you have to see this','this is literally you','explain yourself','KEVIN','we need to talk about the ducks']))}"`)}
  else if(r<.8&&SET.dms!=='off'){initDMs();const pool=Object.keys(DM_REPLY).filter(h=>!isBlocked(h)&&(SET.dms==='everyone'||isFollowing(h)));if(pool.length){const h=pick(pool);(S.dms[h]=S.dms[h]||[]).push({me:0,t:pick(DM_REPLY[h]),ts:Date.now(),voice:Math.random()<.4});S.dmUnread[h]=(S.dmUnread[h]||0)+1;save();updBadge();if(view==='inbox')renderInbox()}}
  setTimeout(ambient,rand(35000,70000));
}

/* ---------- keyboard ---------- */
document.addEventListener('keydown',e=>{
  if(e.target.matches('input,textarea'))return;
  if(e.key==='Escape'){if(openSheet)closeSheet();else if(!room.hidden)closeLive();else if(OV.stack.length)popOv();return}
  const f=playCtx();if(!f||openSheet)return;const r=f.root;
  if(e.key==='ArrowDown'||e.key==='j'){e.preventDefault();r.scrollBy({top:r.clientHeight,behavior:'smooth'})}
  else if(e.key==='ArrowUp'||e.key==='k'){e.preventDefault();r.scrollBy({top:-r.clientHeight,behavior:'smooth'})}
  else if(e.key===' '&&P.card){e.preventDefault();P.paused=!P.paused;P.card.classList.toggle('paused',P.paused);if(P.paused){AU.cut();Music.stop()}else Music.start(P.card._v.mus)}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden){AU.cut();save()}});

/* ---------- live room wiring ---------- */
$('#lrclose').addEventListener('click',()=>closeLive());
$('#lrfol').addEventListener('click',()=>{const on=toggleFollow(Room.L.h,Room.L.a);updLrFol();if(on){api.sys(`You followed @${Room.L.h}`);api.say(`Thank you for the follow, ${meAt()}!`)}});
$('#lrgift').addEventListener('click',()=>openGift({type:'live',h:Room.L.h,av:Room.L.a,L:Room.L}));
$('#lrheart').addEventListener('click',()=>{for(let i=0;i<3;i++)setTimeout(()=>floatHeart(true),i*120);Room.L.likes+=3;updLr()});
$('#lrhost').addEventListener('click',()=>{const h=Room.L.h;closeLive();openProfile(h)});
$('#lrform').addEventListener('submit',e=>{e.preventDefault();const inp=$('#lrinput');const t=inp.value.trim();if(!t||!Room.L)return;chatMsg(`<b>${esc(meH())}</b>${esc(t)}`,'me');inp.value='';liveReply(t)});

/* ---------- boot ---------- */
initDMs();applyRootClasses();setSoundUI();seedNotes();updCoins();updFoCount();updBadge();
$('#spGo').textContent=SET.sound?'Tap to start (sound on)':'Tap to start';
FY.fill(5);
setTimeout(ambient,25000);
requestAnimationFrame(tick);
