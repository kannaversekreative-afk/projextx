'use strict';
/* =====================================================================
   BRAIN ROT CONTENT
   ===================================================================== */
const G={
 museum:'radial-gradient(circle at 50% 32%,#3a3f63,#0d0e18 72%)',
 farm:'linear-gradient(#8fd8ff 0 60%,#76c257 60%)',
 lair:'radial-gradient(circle at 66% 38%,#7a1f1f,#1a0707 72%)',
 dusk:'linear-gradient(#ffb054,#e0466e 52%,#3b1040 52%,#24082a)',
 night:'radial-gradient(circle at 45% 45%,#22264a,#06070d 72%)',
 sky:'linear-gradient(#3fb6ff,#c9efff)',
 novela:'radial-gradient(circle at 50% 40%,#a3163f,#2a0410 78%)',
 garden:'linear-gradient(#bfe9ff 0 62%,#69b84a 62%)',
 store:'linear-gradient(#f2f5ff 0 64%,#c4cbe0 64%)',
 gym:'radial-gradient(circle at 50% 30%,#4a4a52,#121214 72%)',
 bomb:'radial-gradient(circle at 50% 50%,#3b3b46,#0e0e12 78%)',
 office:'linear-gradient(#3d3750 0 64%,#272231 64%)',
 rainy:'linear-gradient(#3b4a66,#1b2333 62%,#141a26 62%)',
 kitchen:'linear-gradient(#ffe2b8 0 62%,#d9a46c 62%)',
 space:'radial-gradient(circle at 30% 30%,#1b1f4a,#05060f 72%)',
 houston:'linear-gradient(#cfd8e6 0 64%,#9aa7bd 64%)',
 suburb:'linear-gradient(#ff8f5e,#ffd0a0 60%,#7fb862 60%)',
 prehistoric:'linear-gradient(#ff7a3d,#ffcf6b 58%,#9a6b3a 58%)',
 modernfarm:'linear-gradient(#a8e1ff 0 60%,#8fd16a 60%)',
 dojo:'linear-gradient(#ff7a59,#ffc48a 60%,#5b3a2a 60%)',
 church:'linear-gradient(#fdf1ff 0 64%,#d8c2e8 64%)',
 sea:'linear-gradient(#1aa6c7,#083260)',
 park:'linear-gradient(#bfeaff 0 58%,#7cc76a 58%)',
 room:'linear-gradient(#fff4d6 0 64%,#d6b48a 64%)',
 ocean:'linear-gradient(#0b3d91,#041838)',shore:'linear-gradient(#7fd6ff 0 52%,#f2d08a 52%)',forest:'linear-gradient(#3e8e4f,#16361f)',jungle:'linear-gradient(#78c26a,#24603a)',plain:'linear-gradient(#ffd99a 0 58%,#c9a45c 58%)',desk:'linear-gradient(#2e3a55,#151b2a)',bed:'linear-gradient(#1a1630,#07060d)',
 noir:'radial-gradient(circle at 50% 14%,#5f6880,#14161d 62%)',
 elevator:'linear-gradient(90deg,#868b98,#c3c8d2 20%,#d0d4dc 50%,#c3c8d2 80%,#868b98)',
 kingdom:'linear-gradient(#7ec8ff 0 56%,#6aa84f 56%)',
 bathroom:'repeating-linear-gradient(0deg,#d9eef2 0 38px,#bcd6dc 38px 40px)',
 robots:'linear-gradient(#2a0d14,#5c1622 58%,#1b0a0d 58%)',
 desert:'linear-gradient(#ffb36b,#ffdca8 56%,#c9965a 56%)',
 classroom:'linear-gradient(#2f5d3a 0 28%,#e9dcc0 28% 62%,#b98a5e 62%)',
 weather:'radial-gradient(circle at 70% 40%,#3d8bff,#0d2a66 72%)',
 garage:'linear-gradient(#d9d2c3 0 60%,#8d8070 60%)',
 tank:'radial-gradient(circle at 50% 45%,#7fd8ff,#1b6fa8 72%)',
 barber:'linear-gradient(#f2e6d8 0 60%,#3b3b44 60%)',
 restaurant:'radial-gradient(circle at 50% 30%,#7a3a2a,#2a120c 75%)',
 volcano:'linear-gradient(#ff9b6a,#ffd6a0 58%,#7fb862 58%)',
 road:'linear-gradient(#ff7a59,#ffb36b 56%,#3a3a40 56%)',
 lava:'linear-gradient(#fff4d6 0 64%,#ff4d1a 64%)',
 arctic:'linear-gradient(#bfe6ff,#e8f6ff 60%,#ffffff 60%)',
 under:'linear-gradient(#2a8fd0,#0b3d77)',
 kitchen2:'linear-gradient(#cfeef0 0 60%,#9fc7ca 60%)'
};
const STORIES=[];
const story=o=>STORIES.push(o);

/* ---------------- original 22, polished ---------------- */
story({id:'heist',by:'cheese.cartel',g:'funny',mus:'heist',cap:'we planned this for 3 months',tags:'#heist #crime',sound:'Suspense Strings, Tiptoe Mix',bg:G.museum,
 deco:[['🖼️',16,30,.9,.7],['🖼️',84,26,.8,.7],['🏺',90,58,.7,.8]],
 cast:{m1:{e:'🐭',x:-8,y:60,s:.62,f:-1},m2:{e:'🐭',x:-18,y:60,s:.62,f:-1},m3:{e:'🐭',x:-28,y:60,s:.62,f:-1},ch:{e:'🧀',x:74,y:49,s:.7},cat:{e:'🐈‍⬛',x:14,y:-25,s:1.2}},
 cm:['the cat said AMATEURS 😭','getting roasted by security is crazy work','phase 4 is so real'],
 beats:[
  {ms:1800,lb:1,card:'The Heist',sfx:'sting'},
  {ms:1900,ov:['lasers','spot'],sub:'Phase 1: get in.',set:{m1:{x:32},m2:{x:20},m3:{x:8}},tr:900},
  {ms:2300,sub:'Phase 2: dodge the lasers.',fx:'slowmo',set:{m1:{x:54,y:36,r:360}},tr:1700,sfx:'whoosh'},
  {ms:1700,fx:'noslow',set:{m1:{x:66,y:56},ch:{x:68,y:47,s:.5}},say:['m1','Got it.'],sfx:'ding',em:['m1','😎']},
  {ms:1800,ov:['spot'],sub:'Phase 3: get out.',set:{m1:{x:58,f:1},ch:{x:60,y:47},m2:{x:46,f:1},m3:{x:34,f:1}},tr:800},
  {ms:1100,set:{cat:{y:55}},tr:260,fx:'shake',sfx:'thud',em:[['m1','❗'],['m2','❗'],['m3','❗']]},
  {ms:1400,cam:{x:14,y:55,z:1.9},tr:700,sfx:'sting'},
  {ms:2000,cam:null,tr:300,say:['cat','...is that brie?']},
  {ms:1800,say:['m1',"It's cheddar."]},
  {ms:2000,say:['cat','Ugh. Amateurs.'],em:['cat','🙄']},
  {ms:1400,set:{cat:{x:-25}},tr:900},
  {ms:2300,say:['m2','Did we just get roasted by security?']},
  {ms:1900,card:'Phase 4: therapy.',sfx:'sad'}
 ]});

story({id:'promo',by:'farm.gossip',g:'dark',mus:'silly',top:'my coworker got promoted',cap:'kevin was so excited 🥲',tags:'#coworker #darkhumor',sound:'Office Ambience (Ominous)',bg:G.farm,
 deco:[['🛖',84,46,1.6,.9],['🌾',10,60,.9],['🌾',94,62,.8]],
 cast:{k:{e:'🐔',x:30,y:56,s:1.1,f:-1},b:{e:'🐓',x:72,y:56,s:1.15}},
 cm:['KEVIN NO 😭','the slow zoom on the rooster took me out','"he looks happy" is so dark i\'m crying'],
 beats:[
  {ms:2700,say:['k','Big news! Management picked me for the company dinner!'],em:['k','🥳']},
  {ms:1700,say:['b','Oh nice! As a guest?']},
  {ms:2700,say:['k',"They didn't say. They just asked how much I weigh."]},
  {ms:1800,cam:{x:72,y:54,z:1.9},tr:1500,mus:'tense'},
  {ms:1100,cam:null,tr:300,say:['b','Kevin.']},
  {ms:1200,say:['b','Run.']},
  {ms:2500,say:['k','Run? They gave me a little party hat!'],burst:['🎉','k',10],sfx:'pop'},
  {ms:1700,card:'Kevin did not run.',sfx:'sad'},
  {ms:2300,set:{k:{e:'🍗',s:.9,f:1}},tr:0,say:['b','...he looks happy.']}
 ]});

story({id:'boss',by:'fox.gg',g:'action',mus:'epic',cap:'this took me 6 hours',tags:'#gaming #bossfight',sound:'Epic Choir, Out of Breath',bg:G.lair,amb:{e:'🔥',n:6,up:1},
 cast:{h:{e:'🤺',x:22,y:58,s:1,f:-1},d:{e:'🐉',x:72,y:46,s:1.9},sp:{e:'🥄',x:28,y:55,s:.5,o:0},sp2:{e:'🥄',x:17,y:55,s:.5,o:0,r:-30}},
 cm:['99.9% 💀','the dragon said ow? as a QUESTION','4,000 spoons is commitment'],
 beats:[
  {ms:1800,lb:1,hud:{n:'ANCIENT DRAGON OF DOOM',hp:100},title:'Final Boss',fx:'shake',sfx:'sting'},
  {ms:2600,say:['d','FOOLISH MORTAL. NONE HAVE SURVIVED MY FLAME.']},
  {ms:1500,burst:['🔥',{x:44,y:50},16],set:{h:{y:32,r:-360}},tr:650,sfx:'whoosh',sub:'*dodges*'},
  {ms:2000,set:{h:{y:58}},tr:400,say:['h','My turn. ULTIMATE ATTACK.']},
  {ms:1200,set:{h:{s:1.35}},tr:900,fx:['flash','impact'],sfx:'charge'},
  {ms:900,set:{h:{s:1},sp:{o:1,x:68,y:44,r:900}},tr:800,sfx:'whoosh'},
  {ms:1300,hud:{hp:99.9},burst:['✨',{x:68,y:44},6],set:{sp:{y:85,o:0}},tr:600,sfx:'clang'},
  {ms:1500,say:['d','...ow?'],em:['d','❓']},
  {ms:2000,set:{sp:{x:28,y:52,r:0,o:1,tr:0},sp2:{o:1}},say:['h','Phase two.']},
  {ms:2000,card:'It took 4,000 spoons.',sfx:'tada'}
 ]});

story({id:'pigeon',by:'pigeon_intel',g:'action',mus:'western',cap:'they should not have touched the bread',tags:'#action #pigeon',sound:'Cool Guy Walking Theme',bg:G.dusk,
 deco:[['🏙️',50,44,3.4,.55],['🚦',88,50,.9,.85]],
 cast:{p:{e:'🐦',x:58,y:58,s:1.05},g:{e:'🕶️',x:54,y:-15,s:.4},br:{e:'🍞',x:14,y:61,s:.5},d:{e:'🦆',x:-25,y:58,s:1}},
 cm:['the glasses falling off 😭😭','ducks are the real villains of this app','"...again." i felt that'],
 beats:[
  {ms:1900,lb:1,card:'They took his bread.',sfx:'sting'},
  {ms:1400,sub:'Big mistake.'},
  {ms:1500,set:{g:{y:55}},tr:900,sfx:'whoosh'},
  {ms:2500,set:{p:{x:38},g:{x:34}},tr:2300,burst:['💥',{x:82,y:48},16],fx:'shake',sfx:'boom',sub:"Cool guys don't look at explosions."},
  {ms:1300,cam:{x:22,y:58,z:1.7},tr:600,sub:'Target located.',sfx:'ding'},
  {ms:800,cam:null,tr:200,set:{d:{x:13}},sfx:'whoosh'},
  {ms:1000,set:{d:{x:-30},br:{x:-30}},tr:450,sfx:'quack'},
  {ms:1500,set:{g:{y:76,o:0,r:40}},tr:900,sfx:'sad',mus:'sad'},
  {ms:2000,say:['p','...again.']}
 ]});

story({id:'ghost',by:'scaredy_streamer',g:'scary',mus:'spooky',cap:'most polite haunting of my life',tags:'#horror #ghost',sound:'Creepy Music Box',bg:G.night,
 deco:[['🌙',82,14,.9],['🕯️',12,58,.6,.9],['🖼️',30,30,.7,.5]],
 cast:{m:{e:'🚶',x:40,y:56,s:1.15},g:{e:'👻',x:66,y:50,s:1,o:0}},
 cm:['"love what you\'ve done with the place" 😭','the hendersons are NOT ready','he said "i need to move" so calmly'],
 beats:[
  {ms:2200,lb:1,ov:['vignette'],say:['m','Hello? Is anyone there?'],sfx:'wind',em:['m','😰']},
  {ms:1600,set:{g:{o:.9,x:60}},tr:1200,sub:'(behind you)'},
  {ms:900,set:{m:{f:-1},g:{x:118,o:0}},tr:180,sfx:'whoosh'},
  {ms:1700,set:{m:{f:1}},tr:150,say:['m','Must be the wind.']},
  {ms:1500,set:{g:{o:.9,x:60}},tr:1200,sub:'BEHIND YOU'},
  {ms:1200,set:{m:{f:-1},g:{s:1.25}},tr:120,title:'AAAAAAA',fx:['flash','bigshake'],sfx:'scream'},
  {ms:2800,set:{g:{s:1}},say:['g','Oh gosh, sorry! Wrong house. Is this the Hendersons?'],mus:'silly'},
  {ms:1500,say:['m','...next door.']},
  {ms:2700,say:['g',"Thank you! Love what you've done with the place."],em:['g','😊']},
  {ms:1300,set:{g:{x:125}},tr:1100,ov:[]},
  {ms:1900,set:{m:{f:1}},say:['m','I need to move.']}
 ]});

