'use strict';
/* =====================================================================
   SERIES: Interdimensional TV
   Real English (device text-to-speech), zero sense.
   ===================================================================== */
const TVB={
 office:'linear-gradient(#3d4a66 0 62%,#252d40 62%)',
 kitchen:'linear-gradient(#ffd6e0 0 62%,#c98fa0 62%)',
 weather:'radial-gradient(circle at 70% 40%,#7b2cbf,#240046 72%)',
 promo:'linear-gradient(165deg,#ffbe0b,#fb5607)',
 hospital:'linear-gradient(#d8f3f0 0 64%,#9fd3cd 64%)',
 kids:'linear-gradient(#ffafcc 0 60%,#a2d2ff 60%)',
 stadium:'linear-gradient(#0b3d20 0 40%,#1f7a3d 40%)',
 dating:'radial-gradient(circle at 50% 30%,#ff4d6d,#590d22 75%)',
 savanna:'linear-gradient(#ffb703 0 58%,#c98a3d 58%)',
 news:'radial-gradient(circle at 50% 30%,#1d4e89,#071a33 75%)',
 cereal:'linear-gradient(165deg,#c77dff,#3c096c)',
 talk:'radial-gradient(circle at 50% 35%,#3a2f5a,#120e1c 75%)',
 car:'linear-gradient(#4cc9f0 0 55%,#4a4e69 55%)',
 psa:'linear-gradient(#e9ecef 0 60%,#adb5bd 60%)'
};
const SERIES_EPS=[];
const ep=o=>{SERIES_EPS.push(o);STORIES.push(o)};
const TVBASE={by:'dimension_tv',series:'idtv',tv:1,lang:'en',g:'funny',tags:'#interdimensionaltv #nonsense'};

ep({...TVBASE,id:'tv01',ep:1,ch:4,show:'GARY BREAD, ATTORNEY AT LUNCH',mus:'news',cap:'have you been injured by a sandwich?',sound:'Law Firm Jingle (Toasted)',bg:TVB.office,
 deco:[['⚖️',84,30,1,.7]],
 cast:{l:{e:'🧑‍💼',x:30,y:54,s:1.2,f:-1},sw:{e:'🥪',x:120,y:58,s:1}},
 cm:['"you have the right to remain delicious" 😭','gary bread is my lawyer now','we sue the hungry is so powerful'],
 beats:[
  {ms:2800,say:['l','Have you been injured by a sandwich?']},
  {ms:3200,say:['l','Did a sandwich look at you funny in two thousand nineteen?'],em:['l','👉']},
  {ms:3200,say:['l','Call Gary Bread. Attorney at lunch.'],title:'1-800-BREAD-ME'},
  {ms:1200,set:{sw:{x:72}},tr:700},
  {ms:2200,say:['sw','I am the sandwich.']},
  {ms:1400,cam:{x:30,y:52,z:1.6},tr:600,sub:'...'},
  {ms:3200,cam:null,say:['l','Then you have the right to remain delicious.']},
  {ms:2400,card:'Gary Bread. We sue the hungry.'}
 ]});

ep({...TVBASE,id:'tv02',ep:2,ch:11,show:'COOKING WITH DOUG (HE IS A DOOR)',mus:'lofi',cap:'nobody knocks anymore',sound:'Cooking Show Ukulele',bg:TVB.kitchen,
 cast:{d:{e:'🚪',x:32,y:50,s:1.6},p:{e:'🍲',x:70,y:58,s:1.1},sp:{e:'🥄',x:62,y:46,s:.5,r:-30}},
 cm:['"add the soup to the soup" is the best recipe i know','doug deserves a knock','hinges 😭'],
 beats:[
  {ms:2600,say:['d','Welcome back to Cooking with Doug.']},
  {ms:2800,say:['d','I am Doug. I have been a door for forty one years.']},
  {ms:2200,say:['d','Nobody knocks anymore.'],sfx:'sad',em:['d','💧']},
  {ms:2600,say:['d','Today we make soup. Step one. Be a door.']},
  {ms:2400,say:['d','Step two. Add the soup to the soup.'],set:{sp:{r:40}},tr:400,burst:['💦','p',8],sfx:'splash'},
  {ms:1900,say:['d','Taste it.'],set:{sp:{x:40,y:44}},tr:500},
  {ms:2000,say:['d','Mmm. Hinges.']},
  {ms:2300,card:'Next week on Cooking with Doug: opening.'}
 ]});

