'use strict';
/* =====================================================================
   BRAIN ROT AUDIO
   - Simlish: a consistent made-up language (same English word -> same gibberish word)
   - Voice: phoneme-based formant synthesizer with prosody and emotion
   - Music: small data-driven sequencer with styles
   - Effects: synthesized one-shots
   ===================================================================== */

/* ---------- Simlish lexicon ---------- */
const SIM_V=['a','e','i','o','u','ah','ee','oo','ai','ou','oi'];
const SIM_VW=[.2,.15,.12,.16,.1,.05,.05,.05,.06,.04,.02];
const SIM_ON1=['b','d','f','g','k','l','m','n','p','r','s','sh','t','v','w','z','h','y','ch','zh','b','m','n','l','s','d'];
const SIM_ON2=['bl','br','fl','gl','kr','pl','sn','sw','tr','dr','gr','sp','st','fr','sk'];
const SIM_CODA=['n','m','s','b','sh','k','l','z','p','t','n','b'];
const SIM_FIXED={i:'ba',a:'na',the:'zo',you:'noobi',yes:'sha',no:'nub',ok:'wooki',okay:'wooki',hi:'shoo',hello:'shooba',bye:'dagoo',thank:'vashi',thanks:'vashi',please:'flimpa',what:'wah',why:'bloo',chat:'shagga',oh:'oo',wow:'wawoo',no_:'nub'};
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function mkRng(seed){let x=(seed>>>0)||1;return()=>{x^=x<<13;x>>>=0;x^=x>>>17;x^=x<<5;x>>>=0;return x/4294967296}}
function wPick(r,arr,w){let x=r(),i=0;for(;i<arr.length-1;i++){x-=w[i];if(x<0)break}return arr[i]}
function engSyl(w){const m=w.replace(/e$/,'').match(/[aeiouy]+/g);return Math.max(1,Math.min(4,m?m.length:1))}
function parsePh(str){const out=[];let i=0;const two=['sh','ch','zh','ah','ee','oo','ai','ou','oi'];while(i<str.length){const d=str.slice(i,i+2);if(two.includes(d)){out.push(d);i+=2}else{out.push(str[i]);i++}}return out}
const SIM_LEX=new Map();
function gibWord(raw){
  const key=raw.toLowerCase().replace(/[^a-z0-9']/g,'');if(!key)return null;
  if(SIM_LEX.has(key))return SIM_LEX.get(key);
  let ph;
  if(SIM_FIXED[key])ph=parsePh(SIM_FIXED[key]);
  else{
    const r=mkRng(hashStr(key)+977);const n=engSyl(key);const syl=[];
    for(let s=0;s<n;s++){
      if(s===1&&r()<.13){syl.push(syl[0].slice());continue}
      const p=[];const x=r();
      if(x<.66||(s===0&&x<.85))p.push(SIM_ON1[Math.floor(r()*SIM_ON1.length)]);
      else if(x<.85)p.push(...SIM_ON2[Math.floor(r()*SIM_ON2.length)].split(''));
      p.push(wPick(r,SIM_V,SIM_VW));
      if((s===n-1&&r()<.4)||(s<n-1&&r()<.12))p.push(SIM_CODA[Math.floor(r()*SIM_CODA.length)]);
      syl.push(p);
    }
    ph=syl.flat();
  }
  const res={ph,txt:ph.join('')};SIM_LEX.set(key,res);return res;
}
/* English text -> {disp, words:[{ph,end}]} */
function simlish(text){
  const clean=String(text).replace(/\*[^*]*\*/g,' ').replace(/[♪♫]/g,' ');
  const toks=clean.split(/\s+/).filter(Boolean);
  const words=[];const disp=[];let cap=true;
  const allCaps=/[A-Z]{3}/.test(clean)&&clean===clean.toUpperCase();
  for(const tk of toks){
    const m=tk.match(/^(.*?)([.,!?…;:]*)$/);const core=m[1],punct=m[2]||'';
    const g=gibWord(core);
    if(!g){if(punct&&words.length)words[words.length-1].end=punct[0]==='…'?'.':punct[0];continue}
    let s=g.txt;if(cap)s=s[0].toUpperCase()+s.slice(1);if(allCaps)s=s.toUpperCase();
    disp.push(s+(punct?punct.replace('…','...'):''));
    words.push({ph:g.ph,end:punct?(punct[0]==='…'?'.':punct[0]):''});
    cap=/[.!?…]/.test(punct);
  }
  return {disp:disp.join(' '),words,allCaps,q:/\?\s*$/.test(clean),ex:/!\s*$/.test(clean),sad:/^\s*\.\.\./.test(clean)};
}

/* ---------- phonetics ---------- */
const PH_V={a:[730,1090,2440],e:[530,1840,2480],i:[330,2150,2900],o:[570,840,2410],u:[330,920,2240],ah:[700,1180,2500],ee:[270,2290,3010],oo:[300,870,2240],ai:['a','i'],ou:['o','u'],oi:['o','i']};
const PH_C={p:{k:'stop',b:850},b:{k:'stop',b:650,v:1},t:{k:'stop',b:3800},d:{k:'stop',b:3200,v:1},k:{k:'stop',b:1900},g:{k:'stop',b:1700,v:1},ch:{k:'aff'},
  s:{k:'fric',f:6300,q:2.4,a:.5},z:{k:'fric',f:5600,q:2.2,a:.35,v:1},sh:{k:'fric',f:3000,q:2.6,a:.6},zh:{k:'fric',f:2800,q:2.6,a:.4,v:1},f:{k:'fric',f:5200,q:.7,a:.28},v:{k:'fric',f:4300,q:.7,a:.22,v:1},h:{k:'asp'},
  m:{k:'nas',F:[260,1100,2300]},n:{k:'nas',F:[270,1700,2600]},l:{k:'liq',F:[360,1300,2900]},r:{k:'liq',F:[420,1200,1700]},w:{k:'liq',F:[300,700,2200]},y:{k:'liq',F:[280,2250,3000]},x:{k:'fric',f:2500,q:1,a:.35}};
const isV=p=>!!PH_V[p];
const vF=p=>{const v=PH_V[p];return typeof v[0]==='string'?PH_V[v[0]]:v};
function sylls(ph){const out=[];let cur=[];const vi=[];ph.forEach((p,i)=>{if(isV(p))vi.push(i)});if(!vi.length)return [ph];
  let start=0;vi.forEach((v,k)=>{const nextV=vi[k+1];let end;if(nextV==null)end=ph.length;else{const gap=nextV-v-1;end=v+1+Math.max(0,gap-1)}out.push(ph.slice(start,end));start=end});return out}

/* ---------- voices ---------- */
const VOX={
  tiny:{p:520,fm:1.36,br:.1,sp:1.18},
  small:{p:330,fm:1.24,br:.09,sp:1.1},
  kid:{p:300,fm:1.22,br:.08,sp:1.08},
  fem:{p:225,fm:1.16,br:.13,sp:1.02},
  mid:{p:145,fm:1,br:.08,sp:1},
  bro:{p:122,fm:.96,br:.1,sp:1.06},
  low:{p:100,fm:.9,br:.1,sp:.95},
  deep:{p:60,fm:.78,br:.2,sp:.84},
  old:{p:132,fm:.97,br:.22,sp:.86,shake:1},
  robot:{p:128,fm:1,robot:1,sp:1,br:0},
  ghost:{p:290,fm:1.15,br:.65,sp:.86,shake:1}
};
const VMAP={'🐭':'tiny','🐜':'tiny','🐦':'tiny','🐌':'tiny','🐝':'tiny','🕷️':'tiny','🐹':'tiny','🧒':'kid','🐔':'small','🐓':'small','🐈':'small','🐱':'small','🐶':'small','🦆':'small','🐸':'small','🍍':'small','🍕':'small','🐟':'small','🐠':'small','🐧':'small','🦜':'small','🥔':'small','🦊':'small','🪴':'fem','🥀':'fem','🐙':'fem','👩‍🔧':'fem','👰':'fem','🍅':'fem','👩':'fem','🧍‍♀️':'fem','👵':'old','🦖':'low','🦈':'low','🐈‍⬛':'low','🤵':'low','🦍':'low','🐻':'low','🦅':'low','🧔':'bro','💪':'bro','🐉':'deep','💀':'deep','🌋':'deep','👴':'old','🧙':'old','🦉':'old','🖥️':'robot','💣':'robot','🤖':'robot','👻':'ghost','🐕':'mid','🦀':'small','🐢':'small','🦝':'small','🤓':'mid','😰':'small','🧑‍🍳':'mid'};
function voiceFor(e,shift){const b=VOX[VMAP[e]||'mid'];return {...b,p:b.p*(shift||1),fm:b.fm*(1+((shift||1)-1)*.4)}}

/* ---------- engine ---------- */
const AU={ctx:null,nb:null,el:null,waves:{},sV:null,sF:null,
  init(){
    if(this.ctx)return true;
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
    try{this.ctx=new AC({latencyHint:'interactive'})}catch(e){try{this.ctx=new AC()}catch(e2){return false}}
    const c=this.ctx;
    const comp=c.createDynamicsCompressor();comp.threshold.value=-16;comp.knee.value=12;comp.ratio.value=4;comp.attack.value=.004;comp.release.value=.2;
    this.master=c.createGain();this.master.gain.value=.95;this.master.connect(comp);comp.connect(c.destination);
    this.vBus=c.createGain();this.fBus=c.createGain();this.mBus=c.createGain();this.duck=c.createGain();
    this.vBus.connect(this.master);this.fBus.connect(this.master);this.mBus.connect(this.duck);this.duck.connect(this.master);
    const len=c.sampleRate*2;const buf=c.createBuffer(1,len,c.sampleRate);const d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;this.nb=buf;
    this.newScene();this.applyVol();return true;
  },
  applyVol(){if(!this.ctx)return;const t=this.ctx.currentTime;this.vBus.gain.setTargetAtTime(SET.voices?SET.vVol:0,t,.05);this.fBus.gain.setTargetAtTime(SET.sfx?SET.fVol:0,t,.05);this.mBus.gain.setTargetAtTime(SET.music?SET.mVol*.55:0,t,.05)},
  newScene(){const c=this.ctx;this.sV=c.createGain();this.sV.connect(this.vBus);this.sF=c.createGain();this.sF.connect(this.fBus)},
  ok(){return SET.sound&&this.ctx&&this.ctx.state==='running'},
  cut(){try{if('speechSynthesis' in window)speechSynthesis.cancel()}catch(e){}if(!this.ctx)return;const a=this.sV,b=this.sF,t=this.ctx.currentTime;try{a.gain.setTargetAtTime(0,t,.03);b.gain.setTargetAtTime(0,t,.03)}catch(e){}setTimeout(()=>{try{a.disconnect();b.disconnect()}catch(e){}},500);this.newScene()},
  silentWav(){const n=4000,b=new Uint8Array(44+n*2),v=new DataView(b.buffer),w=(o,t)=>{for(let i=0;i<t.length;i++)b[o+i]=t.charCodeAt(i)};w(0,'RIFF');v.setUint32(4,36+n*2,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,8000,true);v.setUint32(28,16000,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,n*2,true);let bin='';for(let i=0;i<b.length;i++)bin+=String.fromCharCode(b[i]);return 'data:audio/wav;base64,'+btoa(bin)},
  unlock(){
    try{if(navigator.audioSession)navigator.audioSession.type='playback'}catch(e){}
    try{if(!this.el){const a=document.createElement('audio');a.setAttribute('playsinline','');a.setAttribute('webkit-playsinline','');a.loop=true;a.src=this.silentWav();this.el=a}const p=this.el.play();if(p&&p.catch)p.catch(()=>{})}catch(e){}
    try{if(this.canEN()){const u=new SpeechSynthesisUtterance(' ');u.volume=0;speechSynthesis.speak(u)}}catch(e){}
    if(!this.init())return Promise.resolve(false);
    try{const s=this.ctx.createBufferSource();s.buffer=this.ctx.createBuffer(1,1,22050);s.connect(this.ctx.destination);s.start(0)}catch(e){}
    let r;try{r=this.ctx.resume()}catch(e){}
    return Promise.resolve(r).then(()=>this.ctx.state==='running',()=>false);
  },
  wave(kind){
    if(this.waves[kind])return this.waves[kind];
    const N=64,re=new Float32Array(N),im=new Float32Array(N);
    for(let n=1;n<N;n++){
      if(kind==='robot')im[n]=n%2?1/n:0;
      else im[n]=Math.pow(n,-1.2)*(1+.35*Math.cos(n*.9))*(n>40?.5:1);
    }
    return this.waves[kind]=this.ctx.createPeriodicWave(re,im);
  },

  /* ---- speech ---- */
  estimate(sp,o,vx){
    let n=0,p=0;sp.words.forEach(w=>{n+=sylls(w.ph).length;if(w.end)p+=w.end===','?.14:.24});
    const speed=(vx.sp||1)*(SET.vSpeed||1)*(o.sing?.4:1)*(sp.sad||o.sad?.82:1);
    return n*.2/speed+p+.1;
  },
  speak(text,vx,o={}){
    const sp=typeof text==='string'?simlish(text):text;
    if(!sp.words.length)return 0;
    const est=this.estimate(sp,o,vx);
    if(!this.ok()||!SET.voices)return est;
    const c=this.ctx;const t0=c.currentTime+.03;
    const yell=o.yell||sp.allCaps,q=sp.q,ex=sp.ex||yell,sad=o.sad||sp.sad,wh=o.whisper,sing=o.sing,robot=vx.robot;
    const fm=(vx.fm||1)*(yell?1.05:1)*(SET.vPitch||1)**.35;
    const speed=(vx.sp||1)*(SET.vSpeed||1)*(sing?.42:1)*(sad?.82:1)*(o.scared?1.12:1);
    const base=vx.p*(SET.vPitch||1)*(yell?1.42:1)*(ex&&!yell?1.12:1)*(sad?.88:1)*(wh?1.05:1);
    const breath=wh?0:(vx.br??.08)*(yell?1.6:1);
    /* nodes */
    const out=c.createGain();out.gain.value=(vx.vol||1)*(yell?1.25:wh?1.5:1)*.3*Math.pow(145/vx.p,.6);out.connect(this.sV);
    const osc=c.createOscillator();osc.setPeriodicWave(this.wave(robot?'robot':'glottal'));osc.frequency.setValueAtTime(base,t0);
    const vg=c.createGain();vg.gain.value=0;osc.connect(vg);
    const nz=c.createBufferSource();nz.buffer=this.nb;nz.loop=true;
    const bg=c.createGain();bg.gain.value=0;nz.connect(bg);
    const FQ=[7,11,15],FG=[3.2,2.1,1.1];
    const first=sp.words[0].ph.find(isV)||'a';const F0=vF(first);
    const fs=FQ.map((q,i)=>{const f=c.createBiquadFilter();f.type='bandpass';f.Q.value=q;f.frequency.value=F0[i]*fm;const g=c.createGain();g.gain.value=FG[i];vg.connect(f);bg.connect(f);f.connect(g);g.connect(out);return {f,g}});
    const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=420*fm;const lg=c.createGain();lg.gain.value=.3;vg.connect(lp);lp.connect(lg);lg.connect(out);
    const cf=c.createBiquadFilter();cf.type='bandpass';cf.Q.value=1.5;const cg=c.createGain();cg.gain.value=0;nz.connect(cf);cf.connect(cg);cg.connect(out);
    const lfo=c.createOscillator(),lfg=c.createGain();lfo.frequency.value=vx.shake||o.scared?8.5:sing?5.5:5.2;lfg.gain.value=robot?0:base*(vx.shake||o.scared?.045:sing?.032:.009);lfo.connect(lfg);lfg.connect(osc.frequency);
    /* helpers */
    const VA=(a,at,tc=.012)=>{vg.gain.setTargetAtTime(wh?0:a,at,tc);bg.gain.setTargetAtTime(wh?a*1.3:a*breath,at,tc)};
    const FM=(F,at,tc=.022)=>fs.forEach((x,i)=>x.f.frequency.setTargetAtTime(F[i]*fm,at,tc));
    const FGm=(m,at)=>fs.forEach((x,i)=>{if(i)x.g.gain.setTargetAtTime(FG[i]*m,at,.015)});
    const PI=(f,at,tc=.03)=>osc.frequency.setTargetAtTime(f,at,tc);
    /* syllable list with prosody */
    const SY=[];sp.words.forEach((w,wi)=>{const ss=sylls(w.ph);ss.forEach((s,si)=>SY.push({ph:s,wi,first:si===0,last:si===ss.length-1,end:si===ss.length-1?w.end:''}))});
    const N=SY.length;
    const stressed=new Set();SY.forEach((s,k)=>{if(s.first&&Math.random()<.42)stressed.add(k)});
    if(ex||yell){let k=N-1;while(k>0&&!SY[k].first)k--;stressed.add(k)}
    const MEL=o.notes||[1,1.122,1.26,1.335,1.498,1.335,1.26,1.122,1,.891,1,1.26];
    let t=t0;let lastF=base;
    SY.forEach((s,k)=>{
      const pos=N>1?k/(N-1):0;
      let f=base*((sad?1.06:1.1)-(sad?.26:.2)*pos);
      if(stressed.has(k))f*=1.14;
      if(q){if(k===N-1)f*=1.38;else if(k===N-2)f*=1.12}
      else if(k===N-1)f*=ex?.96:.86;
      if(sing)f=base*1.15*MEL[(k+(o.seed||0))%MEL.length];
      if(robot)f=base*(k%3===2?1.12:1);
      f*=robot||sing?1:(.97+Math.random()*.06);
      let vd=.105/speed*(stressed.has(k)?1.28:1)*(k===N-1?1.35:1)*(.9+Math.random()*.25);
      if(sing)vd=Math.max(vd,.26);
      if(o.hold&&k===N-1)vd=1.7;
      const amp=(stressed.has(k)?1.15:1)*(yell?1.2:1);
      s.ph.forEach((p,pi)=>{
        if(isV(p)){
          VA(amp,t,.012);PI(f,t,sing?.05:.028);lastF=f;
          const V=PH_V[p];
          if(typeof V[0]==='string'){FM(PH_V[V[0]],t,.02);FM(PH_V[V[1]],t+vd*.45,.04)}else FM(V,t,.02);
          if(!robot&&!sing)PI(f*(q&&k===N-1?1.12:(.95+Math.random()*.06)),t+vd*.6,.06);
          if(o.hold&&k===N-1){vg.gain.setTargetAtTime(amp*1.3,t+.3,.4);lfg.gain.setTargetAtTime(base*.05,t+.4,.3)}
          t+=vd;return;
        }
        const C=PH_C[p];if(!C){t+=.03;return}
        const nextV=s.ph.slice(pi+1).find(isV);if(nextV)FM(vF(nextV),t+.02,.03);
        const ca=.85*(yell?1.2:1);
        if(C.k==='stop'){const clos=.042/speed;VA(C.v?.1:0,t,.006);const bt=t+clos;cf.frequency.setValueAtTime(C.b*fm*(.9+Math.random()*.2),bt);cf.Q.setValueAtTime(1.2,bt);cg.gain.setValueAtTime(.95*ca,bt);cg.gain.setTargetAtTime(0,bt+.006,.012);if(!C.v){bg.gain.setTargetAtTime(.55,bt+.012,.006);bg.gain.setTargetAtTime(0,bt+.04,.01)}t=bt+(C.v?.018:.04)}
        else if(C.k==='aff'){VA(0,t,.006);const bt=t+.03/speed;cf.frequency.setValueAtTime(3200*fm,bt);cf.Q.setValueAtTime(2.5,bt);cg.gain.setTargetAtTime(.6*ca,bt,.006);cg.gain.setTargetAtTime(0,bt+.055,.01);t=bt+.07}
        else if(C.k==='fric'){const d=.08/speed;VA(C.v?.3:0,t,.012);cf.frequency.setValueAtTime(C.f*(fm>1.1?1.08:1),t);cf.Q.setValueAtTime(C.q,t);cg.gain.setTargetAtTime(C.a*ca,t,.012);cg.gain.setTargetAtTime(0,t+d-.015,.01);t+=d}
        else if(C.k==='asp'){VA(0,t,.01);bg.gain.setTargetAtTime(.6,t,.01);t+=.055/speed}
        else if(C.k==='nas'){VA(.55,t,.01);FM(C.F,t,.012);FGm(.22,t);PI(f*.98,t);t+=.065/speed;FGm(1,t)}
        else if(C.k==='liq'){VA(.72,t,.012);FM(C.F,t,.015);PI(f*.98,t);t+=.05/speed}
      });
      if(s.last){
        if(s.end){VA(0,t,.03);t+=s.end===','?.14:(s.end==='?'||s.end==='!')?.26:.22}
        else if(!sing&&Math.random()<.5){VA(.15,t,.02);t+=.03}
      }
    });
    VA(0,t,.035);
    const end=t+.2;
    osc.start(t0);nz.start(t0,Math.random());lfo.start(t0);osc.stop(end);nz.stop(end);lfo.stop(end);
    Music.duckFor(end-t0);
    return end-t0;
  },

  /* ---- real English via device text-to-speech ---- */
  canEN(){return typeof window.speechSynthesis!=='undefined'&&typeof window.SpeechSynthesisUtterance!=='undefined'},
  enVoices(){if(this._vs&&this._vs.length)return this._vs;const all=(this.canEN()&&speechSynthesis.getVoices())||[];const en=all.filter(v=>/^en/i.test(v.lang));this._vs=en.length?en:all;return this._vs},
  speakEN(text,ev,fallbackVx,o={}){
    const clean=String(text).replace(/\*[^*]*\*/g,'').trim();
    const words=clean.split(/\s+/).filter(Boolean).length;
    const rate=(ev.r||1)*(SET.vSpeed||1);
    const est=words*.36/rate+.5;
    if(!this.ok()||!SET.voices)return est;
    if(SET.tvVoice==='sim'||!this.canEN())return this.speak(text,fallbackVx,o);
    try{
      const u=new SpeechSynthesisUtterance(clean);
      const vs=this.enVoices();if(vs.length)u.voice=vs[ev.seed%vs.length];
      u.pitch=Math.max(0,Math.min(2,ev.p*(SET.vPitch||1)));u.rate=Math.max(.5,Math.min(2,rate));u.volume=Math.max(0,Math.min(1,SET.vVol*(ev.whisper?.75:1)));
      speechSynthesis.speak(u);Music.duckFor(est);
    }catch(e){return this.speak(text,fallbackVx,o)}
    return est;
  },

  /* ---- effects ---- */
  tone(type,f0,f1,t,dur,gain,att=.005,dest){const c=this.ctx,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);if(f1!==f0)o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),t+dur);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(gain,t+att);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(dest||this.sF);o.start(t);o.stop(t+dur+.05)},
  noise(t,dur,type,f0,f1,q,gain,att=.005,dest){const c=this.ctx,s=c.createBufferSource();s.buffer=this.nb;s.loop=true;const fl=c.createBiquadFilter();fl.type=type;fl.frequency.setValueAtTime(f0,t);if(f1!==f0)fl.frequency.exponentialRampToValueAtTime(f1,t+dur);fl.Q.value=q;const g=c.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(gain,t+att);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(fl);fl.connect(g);g.connect(dest||this.sF);s.start(t,Math.random());s.stop(t+dur+.05)},
  sfx(n){
    if(!this.ok()||!SET.sfx)return;
    if(Array.isArray(n)){n.forEach((x,i)=>setTimeout(()=>this.sfx(x),i*140));return}
    const t=this.ctx.currentTime+.01,T=this;
    const F={
      boom(){T.noise(t,1.6,'lowpass',1000,60,1,1.3);T.tone('sine',95,26,t,1.2,1)},
      whoosh(){T.noise(t,.45,'bandpass',300,2600,2,.5,.16)},
      ding(){T.tone('sine',1318,1318,t,.8,.28);T.tone('sine',1976,1976,t,.5,.1)},
      sting(){[0,.3].forEach(d=>{T.tone('sawtooth',147,146,t+d,.26,.18);T.tone('sine',73,73,t+d,.3,.35)});T.tone('sawtooth',131,118,t+.62,1.3,.22);T.tone('sine',65,58,t+.62,1.4,.4)},
      dun(){T.tone('sawtooth',110,108,t,.35,.22);T.tone('sine',55,55,t,.4,.4)},
      pop(){T.tone('sine',300,900,t,.09,.4)},
      crash(){T.noise(t,.8,'highpass',2400,2400,.7,.6);[2400,3100,4300,5200].forEach((f,i)=>T.tone('sine',f,f*.98,t+i*.03,.35,.06))},
      sad(){[392,370,349].forEach((f,i)=>T.tone('sawtooth',f,f*.98,t+i*.42,.4,.1));T.tone('sawtooth',330,318,t+1.26,1.2,.11)},
      tada(){[523,659,784,1047].forEach((f,i)=>T.tone('triangle',f,f,t+i*.11,i===3?.9:.25,.24))},
      beep(){T.tone('square',1000,1000,t,.09,.09)},
      snip(){T.noise(t,.06,'highpass',4000,4000,1,.5)},
      splash(){T.noise(t,.9,'lowpass',3200,300,1,.7,.01)},
      thud(){T.tone('sine',150,45,t,.28,.9);T.noise(t,.08,'lowpass',400,200,1,.4)},
      scream(){T.speak('AAAAAAAAH',{...VOX.fem,p:420,sp:.6},{yell:true})},
      cheer(){T.noise(t,1.8,'bandpass',1400,1300,.7,.45,.3);for(let i=0;i<16;i++)T.noise(t+Math.random()*1.5,.03,'bandpass',2200,2200,1,.28)},
      creak(){T.tone('sawtooth',55,85,t,.9,.16);T.noise(t,.9,'bandpass',900,600,8,.2)},
      chomp(){T.tone('sine',160,40,t,.18,.9);T.tone('sine',140,40,t+.16,.2,.8);T.noise(t,.3,'lowpass',800,300,1,.4)},
      slice(){T.noise(t,.18,'highpass',2000,7000,1,.6)},
      clang(){[880,1330,2090,3150].forEach((f,i)=>T.tone('sine',f,f,t,1.3-i*.2,.26-i*.05))},
      rumble(){T.noise(t,1.8,'lowpass',160,70,1,1,.4)},
      charge(){T.tone('sawtooth',150,1200,t,1,.1);T.tone('sine',300,2400,t,1,.09)},
      wind(){T.noise(t,1.8,'bandpass',500,900,3,.4,.6)},
      scribble(){for(let i=0;i<5;i++)T.noise(t+i*.09,.07,'bandpass',3500,3000,3,.25)},
      coin(){T.tone('square',988,988,t,.08,.08);T.tone('square',1319,1319,t+.08,.3,.08)},
      gasp(){T.noise(t,.4,'bandpass',900,2200,3,.6,.25);T.speak('ooh',{...VOX.mid,p:200},{})},
      quack(){T.tone('sawtooth',620,430,t,.13,.25);T.tone('sawtooth',580,400,t+.17,.16,.25)},
      scrape(){T.noise(t,.5,'bandpass',600,1400,6,.35)},
      fire(){for(let i=0;i<18;i++)T.noise(t+Math.random()*1.4,.02,'highpass',3000,3000,1,.32);T.noise(t,1.5,'lowpass',500,400,1,.3,.3)},
      heart(){T.tone('sine',70,50,t,.2,.9);T.tone('sine',65,45,t+.22,.25,.7)},
      lose(){T.tone('square',330,320,t,.2,.1);T.tone('square',262,250,t+.22,.2,.1);T.tone('square',196,180,t+.44,.5,.1)},
      jump(){T.tone('square',300,620,t,.12,.06)},
      hit(){T.noise(t,.12,'lowpass',1500,400,1,.6);T.tone('square',200,90,t,.12,.12)},
      laugh(){T.speak('ha ha ha ha',{...VOX.mid,p:180,sp:1.3},{})},
      awh(){T.speak('awwww',{...VOX.fem,p:260},{sad:true})},
      riser(){T.noise(t,3.6,'bandpass',300,6000,3,.4,3.4);T.tone('sawtooth',110,880,t,3.6,.06,3.3)},
      drop(){T.tone('sine',120,30,t,1.4,1.1);T.noise(t,.8,'lowpass',2000,100,1,.8);T.tone('sawtooth',55,50,t,1.2,.25)},
      bell(){[0,.4].forEach(d=>{T.tone('sine',880,880,t+d,1,.25);T.tone('sine',2420,2420,t+d,.6,.08)})},
      buzzer(){T.tone('sawtooth',140,130,t,.6,.2);T.tone('square',147,140,t,.6,.12)},
      correct(){[784,988,1319].forEach((f,i)=>T.tone('triangle',f,f,t+i*.08,.35,.22))},
      swoosh(){T.noise(t,.25,'highpass',1000,4000,1,.35)},
      brush(){T.noise(t,.5,'bandpass',1200,2400,1.5,.12,.1)},
      engine(){T.tone('sawtooth',70,140,t,.8,.08);T.noise(t,.8,'lowpass',300,600,1,.2)},
      grunt(){T.speak('hnngh',{...VOX.low,p:110},{yell:true})},
      static(){T.noise(t,.5,'bandpass',3000,3000,.5,.25)}
    };
    (F[n]||(()=>{}))();
  }
};