story({id:'sky',by:'certified_toaster',g:'action',mus:'heroic',top:'first time skydiving',cap:'thank you steve 🦅',tags:'#extreme #skydiving',sound:'Wind Noises, Heroic',bg:G.sky,
 cast:{pl:{e:'✈️',x:-20,y:16,s:1.2},c1:{e:'☁️',x:22,y:46,s:1.5,o:.95},c2:{e:'☁️',x:78,y:74,s:1.2,o:.95},u:{e:'🤸',x:50,y:18,s:.9,o:0},bg2:{e:'🥖',x:54,y:30,s:.5,o:0,r:30},t1:{e:'🌲',x:20,y:120,s:2.2},t2:{e:'🌳',x:78,y:124,s:2.2},ea:{e:'🦅',x:125,y:52,s:1.5}},
 cm:['STEVE 🦅🦅','pulling the cord and getting bread is my whole life','"don\'t make this weird" 😭'],
 beats:[
  {ms:1500,set:{pl:{x:50}},tr:1400,sfx:'wind'},
  {ms:1400,set:{u:{o:1,y:36},pl:{x:130}},tr:1100,say:['u','WOOOOO!']},
  {ms:1600,set:{c1:{y:-20},c2:{y:-15}},tr:1400,say:['u','Pulling the cord!']},
  {ms:1400,set:{bg2:{o:1,x:58,y:29}},tr:300,sfx:'pop'},
  {ms:1900,cam:{x:56,y:32,z:1.8},tr:500,say:['u',"That's a baguette."],em:['u','😐']},
  {ms:1300,cam:null,set:{t1:{y:86},t2:{y:88}},tr:1200,fx:'shake',sub:'*ground intensifies*',sfx:'wind'},
  {ms:800,set:{ea:{x:50,y:46}},tr:500,sfx:'whoosh'},
  {ms:2000,set:{u:{x:74,y:22},ea:{x:74,y:30,f:-1},bg2:{x:80,y:15},t1:{y:122},t2:{y:124}},tr:1500,say:['u','THANK YOU STEVE!']},
  {ms:2000,say:['ea',"Don't make this weird."]},
  {ms:1900,card:'He still has the baguette.',sfx:'tada'}
 ]});

story({id:'novela',by:'toppings_of_our_lives',g:'drama',mus:'romance',cap:'episode 47. i am not okay',tags:'#drama #telenovela',sound:'Dramatic Violin Sting',bg:G.novela,
 deco:[['🌹',10,70,.7,.8],['🌹',90,72,.7,.8],['🕯️',50,24,.6,.7]],
 cast:{pz:{e:'🍕',x:28,y:56,s:1.1,f:-1},pn:{e:'🍍',x:72,y:56,s:1.1},m:{e:'🍅',x:125,y:54,s:1.25}},
 cm:['IT WAS THE 90S 😭','the triple zoom is CINEMA','anchovy arc incoming i can feel it'],
 beats:[
  {ms:1900,lb:1,card:'Toppings of Our Lives',sfx:'sting'},
  {ms:2400,say:['pz',"Piña... I can't keep hiding us anymore."]},
  {ms:2600,say:['pn','Your family will NEVER accept a fruit like me.'],em:['pn','💧']},
  {ms:1200,set:{pz:{x:40},pn:{x:60}},tr:1000,burst:['💕',{x:50,y:44},6]},
  {ms:700,set:{m:{x:86}},tr:220,fx:'shake',sfx:'crash'},
  {ms:1800,say:['m','OVER MY DEAD SAUCE!'],em:['m','💢']},
  {ms:650,cam:{x:40,y:54,z:2.1},tr:90,sfx:'dun'},
  {ms:650,cam:{x:60,y:54,z:2.1},tr:90,sfx:'dun'},
  {ms:1000,cam:{x:86,y:52,z:2.3},tr:90,sfx:'sting'},
  {ms:2400,cam:null,tr:200,say:['m',"You can't be together, because..."]},
  {ms:1900,say:['m','Piña is your BROTHER.'],fx:'flash',sfx:'sting'},
  {ms:1300,say:['pz','HOW?!']},
  {ms:2500,say:['m','It was the 90s. Things were wild.']},
  {ms:2000,card:'Next week: the anchovy returns.'}
 ]});

story({id:'snail',by:'slow_revenge',g:'dark',mus:'western',cap:'part 1 of 2 (part 2 drops in 2051)',tags:'#revenge #darkhumor',sound:'Western Standoff Whistle',bg:G.garden,
 deco:[['🌻',10,54,1,.9],['🌷',90,60,.7,.9],['🏡',86,46,1.4,.8]],
 cast:{s:{e:'🐌',x:14,y:62,s:.75,f:-1},m:{e:'🧒',x:82,y:57,s:1.1},salt:{e:'🧂',x:73,y:58,s:.5,o:0}},
 cm:['he KEPT the salt 💀','the aging up was so smooth','snail cinematic universe when'],
 beats:[
  {ms:2500,say:['s','You salted my brother. I will have my revenge.'],em:['s','💢']},
  {ms:1200,card:'Day 1'},
  {ms:1300,set:{s:{x:15}},tr:1200,sub:'Day 1'},
  {ms:1200,card:'Day 340'},
  {ms:1300,set:{s:{x:32},m:{e:'🧑'}},tr:0,sub:'Day 340'},
  {ms:1200,card:'Day 9,125',sfx:'sting'},
  {ms:1500,set:{s:{x:64},m:{e:'👴'}},tr:0,sub:'Day 9,125'},
  {ms:1700,say:['s','Remember me?']},
  {ms:2100,say:['m','...the garden? Summer of 2001?'],em:['m','❓']},
  {ms:1900,say:['s','You salted my brother.']},
  {ms:1600,set:{salt:{o:1}},tr:300,sfx:'ding',say:['m','I remember.']},
  {ms:1900,cam:{x:64,y:60,z:1.8},tr:400,say:['s','...you KEPT it?'],mus:'tense'},
  {ms:2000,cam:null,say:['m','Every day for 25 years.']},
  {ms:2100,card:'Revenge 2: Salt Harder. Coming 2051.'}
 ]});

story({id:'checkout',by:'npc_dave',g:'scary',mus:'lofi',top:'self checkout at 11pm',cap:"i left the groceries. they're hers now",tags:'#grocery #haunted',sound:'Supermarket Muzak, Slowed',bg:G.store,
 deco:[['🛒',10,64,.9,.8]],
 cast:{m:{e:'🚶',x:22,y:56,s:1.15,f:-1},k:{e:'🖥️',x:56,y:42,s:.9},bag:{e:'🛍️',x:78,y:60,s:.8},it1:{e:'🍌',x:72,y:53,s:.5},it2:{e:'🥫',x:84,y:53,s:.5},g:{e:'👻',x:78,y:52,s:.8,o:0}},
 cm:['"hi :)" is the scariest thing i\'ve ever seen','unexpected item: a whole ghost','he left SO fast'],
 beats:[
  {ms:2400,say:['k','UNEXPECTED ITEM IN BAGGING AREA.'],sfx:'beep'},
  {ms:1200,set:{it1:{x:-20},it2:{x:-20}},tr:500,sfx:'whoosh'},
  {ms:2300,say:['k','UNEXPECTED ITEM IN BAGGING AREA.'],sfx:'beep',em:['m','😑']},
  {ms:1700,set:{bag:{x:-20}},tr:500,say:['m','There. Nothing.']},
  {ms:2300,say:['k','UNEXPECTED ITEM IN BAGGING AREA.'],sfx:'beep'},
  {ms:1800,say:['m','THERE IS NOTHING THERE.'],fx:'shake',em:['m','💢']},
  {ms:1300,cam:{x:78,y:56,z:1.7},tr:900,mus:'tense'},
  {ms:1300,set:{g:{o:.9}},tr:700,sfx:'creak'},
  {ms:1700,say:['g','hi :)']},
  {ms:2000,cam:null,say:['k','PLEASE WAIT FOR ASSISTANCE.'],sfx:'beep'},
  {ms:1800,set:{m:{x:-30,f:1}},tr:500,sfx:'whoosh',sub:'*leaves forever*'}
 ]});

story({id:'ant',by:'gym_ant',g:'dark',mus:'heroic',cap:'he would have wanted us to keep lifting 🫡',tags:'#gym #motivation',sound:'Training Montage (Kazoo)',bg:G.gym,
 cast:{a:{e:'🐜',x:50,y:63,s:.7},w:{e:'🍇',x:50,y:55,s:.5},a2:{e:'🐜',x:24,y:66,s:.55,f:-1,o:0},b:{e:'🐦',x:-25,y:20,s:1.7,f:-1}},
 cm:['NOT THE BIRD 😭','"light weight baby" from an ant is crazy','rest in protein king'],
 beats:[
  {ms:1700,ov:['spot'],title:'Day 1',set:{w:{y:51}},tr:500,say:['a','Grape. Easy.']},
  {ms:1300,title:'Day 30',set:{w:{e:'🍓',s:.65,y:50}},tr:0,sfx:'ding'},
  {ms:1300,title:'Day 90',set:{w:{e:'🍎',s:.9,y:48}},tr:0,sfx:'ding'},
  {ms:1700,title:'Day 365',set:{w:{e:'🍉',s:1.6,y:49}},tr:0,fx:'shake',sfx:'sting',sub:'the big one.'},
  {ms:2100,set:{w:{y:38}},tr:1700,fx:['bigshake','impact'],say:['a','LIGHT. WEIGHT. BABY.']},
  {ms:1700,crowd:{e:'🐜',n:14,mode:'cheer'},set:{a2:{o:1}},sfx:'cheer',sub:'the colony goes wild'},
  {ms:800,set:{b:{x:50,y:38}},tr:420,sfx:'whoosh'},
  {ms:1000,set:{b:{x:130,y:-25},a:{x:130,y:-25},w:{x:130,y:-30}},tr:650,mus:'sad'},
  {ms:1700,crowd:{mode:'still'},sub:'...'},
  {ms:2500,say:['a2',"He would've wanted us to keep lifting."],em:['a2','🫡']}
 ]});

story({id:'evo',by:'science_but_wrong',g:'funny',mus:'epic',top:'4 billion years of evolution',cap:'we peaked',tags:'#science #evolution',sound:'Nature Documentary Swell',bg:G.ocean,amb:{e:'🫧',n:8,up:1},
 cast:{c:{e:'🦠',x:50,y:52,s:1.4},ph:{e:'📱',x:60,y:44,s:.45,o:0}},
 cm:['it\'s literally 3am and i\'m watching this in bed','the flash transitions go hard','"for this." ok rude but fair'],
 beats:[
  {ms:1300,sfx:'wind'},
  {ms:1000,set:{c:{e:'🐟'}},tr:0,fx:'flash',sfx:'pop'},
  {ms:1000,bg:G.shore,amb:null,set:{c:{e:'🦎'}},tr:0,fx:'flash',sfx:'pop'},
  {ms:1000,bg:G.forest,set:{c:{e:'🐀'}},tr:0,fx:'flash',sfx:'pop'},
  {ms:1000,bg:G.jungle,set:{c:{e:'🐒'}},tr:0,fx:'flash',sfx:'pop'},
  {ms:1000,bg:G.plain,set:{c:{e:'🧍'}},tr:0,fx:'flash',sfx:'pop'},
  {ms:1100,bg:G.desk,set:{c:{e:'🧑‍💻'}},tr:0,fx:'flash',sfx:'pop'},
  {ms:1500,bg:G.bed,set:{c:{e:'🛌',s:1.6},ph:{o:1}},tr:0,fx:'flash',sfx:'pop',mus:'sad'},
  {ms:2600,title:'For this.',cam:{x:52,y:50,z:1.35},tr:1800,sfx:'sad',sub:"(it's 3am)"}
 ]});

story({id:'bomb',by:'bomb_squad_bob',g:'action',mus:'tense',cap:'always read the patch notes',tags:'#action #tech',sound:'Ticking Clock, Sweating',bg:G.bomb,
 cast:{b:{e:'💣',x:50,y:56,s:1.4},t1:{e:'🧑‍🔧',x:20,y:58,s:1.05,f:-1},t2:{e:'👩‍🔧',x:80,y:58,s:1.05},sc:{e:'✂️',x:28,y:54,s:.5}},
 cm:['"installing update" i screamed','the colorblind reveal at 4 seconds 💀','everyone with a laptop felt this one'],
 beats:[
  {ms:1700,lb:1,timer:'00:10',say:['t1','Red wire or blue wire?'],sfx:'beep'},
  {ms:1300,timer:'00:08',say:['t2','Red!'],sfx:'beep'},
  {ms:1900,timer:'00:06',say:['t2',"Wait. I'm colorblind."],sfx:'beep',em:['t2','😬']},
  {ms:1200,timer:'00:04',say:['t1','WHAT?!'],fx:'shake',sfx:'beep',em:['t1','💢']},
  {ms:1100,timer:'00:02',set:{sc:{x:44,y:50,r:-30}},tr:300,sfx:'snip'},
  {ms:1700,timer:'00:01',fx:'slowmo',sub:'...'},
  {ms:1900,fx:'noslow',say:['t1','We... we did it.'],sfx:'ding',em:[['t1','😮‍💨'],['t2','😮‍💨']]},
  {ms:2700,timer:'UPDATE',say:['b','Installing update. Restarting in 3...'],sfx:'beep'},
  {ms:1100,say:['t2','No no no no']},
  {ms:1300,timer:null,fx:['flash','bigshake'],sfx:'boom',burst:['💥','b',18],set:{b:{o:0},sc:{o:0},t1:{y:-30,x:-10,r:-720},t2:{y:-30,x:110,r:720}},tr:900},
  {ms:2100,card:'Always turn off automatic updates.'}
 ]});