ep({...TVBASE,id:'tv03',ep:3,ch:23,show:'DIMENSION Q WEATHER',mus:'news',cap:'bring a bigger mouth',sound:'Weather Theme from Dimension Q',bg:TVB.weather,
 deco:[['🗺️',70,36,2.2,.35]],
 cast:{w:{e:'👩‍💼',x:26,y:56,s:1.15,f:-1},c:{e:'🐄',x:72,y:34,s:.8,r:-20},sw:{e:'🌀',x:62,y:40,s:1.4,o:.8}},
 cm:['a low of gerald is crazy','"bring a bigger mouth" ok ma\'am','the cow in the tornado is just vibing'],
 beats:[
  {ms:2400,title:'Weather',say:['w','Good evening. Here is your weather.']},
  {ms:2400,say:['w','Tomorrow will be Tuesday. Twice.']},
  {ms:2600,say:['w','High of eleven. Low of Gerald.'],em:['w','😐']},
  {ms:3000,say:['w','A cold front of spoons is moving in from the west.'],amb:{e:'🥄',n:16},sfx:'wind'},
  {ms:2600,set:{c:{r:340}},tr:2400,say:['w','The cow is fine. The cow has always been there.']},
  {ms:2400,say:['w','Bring a bigger mouth.']},
  {ms:2200,amb:null,card:'Back to you, Linda.'}
 ]});

ep({...TVBASE,id:'tv04',ep:4,ch:38,show:'THE UNHAMMER™',mus:'silly',cap:'four easy payments of yesterday',sound:'Infomercial Funk (Reversed)',bg:TVB.promo,
 cast:{s:{e:'🧔',x:26,y:54,s:1.15,f:-1},h:{e:'🔨',x:52,y:56,s:.8,r:-30},n:{e:'🔩',x:64,y:60,s:.5},g:{e:'👵',x:120,y:56,s:1.1}},
 cm:['"it took my husband" 😭😭','results may vary is DOING SO MUCH','i need an unhammer for my monday'],
 beats:[
  {ms:2700,say:['s','Are you tired of hammering?'],title:'TIRED OF HAMMERING?'},
  {ms:2600,say:['s','Try unhammering!'],fx:'flash',sfx:'tada'},
  {ms:1300,set:{h:{r:30}},tr:250,sfx:'hit'},
  {ms:1400,set:{n:{y:-20,r:720}},tr:900,sfx:'whoosh'},
  {ms:3300,say:['s','It takes the nail back to where it came from. The past.']},
  {ms:1200,set:{g:{x:76}},tr:600},
  {ms:2200,say:['g','It took my husband.'],em:['g','😑']},
  {ms:2600,say:['s','Results may vary. Order now.'],em:['s','😁']},
  {ms:2500,card:'The Unhammer. Four easy payments of yesterday.'}
 ]});

ep({...TVBASE,id:'tv05',ep:5,ch:52,show:'HOSPITAL OF FEELINGS',mus:'romance',cap:'it is serious. it is also a horse.',sound:'Medical Drama Strings',bg:TVB.hospital,
 deco:[['🩺',86,30,.8,.7],['🛏️',50,70,1.6,.5]],
 cast:{d:{e:'🧑‍⚕️',x:72,y:52,s:1.15},p:{e:'🧑',x:30,y:54,s:1.1,f:-1},x:{e:'🩻',x:52,y:36,s:.9,o:0}},
 cm:['"you ARE the horse" i screamed','a smaller x-ray 💀','the dramatic music made it 10x funnier'],
 beats:[
  {ms:2100,lb:1,card:'Hospital of Feelings',sfx:'sting'},
  {ms:2600,set:{x:{o:1}},tr:300,say:['d','I am sorry. I have your results.']},
  {ms:3000,say:['d','Your x-ray shows a smaller x-ray.'],cam:{x:52,y:36,z:1.6},tr:600},
  {ms:2300,cam:null,say:['p','Doctor, is it serious?'],em:['p','😰']},
  {ms:2600,say:['d','It is serious. It is also a horse.']},
  {ms:2600,say:['p','I have always wanted a horse.'],em:['p','🥹']},
  {ms:1300,cam:{x:72,y:50,z:1.9},tr:150,sfx:'dun'},
  {ms:2300,cam:null,say:['d','You are the horse.']},
  {ms:1600,set:{p:{e:'🐎'}},tr:0,fx:'flash',sfx:'sting'},
  {ms:2300,say:['p','Neigh.']}
 ]});

