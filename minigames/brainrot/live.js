'use strict';
/* =====================================================================
   LIVE STREAMS: room controller + stream modules
   ===================================================================== */
const Room={L:null,mod:null,timers:[],lastSay:0,speakUntil:0,talkT:null,gifters:{},
  later(fn,ms){const t=setTimeout(()=>{if(Room.L)fn()},ms);Room.timers.push(t);return t},
  tick(dt,now){
    if(Room.mod&&Room.mod.tick)Room.mod.tick(dt/1000);
    const gap=Room.mod&&Room.mod.gap||6500;
    if(Room.L.idle&&!(Room.mod&&Room.mod.noIdle)&&now-Room.lastSay>gap&&now>Room.speakUntil+700&&!(Room.mod&&Room.mod.busy))api.say(pick(Room.L.idle),Room.mod&&Room.mod.idleOpts||{});
  },
  gift(g,u,me){
    chatMsg(`<b>${esc(u.replace('@',''))}</b>sent ${g.e} ${esc(g.n)}`,'g');
    Room.L.raised+=g.c;updGoal(true);
    Room.gifters[u]=(Room.gifters[u]||0)+g.c;updTop3();
    const handled=Room.mod&&Room.mod.gift&&Room.mod.gift(g,u,me);
    if(!handled&&(me||Math.random()<.35))Room.later(()=>api.say((Room.L.thx||'{u}, thank you!').replace('{u}',u)),600);
  }
};
const api={
  hostEl:null,hostEl2:null,
  say(text,o={}){
    const L=Room.L;if(!L)return 0;
    const now=performance.now();Room.lastSay=now;
    const two=o.who===2;const vx=o.vx||(two?L.vox2:L.vox);
    const sp=simlish(text);
    const el=$('#hsay');
    if(SET.subs==='off'){el.hidden=true}else{
      el.hidden=false;
      const name=o.name||(two?L.name2:L.name1);
      const shown=o.sing?`♪ ${text} ♪`:text;
      const cc=o.whisper?'(whispering) '+shown:(o.yell&&!o.sing)?'(yelling) '+shown:shown;
      el.innerHTML=`${name?`<span class="hn2">${esc(name)}</span>`:''}${SET.subs!=='en'?`<b class="gb">${esc(o.sing?'♪ '+sp.disp+' ♪':sp.disp)}</b>`:''}${SET.subs!=='sim'?`<span class="cc"><em>CC</em>${esc(cc)}</span>`:''}`;
      repop(el);
    }
    const d=AU.speak(sp,vx,o);Room.speakUntil=now+d*1000;
    const h=two?api.hostEl2:api.hostEl;if(h){h.classList.add('talk');clearTimeout(h._t);h._t=setTimeout(()=>h.classList.remove('talk'),Math.max(500,d*1000))}
    return d;
  },
  react(arr){arr.forEach((t,i)=>Room.later(()=>chatMsg(`<b>${esc(pick(CNAMES))}</b>${esc(t)}`),i*rand(160,420)+rand(0,200)))},
  sys(t){chatMsg(esc(t),'sys')},
  sfx(n){AU.sfx(n)},
  shake(){if(!SET.reduceMotion)repop($('#lrs'),'shake')},
  later:(fn,ms)=>Room.later(fn,ms),
  ban(txt,cls,ms=3000){const b=document.createElement('div');b.className='bigban '+(cls||'');b.textContent=txt;$('#lrs').appendChild(b);Room.later(()=>b.remove(),ms);return b}
};
function chatMsg(html,cls=''){const c=$('#chat');if(!c)return;const m=document.createElement('div');m.className='msg '+cls;m.innerHTML=html;c.appendChild(m);while(c.children.length>30)c.firstChild.remove()}
function updGoal(bump){const L=Room.L;if(!L)return;const p=Math.min(100,L.raised/L.goal[1]*100);$('#lrgoal i').style.width=p+'%';$('#lrgoalT').textContent=`🎯 ${L.goal[0]} · ${comma(L.raised)} / ${comma(L.goal[1])}`;if(bump)repop($('#lrgoal'),'pop');if(L.raised>=L.goal[1]&&!L._goalHit){L._goalHit=1;Room.later(()=>{api.ban('GOAL REACHED!','gold');AU.sfx('tada');api.say('WE HIT THE GOAL! Thank you chat!',{yell:true})},800)}}
function updTop3(){const arr=Object.entries(Room.gifters).sort((a,b)=>b[1]-a[1]).slice(0,3);$('#lrtop3').innerHTML=arr.map(([u,c],i)=>`<span class="t3${u===meAt()?' me':''}">${['🥇','🥈','🥉'][i]} ${esc(u.replace('@',''))} <b>${fmt(c)}</b></span>`).join('')}

const NUMW=(()=>{const o=['','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'],t=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];return n=>n===100?'one hundred':n<20?o[n]:t[Math.floor(n/10)]+(n%10?' '+o[n%10]:'')})();