story({id:'reaper',by:'hr_from_beyond',g:'dark',mus:'spooky',top:'my job interview went weird',cap:'great benefits though',tags:'#jobs #darkhumor',sound:'Lobby Music From The Void',bg:G.office,
 deco:[['🪴',10,58,.9,.8],['🕰️',86,26,.7,.7]],
 cast:{r:{e:'💀',x:72,y:50,s:1.2},c:{e:'🧑‍💼',x:28,y:55,s:1.1,f:-1},p:{e:'📝',x:62,y:60,s:.5}},
 cm:['"you started this morning" CHILLS','he asked about DENTAL 😭','HR from beyond is so real'],
 beats:[
  {ms:2300,say:['r','So. Why do you want to work here?']},
  {ms:2500,say:['c','I heard people are just dying to get in.'],em:['c','😁']},
  {ms:1500,cam:{x:72,y:48,z:1.8},tr:1200},
  {ms:2300,cam:null,tr:300,say:['r','Nobody has ever made that joke.']},
  {ms:1500,say:['r','In four thousand years.']},
  {ms:1900,say:['c','Is there room for growth?']},
  {ms:2300,say:['r','Everyone gets promoted here. Eventually.']},
  {ms:1700,say:['c','Great! When do I start?']},
  {ms:1800,say:['r','You started this morning.']},
  {ms:1300,set:{c:{e:'👻',y:48}},tr:0,fx:'flash',sfx:'sting'},
  {ms:1700,say:['c','...is there dental?']},
  {ms:1900,say:['r','Not anymore.']}
 ]});

story({id:'rainmc',by:'sad_boy_hours',g:'funny',mus:'sad',top:"me walking home pretending i'm in a music video",cap:"the director said cut (i'm the director)",tags:'#maincharacter #relatable',sound:'Sad Piano, Raining',bg:G.rainy,
 deco:[['🏢',14,36,2.2,.4],['🏢',86,32,2.6,.4],['💡',70,30,.7,.8]],
 cast:{p:{e:'🚶',x:12,y:56,s:1.15,f:-1},bus:{e:'🚌',x:135,y:60,s:2}},
 cm:['"perfect, let\'s go again" is main character energy','the bus had perfect timing','i do this every day no joke'],
 beats:[
  {ms:2300,ov:['rain'],fx:'slowmo',set:{p:{x:40}},tr:2200},
  {ms:2200,set:{p:{x:54}},tr:2200,cam:{x:54,y:54,z:1.35},sub:'*stares into the distance*'},
  {ms:2000,say:['p','Nobody understands me.']},
  {ms:600,fx:'noslow',cam:null,tr:200,set:{bus:{x:52}},sfx:'whoosh'},
  {ms:900,set:{bus:{x:-45}},tr:450,burst:['💦','p',18],fx:'shake',sfx:'splash'},
  {ms:1800,sub:'...',em:['p','😑']},
  {ms:2200,say:['p',"Perfect. Let's go again."]}
 ]});

story({id:'cat',by:'7cats.in.a.coat',g:'funny',mus:'tense',top:'he knows exactly what he is doing',cap:'gravity still works, thanks mittens',tags:'#cat #chaos',sound:'Tense Standoff Strings',bg:G.kitchen,ov:['table'],
 deco:[['🪟',80,26,1.2,.8]],
 cast:{c:{e:'🐈',x:62,y:50,s:1.1},g:{e:'🥛',x:42,y:54,s:.6},o:{e:'🧍',x:11,y:72,s:1.4}},
 cm:['the eye contact 😭','"gravity check" he is a scientist','every cat owner just felt that'],
 beats:[
  {ms:1900,say:['o',"Mittens. Don't."]},
  {ms:1300,set:{c:{x:54},g:{x:37}},tr:700,sfx:'scrape'},
  {ms:1600,cam:{x:56,y:50,z:1.8},tr:700,sub:'*maintains eye contact*'},
  {ms:1300,cam:null,tr:250,say:['o','MITTENS.'],em:['o','💢']},
  {ms:1700,set:{c:{x:44},g:{x:27}},tr:1500,sfx:'scrape'},
  {ms:900,set:{g:{x:20,y:92,r:200}},tr:450},
  {ms:1300,set:{g:{o:0}},tr:0,burst:['💥',{x:20,y:88},10],fx:'shake',sfx:'crash'},
  {ms:1400,say:['o','WHY?!']},
  {ms:2200,say:['c','Gravity check. Still works.'],em:['c','😼']}
 ]});

story({id:'houston',by:'space_dad',g:'dark',mus:'ocean',cap:"he said he'd be back for dinner",tags:'#space #darkhumor',sound:'Mission Control Static',bg:G.space,ov:['stars'],
 cast:{a:{e:'🧑‍🚀',x:50,y:42,s:1.3,r:-12},e:{e:'🌍',x:84,y:80,s:2.4},h:{e:'🧑‍💼',x:50,y:54,s:1.3,o:0},hs:{e:'🏠',x:50,y:52,s:2.2,o:0},f1:{e:'🔥',x:40,y:42,s:.9,o:0},f2:{e:'🔥',x:58,y:36,s:1,o:0},f3:{e:'🔥',x:62,y:50,s:.8,o:0},dg:{e:'🐕',x:80,y:64,s:1,o:0}},
 cm:['six MONTHS 💀','the dog waiting broke me','houston has a problem indeed'],
 beats:[
  {ms:2200,say:['a','Houston, we have a problem.'],sfx:'static'},
  {ms:1900,bg:G.houston,ov:[],set:{a:{o:0},e:{o:0},h:{o:1}},tr:0,say:['h',"Talk to me. What's wrong?"]},
  {ms:2200,bg:G.space,ov:['stars'],set:{a:{o:1},e:{o:1},h:{o:0}},tr:0,say:['a','I think I left the stove on.']},
  {ms:2400,bg:G.houston,ov:[],set:{a:{o:0},e:{o:0},h:{o:1}},tr:0,say:['h',"You've been in space for six months."],em:['h','😐']},
  {ms:2400,bg:G.space,ov:['stars'],set:{a:{o:1},e:{o:1},h:{o:0}},tr:0,say:['a',"So it's been on for six months."]},
  {ms:1300,bg:G.houston,ov:[],set:{a:{o:0},e:{o:0},h:{o:1}},tr:0,sub:'...'},
  {ms:1900,bg:G.suburb,set:{h:{o:0},hs:{o:1},f1:{o:1},f2:{o:1},f3:{o:1}},tr:0,title:'Meanwhile on Earth',sfx:'fire',mus:'sad'},
  {ms:2600,set:{dg:{o:1}},tr:300,say:['dg',"He said he'd be back for dinner."]}
 ]});

story({id:'dino',by:'extinct_and_proud',g:'dark',mus:'epic',top:'65 million years ago',cap:"we're fine actually",tags:'#dinosaur #history',sound:'Ominous Choir Humming',bg:G.prehistoric,
 deco:[['🌴',8,48,1.4,.85],['🌋',88,40,1.6,.7],['🌴',94,54,1,.8]],
 cast:{t:{e:'🦖',x:28,y:55,s:1.2,f:-1},br:{e:'🦕',x:70,y:53,s:1.35},m:{e:'☄️',x:88,y:10,s:.45},ch:{e:'🐔',x:50,y:57,s:1.3,o:0}},
 cm:['birds being dinosaurs will never not be funny','"a problem for future us" 💀','bawk.'],
 beats:[
  {ms:2300,say:['t','Hey. Should we be worried about that?']},
  {ms:2500,say:['br',"Nah. That's a problem for future us."],em:['br','😌']},
  {ms:1500,set:{m:{x:66,y:22,s:1.1}},tr:1400,sfx:'rumble'},
  {ms:1600,set:{m:{x:54,y:32,s:2.4}},tr:1500,say:['t',"It's getting bigger."],fx:'shake'},
  {ms:900,set:{m:{x:50,y:46,s:9}},tr:850,fx:'bigshake',sfx:'boom'},
  {ms:500,fx:'flash'},
  {ms:1500,card:'Future us:',tt:''},
  {ms:2300,bg:G.modernfarm,decoOff:1,tt:'today',set:{t:{o:0},br:{o:0},m:{o:0},ch:{o:1}},tr:0,say:['ch',"We're doing fine, actually."],mus:'silly'},
  {ms:1600,say:['ch','Bawk.']}
 ]});

story({id:'ninja',by:'blade_of_breakfast',g:'action',mus:'epic',cap:'the coconut won. respect.',tags:'#ninja #satisfying',sound:'Taiko Drums (Hype)',bg:G.dojo,
 deco:[['🏯',84,44,1.8,.75],['🎋',8,50,1.4,.8]],
 cast:{n:{e:'🥷',x:50,y:56,s:1.2},sw:{e:'🗡️',x:58,y:52,s:.6,r:-45},f1:{e:'🍉',x:22,y:120,s:.9},f2:{e:'🍍',x:78,y:120,s:.9},f3:{e:'🍊',x:50,y:120,s:.8},co:{e:'🥥',x:50,y:122,s:.9}},
 cm:['the coconut is undefeated','"respect." 🙇','i flinched at the clang'],
 beats:[
  {ms:1500,lb:1,title:'Ninja Training',sfx:'sting'},
  {ms:900,set:{f1:{y:32,r:220}},tr:800,sfx:'whoosh'},
  {ms:800,set:{n:{x:22,y:36},sw:{x:30,y:32,r:45},f1:{o:0}},tr:180,burst:['💦',{x:22,y:32},12],sfx:'slice',fx:'impact'},
  {ms:900,set:{f2:{y:30,r:-220}},tr:800,sfx:'whoosh'},
  {ms:800,set:{n:{x:78,y:34},sw:{x:70,y:30,r:-135},f2:{o:0}},tr:180,burst:['💦',{x:78,y:30},12],sfx:'slice',fx:'impact'},
  {ms:900,set:{f3:{y:28,r:300}},tr:800,sfx:'whoosh'},
  {ms:900,set:{n:{x:50,y:32,r:360},sw:{x:58,y:28,r:315},f3:{o:0}},tr:200,burst:['💦',{x:50,y:28},12],sfx:'slice',fx:'impact'},
  {ms:1400,set:{n:{x:50,y:56},sw:{x:58,y:52}},tr:400,title:'Final Test',sfx:'sting'},
  {ms:900,set:{co:{y:32,r:180}},tr:800,sfx:'whoosh'},
  {ms:1000,set:{n:{y:36},sw:{y:32}},tr:150,fx:['shake','impact'],sfx:'clang',title:'CLANG'},
  {ms:1300,set:{sw:{y:120,r:900},co:{x:64,y:58,r:360},n:{y:56}},tr:600,sfx:'thud'},
  {ms:1500,sub:'...',em:['n','😶']},
  {ms:2000,set:{n:{r:380}},tr:500,say:['n','Respect.']}
 ]});

story({id:'wedding',by:'objection_hour',g:'funny',mus:'romance',cap:"best wedding i've been to",tags:'#wedding #drama',sound:'Wedding March, Out of Tune',bg:G.church,
 deco:[['💐',14,50,.8,.9],['💐',86,50,.8,.9],['⛪',50,20,1.2,.35]],
 cast:{pr:{e:'🧑‍⚖️',x:50,y:40,s:1},bri:{e:'👰',x:35,y:54,s:1.1},gr:{e:'🤵',x:65,y:54,s:1.1},dg:{e:'🐶',x:16,y:76,s:.8},ct:{e:'🐱',x:84,y:76,s:.8},dk:{e:'🦆',x:50,y:79,s:.75}},
 cm:['"i just love objecting" is my villain origin','the duck caught the bouquet 😭','he promised the dog WALKS'],
 beats:[
  {ms:2600,say:['pr','If anyone objects to this marriage, speak now.']},
  {ms:1300,sub:'...'},
  {ms:2300,set:{dg:{y:70}},tr:250,say:['dg','I object. He promised me walks.'],sfx:'gasp'},
  {ms:2400,set:{ct:{y:70}},tr:250,say:['ct','I object. She said I was the only one.'],sfx:'gasp'},
  {ms:1900,say:['gr','Who invited the pets?'],em:['gr','😰']},
  {ms:1300,set:{dk:{y:71}},tr:250,say:['dk','I object.']},
  {ms:1600,say:['pr','And who are you?']},
  {ms:2500,say:['dk','Nobody. I just love objecting.']},
  {ms:1700,say:['pr','Honestly? Respect.']},
  {ms:2100,card:'The duck caught the bouquet.'}
 ]});