ep({...TVBASE,id:'tv06',ep:6,ch:61,show:'MR. WOBBLES TEACHES NUMBERS',mus:'silly',cap:'numbers are letters that went to college',sound:'Kids Show Xylophone',bg:TVB.kids,
 deco:[['🌈',50,22,2.4,.7]],
 cast:{w:{e:'🧸',x:30,y:52,s:1.3},k1:{e:'🧒',x:66,y:60,s:.9},k2:{e:'👧',x:82,y:60,s:.9}},
 cm:['"one, two, purple" is now how i count','the kids\' faces 😭','mr wobbles has a PhD in nonsense'],
 beats:[
  {ms:2600,say:['w','Hi kids! Today we learn numbers!'],em:['w','✨']},
  {ms:2400,say:['w','What comes after three?']},
  {ms:1800,say:['k1','Four!'],em:['k1','🙋']},
  {ms:2400,say:['w','Wrong. It is Thursday.'],sfx:'buzzer'},
  {ms:2400,say:['w','Now let us count to purple!']},
  {ms:2600,say:['w','One. Two. Purple! Good job!'],burst:['🟣',{x:30,y:40},10],sfx:'tada'},
  {ms:1500,em:[['k1','❓'],['k2','❓']],sub:'...'},
  {ms:3400,say:['w','Remember kids. Numbers are just letters that went to college.']},
  {ms:2200,card:'Mr. Wobbles is not a licensed teacher.'}
 ]});

ep({...TVBASE,id:'tv07',ep:7,ch:74,show:'COMPETITIVE STANDING STILL',mus:'heroic',cap:'heartbreaking. his family is a lamp.',sound:'Sports Broadcast Fanfare',bg:TVB.stadium,
 deco:[['🏟️',50,22,3.2,.5]],
 cast:{a:{e:'🧍',x:50,y:56,s:1.2},c1:{e:'🧔',x:14,y:76,s:.8,f:-1},c2:{e:'👨‍🦳',x:86,y:76,s:.8},l:{e:'💡',x:76,y:46,s:.6,o:0}},
 cm:['"his family is a lamp" i need to lie down','the blink was so dramatic','standing still olympics when'],
 beats:[
  {ms:2600,title:'LIVE: FINALS',say:['c1','And he is still standing.']},
  {ms:2300,say:['c2','Incredible form, Jim.']},
  {ms:2700,say:['c1','He has not moved since Monday.']},
  {ms:2600,say:['c2','His coach is a cloud. Very supportive.']},
  {ms:1400,cam:{x:50,y:46,z:2.2},tr:900,fx:'slowmo',sub:'*blinks*'},
  {ms:1300,cam:null,fx:['noslow','flash'],sfx:'buzzer',title:'DISQUALIFIED'},
  {ms:2200,say:['c1','He blinked! Oh no!'],crowd:{e:'😱',n:10}},
  {ms:1300,set:{l:{o:1}},tr:300},
  {ms:2700,say:['c2','Heartbreaking. His family is a lamp.']}
 ]});

ep({...TVBASE,id:'tv08',ep:8,ch:89,show:'WILL YOU DATE THIS?',mus:'romance',cap:'she married wednesday',sound:'Dating Show Saxophone',bg:TVB.dating,
 cast:{h:{e:'👱',x:14,y:50,s:1,f:-1},c:{e:'👩',x:34,y:58,s:1.05,f:-1},b1:{e:'💡',x:54,y:56,s:.75},b2:{e:'💡',x:66,y:56,s:.75},b3:{e:'🌫️',x:78,y:54,s:.85,o:.75},ring:{e:'💍',x:44,y:40,s:.6,o:0}},
 cm:['"the concept of tuesday" is my type','married to wednesday is so real','bachelor number two is also a lamp 😭'],
 beats:[
  {ms:2400,title:'Will You Date This?',sfx:'ding'},
  {ms:2600,say:['h','Bachelor number one is a lamp.']},
  {ms:2600,say:['h','Bachelor number two is also a lamp.']},
  {ms:3000,say:['h','Bachelor number three is the concept of Tuesday.'],em:['b3','✨']},
  {ms:1300,em:['c','🤔'],sub:'...'},
  {ms:2600,say:['c','I choose the concept of Tuesday.']},
  {ms:1200,set:{ring:{o:1}},tr:300,burst:['💕',{x:44,y:44},10],sfx:'tada'},
  {ms:3000,say:['h','Congratulations! You are now married to Wednesday.']},
  {ms:2100,say:['c','That is fine.']}
 ]});