/* ---------- modules ---------- */
const MODS={
runner(L,root){
  root.innerHTML=`<canvas class="gcv"></canvas><div class="ghud"><span>ATTEMPT <b class="at"></b></span><span>SCORE <b class="sc"></b></span><span>BEST <b class="bs"></b></span><span class="lvs"></span></div>`;
  const cv=$('canvas',root),ctx=cv.getContext('2d');let W=0,H=0;
  const size=()=>{const dpr=Math.min(2,window.devicePixelRatio||1);W=root.clientWidth;H=root.clientHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)};
  const st={att:L._att||437,best:L._best||1210,score:0,dist:0,speed:250,obs:[],py:0,vy:0,dead:0,inv:0,lives:0,next:420,rec:false};
  const GY=()=>H*.6,PX=()=>W*.24;let ban=null;
  const EMO='"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  function hud(){$('.at',root).textContent=st.att;$('.sc',root).textContent=st.score;$('.bs',root).textContent=st.best;$('.lvs',root).textContent=st.lives?'❤️'.repeat(Math.min(st.lives,5)):''}
  function reset(){st.score=0;st.dist=0;st.speed=250;st.obs=[];st.py=0;st.vy=0;st.dead=0;st.next=420;st.rec=false;if(ban){ban.remove();ban=null}hud()}
  function spawn(){const ok=Math.random()<.87;st.obs.push({x:W+30,e:pick(['🌵','🔥','🪨','🦔','🧱']),plan:ok?rand(58,84):(Math.random()<.5?rand(150,175):-1),j:false})}
  function die(){st.dead=3;api.shake();api.sfx('lose');ban=api.ban('GAME OVER','red',2900);if(st.score>st.best){st.best=st.score;L._best=st.best}api.say(pick(L.die),{yell:true});api.react(['L','💀💀','skill issue','HE WAS SO CLOSE','hitbox moment',`attempt ${st.att+1} here we go`].sort(()=>Math.random()-.5).slice(0,4))}
  function draw(){
    const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#2a1250');g.addColorStop(.6,'#ff5a3d');g.addColorStop(.6,'#3b1d14');g.addColorStop(1,'#1a0b07');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    ctx.fillStyle='rgba(20,6,40,.65)';ctx.beginPath();ctx.moveTo(0,GY());for(let x=0;x<=W;x+=10)ctx.lineTo(x,GY()-60-Math.sin((x+st.dist*.2)/60)*28-Math.sin((x+st.dist*.2)/23)*10);ctx.lineTo(W,GY());ctx.fill();
    ctx.fillStyle='#ff7a1a';for(let x=-((st.dist*.9)%40);x<W;x+=40)ctx.fillRect(x,GY()+2,22,4);
    ctx.font='38px '+EMO;ctx.textAlign='center';ctx.textBaseline='bottom';
    st.obs.forEach(o=>{ctx.globalAlpha=o.hit?.3:1;ctx.fillText(o.e,o.x,GY()+4)});ctx.globalAlpha=1;
    const bob=st.py===0&&!st.dead?Math.abs(Math.sin(st.dist/18))*4:0;
    ctx.save();ctx.translate(PX(),GY()+st.py-bob+4);
    if(st.inv>0){ctx.shadowColor=`hsl(${(performance.now()/4)%360} 100% 60%)`;ctx.shadowBlur=24}
    if(st.dead)ctx.rotate(Math.min(1.6,(3-st.dead)*3));
    ctx.scale(-1,1);ctx.font='44px '+EMO;ctx.fillText('🏃',0,0);ctx.restore();
  }
  window.addEventListener('resize',size);hud();
  return {
    tick(dt){
      if(!W)size();
      if(st.dead>0){st.dead-=dt;if(st.dead<=0){st.att++;L._att=st.att;reset();api.say(pick(L.retry))}draw();return}
      const sp=st.speed*(st.inv>0?1.6:1);st.dist+=sp*dt;st.score=Math.floor(st.dist/12);st.speed=Math.min(520,250+st.dist/60);
      st.next-=sp*dt;if(st.next<=0){spawn();st.next=rand(260,480)}
      if(st.py<0||st.vy<0){st.vy+=1700*dt;st.py+=st.vy*dt;if(st.py>=0){st.py=0;st.vy=0}}
      for(const o of st.obs){o.x-=sp*dt;const d=o.x-PX();
        if(!o.j&&o.plan>0&&d<=o.plan*(sp/250)&&st.py===0){st.vy=-600;st.py=-.01;o.j=true;api.sfx('jump')}
        if(!o.hit&&Math.abs(d)<24&&st.py>-30){if(st.inv>0)o.hit=true;else if(st.lives>0){st.lives--;o.hit=true;api.say('Extra life used! Phew!');hud()}else{die();break}}}
      st.obs=st.obs.filter(o=>o.x>-60);if(st.inv>0)st.inv-=dt;
      if(!st.rec&&st.score>st.best){st.rec=true;api.say(pick(L.record),{yell:true});api.react(['NEW RECORD???','W','LETS GOOO','🔥🔥🔥']);api.sfx('tada')}
      if(Math.random()<dt*.6)hud();draw();
    },
    gift(g,u){if(g.c>=500){st.lives++;hud();api.say(L.life.replace('{u}',u),{yell:true});return true}if(g.c>=199){st.inv=5;api.say(L.boost.replace('{u}',u),{yell:true});return true}return false},
    destroy(){window.removeEventListener('resize',size)}
  };
},
rpg(L,root){
  const BOSSES=[['🐉','Ancient Dragon',100],['👹','Ogre King',120],['🦑','Lord of the Deep',140],['🤖','Mecha Overlord',160],['🍕','Sentient Pizza (final)',200]];
  root.innerHTML=`<div class="rpg"><div class="rfoe"><div class="rnm fn"></div><div class="rbar fb"><i></i></div><span class="rfe">🐉</span></div><div class="rhero"><span class="rhe">🧝</span><div class="rnm">Hero + Gerald (stick)</div><div class="rbar g hb2"><i></i></div></div><div class="rlog"></div></div>`;
  const fe=$('.rfe',root),he=$('.rhe',root),log=$('.rlog',root);
  const st={bi:0,fhp:100,fmax:100,hhp:60,hmax:60,t:0,turn:0,phase:'fight',bonus:0};
  const upd=()=>{$('.fb i',root).style.width=Math.max(0,st.fhp/st.fmax*100)+'%';$('.hb2 i',root).style.width=Math.max(0,st.hhp/st.hmax*100)+'%'};
  const say=t=>{log.textContent=t;repop(log)};
  const num=(txt,el,cls='')=>{const r=el.getBoundingClientRect(),R=root.getBoundingClientRect();const s=document.createElement('span');s.className='rdm '+cls;s.textContent=txt;s.style.left=(r.left-R.left+r.width/2+rand(-14,14))+'px';s.style.top=(r.top-R.top+r.height*.3)+'px';root.appendChild(s);setTimeout(()=>s.remove(),1000)};
  function setBoss(){const b=BOSSES[st.bi%BOSSES.length];st.fmax=b[2]+Math.floor(st.bi/BOSSES.length)*60;st.fhp=st.fmax;fe.textContent=b[0];$('.fn',root).textContent=b[1];fe.className='rfe';repop(fe,'enter');upd();say(`${b[1]} appears!`)}
  function hitFoe(d,cls){st.fhp-=d;num((cls==='crit'?'CRIT ':'')+'-'+d,fe,cls);repop(fe,'hitf');api.sfx('hit');upd();if(st.fhp<=0)victory()}
  function heroAtk(){repop(he,'atkR');let d=rand(4,9);const crit=Math.random()<.12;if(crit)d=rand(16,22);d+=st.bonus;st.bonus=0;say(crit?'Gerald lands a CRITICAL bonk!':pick(['You bonk it with Gerald.','Gerald strikes!','A firm poke.','Stick to the face.']));if(crit)api.say(pick(L.crit),{yell:true});hitFoe(d,crit?'crit':'')}
  function foeAtk(){repop(fe,'atkL');const d=rand(5,11)+st.bi*2;st.hhp-=d;num('-'+d,he);repop(he,'hitf');api.sfx('hit');say(`${$('.fn',root).textContent} attacks!`);upd();if(d>12&&Math.random()<.5)api.say(pick(L.hit));if(st.hhp<=0)defeat()}
  function victory(){st.phase='wait';fe.className='rfe';repop(fe,'dead');api.ban('VICTORY','gold',3400);api.sfx('tada');api.say(pick(L.win),{yell:true});api.react(['GG','GERALD!!','W STICK','LETS GOOO']);api.later(()=>{st.bi++;st.hhp=st.hmax;st.phase='fight';st.t=0;st.turn=0;setBoss();api.say(pick(L.next))},3600)}
  function defeat(){st.phase='wait';repop(he,'dead');api.ban('DEFEATED','red',3400);api.sfx('lose');api.say(pick(L.die),{yell:true});api.react(['L','gerald deserved better','💀','he was so close']);api.later(()=>{he.className='rhe';st.hhp=st.hmax;st.fhp=st.fmax;st.phase='fight';st.t=0;st.turn=0;upd();say('Try again!')},3600)}
  setBoss();
  return {
    tick(dt){if(st.phase!=='fight')return;st.t+=dt;if(st.t>1.8){st.t=0;st.turn?foeAtk():heroAtk();st.turn^=1}},
    gift(g,u,me){if(st.phase!=='fight')return false;
      if(g.c<10){const h=g.c<5?8:15;st.hhp=Math.min(st.hmax,st.hhp+h);num('+'+h,he,'heal');say(`${u} healed the hero!`);upd();api.sfx('ding')}
      else if(g.c<99){st.bonus+=12;say(`${u} sharpened Gerald! +12 next hit`);api.sfx('ding')}
      else if(g.c<500){say(`${u} called down a METEOR!`);api.shake();api.sfx('boom');hitFoe(35,'crit')}
      else{st.hhp=st.hmax;upd();say(`${u} fully healed you and smote the boss!`);api.shake();api.sfx('boom');hitFoe(60,'crit')}
      if(me)api.say(`${u}! You saved Gerald!`,{yell:true});return true}
  };
},
cook(L,root){
  root.innerHTML=`<div class="kit"><span class="khost"><i class="hostE">${L.a}</i></span><div class="kpot"><span class="kp">🍲</span><span class="kfl">🔥</span></div><div class="krec"><b>Soup #<span class="kn">1</span></b><div class="kli"></div></div></div>`;
  api.hostEl=$('.khost .hostE',root);
  const NORMAL=['🥕','🧅','🥔','🍅','🧄','🌶️','🥦','🧀','🍄'];
  const WEIRD={'🧦':['sock','A SOCK? Who brought a sock? It goes in.'],'🦆':['duck','The duck is swimming. He lives here now.'],'🍌':['banana','Banana soup. A classic. Probably.'],'🍫':['chocolate','Chocolate soup. For dessert. And breakfast.'],'🧃':['juice box','A juice box! We hydrate the soup.'],'🌵':['cactus','Cactus! Spicy, in a stabby way.'],'🥫':['bean','Beans in soup. Revolutionary.'],'📱':['phone',"Somebody's phone. It is ringing. In the soup."]};
  const GIFT={'Rose':['rose','A rose! Romantic soup tonight, chat.'],'Brain Cell':['brain','A brain cell! Now the soup is smarter than me.'],'Rubber Duck':['rubber duck','A rubber duck! He floats! He is our mascot!'],'Toast':['toast','Toast! Croutons, baby!'],'Goblin':['goblin','A GOBLIN? In MY soup? He is stirring now.'],'Rocket':['rocket','A ROCKET! The soup has left the atmosphere!'],'Castle':['castle','A whole castle! In this economy?'],'Unicorn':['unicorn','A unicorn. Magical. Also probably illegal.']};
  const st={n:1,items:[],names:[],t:0,next:2.4,phase:'add'};
  const pot=$('.kpot',root),kp=$('.kp',root),fl=$('.kfl',root),li=$('.kli',root);
  function drop(e,name,line){
    const d=document.createElement('span');d.className='kdrop';d.textContent=e;d.style.left=rf(30,80)+'%';d.style.top='16%';root.appendChild(d);
    requestAnimationFrame(()=>requestAnimationFrame(()=>{d.style.left='58%';d.style.top='45%';d.style.rotate=rand(-300,300)+'deg'}));
    api.sfx('whoosh');
    api.later(()=>{d.remove();repop(kp,'hitf');api.sfx('splash');st.items.push(e);if(name)st.names.push(name);li.textContent=st.items.join(' ');if(line)api.say(line);else if(Math.random()<.4)api.say(pick(L.add));if(Math.random()<.13)fire()},900);
  }
  function fire(){fl.classList.add('big');api.shake();api.sfx('fire');api.say(pick(L.fire),{yell:true});api.react(['FIRE','🔥🔥🔥','call 911 lmao','health inspector is typing']);api.later(()=>fl.classList.remove('big'),2600)}
  function reveal(){
    st.phase='show';repop(pot,'hitf');api.sfx('tada');
    const ADJ=['Forbidden','Damp','Haunted','Crunchy','Suspicious',"Grandma's",'Ultimate','Questionable','Legendary'];const DISH=['Stew','Soup','Casserole','Chowder','Surprise','Bisque'];
    const name=`${pick(ADJ)} ${st.names.length?st.names[st.names.length-1].replace(/\b\w/g,m=>m.toUpperCase())+' ':''}${pick(DISH)}`;
    const p=document.createElement('div');p.className='panel';p.innerHTML=`<div class="pe">🍲</div><div class="pn">${esc(name)}</div><div class="ps">Taste: ${rand(1,10)}/10 · Smell: ${pick(['concerning','legal','alive','loud','sad','meaty?'])} · Chat rating: ${rand(2,5)}★</div>`;root.appendChild(p);
    api.say(pick(L.review));api.react(['5 STARS','i would eat that','no.','the duck deserved better','send recipe']);
    api.later(()=>{p.remove();st.n++;$('.kn',root).textContent=st.n;st.items=[];st.names=[];li.textContent='';st.phase='add';st.t=0},5200);
  }
  return {
    tick(dt){if(st.phase!=='add')return;st.t+=dt;if(st.t>st.next){st.t=0;st.next=rf(2.4,3.4);if(st.items.length>=5){st.phase='wait';api.later(reveal,1200);return}if(Math.random()<.35){const e=pick(Object.keys(WEIRD));drop(e,WEIRD[e][0],WEIRD[e][1])}else drop(pick(NORMAL))}},
    gift(g,u){const m=GIFT[g.n];drop(g.e,m[0],`${u}... ${m[1]}`);return true},gap:8000
  };
},
qa(L,root){
  root.innerHTML=`<div class="qa"><div class="ring"></div><span class="qhost"><i class="hostE">${L.a}</i></span><span class="qsw">💦</span></div>`;
  api.hostEl=$('.qhost .hostE',root);
  const st={t:2.5,deck:shuffle(L.qa.slice())};let card=null;
  const show=(u,q)=>{if(card)card.remove();card=document.createElement('div');card.className='qcard';card.innerHTML=`<small>@${esc(u)} asks</small><span>${esc(q)}</span>`;root.appendChild(card)};
  function ask(){if(!st.deck.length)st.deck=shuffle(L.qa.slice());const q=st.deck.pop();const u=pick(CNAMES);show(u,q[0]);chatMsg(`<b>${esc(u)}</b>${esc(q[0])}`);api.later(()=>{api.say(q[1],{scared:true});repop($('.qsw',root),'go');if(Math.random()<.5)api.react([pick(['LMAO','protect him','😭😭','so real',"he's so honest"])])},1500)}
  return {
    tick(dt){st.t-=dt;if(st.t<=0){st.t=rf(9,12);ask()}},
    reply(t){api.later(()=>{show(meH(),t);api.say(pick(L.replies),{scared:true});repop($('.qsw',root),'go')},1200);st.t=Math.max(st.t,8);return true},
    gap:9500,idleOpts:{scared:true}
  };
},
sing(L,root){
  root.innerHTML=`<div class="stg"><div class="spot"></div><div class="floor"></div><div class="songt"></div><span class="shost"><i class="hostE">${L.a}</i></span><span class="smic">🎤</span></div>`;
  api.hostEl=$('.shost .hostE',root);
  const st={si:0,li:0,t:1.5,phase:'intro',noteT:0};const songt=$('.songt',root);
  const SCALE=[[1,1.122,1.26,1.498,1.26,1.122],[1.335,1.26,1.122,1,1.122,1.26],[1.498,1.682,1.498,1.335,1.26,1.122],[1,1.26,1.498,2,1.498,1.26]];
  function note(){const n=document.createElement('span');n.className='mnote';n.textContent=pick(['♪','♫','♬']);n.style.left=rf(38,62)+'%';n.style.top='44%';n.style.setProperty('--dx',rand(-60,60)+'px');root.appendChild(n);setTimeout(()=>n.remove(),2200)}
  function roses(n){for(let i=0;i<n;i++)api.later(()=>{const r=document.createElement('span');r.className='rose';r.textContent='🌹';r.style.left=rf(22,78)+'%';r.style.setProperty('--r',rand(-200,200)+'deg');root.appendChild(r);setTimeout(()=>r.remove(),2000)},i*130)}
  return {
    noIdle:true,
    tick(dt){
      if(st.phase==='song'){st.noteT-=dt;if(st.noteT<=0){st.noteT=rf(.25,.5);note()}}
      st.t-=dt;if(st.t>0)return;
      const song=L.songs[st.si%L.songs.length];
      if(st.phase==='intro'){songt.textContent=`Now singing: ${song.n}`;repop(songt);st.t=api.say(`This one is called ${song.n}.`)+.8;st.phase='song';st.li=0;return}
      if(st.phase==='song'){const last=st.li===song.l.length-1;const d=api.say(song.l[st.li],{sing:true,hold:last,notes:SCALE[st.li%SCALE.length]});if(last){api.shake();api.react(['MY EARS','HE HIT IT','🔊🔊🔊','windows shattered'])}st.t=d+.4;st.li++;if(st.li>=song.l.length)st.phase='bow';return}
      if(st.phase==='bow'){roses(8);api.sfx('cheer');api.say(pick(L.between));api.react(['ENCORE','BRAVO','👏👏👏','she was delicious 💀']);songt.textContent='';st.si++;st.t=5;st.phase='intro'}
    },
    gift(g,u){roses(g.c>=99?16:4);if(g.c>=99){api.later(()=>api.say(`${u}! This high note is for you!`,{yell:true}),300);api.later(()=>{api.say('AAH',{sing:true,hold:true});api.shake()},2600)}else api.later(()=>api.say(L.thx.replace('{u}',u)),300);return true}
  };
},
chess(L,root){
  root.innerHTML=`<div class="chs"><div class="board"><span class="pig"><i>🐦</i></span><span class="bread">🍞</span></div></div>`;
  const board=$('.board',root),pig=$('.pig',root),bread=$('.bread',root);const T='︎';let pcs=[];
  function setup(){pcs.forEach(p=>p.el.remove());pcs=[];const back=['♜','♞','♝','♛','♚','♝','♞','♜'],wback=['♖','♘','♗','♕','♔','♗','♘','♖'];
    const add=(g,c,r,w)=>{const el=document.createElement('span');el.className='pc'+(w?' w':'');el.textContent=g+T;el.style.left=c*12.5+'%';el.style.top=r*12.5+'%';board.insertBefore(el,pig);pcs.push({el,c,r,w,g})};
    back.forEach((g,c)=>add(g,c,0));for(let c=0;c<8;c++)add('♟',c,1);for(let c=0;c<8;c++)add('♙',c,6,1);wback.forEach((g,c)=>add(g,c,7,1));movePig(8.6,3.2);bread.classList.remove('on')}
  function movePig(c,r){pig.style.left=c*12.5+'%';pig.style.top=r*12.5+'%';repop(pig,'hop')}
  function knock(c,r){pcs.filter(p=>!p.off&&Math.abs(p.c-c)<=.6&&Math.abs(p.r-r)<=.6).forEach(p=>{p.off=true;p.el.style.transform=`translate(${rand(-160,160)}px,${rand(-120,60)}px) rotate(${rand(-540,540)}deg)`;p.el.classList.add('off');api.sfx('pop')})}
  let steps=[],si=0,wait=1.5,breadMode=false;
  function plan(){steps=[];si=0;
    steps.push([1.8,()=>{const mv=pcs.filter(p=>p.w&&p.r===6&&!p.off);const p=pick(mv);if(p){p.r-=rand(1,2);p.el.style.top=p.r*12.5+'%'}api.sfx('thud');api.say(pick(L.move))}]);
    steps.push([2.6,()=>{movePig(7,rand(2,5));api.sfx('quack')}]);
    for(let i=0;i<4;i++)steps.push([.75,()=>{const c=rand(0,7),r=rand(0,7);movePig(c,r);knock(c,r)}]);
    steps.push([.4,()=>{api.say(pick(L.pig),{yell:true});api.react(['pigeon diff','not the queen 😭','LMAO',"he's STRUTTING"])}]);
    for(let i=0;i<3;i++)steps.push([.7,()=>{const c=rand(0,7),r=rand(1,6);movePig(c,r);knock(c,r)}]);
    steps.push([1.4,()=>{const k=pcs.find(p=>p.g==='♔');if(k&&!k.off){k.off=true;k.el.style.transform='translate(80px,-160px) rotate(720deg)';k.el.classList.add('off')}api.ban('🐦 PIGEON WINS','red',3200);api.sfx('lose');api.say(pick(L.lose))}]);
    steps.push([3.6,()=>{setup();plan()}])}
  setup();plan();
  return {
    tick(dt){if(breadMode)return;wait-=dt;if(wait<=0&&steps[si]){const [d,fn]=steps[si];si++;fn();wait=d}},
    gift(g,u){if(g.c<25||breadMode)return false;breadMode=true;bread.classList.add('on');api.sys(`${u.replace('@','')} threw bread!`);movePig(9.2,6.1);api.sfx('quack');
      api.later(()=>{api.ban('YOU WIN?!','mint',3600);api.sfx('tada');api.say(pick(L.win),{yell:true});api.react(['BREAD STRATEGY','W','history','the pigeon is eating lmao']);api.later(()=>{breadMode=false;setup();plan();wait=1.5},3800)},1200);return false}
  };
},
fish(L,root){
  root.innerHTML=`<div class="fsh"><div class="wv"></div><span class="dock"></span><svg class="fline" viewBox="0 0 100 100" preserveAspectRatio="none"><line x1="27" y1="27" x2="68" y2="49" stroke="#fff" stroke-opacity=".7" stroke-width="1" vector-effect="non-scaling-stroke"/></svg><span class="fhost"><i class="hostE">${L.a}</i></span><span class="rod">🎣</span><span class="bob">🔴</span><span class="alrt">❗</span></div>`;
  api.hostEl=$('.fhost .hostE',root);
  const CATCH={common:[['🐟','Regular Fish','He is just a guy.'],['👢','Old Boot','Size 11. Left foot. The search continues.'],['🥫','Can of Beans','Expired 1998. Still sealed.'],['🌿','Seaweed','Crunchy. Allegedly.']],rare:[['🐡','Pufferfish','He is not mad. He is just like that.'],['📱',"Someone's Phone",'47 missed calls from Mom.'],['🦀','Crab With Briefcase','He is late for a meeting.'],['🐢','Turtle','Released. He had places to be. Slowly.']],epic:[['🦈','SHARK','We are gonna need a bigger stream.'],['🐙','Octopus','Stole the bait, the rod, and my watch.'],['💍','Diamond Ring','The proposal went badly. Very badly.']],legendary:[['🧌','A Goblin','He was living down there. He is furious.'],['🐋','Whale','The dock is gone now.'],['🗿','Moai','How.']]};
  const COL={common:'#8a8399',rare:'#2b7fff',epic:'#9b38ff',legendary:'#e09a00'};
  const st={phase:'wait',t:rf(3,5),bait:null};const bob=$('.bob',root),al=$('.alrt',root);let panel=null;
  function roll(){if(st.bait){const b=st.bait;st.bait=null;return b}const r=Math.random();return r<.55?'common':r<.83?'rare':r<.96?'epic':'legendary'}
  return {
    tick(dt){st.t-=dt;if(st.t>0)return;
      if(st.phase==='wait'){bob.classList.add('bite');al.classList.remove('on');repop(al,'on');api.sfx('splash');api.say(pick(L.bite),{yell:Math.random()<.4});st.phase='reel';st.t=1.8}
      else if(st.phase==='reel'){bob.classList.remove('bite');al.classList.remove('on');const rar=roll();const [e,n,f]=pick(CATCH[rar]);
        panel=document.createElement('div');panel.className='panel';panel.innerHTML=`<span class="tag" style="background:${COL[rar]}">${rar.toUpperCase()}</span><div class="pe">${e}</div><div class="pn">${esc(n)}</div><div class="ps">${esc(f)}<br>${rf(.4,rar==='legendary'?900:rar==='epic'?300:30).toFixed(1)} lb</div>`;root.appendChild(panel);
        api.sfx(rar==='legendary'?'boom':rar==='epic'?'tada':'ding');if(rar==='legendary'||rar==='epic')api.shake();
        api.say(pick(L.react[rar]),{yell:rar==='legendary'||rar==='epic'});
        api.react(rar==='legendary'?['LEGENDARY??','NO WAY','CLIP IT','🚨🚨🚨']:rar==='epic'?['WHAT','W CATCH','huge']:rar==='rare'?['nice','W']:['lol','release him','classic']);st.phase='show';st.t=4.8}
      else if(st.phase==='show'){if(panel){panel.remove();panel=null}st.phase='wait';st.t=rf(3.5,6)}},
    gift(g,u){if(g.c>=1000){st.bait='legendary';api.say(`${u} sent unicorn bait. Chat, it is legendary time.`,{yell:true});return true}if(g.c>=199){st.bait='epic';api.say(`${u} sent golden bait! Something big is coming.`);return true}return false},
    gap:7500
  };
},
horror(L,root){
  root.innerHTML=`<div class="hor"><span class="it" style="left:50%;top:36%;font-size:96px">🚪</span><span class="it" style="left:20%;top:30%;font-size:44px">🖼️</span><span class="it" style="left:78%;top:52%;font-size:52px">🪑</span><span class="it" style="left:32%;top:56%;font-size:34px">🕯️</span><span class="it" style="left:64%;top:60%;font-size:40px">🧸</span><span class="it" style="left:86%;top:26%;font-size:34px">🕸️</span><div class="dark"></div><div class="scare">👹</div><div class="redfl"></div></div>`;
  const dark=$('.dark',root),sc=$('.scare',root),red=$('.redfl',root);const st={lx:50,ly:45,tx:50,ty:45,tt:0,phase:'calm',t:rf(9,13)};
  function scare(){st.phase='after';st.t=3.2;sc.classList.remove('go');void sc.offsetWidth;sc.classList.add('go');repop(red,'go');api.shake();AU.sfx('scream');const fe=$('#fcamE');fe.textContent='😱';repop(fe,'jump');api.later(()=>fe.textContent=L.a,2400);api.later(()=>api.say(pick(L.scare),{yell:true,scared:true}),300);api.react(['LMAOOOO','HIS SCREAM 😭','💀💀💀','i jumped too','clip it'])}
  return {
    idleOpts:{whisper:true},gap:7000,get busy(){return st.phase!=='calm'},
    tick(dt){st.tt-=dt;if(st.tt<=0){st.tt=rf(1,2);st.tx=rf(18,82);st.ty=rf(26,62)}st.lx+=(st.tx-st.lx)*Math.min(1,dt*2);st.ly+=(st.ty-st.ly)*Math.min(1,dt*2);dark.style.setProperty('--lx',st.lx+'%');dark.style.setProperty('--ly',st.ly+'%');
      st.t-=dt;if(st.t>0)return;
      if(st.phase==='calm'){st.phase='tense';st.t=3;st.tx=50;st.ty=38;[0,700,1300,1800,2250,2600].forEach(ms=>api.later(()=>api.sfx('heart'),ms));api.say(pick(['Wait. Did you hear that?','Something is behind the door.','Okay okay okay okay.']),{whisper:true})}
      else if(st.phase==='tense')scare();
      else if(st.phase==='after'){api.say(pick(L.after),{scared:true});st.phase='calm';st.t=rf(10,15)}},
    gift(g,u){if(g.c>=25){api.sys(`${u.replace('@','')} triggered a jumpscare 😈`);if(st.phase==='calm'){st.phase='tense';st.t=1.2;api.say('Chat. Chat what did you do.',{whisper:true})}return true}api.say(L.small.replace('{u}',u),{whisper:true});return true}
  };
},
trivia(L,root){
  root.innerHTML=`<div class="tri"><span class="thost"><i class="hostE">${L.a}</i></span><div class="tbox"><div class="tnum"></div><div class="tq"></div><div class="topts"></div><div class="tbar"><i></i></div></div><div class="tscore">Your score <b class="tsc">0</b> · Streak <b class="tst">0</b></div></div>`;
  api.hostEl=$('.thost .hostE',root);
  const st={phase:'intro',t:2.5,deck:shuffle(L.qs.slice()),q:null,pick:null,score:0,streak:0,votes:[0,0,0],n:0,tl:0};
  const box=$('.tbox',root),qel=$('.tq',root),opts=$('.topts',root),bar=$('.tbar i',root);
  function render(){const tot=st.votes.reduce((a,b)=>a+b,0)||1;opts.innerHTML=st.q[1].map((o,i)=>{let cls='';if(st.phase==='reveal'){if(i===st.q[2])cls=' ok';else if(i===st.pick)cls=' bad'}else if(i===st.pick)cls=' sel';return `<button class="topt${cls}" type="button" data-i="${i}"><span>${esc(o)}</span><b>${Math.round(st.votes[i]/tot*100)}%</b><i style="width:${st.votes[i]/tot*100}%"></i></button>`}).join('')}
  function ask(){if(!st.deck.length)st.deck=shuffle(L.qs.slice());st.q=st.deck.pop();st.pick=null;st.votes=st.q[1].map(()=>rand(1,4));st.n++;$('.tnum',root).textContent=`Question ${st.n}`;qel.textContent=st.q[0];st.phase='open';st.tl=11;render();repop(box);api.say(st.q[0]);api.sfx('bell')}
  function reveal(){st.phase='reveal';render();const ok=st.pick===st.q[2];
    if(st.pick==null){api.say(st.q[3])}
    else if(ok){st.streak++;const prize=20*st.streak;st.score+=prize;addCoins(prize,`Trivia win on @${L.h}`);api.sfx('correct');api.say(`${st.q[3]} ${meAt()} got it! Plus ${prize} coins!`);api.react(['W '+meH(),'big brain','ez']);burst('🪙',8)}
    else{st.streak=0;api.sfx('buzzer');api.say(`${st.q[3]} Sorry ${meAt()}.`);api.react(['L','who picked that 💀','it was obvious'])}
    $('.tsc',root).textContent=st.score;$('.tst',root).textContent=st.streak;st.t=5}
  opts.addEventListener('click',e=>{const b=e.target.closest('.topt');if(!b||st.phase!=='open'||st.pick!=null)return;st.pick=+b.dataset.i;st.votes[st.pick]+=3;AU.sfx('pop');render()});
  return {
    noIdle:true,
    tick(dt){
      if(st.phase==='open'){st.tl-=dt;bar.style.width=Math.max(0,st.tl/11*100)+'%';const c=st.q[2];if(Math.random()<dt*6){const i=Math.random()<.5?c:rand(0,st.q[1].length-1);st.votes[i]+=rand(1,5);render()}if(st.tl<=0)reveal();return}
      st.t-=dt;if(st.t>0)return;
      if(st.phase==='intro'){api.say(pick(L.idle));st.phase='wait';st.t=3}
      else ask();
    },
    reply(t){if(st.phase==='open'&&st.q){const i=st.q[1].findIndex(o=>t.toLowerCase().includes(o.toLowerCase()));if(i>=0&&st.pick==null){st.pick=i;render();api.later(()=>api.say(`Locked in, ${meAt()}.`),600);return true}}return false}
  };
},
podcast(L,root){
  root.innerHTML=`<div class="pod"><div class="onair">● ON AIR</div><div class="ptopic"></div><div class="pdesk"><span class="ph1"><i class="hostE">${L.a}</i></span><span class="mic1">🎙️</span><span class="mic2">🎙️</span><span class="ph2"><i class="hostE">${L.a2}</i></span></div><div class="ppoll" hidden></div></div>`;
  api.hostEl=$('.ph1 .hostE',root);api.hostEl2=$('.ph2 .hostE',root);
  const st={ti:-1,li:0,t:1.5,phase:'next',votes:[0,0],pick:null,order:shuffle(L.topics.map((_,i)=>i))};
  const topic=$('.ptopic',root),poll=$('.ppoll',root);
  function renderPoll(){const T=L.topics[st.order[st.ti%st.order.length]];const tot=st.votes[0]+st.votes[1]||1;poll.innerHTML=`<div class="pq">Chat poll: ${esc(T.q)}</div>`+T.a.map((a,i)=>`<button class="topt${st.pick===i?' sel':''}" type="button" data-i="${i}"><span>${esc(a)}</span><b>${Math.round(st.votes[i]/tot*100)}%</b><i style="width:${st.votes[i]/tot*100}%"></i></button>`).join('')}
  poll.addEventListener('click',e=>{const b=e.target.closest('.topt');if(!b||st.phase!=='poll'||st.pick!=null)return;st.pick=+b.dataset.i;st.votes[st.pick]+=5;AU.sfx('pop');renderPoll()});
  return {
    noIdle:true,
    tick(dt){
      if(st.phase==='poll'&&Math.random()<dt*5){st.votes[Math.random()<.55?0:1]+=rand(1,4);renderPoll()}
      st.t-=dt;if(st.t>0)return;
      if(st.phase==='next'){st.ti++;st.li=0;const T=L.topics[st.order[st.ti%st.order.length]];topic.textContent=T.q;repop(topic);poll.hidden=true;st.phase='talk';st.t=.6;return}
      const T=L.topics[st.order[st.ti%st.order.length]];
      if(st.phase==='talk'){const [w,line]=T.l[st.li];const d=api.say(line,{who:w});st.t=d+.35;st.li++;if(st.li>=T.l.length){st.phase='poll';st.votes=[rand(3,9),rand(3,9)];st.pick=null;st.t=7;api.later(()=>{poll.hidden=false;renderPoll();repop(poll)},d*1000)}return}
      if(st.phase==='poll'){st.phase='result';const w=st.votes[0]>=st.votes[1]?0:1;const tot=st.votes[0]+st.votes[1];const pct=Math.round(st.votes[w]/tot*100);
        const d=api.say(`Chat says: ${T.a[w]}. ${pct} percent.`,{who:1});api.later(()=>{api.say(w===0?pick(['I demand a recount.','This is rigged.','Fine. FINE.']):pick(['Ha! Told you.','The people have spoken.','Unbelievable. Thank you chat.']),{who:2,yell:Math.random()<.4})},d*1000+300);st.t=d+4.2;st.phase='next';api.react(['RIGGED','correct answer','racc is losing it','next topic!'])}
    },
    gift(g,u){api.later(()=>api.say(`${u} just sent a ${g.n}! Racc, say thank you.`,{who:1}),400);api.later(()=>api.say('Thank you! I love you! Who are you?',{who:2}),2800);return true}
  };
},
dj(L,root){
  root.innerHTML=`<div class="club"><div class="lights"></div><div class="beams"></div><div class="booth"><span class="djh"><i class="hostE">${L.a}</i></span><span class="decks">🎛️</span></div><div class="dcrowd"></div></div>`;
  api.hostEl=$('.djh .hostE',root);
  const crowd=$('.dcrowd',root);const CE=['🙋','💃','🕺','🙌','🧍','🦆','🐸','🦝','🐼','🐧','🦊','🐻','👽','🤖','🐔','🦖'];
  CE.forEach((e,i)=>{const s=document.createElement('span');s.textContent=e;s.style.left=(4+i*6)+'%';s.style.animationDelay=(-(i%4)*.12)+'s';s.style.animationDuration=(60/124*2)+'s';crowd.appendChild(s)});
  const st={t:rf(14,18),phase:'groove'};
  function drop(u){st.phase='drop';AU.sfx('riser');api.say(pick(L.hype),{yell:true});
    api.later(()=>api.ban('3','gold',700),1300);api.later(()=>api.ban('2','gold',700),2000);api.later(()=>api.ban('1','gold',700),2700);
    api.later(()=>{AU.sfx('drop');api.shake();api.shake();root.classList.add('dropped');burst('🎉',16);api.say(pick(L.drop),{yell:true});api.react(['DROP','🔊🔊🔊','MY EARS','insane','🪩🪩🪩']);api.later(()=>root.classList.remove('dropped'),2500);st.phase='groove';st.t=rf(22,30)},3500)}
  return {
    gap:7000,
    tick(dt){if(st.phase!=='groove')return;st.t-=dt;if(st.t<=0)drop()},
    gift(g,u){if(g.c>=99&&st.phase==='groove'){api.say(`${u}, this drop is for you!`,{yell:true});api.later(()=>drop(u),1600);return true}return false}
  };
},
kart(L,root){
  root.innerHTML=`<canvas class="gcv"></canvas><div class="ghud"><span>LAP <b class="lp">1</b>/3</span><span>POS <b class="ps2">1</b>/6</span></div>`;
  const cv=$('canvas',root),ctx=cv.getContext('2d');let W=0,H=0;
  const size=()=>{const dpr=Math.min(2,window.devicePixelRatio||1);W=root.clientWidth;H=root.clientHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)};
  const EMO='"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  const K=[{e:'🐢',b:.105,host:1},{e:'🐇',b:.112},{e:'🦊',b:.108},{e:'🦔',b:.104},{e:'🐧',b:.106},{e:'🐌',b:.09}];
  let st;function reset(){st={t:0,done:false,bananas:[],lastPos:0,lastSay:0,boost:0,shield:0,count:3};K.forEach((k,i)=>{k.p=-i*.012;k.spin=0;k.v=k.b;k.fin=0})}
  reset();
  const pos=p=>{const a=p*Math.PI*2-Math.PI/2;const cx=W/2,cy=H*.44,rx=W*.38,ry=H*.15;return [cx+rx*Math.cos(a),cy+ry*Math.sin(a)]};
  function rank(){return K.slice().sort((a,b)=>b.p-a.p).indexOf(K[0])+1}
  function draw(){
    ctx.fillStyle='#2f8f46';ctx.fillRect(0,0,W,H);
    ctx.save();ctx.translate(W/2,H*.44);ctx.scale(1,(H*.15)/(W*.38));ctx.strokeStyle='#555a66';ctx.lineWidth=46*(W*.38)/(H*.15)*.32;ctx.beginPath();ctx.arc(0,0,W*.38,0,Math.PI*2);ctx.stroke();ctx.setLineDash([12,14]);ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=2*(W*.38)/(H*.15)*.32;ctx.stroke();ctx.restore();
    const [fx,fy]=pos(0);ctx.fillStyle='#fff';ctx.fillRect(fx-3,fy-22,6,44);
    ctx.font='22px '+EMO;ctx.textAlign='center';ctx.textBaseline='middle';
    st.bananas.forEach(b=>{const [x,y]=pos(b.p);ctx.fillText('🍌',x,y)});
    K.slice().sort((a,b)=>pos(a.p)[1]-pos(b.p)[1]).forEach(k=>{const [x,y]=pos(k.p);ctx.save();ctx.translate(x,y);if(k.spin>0)ctx.rotate(k.spin*12);if(k.host){ctx.beginPath();ctx.arc(0,0,19,0,7);ctx.fillStyle=st.boost>0?'rgba(255,201,60,.8)':'rgba(255,61,139,.55)';ctx.fill()}ctx.font='28px '+EMO;ctx.fillText(k.e,0,0);ctx.restore()});
    if(st.count>0){ctx.fillStyle='rgba(0,0,0,.4)';ctx.fillRect(0,H*.36,W,H*.12);ctx.fillStyle='#fff';ctx.font='900 48px Anton,Impact,sans-serif';ctx.fillText(Math.ceil(st.count),W/2,H*.42)}
  }
  window.addEventListener('resize',size);
  return {
    gap:6500,
    tick(dt){
      if(!W)size();
      if(st.count>0){const b=Math.ceil(st.count);st.count-=dt;if(Math.ceil(st.count)!==b)AU.sfx(st.count<=0?'ding':'beep');if(st.count<=0)api.say('GO GO GO!',{yell:true});draw();return}
      if(st.done){draw();return}
      st.t+=dt;
      if(Math.random()<dt*.18&&st.bananas.length<3){const lead=K.slice().sort((a,b)=>b.p-a.p)[rand(0,2)];st.bananas.push({p:lead.p+rf(.08,.2)})}
      K.forEach(k=>{if(k.fin)return;if(Math.random()<dt*.8)k.v=k.b*rf(.85,1.18);let v=k.v;if(k.host&&st.boost>0)v*=1.8;if(k.spin>0){k.spin-=dt;v*=.15}k.p+=v*dt;
        st.bananas.forEach(b=>{if(!b.hit&&Math.abs((k.p%1+1)%1-(b.p%1+1)%1)<.008){b.hit=1;if(k.host&&st.shield>0){st.shield=0;api.say('Shield! The banana bounced off!')}else{k.spin=1.2;if(k.host){api.say(pick(L.banana),{yell:true});api.react(['BANANA 😭','he spun','banana diff'])}AU.sfx('swoosh')}}});
        if(k.p>=3&&!k.fin){k.fin=st.t}});
      st.bananas=st.bananas.filter(b=>!b.hit&&b.p>Math.min(...K.map(k=>k.p))-.05);
      if(st.boost>0)st.boost-=dt;
      const r=rank();$('.ps2',root).textContent=r;$('.lp',root).textContent=Math.min(3,Math.floor(Math.max(0,K[0].p))+1);
      if(r!==st.lastPos&&st.t-st.lastSay>4){st.lastSay=st.t;if(r===1)api.say(pick(L.first),{yell:true});else if(r>st.lastPos)api.say(pick(L.passed),{yell:Math.random()<.5})}
      st.lastPos=r;
      if(K[0].p>=3){st.done=true;const fr=K.filter(k=>k.p>=3).sort((a,b)=>a.fin-b.fin).indexOf(K[0])+1||r;
        if(fr===1){api.ban('1ST PLACE','gold',4500);AU.sfx('tada');api.say(pick(L.win),{yell:true});api.react(['GG','TURTLE WINS','🐢🐢🐢','he did it'])}else{api.ban(`${fr}${['','ST','ND','RD','TH','TH','TH'][fr]} PLACE`,'red',4500);AU.sfx('lose');api.say(pick(L.lose))}
        api.later(()=>{reset();api.say('New race. Lock in, turtle.')},6000)}
      draw();
    },
    gift(g,u){if(g.c>=199){st.boost=4;api.say(`${u} gave me a turbo boost! ZOOM!`,{yell:true});return true}if(g.c>=25){st.shield=1;api.say(`${u} gave me a banana shield! Thank you!`);return true}return false},
    destroy(){window.removeEventListener('resize',size)}
  };
},
workout(L,root){
  root.innerHTML=`<div class="gymr"><div class="wex"></div><div class="wnum">0</div><div class="wtar"></div><span class="whost"><i class="hostE">${L.a}</i></span><span class="wmat"></span></div>`;
  api.hostEl=$('.whost .hostE',root);
  const EX=[['PUSHUPS',100],['SQUATS',50],['JUMPING JACKS',60],['BURPEES',30],['REPS FOR KEVIN',20]];
  const st={ei:0,n:0,target:EX[0][1],t:2.5,phase:'intro',rt:0};const wh=$('.whost',root);
  const setEx=()=>{const e=EX[st.ei%EX.length];st.n=0;st.target=e[1];$('.wex',root).textContent=e[0];$('.wnum',root).textContent='0';$('.wtar',root).textContent=`of ${st.target}`};
  setEx();
  return {
    noIdle:false,gap:9000,get busy(){return st.phase==='reps'},
    tick(dt){
      st.t-=dt;
      if(st.phase==='intro'){if(st.t<=0){api.say(`Okay chat! ${EX[st.ei%EX.length][0].toLowerCase()}! Let us go!`,{yell:true});st.phase='reps';st.t=2.2}return}
      if(st.phase==='reps'){if(st.t>0)return;st.n++;st.t=1.2;repop(wh,'rep');$('.wnum',root).textContent=st.n;repop($('.wnum',root));
        if(st.n%5===0||st.n<=3||st.n>=st.target-2)api.say(NUMW(Math.min(st.n,100)).toUpperCase()+'!',{yell:true});
        if(st.n%10===0)api.react(['GO COACH','💪💪💪','LIGHT WEIGHT',`${st.n}!!`]);
        if(st.n>=st.target){st.phase='done';st.t=4;api.ban('DONE!','gold',2600);AU.sfx('tada');api.later(()=>api.say(pick(L.done),{yell:true}),400)}return}
      if(st.phase==='done'&&st.t<=0){st.ei++;setEx();st.phase='intro';st.t=1.5}
    },
    gift(g,u){const add=g.c>=199?25:g.c>=25?10:5;st.target+=add;$('.wtar',root).textContent=`of ${st.target}`;api.later(()=>api.say(`${u} added ${add} reps. WHY. Thank you. WHY.`,{yell:true}),300);api.react(['LMAOOO','more reps','he hates you','🫡']);return true}
  };
},
art(L,root){
  root.innerHTML=`<div class="studio"><div class="easel"><canvas class="acv"></canvas></div><div class="req"></div><span class="ahost"><i class="hostE">${L.a}</i></span><span class="apal">🎨</span></div>`;
  api.hostEl=$('.ahost .hostE',root);
  const cv=$('.acv',root),ctx=cv.getContext('2d');let W=0,H=0;
  const size=()=>{const r=cv.getBoundingClientRect();const dpr=Math.min(2,window.devicePixelRatio||1);W=r.width;H=r.height;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)};
  const REQ=[['a dragon','🐉','There he is. He is shy.'],['my ex','🤡','Accurate, I am told.'],['a spaceship','🚀','It is taking off. Very small.'],['a cat','🐈','He is judging the mountains.'],['the meaning of life','🍕','There. Pizza. Obviously.'],['kevin the chicken','🐔','For Kevin. Wherever he is.'],['my homework','📝','There. Done. You are welcome.']];
  const EMO='"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  let req,steps=[],si=0,sp=0,seed=1;const R=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
  const stroke=(x1,y1,x2,y2,col,w)=>{ctx.strokeStyle=col;ctx.lineCap='round';for(let j=0;j<3;j++){ctx.lineWidth=w*(.6+R()*.6);ctx.globalAlpha=.55+R()*.3;ctx.beginPath();ctx.moveTo(x1+(R()-.5)*4,y1+(R()-.5)*4);ctx.lineTo(x2+(R()-.5)*4,y2+(R()-.5)*4);ctx.stroke()}ctx.globalAlpha=1};
  function build(){const hue=rand(0,40);const sky=[`hsl(${200+hue} 80% 75%)`,`hsl(${20+hue} 90% 72%)`];const sunX=rf(.2,.8),mt=[...Array(6)].map(()=>rf(.25,.5));
    steps=[
      {d:2.2,say:'First, a sky. Every painting needs somewhere to look up to.',f:p=>{const n=Math.floor(p*22);for(let i=sp;i<n;i++){const y=(i/22)*H*.62;stroke(0,y,W,y,i<11?sky[0]:sky[1],14)}sp=n}},
      {d:1.4,f:p=>{if(p>.5&&sp<99){sp=99;ctx.fillStyle='#ffe066';ctx.beginPath();ctx.arc(sunX*W,H*.22,H*.08,0,7);ctx.fill()}}},
      {d:2,say:'Now some mountains. Every mountain needs a friend.',f:p=>{const n=Math.floor(p*6);for(let i=sp;i<n;i++){ctx.fillStyle=`hsl(${230+i*6} 25% ${38+i*3}%)`;ctx.beginPath();const x=(i/5)*W;ctx.moveTo(x-W*.3,H*.62);ctx.lineTo(x,H*mt[i]);ctx.lineTo(x+W*.3,H*.62);ctx.fill()}sp=n}},
      {d:1.6,f:p=>{const n=Math.floor(p*10);for(let i=sp;i<n;i++){const y=H*.62+(i/10)*H*.38;stroke(0,y,W,y,i<4?'#5aa9d6':'#5c9e4a',16)}sp=n}},
      {d:2,say:'A few trees. They are a family. They love each other.',f:p=>{const n=Math.floor(p*5);for(let i=sp;i<n;i++){const x=W*(.08+i*.21),y=H*(.84+R()*.08);ctx.fillStyle='#5b3a1e';ctx.fillRect(x-2,y-10,4,12);ctx.fillStyle='#1f6b3a';ctx.beginPath();ctx.moveTo(x,y-46);ctx.lineTo(x-14,y-8);ctx.lineTo(x+14,y-8);ctx.fill()}sp=n}},
      {d:1.4,f:p=>{if(p>.4&&sp<99){sp=99;ctx.strokeStyle='#333';ctx.lineWidth=1.5;for(let i=0;i<3;i++){const x=W*(.3+i*.12),y=H*(.3+R()*.08);ctx.beginPath();ctx.moveTo(x-6,y);ctx.lineTo(x,y+4);ctx.lineTo(x+6,y);ctx.stroke()}}}},
      {d:2.4,req:1,f:p=>{if(p>.3&&sp<99){sp=99;ctx.font=Math.round(H*.07)+'px '+EMO;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(req[1],W*rf(.7,.9),H*rf(.7,.78))}}},
      {d:1.2,f:p=>{if(p>.5&&sp<99){sp=99;ctx.fillStyle='#222';ctx.font='italic 700 12px Figtree,sans-serif';ctx.textAlign='right';ctx.fillText('— crab',W-8,H-8)}}}
    ];si=-1;sp=0;
  }
  const st={phase:'pick',t:1.5,st:0};
  function newReq(){req=pick(REQ);const u=pick(CNAMES);const el=$('.req',root);el.innerHTML=`<small>@${esc(u)} requested</small><b>${esc(req[0])}</b>`;repop(el);chatMsg(`<b>${esc(u)}</b>paint ${esc(req[0])} pls`);size();ctx.fillStyle='#f6f1e4';ctx.fillRect(0,0,W,H);build();api.say(`${req[0]}? Wonderful. Let us begin.`)}
  window.addEventListener('resize',size);
  return {
    gap:9000,get busy(){return st.phase==='paint'},
    tick(dt){
      if(st.phase==='pick'){st.t-=dt;if(st.t<=0){newReq();st.phase='paint';st.t=2.6}return}
      if(st.phase==='paint'){if(si<0){st.t-=dt;if(st.t<=0){si=0;st.st=0;sp=0;if(steps[0].say)api.say(steps[0].say)}return}
        const s=steps[si];st.st+=dt;s.f(Math.min(1,st.st/s.d));if(Math.random()<dt*2)AU.sfx('brush');
        if(st.st>=s.d){si++;st.st=0;sp=0;if(si>=steps.length){st.phase='reveal';st.t=6;api.ban('MASTERPIECE','gold',2500);AU.sfx('tada');api.later(()=>api.say(`Sold for three seashells.`),2600);api.react(['FRAME IT','10/10','i want it','crab bob strikes again']);return}const n=steps[si];if(n.say)api.say(n.say);if(n.req){api.later(()=>{api.say(req[2]);api.react(['WHERE','i see it!','THE '+req[0].toUpperCase(),'he is so small 😭'])},900)}}
        return}
      if(st.phase==='reveal'){st.t-=dt;if(st.t<=0){st.phase='pick';st.t=1}}
    },
    destroy(){window.removeEventListener('resize',size)}
  };
},
news(L,root){
  root.innerHTML=`<div class="nws"><div class="nscreen"><span class="nemo">📰</span></div><div class="ndesk"><span class="nhost"><i class="hostE">${L.a}</i></span><div class="dsk">PARROT NEWS</div></div><div class="nfield" hidden><span class="nrep"><i class="hostE">🐧</i></span><div class="nflab">LIVE · FIELD REPORT</div></div><div class="nl3"><span class="brk">BREAKING</span><div class="nhl"></div></div><div class="ntick"><span class="ntk"></span></div></div>`;
  api.hostEl=$('.nhost .hostE',root);const rep=$('.nrep .hostE',root);
  $('.ntk',root).textContent=(L.heads.map(h=>h[0]).join('  •  ')+'  •  ').repeat(2);
  api.hostEl2=rep;
  const st={i:-1,t:1.5,phase:'next',q:[],qi:0,order:shuffle(L.heads.map((_,i)=>i))};const REPV={...VOX.small,p:340};
  const EM=['🪿','😴','🐈','🐦','🧦','🌋','🤖','🐸','🕷️','🦆'];const fld=$('.nfield',root);
  return {
    noIdle:true,
    tick(dt){st.t-=dt;if(st.t>0)return;
      if(st.phase==='next'){
        st.i++;const k=st.order[st.i%st.order.length];const Hn=L.heads[k];
        $('.nhl',root).textContent=Hn[0];repop($('.nl3',root));$('.nemo',root).textContent=EM[k%EM.length];AU.sfx('ding');
        st.q=[{t:`Breaking news. ${Hn[0]}.`}];
        Hn[1].forEach((ln,i)=>st.q.push(Hn[2]&&i>=1?{t:ln,f:1}:{t:ln}));
        if(Hn[2])st.q.push({t:'Back to you.',f:1,end:1});
        st.q.push({t:pick(['Truly shocking.','We will keep you updated.','Wow. Anyway.','In other news.'])});
        st.qi=0;st.phase='q';st.t=.5;return}
      const it=st.q[st.qi++];
      if(!it){st.phase='next';st.t=1.2;if(Math.random()<.5)api.react(['BREAKING','this is the only news i trust','kevin again??','the field reporter 😭']);return}
      if(it.f&&fld.hidden){fld.hidden=false;repop(fld);AU.sfx('static')}
      if(!it.f&&!fld.hidden)fld.hidden=true;
      st.t=api.say(it.t,it.f?{who:2,vx:REPV,name:'Field reporter',yell:!it.end&&Math.random()<.4}:{name:'Anchor'})+.45;
    }
  };
}
};
const GAMES=['runner','rpg','chess','horror','kart'];