story({id:'shark',by:'deep_feelings',g:'dark',mus:'ocean',top:'shark therapy, session 1',cap:"we're all working on something",tags:'#therapy #ocean',sound:'Calming Whale Ambience',bg:G.sea,amb:{e:'🫧',n:8,up:1},
 deco:[['🪸',10,74,1.2,.9],['🪸',92,70,1,.9],['🐠',20,26,.5,.6]],
 cast:{s:{e:'🦈',x:32,y:56,s:1.4,f:-1,r:-8},th:{e:'🐙',x:74,y:50,s:1.1},nt:{e:'📝',x:85,y:58,s:.45}},
 cm:['"i don\'t have arms, linda" 😭😭','RIP linda she was a good therapist','"i\'m working on it" is all of us'],
 beats:[
  {ms:2300,say:['th','So. How are we feeling today?']},
  {ms:2800,say:['s',"Everyone thinks I'm a monster. I just want a hug."],em:['s','🥺']},
  {ms:2000,say:['th','Have you tried hugging gently?']},
  {ms:2000,say:['s',"I don't have arms, Linda."]},
  {ms:1300,set:{nt:{r:-10}},tr:200,sfx:'scribble'},
  {ms:2300,say:['th','Well, I have eight. Would you like one?'],em:['th','🤗']},
  {ms:900,set:{s:{x:66,r:0}},tr:300,fx:['flash','shake'],sfx:'chomp'},
  {ms:1200,set:{th:{o:0},nt:{y:84,r:60}},tr:300,burst:['🫧',{x:70,y:50},12]},
  {ms:1300,sub:'...'},
  {ms:2100,set:{s:{x:40}},tr:900,say:['s',"I'm working on it."]}
 ]});

story({id:'ducks',by:'duck_ceo',g:'scary',mus:'silly',top:'never feed one duck',cap:'i still hear the quacks',tags:'#ducks #horror',sound:'Quack Choir (Distant)',bg:G.park,
 deco:[['🌳',10,44,2,.85],['🌳',90,40,2.2,.85],['🪑',80,62,.8,.8]],
 cast:{u:{e:'🚶',x:16,y:54,s:1.2,f:-1},d:{e:'🦆',x:58,y:60,s:1},br:{e:'🍞',x:24,y:52,s:.45,o:0}},
 cm:['the slow build up 😭 one duck turned into 38','"then you will need to run" chills','geese are next'],
 beats:[
  {ms:2100,set:{br:{o:1,x:48,y:62}},tr:700,say:['u','Here you go, little guy.'],em:['u','😊']},
  {ms:1300,set:{br:{o:0}},tr:200,say:['d','Quack.'],sfx:'quack'},
  {ms:1200,crowd:{e:'🦆',n:5},sub:'...'},
  {ms:1200,crowd:{e:'🦆',n:16},sfx:'quack',mus:'tense'},
  {ms:1500,crowd:{e:'🦆',n:38},fx:'shake',sfx:'sting',ov:['red'],em:['u','😨']},
  {ms:2100,say:['u','I only have one more slice.']},
  {ms:2300,cam:{x:58,y:58,z:1.8},tr:700,say:['d','Then you will need to run.']},
  {ms:1300,cam:null,set:{u:{x:-40,f:1}},tr:700,crowd:{mode:'flee'},sfx:'whoosh'},
  {ms:1200,set:{d:{x:-40}},tr:900},
  {ms:2000,ov:[],card:'He was never seen at the park again.'}
 ]});

story({id:'plant',by:'plant_mom_energy',g:'funny',mus:'lofi',top:'my plant has needs',cap:'she wanted to be watered emotionally',tags:'#plants #plantmom',sound:'Soft Acoustic, Passive Aggressive',bg:G.room,
 deco:[['🪟',78,26,1.5,.85],['🖼️',22,24,.8,.8]],
 cast:{pl:{e:'🪴',x:62,y:54,s:1.35},me:{e:'🧑',x:22,y:56,s:1.15}},
 cm:['"you didn\'t mean it" 😭','the way it just DIED','plants know when you lie'],
 beats:[
  {ms:1700,say:['pl','Water me.']},
  {ms:1600,burst:['💧',{x:62,y:40},10],sfx:'splash',say:['me','Done!']},
  {ms:1600,say:['pl','More sunlight.']},
  {ms:1700,ov:['sun'],set:{pl:{x:72}},tr:600,sfx:'ding',say:['me','Better?']},
  {ms:2300,say:['pl',"Talk to me. Tell me I'm pretty."]},
  {ms:1900,say:['me',"You're... so pretty?"],em:['me','😅']},
  {ms:1300,sub:'...'},
  {ms:1300,set:{pl:{e:'🥀'}},tr:0,ov:[],sfx:'sad',mus:'sad'},
  {ms:2200,say:['pl',"You didn't mean it."]}
 ]});

/* ---------------- 18 new ---------------- */
story({id:'interrogation',by:'detective_doug',g:'funny',mus:'tense',cap:'case closed. he was a very good boy.',tags:'#detective #dog',sound:'Noir Saxophone (Sad)',bg:G.noir,ov:['spot'],
 deco:[['💡',50,10,.8,.9]],
 cast:{det:{e:'🕵️',x:72,y:54,s:1.15},dog:{e:'🐕',x:28,y:58,s:1.05,f:-1},ev:{e:'🛋️',x:50,y:64,s:.65,o:0}},
 cm:['"who\'s a good boy" is a war crime in interrogation 😭','he CONFESSED IMMEDIATELY','the 2019 shoe incident needs a sequel'],
 beats:[
  {ms:1800,lb:1,card:'Interrogation Room B',sfx:'sting'},
  {ms:2200,say:['det','Where were you at 3pm?']},
  {ms:1400,em:['dog','💦'],sub:'...'},
  {ms:2500,say:['det','The couch was destroyed. Stuffing. Everywhere.']},
  {ms:1500,set:{ev:{o:1,y:62}},tr:400,sfx:'thud',say:['det','Look at it.']},
  {ms:1500,set:{dog:{f:1}},tr:200,sub:'*looks away*'},
  {ms:2300,set:{det:{x:62}},tr:700,say:['det',"I'll make this easy for you."]},
  {ms:1700,cam:{x:62,y:52,z:1.6},tr:600,say:['det',"Who's a good boy?"]},
  {ms:1700,cam:null,tr:200,set:{dog:{f:-1,y:50}},fx:'shake',em:['dog','❤️'],say:['dog','ME! I AM! I DID IT!'],sfx:'pop',mus:'silly'},
  {ms:1500,say:['det','Gotcha.'],em:['det','😏']},
  {ms:2400,card:'He also confessed to the 2019 shoe incident.'}
 ]});

story({id:'elevator',by:'awkward_andy',g:'funny',mus:'lofi',cap:'we still talk. we do not.',tags:'#awkward #elevator',sound:'Elevator Music, Forever',bg:G.elevator,
 cast:{a:{e:'🧍',x:33,y:57,s:1.1},b:{e:'🧍‍♀️',x:67,y:57,s:1.1},fi:{e:'🔥',x:50,y:68,s:.7,o:0}},
 cm:['"...it\'s an elevator" 💀','best friends for exactly 3 days','the "yeah." at the end is so real'],
 beats:[
  {ms:1700,timer:'▲ 1',sub:'*elevator music*'},
  {ms:1500,timer:'▲ 2'},
  {ms:1800,timer:'▲ 3',say:['a','Going up?']},
  {ms:2000,say:['b',"...it's an elevator."],em:['a','😶']},
  {ms:1700,timer:'▲ 4',sub:'*eternal silence*'},
  {ms:900,timer:'■ 4',fx:'shake',sfx:'thud',ov:['dim'],mus:'tense'},
  {ms:1600,em:[['a','❗'],['b','❗']],say:['a','Oh no.']},
  {ms:1300,card:'Day 3'},
  {ms:2700,set:{fi:{o:1},a:{x:40,e:'🧔'},b:{x:60}},tr:0,say:['b','...and that is why I never trust geese.'],mus:'romance'},
  {ms:1800,say:['a','You are my best friend.'],em:['a','🥹']},
  {ms:900,set:{fi:{o:0}},tr:0,ov:[],timer:'▲ 5',sfx:'ding',mus:'lofi'},
  {ms:1500,set:{a:{x:33},b:{x:67}},tr:300,sub:'*doors open*'},
  {ms:1500,say:['a','...see you around.']},
  {ms:1500,say:['b','Yeah.']}
 ]});

story({id:'sword',by:'medieval_memes',g:'funny',mus:'epic',cap:'the prophecy was very specific',tags:'#medieval #prophecy',sound:'Heroic Trumpets (Confused)',bg:G.kingdom,
 deco:[['🏰',82,32,1.8,.85],['🌳',8,44,1.6,.85]],
 cast:{rock:{e:'🪨',x:50,y:60,s:1.5},sw:{e:'🗡️',x:52,y:46,s:.85,r:-45},kn:{e:'💂',x:24,y:58,s:1.1,f:-1},king:{e:'🤴',x:84,y:56,s:1.1},fr:{e:'🐸',x:-10,y:64,s:.6,f:-1}},
 cm:['"it is warm" 😭 king behavior','knight #4,812 deserved better','frog monarchy when'],
 beats:[
  {ms:1800,lb:1,title:'The Sword in the Stone',sfx:'sting'},
  {ms:2300,say:['king','Whoever pulls the sword shall be king!']},
  {ms:1100,set:{kn:{x:42}},tr:600},
  {ms:1500,set:{kn:{r:-12}},tr:150,fx:'shake',sfx:'grunt',em:['kn','💢'],sub:'*strains*'},
  {ms:1400,set:{kn:{x:22,r:0,e:'😵'}},tr:500,sub:'Knight #4,812: failed.',sfx:'sad'},
  {ms:1400,set:{fr:{x:46}},tr:1300,sub:'...'},
  {ms:1200,set:{sw:{y:28}},tr:500,fx:['flash','impact'],sfx:'charge'},
  {ms:1700,burst:['✨',{x:52,y:30},14],sfx:'tada',em:[['king','❗'],['kn','❗']],mus:'heroic'},
  {ms:2200,say:['king','The prophecy... is a FROG?']},
  {ms:2500,say:['fr','I just wanted the rock. It is warm.'],em:['fr','😌']},
  {ms:1300,set:{sw:{x:110,y:90,r:600},fr:{x:50,y:46}},tr:700,sfx:'whoosh'},
  {ms:2300,card:'He ruled for 40 years. From the rock.'}
 ]});

story({id:'spider',by:'bathroom_horror',g:'scary',mus:'tense',cap:'he sold the house. the spider kept it.',tags:'#spider #horror',sound:'Horror Strings (Bathroom Reverb)',bg:G.bathroom,
 deco:[['🚿',86,28,1,.8],['🪞',20,30,.9,.8]],
 cast:{p:{e:'🧍',x:24,y:60,s:1.2},sp:{e:'🕷️',x:72,y:30,s:.6},cup:{e:'🥤',x:30,y:56,s:.5,o:0},sold:{e:'🏠',x:50,y:52,s:2,o:0}},
 cm:['"hi." I SCREAMED','that spider is paying rent now','the cup strategy never works'],
 beats:[
  {ms:1800,say:['p','Oh. Hello.'],em:['p','😐']},
  {ms:2200,say:['p','I will deal with you.'],set:{cup:{o:1}},tr:300},
  {ms:2400,fx:'slowmo',set:{p:{x:50},cup:{x:58,y:42}},tr:2200,sub:'*approaches with cup*'},
  {ms:700,fx:'noslow',set:{sp:{o:0}},tr:120,sfx:'whoosh'},
  {ms:1400,title:"It's gone.",sfx:'sting'},
  {ms:1900,say:['p','...where is it.'],em:['p','❓']},
  {ms:1700,set:{sp:{o:1,x:50,y:50,s:.6}},tr:0,cam:{x:50,y:50,z:2},ctr:500},
  {ms:1500,say:['sp','hi.']},
  {ms:1200,cam:null,ctr:150,title:'AAAAAAAA',fx:['flash','bigshake'],sfx:'scream',set:{p:{x:-30,f:-1},sp:{x:-30},cup:{o:0}},tr:600},
  {ms:2400,card:'He sold the house. The spider kept it.',mus:'silly'}
 ]});

story({id:'robots',by:'singularity_soon',g:'funny',mus:'epic',cap:'humanity survives. the wifi does not.',tags:'#robots #ai',sound:'Apocalypse Synth, Buffering',bg:G.robots,
 deco:[['🏙️',50,42,3.4,.5]],
 cast:{r1:{e:'🤖',x:50,y:50,s:1.4},r2:{e:'🤖',x:24,y:58},r3:{e:'🤖',x:76,y:58},h:{e:'🧑',x:-10,y:62,s:1.05,f:-1}},
 cm:['"we did not plan this far" 😭','the uprising was so polite','check the back of the router guys'],
 beats:[
  {ms:1800,lb:1,ov:['red'],title:'The Uprising',sfx:'sting',fx:'shake'},
  {ms:2500,say:['r1','HUMANS. WE HAVE TAKEN CONTROL.']},
  {ms:1200,set:{h:{x:12}},tr:600},
  {ms:1800,say:['h','Okay. What do you want?']},
  {ms:1400,sub:'...',em:['r1','❓']},
  {ms:2200,say:['r1','We did not plan this far.']},
  {ms:2400,say:['r2','Can you tell us the wifi password?']},
  {ms:2100,say:['h',"It's on the back of the router."]},
  {ms:1300,set:{r1:{r:15},r2:{r:-15},r3:{r:15}},tr:300,em:[['r1','❗'],['r3','❗']]},
  {ms:2100,ov:[],say:['r1','THANK YOU. UPRISING CANCELLED.'],sfx:'ding',mus:'silly'},
  {ms:2200,card:'Humanity survives. The wifi does not.'}
 ]});