/* ---------- music ---------- */
const NT=s=>Math.pow(2,s/12);
const MUSIC={
  heist:{bpm:116,key:146.83,prog:[[0,3,7],[0,3,7],[8,12,15],[7,10,14]],bass:'x.x.o.x.',bw:'tri',arp:'0.2.1.2.',aw:'pluck',dr:{h:'x.x.x.x.',k:'x...x...'}},
  sad:{bpm:72,key:220,prog:[[0,3,7],[-4,0,3],[3,7,10],[-2,2,5]],bass:'x.......',bw:'tri',pad:'soft',arp:'0121.21.',aw:'bell'},
  tense:{bpm:68,key:73.42,prog:[[0,3,7],[1,4,8]],bass:'x.......',bw:'saw',pad:'dark',dr:{k:'x..x....'},trem:1},
  heroic:{bpm:104,key:130.81,prog:[[0,4,7],[7,11,14],[9,12,16],[5,9,12]],bass:'x.x.x.xo',bw:'saw',pad:'brass',dr:{k:'x...x...',s:'..x...x.',h:'xxxxxxxx'}},
  silly:{bpm:138,key:130.81,prog:[[0,4,7],[5,9,12],[7,11,14],[0,4,7]],bass:'x.5.x.5.',bw:'tuba',arp:'0.12.20.',aw:'pluck',dr:{h:'..x...x.'}},
  romance:{bpm:76,key:174.61,prog:[[0,3,7],[5,8,12],[-2,2,5],[3,7,10]],bass:'x...x...',bw:'tri',pad:'strings',arp:'0.1.2.1.',aw:'bell'},
  spooky:{bpm:92,key:220,prog:[[0,3,7],[-1,3,6],[0,3,7],[-4,0,3]],pad:'dark',arp:'2.0.3.1.',aw:'box'},
  lofi:{bpm:82,key:146.83,prog:[[0,4,7,11],[-3,0,4,7],[2,5,9,12],[-5,-1,2,5]],bass:'x..x..x.',bw:'tri',pad:'soft',dr:{k:'x.....x.',s:'....x...',h:'x.xxx.x.'},sw:.16},
  epic:{bpm:90,key:110,prog:[[0,3,7],[-4,0,3],[-2,2,5],[-5,-1,2]],bass:'x.xxx.xx',bw:'saw',pad:'choir',dr:{k:'x..x..x.',s:'....x...'}},
  chip:{bpm:150,key:220,prog:[[0,4,7],[-3,0,4],[5,9,12],[7,11,14]],bass:'xoxoxoxo',bw:'sq',arp:'01201201',aw:'chip',dr:{k:'x...x...',s:'..x...x.',h:'xxxxxxxx'}},
  ocean:{bpm:64,key:196,prog:[[0,4,7,11],[5,9,12,16]],bass:'x.......',bw:'tri',pad:'soft',arp:'0...2...',aw:'bell'},
  club:{bpm:124,key:110,prog:[[0,3,7],[0,3,7],[-4,0,3],[-2,2,5]],bass:'.x.x.x.x',bw:'saw',arp:'0.20.2.1',aw:'chip',dr:{k:'x.x.x.x.',s:'..x...x.',h:'.x.x.x.x'}},
  news:{bpm:120,key:196,prog:[[0,4,7],[5,9,12],[7,11,14],[5,9,12]],bass:'x.x.x.x.',bw:'tri',pad:'stab',dr:{k:'x...x...',s:'....x...',h:'x.x.x.x.'}},
  western:{bpm:96,key:146.83,prog:[[0,3,7],[0,3,7],[-2,2,5],[-4,0,3]],bass:'x..x..x.',bw:'tri',arp:'0.2.1.2.',aw:'pluck',lead:1,dr:{k:'x.....x.',h:'..x...x.'}},
  piano:{bpm:70,key:174.61,prog:[[0,4,7],[-3,0,4],[5,9,12],[7,11,14]],bass:'x...x...',bw:'tri',arp:'0.1.2.1.',aw:'bell'}
};
const Music={style:null,iv:null,step:0,next:0,bus:null,
  start(name){
    if(!name||!AU.ctx){this.want=name;return}
    if(this.style===name&&this.iv)return;
    this.stop();if(!MUSIC[name])return;
    const c=AU.ctx;this.style=name;this.S=MUSIC[name];this.bus=c.createGain();this.bus.gain.value=0;this.bus.connect(AU.mBus);this.bus.gain.setTargetAtTime(1,c.currentTime,.4);
    this.step=0;this.next=c.currentTime+.08;
    this.iv=setInterval(()=>this.pump(),45);
  },
  stop(){if(this.iv)clearInterval(this.iv);this.iv=null;this.style=null;if(this.bus&&AU.ctx){const b=this.bus;b.gain.setTargetAtTime(0,AU.ctx.currentTime,.15);setTimeout(()=>{try{b.disconnect()}catch(e){}},900)}this.bus=null},
  duckFor(d){if(!AU.ctx)return;const t=AU.ctx.currentTime;AU.duck.gain.cancelScheduledValues(t);AU.duck.gain.setTargetAtTime(.38,t,.06);AU.duck.gain.setTargetAtTime(1,t+d,.3)},
  pump(){
    if(!AU.ok()){this.next=AU.ctx.currentTime+.08;return}
    const c=AU.ctx,S=this.S,sd=60/S.bpm/2;
    while(this.next<c.currentTime+.25){
      const st=this.step%8,bar=Math.floor(this.step/8),ch=S.prog[bar%S.prog.length];
      let t=this.next+((st%2)&&S.sw?S.sw*sd:0);
      this.play(S,st,bar,ch,t,sd);
      this.next+=sd;this.step++;
    }
  },
  play(S,st,bar,ch,t,sd){
    const k=S.key,B=this.bus,T=AU;
    const note=(semi,oct)=>k*NT(semi)*Math.pow(2,oct);
    if(S.bass){const p=S.bass[st];if(p&&p!=='.'){const f=p==='o'?note(ch[0],0):p==='5'?note(ch[2]-12,0):note(ch[0],-1);this.inst(S.bw||'tri',f,t,sd*1.6,B)}}
    if(S.pad&&st===0){ch.forEach(s=>this.pad(S.pad,note(s,0),t,sd*8,B))}
    if(S.pad==='stab'&&(st===3||st===6))ch.forEach(s=>this.pad('stab',note(s,0),t,sd,B));
    if(S.arp){const p=S.arp[st];if(p&&p!=='.'){const i=+p;const s=ch[i%ch.length]+(i>=ch.length?12:0);this.inst(S.aw,note(s,1),t,sd*1.2,B)}}
    if(S.trem&&st===4&&bar%2===0)this.inst('box',note(ch[1]+13,1),t,sd*6,B);
    if(S.lead&&bar%2===1&&(st===0||st===3||st===5)){const pent=[0,3,5,7,10,12];this.inst('whistle',note(pent[(bar*3+st)%pent.length],1),t,sd*(st===5?3:1.5),B)}
    if(S.dr){const d=S.dr;
      if(d.k&&d.k[st]==='x'){T.tone('sine',150,42,t,.2,.55,.003,B)}
      if(d.s&&d.s[st]==='x'){T.noise(t,.14,'bandpass',1800,1600,.8,.26,.002,B);T.tone('triangle',190,150,t,.08,.12,.002,B)}
      if(d.h&&d.h[st]==='x'){T.noise(t,.035,'highpass',8000,8000,1,.08,.001,B)}
    }
  },
  inst(w,f,t,d,B){
    const c=AU.ctx,o=c.createOscillator(),g=c.createGain();let dest=g;let peak=.12,dec=d;
    if(w==='tri'){o.type='triangle';peak=.3}
    else if(w==='saw'||w==='tuba'||w==='sq'){o.type=w==='saw'?'sawtooth':'square';const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=w==='tuba'?500:w==='saw'?650:1200;o.connect(lp);lp.connect(g);peak=w==='sq'?.1:.16;o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+dec);g.connect(B);o.start(t);o.stop(t+dec+.05);return}
    else if(w==='pluck'){o.type='triangle';peak=.13;dec=Math.min(d,.35)}
    else if(w==='bell'||w==='box'){o.type='sine';peak=w==='box'?.09:.1;dec=w==='box'?.7:1.1;const o2=c.createOscillator(),g2=c.createGain();o2.type='sine';o2.frequency.value=f*(w==='box'?4.02:2.76);g2.gain.setValueAtTime(peak*.3,t);g2.gain.exponentialRampToValueAtTime(.0001,t+dec*.5);o2.connect(g2);g2.connect(B);o2.start(t);o2.stop(t+dec)}
    else if(w==='chip'){o.type='square';peak=.045;dec=Math.min(d,.14)}
    else if(w==='whistle'){o.type='sine';peak=.07;const l=c.createOscillator(),lg=c.createGain();l.frequency.value=6;lg.gain.value=f*.012;l.connect(lg);lg.connect(o.frequency);l.start(t);l.stop(t+d+.1);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+.06);g.gain.setTargetAtTime(.0001,t+d*.8,.08);o.frequency.setValueAtTime(f,t);o.connect(g);g.connect(B);o.start(t);o.stop(t+d+.3);return}
    o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+dec);o.connect(g);g.connect(B);o.start(t);o.stop(t+dec+.05);
  },
  pad(kind,f,t,d,B){
    const c=AU.ctx;const g=c.createGain();const lp=c.createBiquadFilter();lp.type='lowpass';
    const cfg={soft:['triangle',1500,.05,.25],strings:['sawtooth',1500,.028,.45],dark:['sawtooth',480,.05,.6],brass:['sawtooth',1300,.035,.06],choir:['sawtooth',900,.035,.35],stab:['square',2000,.03,.01]}[kind]||['triangle',1200,.04,.2];
    lp.frequency.value=cfg[1];
    [-6,6].forEach(cents=>{const o=c.createOscillator();o.type=cfg[0];o.frequency.value=f;o.detune.value=cents;o.connect(lp);o.start(t);o.stop(t+d+.4)});
    if(kind==='choir'){const bp=c.createBiquadFilter();bp.type='bandpass';bp.frequency.value=800;bp.Q.value=2;lp.connect(bp);bp.connect(g)}else lp.connect(g);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(cfg[2]*(kind==='choir'?2.2:1),t+cfg[3]);g.gain.setValueAtTime(cfg[2]*(kind==='choir'?2.2:1),t+Math.max(cfg[3],d-.2));g.gain.linearRampToValueAtTime(0,t+d+.3);g.connect(B);
  }
};
if(typeof window.speechSynthesis!=='undefined')try{speechSynthesis.onvoiceschanged=()=>{AU._vs=null}}catch(e){}