ep({...TVBASE,id:'tv09',ep:9,ch:102,show:'PLANET FURNITURE',mus:'ocean',cap:'nature is beautiful. and terrible. and furniture.',sound:'Nature Documentary Hush',bg:TVB.savanna,
 deco:[['🌳',14,46,1.8,.85],['🌳',90,44,1.6,.85]],
 cast:{ch:{e:'🪑',x:52,y:60,s:1.3},cat:{e:'🐆',x:120,y:60,s:1.2},n:{e:'🎙️',x:10,y:78,s:.5,o:0}},
 cm:['"it is hunting" 😭 the chair','whisper voice made it 100x better','the leopard just sitting 💀'],
 beats:[
  {ms:3000,say:['n','Here we see the wild chair. In its natural habitat.'],sub:'(narrator, whispering)'},
  {ms:2600,say:['n','The chair has not moved in thirty years.']},
  {ms:2000,say:['n','It is hunting.'],cam:{x:52,y:58,z:1.6},tr:1600},
  {ms:1500,cam:null,set:{cat:{x:72}},tr:1300,sfx:'creak'},
  {ms:2200,say:['n','A leopard approaches. Bold.']},
  {ms:1300,set:{cat:{x:52,y:52}},tr:500,sfx:'thud'},
  {ms:1600,sub:'*the leopard sits*'},
  {ms:3300,say:['n','Nature is beautiful. And terrible. And furniture.']}
 ]});

ep({...TVBASE,id:'tv10',ep:10,ch:117,show:'NEWS FROM ELSEWHERE',mus:'news',cap:'the moon is pursuing other opportunities',sound:'Newsroom Synth (Wrong Dimension)',bg:TVB.news,ov:['stars'],
 cast:{a:{e:'🧑‍💼',x:28,y:56,s:1.15,f:-1},m:{e:'🌙',x:72,y:34,s:1.2}},
 cm:['"a slightly bigger moon" career growth','his keys were his hands 💀','this is the only news that makes sense'],
 beats:[
  {ms:2400,title:'Breaking News',sfx:'ding'},
  {ms:3200,say:['a','The moon has announced it will no longer be the moon.']},
  {ms:3400,say:['a','It will now pursue a career as a slightly bigger moon.']},
  {ms:1300,set:{m:{e:'🌕',s:2.6}},tr:900,fx:'flash',sfx:'charge'},
  {ms:2400,say:['a','Congratulations to the moon.'],em:['a','👏']},
  {ms:2800,say:['a','In other news, a man has found his keys.']},
  {ms:2300,say:['a','They were his hands.']},
  {ms:2400,say:['a','He is still looking for his hands.']},
  {ms:2100,card:'This has been the news.'}
 ]});

ep({...TVBASE,id:'tv11',ep:11,ch:130,show:'BOO-FLAKES',mus:'spooky',cap:'part of a complete afterlife',sound:'Cereal Jingle (Haunted)',bg:TVB.cereal,
 cast:{k:{e:'👻',x:32,y:56,s:.9},m:{e:'👻',x:66,y:50,s:1.3},b:{e:'📦',x:52,y:62,s:.8,o:0}},
 cm:['"they go right through you" 😭','zero calories because you are dead is diet culture','ghost mom is so supportive'],
 beats:[
  {ms:2300,say:['k','Mom! I am hungry!']},
  {ms:1200,set:{b:{o:1}},tr:300,sfx:'pop'},
  {ms:3200,say:['m','Have some Boo-Flakes! Part of a complete afterlife!'],title:'BOO-FLAKES'},
  {ms:2600,say:['k','But Mom, I cannot eat. I am dead.']},
  {ms:2300,say:['m','Exactly. Zero calories.'],em:['m','😉']},
  {ms:3000,say:['k','Boo-Flakes! They go right through you!'],burst:['✨',{x:52,y:56},10],sfx:'tada'},
  {ms:2200,card:'Boo-Flakes. Now with real ghosts.'}
 ]});

ep({...TVBASE,id:'tv12',ep:12,ch:144,show:'LATE NIGHT WITH A PUDDLE',mus:'lofi',cap:'do not step on me, kevin',sound:'Late Night Band (Damp)',bg:TVB.talk,
 deco:[['🪴',10,58,.9,.8],['🌆',50,28,2.6,.4]],
 cast:{h:{e:'🧑‍💼',x:72,y:52,s:1.1},p:{e:'💧',x:32,y:60,s:1.6}},
 cm:['KEVIN AGAIN 😭','the book is about feelings and shoes','evaporating thursday is a mood'],
 beats:[
  {ms:2700,say:['h','My next guest is a puddle. Please welcome... Puddle!'],crowd:{e:'👏',n:8,mode:'cheer'},sfx:'cheer'},
  {ms:3000,crowd:null,say:['h','So Puddle, your new book is called Splash.']},
  {ms:2600,say:['p','It is about feelings. And shoes.']},
  {ms:2300,say:['h','What is next for you?']},
  {ms:2700,say:['p','Evaporating. Probably Thursday.'],em:['p','🌤️']},
  {ms:1400,say:['h','Wow.']},
  {ms:1200,set:{h:{x:40}},tr:600},
  {ms:2600,say:['p','Do not step on me, Kevin.'],em:['p','💢']}
 ]});