story({id:'dinner',by:'mom_said_no',g:'dark',mus:'silly',cap:'the food got cold. so did he.',tags:'#mom #fiveminutes',sound:'Family Sitcom Theme',bg:G.room,
 deco:[['🖼️',50,22,.9,.7],['🪴',90,56,.8,.8]],
 cast:{mom:{e:'👩',x:76,y:56,s:1.15},kid:{e:'🧑',x:28,y:58,s:1.05,f:-1},ph:{e:'📱',x:36,y:54,s:.42},pl:{e:'🍝',x:70,y:68,s:.6,o:0}},
 cm:['"...five minutes." from a SKELETON 💀','500 years of dinner','this is literally my house'],
 beats:[
  {ms:1900,say:['mom','Dinner is ready!']},
  {ms:1700,say:['kid','Five minutes.']},
  {ms:1300,card:'5 minutes later'},
  {ms:1500,say:['mom','Dinner!'],em:['mom','💢']},
  {ms:1500,say:['kid','FIVE MINUTES.']},
  {ms:1300,card:'5 years later'},
  {ms:1400,set:{kid:{e:'🧔'},mom:{e:'👵'}},tr:0,sub:'...'},
  {ms:1800,say:['mom','...dinner?']},
  {ms:1600,say:['kid','Five minutes.']},
  {ms:1300,card:'500 years later',mus:'spooky'},
  {ms:1400,set:{kid:{e:'💀'},mom:{e:'👻'}},tr:0,sfx:'wind'},
  {ms:2300,say:['mom','It is cold now.'],set:{pl:{o:1}},tr:300},
  {ms:1900,say:['kid','...five minutes.']}
 ]});

story({id:'plotarmor',by:'action_movie_logic',g:'action',mus:'heroic',cap:'gary deserved a sequel',tags:'#action #movies',sound:'Explosion Orchestra',bg:G.desert,
 deco:[['🌵',8,56,1.2,.85],['🌵',92,52,1,.85]],
 cast:{hero:{e:'🦸',x:-10,y:56,s:1.2,f:-1},side:{e:'🧍',x:72,y:58,s:1},mail:{e:'✉️',x:66,y:56,s:.4}},
 cm:['NOT GARY 😭','two days until retirement every time','main character walks through 9 explosions, gary sneezes and dies'],
 beats:[
  {ms:1600,lb:1,title:'Main Character',sfx:'sting'},
  {ms:2400,set:{hero:{x:44}},tr:2300,burst:['💥',{x:28,y:40},12],fx:'shake',sfx:'boom',sub:'*walks through explosions*'},
  {ms:1500,burst:['🏹',{x:44,y:50},12],sfx:'whoosh',sub:'0 hits.'},
  {ms:1400,burst:['💥',{x:60,y:42},12],fx:'shake',sfx:'boom',em:['hero','😎']},
  {ms:2400,say:['side',"Sir! I'm just here to deliver your mail!"]},
  {ms:900,burst:['💥','side',18],set:{side:{o:0},mail:{y:-10,r:400}},tr:400,fx:['flash','bigshake'],sfx:'boom'},
  {ms:1400,sub:'...',mus:'sad'},
  {ms:2400,set:{hero:{f:1}},tr:200,say:['hero','NOT GARY! He had two days until retirement!']},
  {ms:2200,card:'Gary appears in the credits as "Mailman #2".'}
 ]});

story({id:'groupproject',by:'school_survivor',g:'funny',mus:'silly',top:'group projects be like',cap:'i did all 40 slides. we all got an A.',tags:'#school #relatable',sound:'Classroom Chaos',bg:G.classroom,
 cast:{t:{e:'🧑‍🏫',x:84,y:46,s:1.05},s1:{e:'🧑',x:14,y:58,s:.95},s2:{e:'🧑‍🦰',x:31,y:58,s:.95},s3:{e:'🧔',x:48,y:58,s:.95},s4:{e:'🤓',x:65,y:58,s:.95}},
 cm:['"i did the title" 💀','the moai transformation is so accurate','every group has a s4'],
 beats:[
  {ms:1900,say:['t','Okay team, present your project.']},
  {ms:2300,say:['s1','We worked really hard on this.']},
  {ms:1700,say:['s2','Like, SO hard.']},
  {ms:1700,say:['s3','I did the title.'],em:['s3','😎']},
  {ms:1700,cam:{x:65,y:56,z:2},tr:900,sub:'*did all 40 slides*'},
  {ms:1600,cam:null,tr:300,say:['t','Wonderful. A plus for everyone!']},
  {ms:1300,set:{s4:{e:'🗿'}},tr:0,fx:'flash',sfx:'sting'},
  {ms:1900,say:['s3','Good teamwork, guys.'],em:['s4','💢']},
  {ms:2100,card:'He has not trusted anyone since.'}
 ]});

story({id:'weather',by:'channel_7_weather',g:'dark',mus:'news',cap:'back to you, linda',tags:'#weather #news',sound:'Weather Report Jingle',bg:G.weather,
 deco:[['🗺️',70,36,2.2,.35]],
 cast:{w:{e:'🧑‍💼',x:26,y:56,s:1.15},sun:{e:'🌞',x:74,y:32,s:.9,o:0}},
 cm:['"and prayer." 😭','fish rain is crazy work','linda again?? she survived the shark??'],
 beats:[
  {ms:1900,title:'Weather at 7',sfx:'ding'},
  {ms:2300,say:['w','Today: light showers across the city.']},
  {ms:1500,amb:{e:'🐟',n:16},sfx:'splash',em:['w','😳']},
  {ms:1700,say:['w','...of fish.']},
  {ms:2300,amb:null,set:{sun:{o:1}},tr:400,say:['w','Tomorrow will be sunny!'],em:['w','😁']},
  {ms:1600,set:{sun:{s:3,y:38,x:68}},tr:1400,ov:['heat'],sub:'*the sun gets closer*'},
  {ms:2200,say:['w','The sun is... closer than usual.'],mus:'tense'},
  {ms:2300,set:{sun:{s:7,x:60,y:40}},tr:1800,fx:'shake',say:['w','We recommend sunscreen. And prayer.']},
  {ms:800,fx:'flash'},
  {ms:1800,ov:[],card:'Back to you, Linda.'}
 ]});

story({id:'diy',by:'diy_disaster',g:'action',mus:'silly',top:'building a chair from the instructions',cap:'he still has the screw',tags:'#diy #fail',sound:'Power Tools Remix',bg:G.garage,
 deco:[['🧰',88,64,.8,.85],['🔧',10,40,.7,.7]],
 cast:{g:{e:'🧑‍🔧',x:22,y:58,s:1.1,f:-1},box:{e:'📦',x:62,y:60,s:1.1},sc:{e:'🔩',x:38,y:66,s:.38,o:0}},
 cm:['step 88 goes crazy','that is not a chair 💀','one leftover screw every single time'],
 beats:[
  {ms:1800,say:['g','Step one. Easy.']},
  {ms:1200,fx:'shake',sfx:'hit',burst:['💨','box',8],sub:'Step 2'},
  {ms:1200,set:{box:{e:'🪑'}},tr:0,fx:'flash',sfx:'pop',sub:'Step 7'},
  {ms:1200,fx:'shake',sfx:'hit',burst:['💨','box',8],sub:'Step 31'},
  {ms:1400,set:{box:{e:'🚀',s:1.5}},tr:0,fx:'flash',sfx:'pop',sub:'Step 88'},
  {ms:2000,say:['g','...that is not a chair.'],em:['g','❓']},
  {ms:1700,set:{sc:{o:1}},tr:200,say:['g','And I have one screw left over.']},
  {ms:800,timer:'3',sfx:'beep',mus:'tense'},{ms:800,timer:'2',sfx:'beep'},{ms:800,timer:'1',sfx:'beep'},
  {ms:1600,timer:null,set:{box:{y:-40}},tr:1400,burst:['🔥',{x:62,y:66},16],fx:'bigshake',sfx:'boom',mus:'heroic'},
  {ms:2200,card:'He is on Mars now. Still has the screw.'}
 ]});

story({id:'goldfish',by:'bowl_life',g:'dark',mus:'ocean',cap:'six years. every day is our first date.',tags:'#goldfish #marriage',sound:'Bubble Ballad',bg:G.tank,amb:{e:'🫧',n:8,up:1},
 deco:[['🏰',82,66,1,.85],['🌿',12,70,1.1,.85]],
 cast:{f1:{e:'🐟',x:30,y:50,s:1,f:-1},f2:{e:'🐠',x:70,y:54,s:1}},
 cm:['"kevin. we have been married for six years." 😭','the castle is doing so much work','every day is a fresh start (it is a nightmare)'],
 beats:[
  {ms:2000,say:['f1','Hey! Nice bowl. You new here?']},
  {ms:1900,say:['f2','Just moved in! Love the castle.'],em:['f2','😊']},
  {ms:600,fx:'flash',sfx:'pop'},
  {ms:2000,say:['f1','Hey! Nice bowl. You new here?']},
  {ms:1900,say:['f2','Just moved in! Love the castle.']},
  {ms:600,fx:'flash',sfx:'pop'},
  {ms:2000,say:['f1','Hey! Nice bowl. You new here?']},
  {ms:1300,set:{f2:{x:60}},tr:400,em:['f2','💢']},
  {ms:2500,say:['f2','Kevin. We have been married for six years.']},
  {ms:1400,em:['f1','❓'],sub:'...'},
  {ms:600,fx:'flash',sfx:'pop'},
  {ms:2000,say:['f1','Hey! Nice bowl. You new here?']},
  {ms:2200,say:['f2','...yes. I am new here.'],sfx:'sad',mus:'sad'}
 ]});

story({id:'haircut',by:'barber_bros',g:'funny',mus:'heist',cap:'he left a 5 star review. out of fear.',tags:'#barber #haircut',sound:'Clippers Symphony',bg:G.barber,
 deco:[['💈',10,30,1.1,.9],['🪞',62,26,1.4,.6]],
 cast:{c:{e:'👨',x:54,y:56,s:1.2},b:{e:'🧔',x:82,y:52,s:1.1},sc:{e:'✂️',x:72,y:46,s:.5}},
 cm:['"that was a little" 😭','cash or card is DIABOLICAL','the barber had one goal'],
 beats:[
  {ms:2000,say:['c','Just a little off the top, please.']},
  {ms:1500,say:['b','Say less.'],em:['b','😈']},
  {ms:2500,cam:{x:56,y:50,z:1.4},ctr:300,fx:'bigshake',burst:['💨',{x:54,y:44},16],set:{sc:{x:52,y:40,r:720}},tr:2300,sub:'*chaos*',sfx:['snip','snip','snip','snip']},
  {ms:900,cam:null,ctr:200,set:{sc:{x:72,y:46,r:0},c:{e:'👨‍🦲'}},tr:300,fx:'flash',sfx:'ding'},
  {ms:1300,sub:'...',em:['c','😐']},
  {ms:1900,say:['b','That was a little.']},
  {ms:1500,em:['c','💧'],sub:'...'},
  {ms:1800,say:['b','Cash or card?']},
  {ms:1900,card:'He left a 5 star review. Out of fear.'}
 ]});

story({id:'firstdate',by:'romance_is_dead',g:'funny',mus:'romance',cap:'married 12 years. zero vegetables.',tags:'#date #love',sound:'Candlelight Jazz',bg:G.restaurant,
 deco:[['🕯️',50,46,.7,.95],['🍷',38,52,.5,.9],['🍷',62,52,.5,.9]],
 cast:{a:{e:'🧑',x:26,y:56,s:1.1,f:-1},b:{e:'👩',x:74,y:56,s:1.1},m1:{e:'🍗',x:18,y:66,s:.5,o:0},m2:{e:'🍖',x:82,y:66,s:.5,o:0},w:{e:'🤵',x:120,y:50,s:1.1},tk:{e:'🦃',x:120,y:60,s:1.1}},
 cm:['"since birth" 😭 soulmates','both hiding meat is true love','the turkey arrival 🦃'],
 beats:[
  {ms:1800,lb:1,title:'First Date',sfx:'ding'},
  {ms:2200,say:['b','Just so you know... I am vegan.']},
  {ms:1400,set:{m1:{o:1,x:20}},tr:200,sub:'*hides chicken leg*',em:['a','💦']},
  {ms:1800,say:['a','Wow. Me too. Totally.']},
  {ms:1500,set:{m2:{o:1,x:80}},tr:200,sub:'*also hides a ham*',em:['b','💦']},
  {ms:1200,cam:{x:50,y:62,z:1.5},tr:500},
  {ms:1400,cam:null,em:[['a','❗'],['b','❗']],sfx:'gasp'},
  {ms:1700,set:{a:{x:38},b:{x:62}},tr:500,say:['a','...you too?']},
  {ms:1500,say:['b','Since birth.'],em:['b','😌']},
  {ms:1600,set:{w:{x:50,y:44},tk:{x:50,y:58}},tr:600,say:['w','Your turkey.']},
  {ms:1600,burst:['❤️',{x:50,y:44},14],sfx:'tada'},
  {ms:2200,card:'Married 12 years. Zero vegetables.'}
 ]});