/* ---------- room open/close ---------- */
function openLive(L){
  closeSheet();if(Room.L)closeLive(true);
  if(isBlocked(L.h)){toast(`You blocked @${L.h}.`);return}
  AU.cut();Room.L=L;Room.gifters={};room.hidden=false;
  const game=GAMES.includes(L.type);room.classList.toggle('gm',game);
  $('#fcam').hidden=!game;$('#fcamE').textContent=L.a;$('#hsay').hidden=true;$('#hsay').innerHTML='';
  $('#lrav').textContent=L.a;$('#lrav').style.background=avBg(L.h);$('#lrname').textContent='@'+L.h;$('#lrtitle').textContent=L.t;
  $('#chat').innerHTML='';updLrFol();updLr();updGoal();updTop3();
  api.hostEl=game?$('#fcamE'):null;api.hostEl2=null;
  const lrs=$('#lrs');lrs.className='lrs';lrs.innerHTML='';
  Room.mod=MODS[L.type](L,lrs);
  Room.lastSay=performance.now()-4000;Room.speakUntil=0;
  Music.start(L.mus);
  chatMsg(SET.sound&&AU.ok()?'Welcome to Brain Rot LIVE. Be kind, gift weird.':'Welcome to Brain Rot LIVE. Tap the speaker to hear the host.','sys');
  const chatLoop=()=>{if(Math.random()<.12)chatMsg(`<b>${esc(pick(CNAMES))}</b>joined`,'join');else chatMsg(`<b>${esc(pick(CNAMES))}</b>${esc(Math.random()<.5?pick(L.chat):pick(LIVECHAT))}`);Room.later(chatLoop,rand(700,1700))};Room.later(chatLoop,400);
  Room.timers.push(setInterval(()=>{L.viewers=Math.max(100,L.viewers+rand(-260,340));L.likes+=rand(10,120);updLr()},1800));
  const giftLoop=()=>{const g=pick(GIFTS.slice(0,6));const u=pick(CNAMES);giftFX(g,{name:u,av:pick(CAV)},false);Room.gift(g,u,false);Room.later(giftLoop,rand(9000,16000))};Room.later(giftLoop,rand(5000,8000));
  const heartLoop=()=>{floatHeart();Room.later(heartLoop,rand(500,1500))};heartLoop();
  updPlay();
}
function updLr(){if(!Room.L)return;$('#lrview').textContent=fmt(Room.L.viewers);$('#lrlikes').textContent=`${fmt(Room.L.likes)} likes`}
function updLrFol(){const on=isFollowing(Room.L.h);const b=$('#lrfol');b.classList.toggle('on',on);b.textContent=on?'Following':'Follow'}
function closeLive(keep){
  Room.timers.forEach(t=>{clearTimeout(t);clearInterval(t)});Room.timers.length=0;
  if(Room.mod&&Room.mod.destroy)Room.mod.destroy();Room.mod=null;Room.L=null;api.hostEl=null;api.hostEl2=null;AU.cut();
  if(keep)return;
  room.hidden=true;closeSheet();Music.stop();updPlay();
}
function floatHeart(mine){const h=document.createElement('div');h.className='fh';h.textContent=mine?'💖':pick(['❤️','💖','💜','💛','🩷']);h.style.setProperty('--dx',rand(-50,20)+'px');room.appendChild(h);setTimeout(()=>h.remove(),2250)}
function liveReply(t){
  const L=Room.L;const low=t.toLowerCase();
  if(Room.mod&&Room.mod.reply&&Room.mod.reply(t))return;
  let line=null;
  if(L.keys)for(const k in L.keys)if(low.includes(k)){line=L.keys[k];break}
  if(!line&&/\b(hi|hello|hey|yo|sup)\b/.test(low))line=pick([`Hi ${meAt()}! Welcome in!`,`${meAt()}! Hello hello!`,`Oh hi ${meAt()}. Welcome to the chaos.`]);
  if(!line&&/(love|best|goat|amazing|w\b)/.test(low))line=pick([`${meAt()}, I love you too.`,`Stop it ${meAt()}, I am blushing.`]);
  if(!line&&/(bad|boring|trash|cringe|l\b)/.test(low))line=pick([`${meAt()}, rude. Accurate. But rude.`,`Mods? Mods. Actually we have no mods.`]);
  if(!line&&/\?/.test(low))line=pick([`Good question ${meAt()}. The answer is yes. Or no.`,`${meAt()}, I will answer that after the stream. I will not.`]);
  if(!line)line=pick([`Shoutout to ${meAt()}!`,`${meAt()}, I read that. Interesting.`,`${meAt()}, you are so real for that.`]);
  const two=L.type==='podcast'&&Math.random()<.5;
  Room.later(()=>api.say(line,{who:two?2:1}),1300);
}