ep({...TVBASE,id:'tv13',ep:13,ch:158,show:'THE 2027 HORSE',mus:'heroic',cap:'it is a horse',sound:'Car Commercial Guitar',bg:TVB.car,
 deco:[['🏔️',50,36,3.2,.6]],
 cast:{hr:{e:'🐎',x:-20,y:58,s:1.6,f:-1},n:{e:'🎙️',x:10,y:80,s:.5,o:0}},
 cm:['"zero to sixty in a horse" i cannot','legs. four of them. standard.','brown, and also brown 😭'],
 beats:[
  {ms:1700,set:{hr:{x:52}},tr:1600,sfx:'engine',fx:'shake'},
  {ms:2800,say:['n','Introducing the all new, twenty twenty seven Horse.'],title:'THE 2027 HORSE'},
  {ms:2600,say:['n','Zero to sixty in a horse.'],fx:'impact'},
  {ms:3000,say:['n','Features include legs. Four of them. Standard.'],cam:{x:52,y:66,z:1.6},tr:800},
  {ms:2700,cam:null,say:['n','Now available in brown. And also brown.']},
  {ms:1400,set:{hr:{x:130}},tr:1300,sfx:'whoosh'},
  {ms:2200,card:'The Horse. It is a horse.'}
 ]});

ep({...TVBASE,id:'tv14',ep:14,ch:999,show:'A MESSAGE FROM THE COUNCIL',mus:'tense',cap:'if you see something, say something',sound:'Public Service Hum',bg:TVB.psa,
 cast:{g:{e:'🧍',x:36,y:54,s:1.2,f:-1},b:{e:'🐦',x:120,y:50,s:.9}},
 cm:['"something." 💀','the bird just doing exactly what he said','this one is my favorite channel'],
 beats:[
  {ms:2600,say:['g','Hi. I am a regular guy. With a regular message.']},
  {ms:2800,say:['g','Remember. If you see something, say something.']},
  {ms:1300,set:{b:{x:68}},tr:800,sfx:'whoosh'},
  {ms:1800,say:['b','Something.']},
  {ms:2000,say:['g','Thank you.'],em:['g','🙂']},
  {ms:1600,sub:'...'},
  {ms:2600,say:['b','This has been a message from the birds.']},
  {ms:1400,set:{b:{x:-30}},tr:900,sfx:'whoosh'},
  {ms:2200,card:'Channel 999 does not exist.'}
 ]});

/* English voices per role (pitch, rate for device text-to-speech) */
const EN_VOICE={tiny:{p:1.9,r:1.15},small:{p:1.5,r:1.1},kid:{p:1.6,r:1.08},fem:{p:1.25,r:1},mid:{p:1,r:1},bro:{p:.85,r:1.05},low:{p:.7,r:.95},deep:{p:.3,r:.8},old:{p:.8,r:.85},robot:{p:.5,r:.9},ghost:{p:1.4,r:.8}};
const EN_OVERRIDE={'🎙️':{p:.75,r:.85,whisper:1},'🥪':{p:1.7,r:1},'🚪':{p:.5,r:.82},'🧸':{p:1.45,r:1.05},'💧':{p:1.3,r:.8},'🪑':{p:.6,r:.8}};
SERIES_EPS.forEach(v=>{
  v.kind='story';v.av='📺';
  v.beats.forEach(b=>{if(b.say){const w=b.say[1].split(/\s+/).length;b.ms=Math.max(b.ms,Math.round(w*400+900))}});
  let c=0;v._cum=v.beats.map(b=>(c+=b.ms));v.dur=c+800;
  v._vox={};v._en={};
  for(const k in v.cast){const e=v.cast[k].e;v._vox[k]=voiceFor(e,1+((hashStr(v.id+k)%17)-8)/70);const base=EN_OVERRIDE[e]||EN_VOICE[VMAP[e]||'mid'];v._en[k]={...base,p:base.p*(1+((hashStr(v.id+k)%9)-4)/40),seed:hashStr(e+k)}}
});
CREATORS['dimension_tv']=['Interdimensional TV','📺','Broadcasting from every dimension at once. None of them make sense.'];
TRENDING.unshift('#interdimensionaltv');