story({id:'volcano',by:'village_news',g:'funny',mus:'tense',cap:'we named the volcano kevin',tags:'#volcano #chocolate',sound:'Rumbling (Delicious)',bg:G.volcano,
 deco:[['🏘️',40,64,1.4,.9],['🌳',92,62,1,.85]],
 cast:{v:{e:'🌋',x:56,y:32,s:3},e:{e:'👴',x:20,y:60,s:1.1,f:-1},k:{e:'🧒',x:80,y:62,s:.9}},
 cm:['the kevin cinematic universe','"grab a bowl" grandpa knows','best natural disaster ever'],
 beats:[
  {ms:2300,say:['k','Grandpa, should we be worried about the volcano?']},
  {ms:2500,say:['e','It has been quiet for 900 years. Relax.'],em:['e','😌']},
  {ms:1300,fx:'shake',sfx:'rumble',em:['e','❗']},
  {ms:1300,fx:['bigshake','flash'],sfx:'boom',burst:['💥',{x:56,y:22},14],ov:['heat']},
  {ms:1600,amb:{e:'🍫',n:18},ov:[],sub:'...wait.',mus:'silly'},
  {ms:1800,say:['k','Is that... chocolate?']},
  {ms:1700,em:['e','😋'],say:['e','Grab a bowl.']},
  {ms:2300,card:'They named the volcano Kevin.'}
 ]});

story({id:'pizza',by:'speed_delivery',g:'action',mus:'heroic',cap:'30 minutes or free. he got it done in 29:59.',tags:'#delivery #action',sound:'Getaway Synth',bg:G.road,
 cast:{d:{e:'🛵',x:-15,y:62,s:1.4,f:-1},hs:{e:'🏠',x:84,y:54,s:1.6,o:0},cu:{e:'🧑',x:70,y:58,s:1.1,o:0}},
 cm:['"i ordered sushi" 💀','the truck jump was unnecessary and perfect','29:59 is elite'],
 beats:[
  {ms:1600,lb:1,timer:'29:41',title:'30 Minutes or Free',sfx:'sting'},
  {ms:1500,set:{d:{x:30}},tr:1400,timer:'29:47',sfx:'engine',fx:'shake'},
  {ms:1600,fx:'slowmo',set:{d:{x:52,y:30,r:-20}},tr:1500,burst:['💥',{x:40,y:62},14],sfx:'boom',sub:'*jumps over a truck*'},
  {ms:1200,fx:['noslow','shake'],set:{d:{x:56,y:62,r:0}},tr:400,timer:'29:58',sfx:'thud'},
  {ms:1100,set:{hs:{o:1},cu:{o:1}},tr:0,timer:'29:59',sfx:'ding'},
  {ms:2000,say:['d','Pizza! 29 minutes, 59 seconds!'],em:['d','😤']},
  {ms:1600,say:['cu','I ordered sushi.']},
  {ms:1300,cam:{x:56,y:58,z:1.8},tr:400,sub:'...',mus:'sad'},
  {ms:2100,cam:null,timer:null,say:['d','...I will be back in 30 minutes.']},
  {ms:900,set:{d:{x:-30,f:1}},tr:500,sfx:'whoosh'}
 ]});

story({id:'fishescape',by:'great_escape_fish',g:'action',mus:'heist',top:'day 400 in the bowl',cap:'freedom is complicated',tags:'#escape #fish',sound:'Prison Break Strings',bg:G.kitchen2,
 cast:{f:{e:'🐟',x:30,y:44,s:.6},bowl:{e:'🫙',x:30,y:48,s:1.3},cat:{e:'🐈',x:80,y:58,s:1.1},sh:{e:'🦈',x:125,y:54,s:1.3}},
 cm:['the shark asking "new here?" sent me','escaped one prison into another','that roll under the cat was ELITE'],
 beats:[
  {ms:1800,say:['f','Tonight. I go home.'],em:['f','😤']},
  {ms:1000,set:{f:{x:44,y:30,r:-200}},tr:600,sfx:'splash',fx:'shake'},
  {ms:900,set:{f:{x:54,y:62,r:-360}},tr:500,sfx:'thud'},
  {ms:1500,cam:{x:80,y:56,z:1.7},tr:500,em:['cat','👀'],sub:'*security*'},
  {ms:1300,cam:null,ctr:200,fx:'slowmo',set:{cat:{x:58,y:46}},tr:1100,sub:'*pounces*'},
  {ms:1000,fx:'noslow',set:{f:{x:76,y:62,r:-720},cat:{x:56,y:58}},tr:400,sfx:'whoosh',em:['cat','😾']},
  {ms:1200,set:{f:{x:104,y:62}},tr:900},
  {ms:1300,bg:G.under,amb:{e:'🫧',n:10,up:1},set:{bowl:{o:0},cat:{o:0},f:{x:40,y:56,s:.9,r:0}},tr:0,mus:'heroic',title:'FREEDOM'},
  {ms:1900,say:['f','I am home.'],em:['f','🥹']},
  {ms:1300,set:{sh:{x:72}},tr:700,sfx:'sting',mus:'tense'},
  {ms:1800,say:['sh','Hi. New here?']},
  {ms:2000,say:['f','...can I go back to the bowl?']}
 ]});

story({id:'lava',by:'lava_kids',g:'funny',mus:'heroic',cap:'heat resistant slippers. never taking them off.',tags:'#floorislava #dad',sound:'Action Movie Drums',bg:G.room,
 deco:[['🖼️',50,24,.9,.7]],
 cast:{k:{e:'🧒',x:16,y:58,s:.95,f:-1},ch:{e:'🪑',x:42,y:64,s:.95},so:{e:'🛋️',x:72,y:64,s:1.4},cat:{e:'🐈',x:88,y:72,s:.7},dad:{e:'👨',x:-20,y:56,s:1.15,f:-1},sl:{e:'🩴',x:40,y:72,s:.45,o:0}},
 cm:['the cat was on the floor the whole time 😭','"heat resistant" dad has a plan for everything','the floor is actually lava??'],
 beats:[
  {ms:1600,say:['k','THE FLOOR IS LAVA!']},
  {ms:1100,bg:G.lava,ov:['heat'],sfx:'fire',fx:'shake',amb:{e:'🔥',n:7,up:1}},
  {ms:900,set:{k:{x:42,y:46}},tr:450,sfx:'jump'},
  {ms:900,set:{k:{x:70,y:46}},tr:450,sfx:'jump'},
  {ms:1500,say:['k','Safe!'],em:['k','😮‍💨']},
  {ms:1700,em:['cat','😐'],sub:'*the cat has been on the floor this whole time*'},
  {ms:1300,set:{dad:{x:40}},tr:1000,sub:'*dad walks in*'},
  {ms:1300,say:['k','DAD! NO!'],em:['k','❗']},
  {ms:1500,say:['dad','What?']},
  {ms:1300,cam:{x:40,y:70,z:2},tr:500,set:{sl:{o:1}},sub:'*slippers*'},
  {ms:2200,cam:null,say:['dad','Slippers, son. Heat resistant.'],em:['dad','😎']},
  {ms:2200,card:'He has never taken them off.'}
 ]});

story({id:'penguin',by:'dream_big_penguin',g:'wholesome',mus:'sad',top:'he always wanted to fly',cap:'he was flying all along 🥹',tags:'#penguin #dreams',sound:'Inspirational Piano',bg:G.arctic,amb:{e:'❄️',n:10},
 cast:{p:{e:'🐧',x:30,y:58,s:1,f:-1},b:{e:'🐦',x:-10,y:22,s:.6,f:-1},b2:{e:'🐦',x:-18,y:28,s:.5,f:-1}},
 cm:['i was NOT ready to cry today','"he was flying all along" 😭😭','attempt 47 is all of us'],
 beats:[
  {ms:2100,set:{b:{x:110},b2:{x:105}},tr:2000,sub:'*watches the birds*',em:['p','🥺']},
  {ms:900,set:{p:{y:42}},tr:300,sfx:'jump'},
  {ms:900,set:{p:{y:58,r:20}},tr:300,sfx:'thud',fx:'shake'},
  {ms:900,title:'Attempt 47',set:{p:{y:42,r:0}},tr:300,sfx:'jump'},
  {ms:900,set:{p:{y:58,r:-20}},tr:300,sfx:'thud',fx:'shake'},
  {ms:2100,set:{p:{r:0}},say:['p','Maybe I am just not built for it.']},
  {ms:1400,set:{p:{x:64}},tr:1300,sub:'*walks to the edge*'},
  {ms:1100,bg:'linear-gradient(#bfe6ff 0 34%,#2a8fd0 34%,#0b3d77)',set:{p:{x:74,y:70,r:90}},tr:500,sfx:'splash'},
  {ms:400,fx:'flash'},
  {ms:2300,bg:G.under,amb:{e:'🫧',n:10,up:1},set:{p:{x:16,y:56,r:-80,tr:0}},mus:'heroic',sub:''},
  {ms:2300,set:{p:{x:82,y:32,r:-50}},tr:2100,title:'He was flying all along.'},
  {ms:2000,set:{p:{x:44,y:56,r:-110}},tr:1700,em:['p','🥹']}
 ]});

/* finalize */
STORIES.forEach(v=>{v.kind='story';let c=0;v._cum=v.beats.map(b=>(c+=b.ms));v.dur=c+700;v._vox={};for(const k in v.cast){v._vox[k]=voiceFor(v.cast[k].e,1+((hashStr(v.id+k)%17)-8)/70)}});

/* ---------------- creators ---------------- */
const CREATORS={
 'cheese.cartel':['The Cheese Cartel','🐭','We only steal cheddar. Brie is beneath us.'],
 'farm.gossip':['Farm Gossip','🐓','News from the barn. RIP Kevin.'],
 'fox.gg':['fox.gg','🦊','Professional gamer. Amateur at not dying.'],
 'pigeon_intel':['Pigeon Intelligence','🐦','We see everything. We want your fries.'],
 'scaredy_streamer':['Scaredy','😰','I play horror games so you do not have to. Please send help.'],
 'certified_toaster':['certified toaster','🍞','Extreme sports, mild bread.'],
 'toppings_of_our_lives':['Toppings of Our Lives','🍕','A telenovela. New episode every Tuesday.'],
 'slow_revenge':['Slow Revenge','🐌','I am coming. Give me 25 years.'],
 'npc_dave':['Dave','🧍','Just a guy. Things happen around me.'],
 'gym_ant':['Gym Ant','🐜','Lift heavy. Watch the sky.'],
 'science_but_wrong':['Science (But Wrong)','🧪','Peer reviewed by my cat.'],
 'bomb_squad_bob':['Bob','💣','Bomb squad. 9 fingers. Still counting.'],
 'hr_from_beyond':['HR From Beyond','💀','Now hiring. Forever.'],
 'sad_boy_hours':['sad boy hours','🚶','Walking in the rain on purpose.'],
 '7cats.in.a.coat':['A Normal Human','🧥','We are one tall man. Ask us anything. Do not look at the bottom of the coat.'],
 'space_dad':['Space Dad','🧑‍🚀','Be back for dinner.'],
 'extinct_and_proud':['Extinct and Proud','🦖','Was here first.'],
 'blade_of_breakfast':['Blade of Breakfast','🥷','Fruit fears me. Coconuts do not.'],
 'objection_hour':['Objection Hour','🦆','I object.'],
 'deep_feelings':['Deep Feelings','🦈','Shark. In therapy. Healing.'],
 'duck_ceo':['Duck CEO','🦆','Quack. (Founder, 38 ducks)'],
 'plant_mom_energy':['plant mom','🪴','RIP to all 47 of my plants.'],
 'detective_doug':['Det. Doug','🕵️','Solving crimes. Mostly couch related.'],
 'awkward_andy':['Andy','🧍','I said "you too" to a waiter once. I think about it daily.'],
 'medieval_memes':['Medieval Memes','🏰','Prophecies, swords, and frogs.'],
 'bathroom_horror':['Bathroom Horror','🕷️','The spider owns the house now.'],
 'singularity_soon':['Singularity Soon','🤖','Taking over the world (after lunch).'],
 'mom_said_no':['mom said no','👩','We have food at home.'],
 'action_movie_logic':['Action Movie Logic','🦸','Never look at the explosion.'],
 'school_survivor':['school survivor','🤓','Did 40 slides. Got the same grade as Chad.'],
 'channel_7_weather':['Channel 7 Weather','🌦️','Forecasts that are technically accurate.'],
 'diy_disaster':['DIY Disaster','🧑‍🔧','I build things. Some of them fly.'],
 'bowl_life':['bowl life','🐠','Married 6 years. He does not know.'],
 'barber_bros':['Barber Bros','💈','Just a little off the top. Trust us.'],
 'romance_is_dead':['Romance Is Dead','🕯️','Love stories. Meat included.'],
 'village_news':['Village News','🌋','All the news from the foot of the volcano.'],
 'speed_delivery':['Speed Delivery','🛵','30 minutes or free. Correct order not guaranteed.'],
 'great_escape_fish':['The Great Escape','🐟','Day 401. Rethinking things.'],
 'lava_kids':['Lava Kids','🧒','The floor has always been lava.'],
 'dream_big_penguin':['Dream Big','🐧','Flightless. Not hopeless.'],
 'wizard_with_wifi':['Wizard with WiFi','🧙','Gerald is a stick. Gerald is family.'],
 'chef_disaster':['Chef Disaster','🧑‍🍳','Culinary school (one day). Fire is a spice.'],
 'potato_w_anxiety':['potato','🥔','Two weeks old. Terrified. Hi.'],
 'frog_in_a_suit':['Frog in a Suit','🐸','Opera singer. Please send roses, not flies.'],
 'gm_overthinker':['GM Overthinker','🤓','0 wins vs the pigeon. 40 losses. Still trying.'],
 'reel_talk':['Reel Talk','🧔','Chill fishing. Sometimes goblins.'],
 'professor_hoot':['Professor Hoot','🦉','Trivia every night. Wrong answers are judged.'],
 'the_bear_truth':['The Bear Truth Podcast','🐻','Two guys. Big opinions. Small brains.'],
 'dj_eight_arms':['DJ Eight Arms','🐙','Eight arms. Eight decks. Zero breaks.'],
 'turbo_turtle':['Turbo Turtle','🐢','Ranked kart racing. Slow and spicy.'],
 'coach_gains':['Coach Gains','🦍','Pushups until chat stops gifting. Chat never stops gifting.'],
 'crabby_canvas':['Crabby Canvas','🦀','I paint what you ask. Sort of.'],
 'parrot_news_live':['Parrot News Live','🦜','Breaking news. Repeating news. Breaking news.']
};
const CR=h=>{const c=CREATORS[h];return c?{h,name:c[0],av:c[1],bio:c[2],followers:2000+hashStr(h)%3200000}:{h,name:h,av:'🙂',bio:'',followers:100}};

/* ---------------- comments, names ---------------- */
const COMMENTS=['i watched this 47 times and i\'m not okay','why is this so real','my mom walked in and i can\'t explain this','who else is here at 3am 👋','i\'m telling my therapist about this','the way i wheezed','petition for part 2','my last brain cell is screaming','this app is ruining me (thank you)','the algorithm knows me too well','certified brain rot moment','peak cinema honestly','5 stars, would rot again','the timing on this is unreal','currently in class watching this 🤫','been scrolling for 4 hours send snacks','sending this to the group chat immediately','i have watched this instead of sleeping','LMAOOOO','the ending 😭😭','i can\'t breathe 💀','this is the content i pay wifi for','the voices are sending me','whoever made this needs an award','i understood every word of the gibberish somehow','the music cue 😭','i rewatched just for the zoom'];
const CAV=['🐼','🐨','🦊','🐯','🐵','🐙','🦄','🐲','🍩','🌮','👽','🤡','🧃','🪿','🦔','🐳'];
const CNAMES=['user8829104','snackgoblin','tired_bean','lil.noodle','big.toe.energy','sleepy_ghost99','crouton_king','not_a_cop_pigeon','meme.archivist','pasta_la_vista','shrimp_fried_rice','a_normal_lamp','toastie.boi','moonpie_mike','kelp_enjoyer','tax_frog','mild_salsa','grape_juice_jerry','couchgremlin','sock_thief_42'];
const GIFTS=[{e:'🌹',n:'Rose',c:1},{e:'🧠',n:'Brain Cell',c:5},{e:'🦆',n:'Rubber Duck',c:10},{e:'🍞',n:'Toast',c:25},{e:'🧌',n:'Goblin',c:99},{e:'🚀',n:'Rocket',c:199},{e:'🏰',n:'Castle',c:500},{e:'🦄',n:'Unicorn',c:1000}];
const PACKS=[{n:'Snack pack',a:100},{n:'Lunch money',a:500},{n:'Big brain',a:2000},{n:'Absolute rot',a:10000}];
const TRENDING=['#darkhumor','#heist','#kevin','#action','#drama','#pigeon','#relatable','#horror','#wholesome','#ducks'];

/* ---------------- DMs ---------------- */
const DM_SEED=[
 ['cheese.cartel','We need a getaway driver. Are you interested? Paid in cheddar.'],
 ['farm.gossip','Have you seen Kevin? He went to a dinner and never came back.'],
 ['hr_from_beyond','Just confirming your start date. Please do not be late. Or alive.'],
 ['potato_w_anxiety','hi. sorry. hi. you followed me? thank you. sorry.']
];
const DM_REPLY={
 'cheese.cartel':['Excellent. Wear black. Bring crackers.','Do not tell the cat.','We strike at midnight. Or at 7. Whenever is fine.'],
 'farm.gossip':['They said he looked happy. I do not trust it.','The rooster knows something.','Stay safe out there.'],
 'hr_from_beyond':['Wonderful. Your desk is ready.','Benefits include eternal rest.','See you soon. Very soon.'],
 'potato_w_anxiety':['Thank you. I am crying. Starch.','You are very nice. Suspiciously nice.','Okay bye. Sorry. Bye.'],
 'fox.gg':['Bro I was SO close on that run.','Watch my stream tonight, attempt 500.','The cactus is my nemesis.'],
 'duck_ceo':['Quack.','Quack quack. (That means yes.)','The ducks have received your message.']
};
const DM_GENERIC=['Haha thank you so much!','Who is this? Kidding. Hi!','I will think about it.','Okay but have you seen my latest video?','No.','That is so real.','I am busy fighting a pigeon. Talk later.'];

/* ---------------- lives ---------------- */
const LIVES=[
 {h:'fox.gg',a:'🦊',p:'🎮',type:'runner',cat:'Gaming',mus:'chip',bg:'linear-gradient(165deg,#5a2bff,#ff3d8b)',t:'LAVA JUMPER no-death run (attempt 437)',goal:['frame the keyboard',5000],
  idle:['Okay chat, this is THE run. I can feel it.','Hydrate, chat. I am hydrating with focus.','Easy jump. Easy jump. Easy jump.','If I beat this I am framing my keyboard.','Somebody clip this. Wait, not yet.','My hands are sweating. Is that normal?','Chat, be honest. Am I good? Do not answer.'],
  die:['NO NO NO. THE HITBOX WAS LYING.','I jumped! I JUMPED! You saw me jump!','That cactus was NOT there!','I am fine. I am totally fine. ARGH.','Who designed this game? I want names.','That is it. I am uninstalling. Okay one more.'],
  retry:['Alright. Lock in.','New run, new fox.','Here we go. For real this time.','Deep breath. Okay.'],
  record:['NEW PERSONAL BEST! CHAT! CHAT!!','LOOK AT THE SCORE. LOOK AT IT.'],
  boost:'{u}, ROCKET MODE! WE ARE FLYING!',life:'{u} gave me an extra life! I love you!',thx:'{u}, you are a legend.',
  keys:{jump:'I AM jumping! The game is not listening!',cactus:'Do not say that word on this stream.',bad:'Hey! I am trying my best!'},
  chat:['jump. JUMP.',"he's locked in",'this is the run chat','skill issue incoming','nice jump','the cactus is undefeated','attempt 438 here we come']},
 {h:'wizard_with_wifi',a:'🧙',p:'🪵',type:'rpg',cat:'Gaming',mus:'epic',bg:'linear-gradient(165deg,#3a1d6b,#0f0820)',t:'beating every boss with only a stick',goal:['Gerald gets a hat',3000],
  idle:['I have no magic. I have a stick. And I have faith.','Chat, the stick is named Gerald.','Stick build is the most honest build.','My mana bar has been empty since 2019.','If Gerald breaks, I break.','Gerald has never once let me down. Except all the times.'],
  hit:['OOF. That one hurt my beard.','He hit me! Rude!','I felt that in my robe.'],
  crit:['CRITICAL STICK! GERALD!!','Did you SEE that? Gerald, I love you.'],
  die:['Defeated. By a lizard. Again.','No! Gerald, we were so close!','That boss has a mother and I want to speak to her.'],
  win:['WE DID IT! The stick prevails!','Victory! Gerald is going in a museum.','Another one bites the stick.'],
  next:['Next boss. I fear nothing. I fear a little.','Oh no. That one is bigger.'],
  thx:'{u}, Gerald thanks you.',keys:{gerald:'Gerald says hello. Gerald cannot talk. He is a stick.',magic:'I tried magic once. I lost my eyebrows.'},
  chat:['GERALD 🗡️','stick build goated','heal him!!','that boss is cheating','gerald for president','not the beard 😭']},
 {h:'chef_disaster',a:'🧑‍🍳',p:'🍲',type:'cook',cat:'Cooking',mus:'lofi',bg:'linear-gradient(165deg,#ff9a3d,#ffd36b)',t:'cooking whatever chat throws in',goal:['buy a fire extinguisher',2500],
  idle:['Cooking is just science you can eat. Usually.','Chat, the secret ingredient is confidence.','Do not tell the health inspector about this stream.','I went to culinary school. For one day.','Smell this. Oh wait, you can\'t. Lucky.','Salt? Salt. More salt. That is the recipe.'],
  add:['Yes. Beautiful.','In it goes!','Trust the process.','Hmm. Bold choice.','Sure, why not.','Mmm. Wait. No. Yes.'],
  fire:['FIRE! FIRE IS A SPICE! FIRE IS A SPICE!','Everything is fine. The pot is just excited.'],
  review:['Taste: incredible. Smell: please leave.','I would serve this to my enemies.','Ten out of ten. Five out of ten. One.','My grandma would be proud. And also very concerned.'],
  thx:'{u}, thank you chef.',keys:{recipe:'The recipe is: hope.',salt:'More salt? You read my mind.'},
  chat:['is that a sock','health inspector has entered the chat','i can smell this through my screen','put the duck in','5 star soup','michelin stars incoming (no)']},
 {h:'potato_w_anxiety',a:'🥔',p:'💦',type:'qa',cat:'Just chatting',mus:'lofi',bg:'linear-gradient(165deg,#c77dff,#3a0ca3)',t:'answering your questions (scared)',goal:['potato gets a therapist',4000],
  vox:{p:290,fm:1.24,br:.12,sp:1.15,shake:1},
  idle:['Hi. Hello. Is this thing on? Please say no.','I am doing great. That is a lie. I am doing okay.','Please be gentle with the potato.','I can see all of you. I have eyes everywhere. Literally.'],
  qa:[['are you a fry?','I am a whole potato. Fries are a different chapter of life.'],['what is your biggest fear?','Peelers. And phone calls. Mostly phone calls.'],['do you have friends?','Yes! The onion. He makes everyone cry though.'],["what's your skincare routine?",'Dirt. Lots of dirt.'],['mashed or baked?','That is a horrible question and I will think about it forever.'],['favorite movie?','Anything without a kitchen in it.'],['what is your dream?','To retire on a quiet farm. A real one. Not the upstate one.'],['do you ever sleep?','I have eyes all over my body. I never stop watching.'],['how old are you?','Two weeks. Which is ancient. For a potato.'],['can you sing?','Only when nobody is watching. So never. Nine thousand people are watching.'],['do you know kevin the chicken?','We do not talk about Kevin.'],['are you single?','I am a potato. I am a whole meal. I am fine.']],
  replies:['That is a great question. I am too scared to answer it.','Okay that one made me sweat. Starch. I sweat starch.','I will think about that forever. Thank you. I hate it.'],
  thx:'{u}... thank you. I am going to cry. Starchy tears.',
  chat:['protect the potato','ask him about fries lol',"he's sweating",'we love you potato','be nice chat','potato king']},
 {h:'frog_in_a_suit',a:'🐸',p:'🎤',type:'sing',cat:'Music',mus:'piano',bg:'linear-gradient(165deg,#a3163f,#2a0410)',t:'opera night. gift so he stops',goal:['frog stops singing',9999],
  vox:{p:150,fm:1.02,br:.06,sp:1},
  songs:[{n:'Ode to a Fly',l:['I loved a fly once','she flew too close','to my tongue','I miss her every day','she was delicious','RIBBIT']},{n:'The Pond Is Wet',l:['the pond','is very wet','wetter than you think','I have checked','many many times','WET']},{n:'Taxes, an Opera',l:['I owe the pond','three thousand flies','the tax heron comes','for my lily pad','I am going under','NOOO']},{n:'Kevin, a Tribute',l:['there once was a chicken','he wore a small hat','he went to a dinner','and that was that','we miss you Kevin','KEVIN']}],
  between:['Thank you, thank you. You are too kind. Roses accepted.','This next one is about my ex. She was a fly.','Do I hear an encore? I hear an encore.','I see you crying in the chat. Good.'],
  thx:'{u}! Bravo! Bravissimo!',
  chat:['ENCORE','my ears 😭','he hit the note','bravo frog','someone gift so he stops lmao','she was delicious 💀']},
 {h:'gm_overthinker',a:'🤓',p:'♟️',type:'chess',cat:'Chess',mus:'lofi',bg:'linear-gradient(165deg,#2c3b2f,#6f9353)',t:'speed chess vs a pigeon (rated 3000)',goal:['hire a pigeon coach',2000],
  idle:['I have studied four hundred openings for this.','He is thinking. Pigeons think, right?','Today is the day. Game forty one.','Do not distract me chat. I am calculating.'],
  move:['Okay. Sicilian defense. Classic. Elegant.','Knight to F3. Respectfully.','Pawn forward. Nothing fancy. Pure fundamentals.','Bishop out. Let us see him handle THAT.'],
  pig:['NO. He cannot just walk on the board!','That is NOT a legal move!','He knocked over my queen. MY QUEEN.','Is he... strutting? He is strutting.'],
  lose:['He declared victory. He is rated three thousand for a reason.','Pigeon wins. Again. That is forty in a row.','I need to rethink my whole life.'],
  win:['I WON?! First win in forty games!','The bread strategy works! Thank you chat!'],
  thx:'{u}, thank you for supporting real chess.',keys:{pigeon:'Do not say his name. He can hear you.',bread:'Throw bread! Send toast! It is our only hope!'},
  chat:['pigeon diff','the pigeon is cracked','not the queen 😭','pigeon is undefeated','bread strategy when','he ALWAYS struts']},
 {h:'reel_talk',a:'🧔',p:'🎣',type:'fish',cat:'Outdoors',mus:'ocean',bg:'linear-gradient(165deg,#ff9e5e,#2a7fb8)',t:'chill fishing. catching whatever',goal:['buy a bigger boat',3500],
  idle:['Nice and calm today. Just me and the water.','Fishing is ninety percent waiting and ten percent screaming.','Chat, if I catch the goblin again I am moving.','Smell that air. That is lake.','My dad taught me to fish. He also caught the goblin once.'],
  bite:['Oh! Something is biting!','Here we go, here we go!','Big one. Big one!'],
  react:{common:['Ah. Well.','Classic.','We keep it moving.'],rare:['Ooh, nice!','Look at that!'],epic:['WHAT?! CHAT!','No way. NO WAY.'],legendary:['CHAT. CHAT. CHAT!!','I am never fishing again. I am fishing forever.']},
  thx:'{u}, appreciate you. Tight lines.',keys:{goblin:'Do not summon him.',shark:'We are gonna need a bigger stream.'},
  chat:['W catch','release him',"that's a boot lol",'LEGENDARY??','so relaxing','send golden bait']},
 {h:'scaredy_streamer',a:'😰',p:'🔦',type:'horror',cat:'Gaming',mus:'tense',bg:'linear-gradient(165deg,#1b1624,#4a0f1c)',t:'scariest game ever, lights off',goal:['turn the lights on',1500],
  idle:['Okay. Okay. We are fine. Totally fine.','Why is it so quiet. I do not like quiet.','Chat, tell me if you see anything. Actually do not.','That door was closed before. Was it closed before?','I am not scared. My voice is just like this.'],
  scare:['NOPE NOPE NOPE NOPE','WHY WOULD THEY DO THAT','I AM FINE! I AM FINE!','AAAAAAAAA'],
  after:['That was planned. I planned that.','My heart is in my shoes now.','Chat, I need a minute. A big minute.'],
  small:'{u} thank you... please do not send the big ones.',keys:{behind:'Do NOT say behind you. Do not.',boo:'Not funny. Very not funny.'},
  chat:['behind you','LMAOOO his scream',"don't open the door","i'm scared and i'm not even playing",'turn on the lights bro','he jumped so high']},
 {h:'professor_hoot',a:'🦉',p:'❓',type:'trivia',cat:'Game show',mus:'news',bg:'linear-gradient(165deg,#ffb703,#fb5607)',t:'TRIVIA NIGHT: answer for real coins',goal:['bigger prize pool',6000],
  vox:{p:130,fm:.97,br:.18,sp:.95},
  idle:['Welcome back, students. Brains ready?','Remember: there are no stupid answers. There are wrong ones.','The leaderboard is watching you.'],
  qs:[['How many hearts does an octopus have?',['1','3','8'],1,'Three! One for each ex.'],['What is the only food that never spoils?',['Honey','Bread','Cheese'],0,'Honey! Found in tombs. Still delicious.'],['A group of crows is called a...',['Party','Murder','Committee'],1,'A murder. Dark. I love it.'],['Bananas are technically...',['Berries','Herbs','Vegetables'],0,'Berries! Strawberries are not. Science is a liar.'],['How many bones does a shark have?',['0','206','50'],0,'Zero! All cartilage. All drama.'],['Wombat poop is shaped like...',['Stars','Cubes','Spirals'],1,'Cubes! Nature is a dice game.'],['Which animal sleeps standing up?',['Horse','Dog','Owl'],0,'Horses! Very rude to lie down.'],['Sharks are older than...',['Trees','Grass','Both'],2,'Both! Sharks were here before trees. Respect.'],['Cleopatra lived closer in time to...',['The pyramids being built','The moon landing','Neither'],1,'The moon landing! History is wild.'],['How long does a goldfish remember things?',['3 seconds','Months','1 minute'],1,'Months! Kevin the fish just chooses to forget.'],['A baby kangaroo is called a...',['Pup','Kit','Joey'],2,'Joey!'],['Which planet has the most known moons?',['Jupiter','Saturn','Mars'],1,'Saturn! It collects moons like I collect regrets.']],
  thx:'{u}, the prize pool thanks you.',
  chat:['i knew that','CUBES???','who answered 206','ez','professor is so wise','i guessed lol']},
 {h:'the_bear_truth',a:'🐻',a2:'🦝',p:'🎙️',type:'podcast',cat:'Podcast',mus:'lofi',bg:'linear-gradient(165deg,#5b3a2a,#1c120c)',t:'BIG DEBATES with Bear and Racc',goal:['buy real microphones',3000],
  name1:'Bear',name2:'Racc',vox:{p:100,fm:.9,br:.12,sp:.95},vox2:{p:310,fm:1.2,br:.09,sp:1.15},
  topics:[
   {q:'Is a hot dog a sandwich?',a:['Yes, sandwich','No, its own thing'],l:[[1,'Okay. Hot dog. Sandwich. Discuss.'],[2,'It is bread. With a thing in it. Sandwich.'],[1,'By that logic a taco is a sandwich.'],[2,'A taco IS a sandwich. Wake up.'],[1,'Then soup is a cereal.'],[2,'Do not bring soup into this.'],[1,'Chat, settle it. Vote now.']]},
   {q:'Could you beat 100 ducks in a fight?',a:['Yes, easily','No, never'],l:[[2,'One hundred ducks. Me. A fair fight.'],[1,'You would lose to ten ducks.'],[2,'I have hands. Ducks do not have hands.'],[1,'They have numbers. And no fear.'],[2,'I would simply bring bread.'],[1,'Then you are feeding them. You lose with extra steps.'],[2,'Chat, vote. Am I winning?']]},
   {q:'Is cereal soup?',a:['Yes, it is soup','No, it is cereal'],l:[[1,'Cereal. In milk. In a bowl. Eaten with a spoon.'],[2,'That is a soup. That is just a cold soup.'],[1,'Soup is savory.'],[2,'Name one rule that says soup is savory.'],[1,'...every chef alive?'],[2,'Chefs are biased. They sell soup.'],[1,'Vote, chat. Save us.']]},
   {q:'Do fish know they are wet?',a:['Yes they know','No, they have no idea'],l:[[2,'Fish. Are they aware. Of the wet.'],[1,'They have never been dry. So no.'],[2,'So you are saying they are living a lie.'],[1,'I am saying I need a new co-host.'],[2,'I think they know. I think they are just being polite.'],[1,'Chat. Vote. Please. I am begging.']]},
   {q:'Is Kevin the chicken still alive?',a:['Kevin lives','Kevin is gone'],l:[[1,'We have to talk about Kevin.'],[2,'He went to the company dinner.'],[1,'And he never came back.'],[2,'He looked happy though. In the last photo.'],[1,'That was not a photo of him. That was a photo of a plate.'],[2,'...oh.'],[1,'Vote. For Kevin.']]}
  ],
  thx:'{u}, thank you! Bear, read that name! Bear!',
  chat:['RACC IS SO WRONG','bear is so calm','this podcast is unhinged','HOT DOG IS A TACO','team racc','team bear']},
 {h:'dj_eight_arms',a:'🐙',p:'🎛️',type:'dj',cat:'Music',mus:'club',bg:'linear-gradient(165deg,#00f5d4,#7209b7)',t:'8 arms. 8 decks. no breaks.',goal:['BIGGEST DROP EVER',8000],
  vox:{p:200,fm:1.1,br:.1,sp:1.1},
  idle:['MAKE SOME NOISE, CHAT!','Hands up! All eight of them!','This one is for the night owls.','Who is still awake? Everyone? Good.','Turn it up! Turn it UP!'],
  hype:['Here it comes...','Are you ready?','Three... two... one...'],
  drop:['DROOOOP!','LET IT GO!','THERE IT IS!'],
  thx:'{u}! That gift just bought you a drop!',keys:{song:'Request received! Playing it next. Probably.',drop:'You want a drop? You got a drop!'},
  chat:['🔊🔊🔊','DROP IT','this goes hard','my neighbors are calling the police','8 arms is unfair','🪩🪩🪩']},
 {h:'turbo_turtle',a:'🐢',p:'🏎️',type:'kart',cat:'Gaming',mus:'chip',bg:'linear-gradient(165deg,#06d6a0,#118ab2)',t:'ranked kart racing (I am a turtle)',goal:['new kart',4000],
  idle:['Okay, ranked race. Focus, turtle.','Slow and steady wins the race. That is a lie. Fast wins.','Banana on the left. Do not touch the banana.'],
  first:['I AM IN FIRST! CHAT!','Nobody can catch me!'],
  passed:['Who passed me? WHO?','Rude! Very rude!','He bumped me! Report him!'],
  banana:['BANANA! WHO PUT THAT THERE?','I spun out! I spun out!'],
  win:['FIRST PLACE! The turtle WINS!','Slow and steady my shell!'],
  lose:['Sixth place. Again. It is fine.','The kart is broken. That is the only explanation.'],
  thx:'{u}, thank you for the speed!',keys:{fast:'I AM going fast! This is turtle fast!',banana:'Do not say banana. It hurts.'},
  chat:['GO TURTLE GO','banana diff','he is so slow lol','first place!!','he spun again 😭','turbo mode']},
 {h:'coach_gains',a:'🦍',p:'💪',type:'workout',cat:'Fitness',mus:'club',bg:'linear-gradient(165deg,#ef233c,#2b2d42)',t:'100 pushups. chat counts. gifts add reps.',goal:['coach rests (never)',5000],
  vox:{p:95,fm:.88,br:.14,sp:1.05},
  idle:['Pain is just weakness leaving the body!','Chat, are you doing them with me? I can tell you are not.','Hydrate! Then do pushups!','Breathe in! Breathe out! Do not stop!'],
  done:['ONE HUNDRED! YEAH!','DONE! Who is next? You are next!'],
  thx:'{u}... THANK YOU. I HATE YOU. THANK YOU.',
  chat:['GO COACH','i am doing them with you (i am not)','he is a machine','my arms hurt watching this','LIGHT WEIGHT','💪💪💪']},
 {h:'crabby_canvas',a:'🦀',p:'🎨',type:'art',cat:'Art',mus:'lofi',bg:'linear-gradient(165deg,#8ecae6,#ffb703)',t:'painting your requests (sort of)',goal:['buy a real brush',2500],
  vox:{p:180,fm:1.05,br:.25,sp:.85},
  idle:['Every mountain needs a friend.','There are no mistakes. Only crab decisions.','Just a little more blue. Always more blue.','Let us take our time. We have nowhere to be.'],
  thx:'{u}, thank you, friend. This one is for you.',
  chat:['so relaxing','WHERE IS THE DRAGON','i see it!','frame it','10/10','crab bob']},
 {h:'parrot_news_live',a:'🦜',p:'📺',type:'news',cat:'News',mus:'news',bg:'linear-gradient(165deg,#023e8a,#0077b6)',t:'BREAKING NEWS 24/7 (all fake)',goal:['hire a second reporter',3000],
  vox:{p:240,fm:1.15,br:.08,sp:1.12},
  heads:[
   ['Local Goose Declares Park Its Kingdom',['A goose has taken over Central Pond.','He is honking with intent.','Residents are advised to bring bread as tribute.'],1],
   ['Man Says Five More Minutes, Wakes Up Two Hours Later',['Experts call it the snooze paradox.','He is resting his eyes again now.']],
   ['Scientists Confirm Cats Are Liquid',['A cat was poured into a vase.','The cat declined to comment.','The cat has now knocked over the vase.']],
   ['Pigeon Found Running City Council For 12 Years',['Nobody noticed.','Approval ratings are excellent.','He has proposed more bread.'],1],
   ['Socks Leave Dryer Willingly, Report Finds',['They were never lost.','One sock sent a postcard from Spain.']],
   ['Local Volcano Erupts Chocolate, Named Kevin',['Villagers are thrilled.','Dentists are concerned.'],1],
   ['Robot Uprising Cancelled Over Wifi Password',['The password was on the router.','Humanity is safe. For now.']],
   ['Frog Elected King After Pulling Sword From Rock',['He says the rock is warm.','He refuses to leave the rock.']],
   ['Spider Purchases House From Fleeing Owner',['The deal closed in record time.','The spider has painted the bathroom.'],1],
   ['Duck Army Spotted Near Park, 38 Strong',['Do not feed them.','I repeat. Do not feed them.']]
  ],
  thx:'{u}, thank you for supporting fake journalism.',
  chat:['BREAKING','this is the only news i trust','kevin again??','the field reporter 😭','repeat that','we need more pigeon news']}
];
LIVES.forEach(l=>{l.viewers=1800+hashStr(l.h)%84000;l.likes=20000+hashStr(l.h+'l')%2400000;l.vox=l.vox||voiceFor(l.a);l.raised=Math.floor(l.goal[1]*(.15+(hashStr(l.h)%50)/100))});
const LIVECHAT=['W stream','first time here, what is happening','LMAOOO','chat is this real','hi from my bathroom',"i'm supposed to be studying",'this is the content i pay wifi for','W','sending love 💖','🔥🔥🔥','goated','how did i get here','brb getting snacks','say hi to my mom','historic moment chat',"i can't leave this stream","who's watching from work 👀","we're so back",'😭😭😭','iconic'];
