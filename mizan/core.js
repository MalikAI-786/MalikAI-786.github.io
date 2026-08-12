(function(){
'use strict';

/* ==================================================================
   MĪZĀN — engine
   No dependencies, no network. Everything below runs locally.
   ================================================================== */

var KEY='mizan.v1';
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var pad=function(n){return String(n).padStart(2,'0')};
function iso(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function parseISO(s){var p=s.split('-');return new Date(+p[0],+p[1]-1,+p[2])}
function addDays(s,n){var d=parseISO(s);d.setDate(d.getDate()+n);return iso(d)}
function dayDiff(a,b){return Math.round((parseISO(b).getTime()-parseISO(a).getTime())/864e5)}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){
  return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function median(a){if(!a.length)return 0;var s=a.slice().sort(function(x,y){return x-y});
  var m=Math.floor(s.length/2);return s.length%2?s[m]:(s[m-1]+s[m])/2}
function mean(a){return a.length? a.reduce(function(x,y){return x+y},0)/a.length : 0}
function hm(h){if(h==null||isNaN(h))return '—';var t=Math.round(h*60);t=((t%1440)+1440)%1440;
  return pad(Math.floor(t/60))+':'+pad(t%60)}

/* ---------------- measures ---------------- */
var MEASURES=[
 {id:'salah',name:'Ṣalāh',ar:'ٱلصَّلَاة',sub:'the spine',fac:'yaqin',auto:true,
  cite:'Q 4:103 · 20:14',
  why:'The only measure on this sheet with an <b>external clock</b>. Every other one can be quietly renegotiated at eleven at night; this one has already passed or it has not. That is why it carries the heaviest weight — not piety, <b>auditability</b>.',
  rubric:['nothing, or one','two or three','four, or five with slippage','all five, each inside its window']},
 {id:'dhikr',name:'Dhikr &amp; Qur’ān',ar:'ٱلذِّكْر',sub:'the ground',fac:'yaqin',
  cite:'Q 13:28 · 33:41 · 73:6',
  why:'A fixed daily portion — a <em>wird</em> — however small, held on the days you do not feel like it. <b>Small and unbroken beats large and occasional</b>; the point is that the ground stays under you, not that today was moving.',
  rubric:['none','under five minutes, distracted','five to fifteen, attentive','the fixed portion kept, whatever the day did']},
 {id:'amal',name:'ʿAmal',ar:'ٱلْعَمَل',sub:'ceaseless action',fac:'amal',auto:true,
  cite:'Q 53:39 · 94:7 · 62:10',
  why:'Counted, not felt. Each completed sprint scores one, capped at three; moving the One Thing adds one. <b>This score cannot be talked up at the end of the day</b> — it is a tally of blocks that actually ran.',
  rubric:['no focused block ran','one block','two blocks','three blocks, or two and the One Thing moved']},
 {id:'zabt',name:'Ẓabt-e-nafs',ar:'ضَبْطُ ٱلنَّفْس',sub:'restraint',fac:'ishq',
  cite:'Q 79:40–41 · 7:31 · 25:67',
  why:'Not abstinence — <b>restraint under load</b>. Holding a line on a quiet Sunday is not evidence of anything. Holding it on the evening the chapter would not come is the whole test, and naming the trigger is what turns it into data.',
  rubric:['commitment broken, unexamined','broken, but the trigger was named honestly','held, with no real pressure on it','held under genuine pressure, trigger named']},
 {id:'attn',name:'Ḥifẓ al-intibāh',ar:'ٱللَّغْو',sub:'the laghw filter',fac:'amal',
  cite:'Q 23:3 · 17:36',
  why:'Where the first hour of the day went, and where the phone was during work. <b>The first hour sets the register for the other fifteen</b> — a feed before Fajr does not cost you ten minutes, it costs you the whole morning’s depth.',
  rubric:['the feed had the first hour','fragmented; phone within reach all day','sprints were protected','first hour protected and phone out of the room']},
 {id:'body',name:'Badan',ar:'ٱلْبَدَن',sub:'the mount',fac:'amal',auto:true,
  cite:'Q 2:247 · Ṣaḥīḥ al-Bukhārī — "your body has a right over you"',
  why:'Computed from four inputs in the <a href="#badan">Badan</a> module: slept to target, moved, protein floor, eating discipline. <b>Not wellness garnish — an input to every other measure.</b> A short night reproduces, by lunchtime, every symptom you are otherwise trying to manage, and then gets blamed on character.',
  rubric:['none of the four','one of the four','two of the four','three or four of: slept · moved · protein · window held']},
 {id:'ihsan',name:'Iḥsān',ar:'ٱلْإِحْسَان',sub:'toward people',fac:'ishq',
  cite:'Q 55:60 · 4:36 · 2:177',
  why:'One concrete act toward a specific person, named. <b>Not a disposition — a transaction with a date on it.</b> This is the measure that stops the whole exercise from curdling into a very well-instrumented self-absorption.',
  rubric:['nothing','passive kindness — you were pleasant','one deliberate act, named','an act that cost you time, money or ego']}
];
var MI={}; MEASURES.forEach(function(m){MI[m.id]=m});
var DEFW={salah:22,amal:18,zabt:16,dhikr:14,attn:12,body:10,ihsan:8};
var FACULTY={yaqin:['salah','dhikr'],amal:['amal','attn','body'],ishq:['zabt','ihsan']};
var FACNAME={yaqin:'Yaqīn · conviction',amal:'ʿAmal · action',ishq:'ʿIshq · love'};
var PRAYERS=[{id:'fajr',n:'Fajr'},{id:'dhuhr',n:'Ẓuhr'},{id:'asr',n:'ʿAṣr'},
             {id:'maghrib',n:'Maghrib'},{id:'isha',n:'ʿIshāʾ'}];
var TRIGGERS=[['avoidance','avoiding a hard task'],['winddown','wind-down / decompress'],
  ['boredom','boredom'],['anxiety','anxiety'],['sleep','to get to sleep'],
  ['social','social'],['celebration','celebration'],['pain','pain / physical'],['cue','habit cue — no reason']];
var DISPLACED=[['sleep','sleep quality'],['work','the work'],['family','family / presence'],
  ['salah','a prayer'],['exercise','movement'],['nothing','nothing — the day was done']];
var SETTINGS_LIST=[['alone','alone'],['partner','with someone'],['group','group']];
var FRICTION=['Phone in another room during every sprint',
  'Feeds logged out / blocked on the work machine',
  'No screen before wuḍūʾ and Fajr',
  'Tomorrow’s One Thing written before bed',
  'Work surface cleared to a single object'];
var PHASES=[
 {n:1,d:'Days 1–10',t:'Iṭāʿat',ar:'إِطَاعَة',s:'Form. Baseline.',
  ms:['salah','body','amal'],
  li:['Score only three measures. Ignore the rest — they are switched off.',
      'Log the ledger honestly and <b>change nothing about it</b>. This is the walkthrough, not the remediation.',
      'Fixed sleep window and a fixed wake time, seven days a week.',
      'One Thing written the night before, every night.']},
 {n:2,d:'Days 11–20',t:'Ẓabt-e-nafs',ar:'ضَبْطُ ٱلنَّفْس',s:'One tightening.',
  ms:['salah','body','amal','zabt','attn'],
  li:['Restraint and attention switch on.',
      '<b>Nothing before the day’s ʿamal is done.</b> Not "less" — <em>after</em>. Reorder it.',
      'Every urge goes through Delay &amp; Decide. No exceptions, including the ones you win easily.',
      'Phone leaves the room for sprints. This is the week that decides the other thirty days.']},
 {n:3,d:'Days 21–30',t:'ʿIshq',ar:'عِشْق',s:'Put something in.',
  ms:['salah','body','amal','zabt','attn','dhikr','ihsan'],
  li:['Dhikr and iḥsān switch on — the full seven.',
      'A night portion, however short. <em>Nāshi’at al-layl</em> — 73:6.',
      'One deliberate act toward a specific person, daily, logged.',
      'Restraint alone goes brittle by now. This phase is the fuel, not the decoration.']},
 {n:4,d:'Days 31–40',t:'Niyābat',ar:'نِيَابَة',s:'Ship.',
  ms:['salah','body','amal','zabt','attn','dhikr','ihsan'],
  li:['All seven, plus one external requirement: <b>something leaves your hands each week.</b>',
      'A chapter section, a lecture built, a tool published, a comment letter filed.',
      'Vicegerency is being trusted with something — it is measured in output, not in mood.',
      'At day 40, re-baseline and run it again with the targets raised.']}
];

/* ---------------- state ---------------- */
var S=null;
function blankDay(k){return {date:k,forecast:null,prayers:{},dhikrMin:0,sprints:0,
  oneThing:'',oneThingDone:false,scores:{},weed:{sessions:[],clean:false,fog:0},
  gym:{},food:{},weight:null,sleepHrs:null,moved:false,
  friction:[false,false,false,false,false],hyper:'',
  muhasaba:{shukr:'',khata:'',kal:''},closed:false,synthetic:false}}
function defaults(){return {v:1,settings:{lat:40.7357,lng:-74.1724,method:'ISNA',asr:1,
  path:'taper',start:iso(new Date()),cap:2,floorHour:20,weights:Object.assign({},DEFW),
  gymDays:[0,2,4,6],gymHour:17,partner:'Shahzaib',proteinTarget:150,sleepTarget:7},
  days:{},urges:[],ships:{},measures:[],best50:{}}}
function load(){
  try{var raw=localStorage.getItem(KEY); S=raw?JSON.parse(raw):defaults();}
  catch(e){S=defaults()}
  var d=defaults(); S.settings=Object.assign({},d.settings,S.settings||{});
  S.settings.weights=Object.assign({},DEFW,S.settings.weights||{});
  S.days=S.days||{}; S.urges=S.urges||[]; S.ships=S.ships||{};
  S.measures=S.measures||[]; S.best50=S.best50||{};
  if(!Array.isArray(S.settings.gymDays)) S.settings.gymDays=[0,2,4,6];
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){
  console.warn('storage full',e)}}
function day(k){ if(!S.days[k]) S.days[k]=blankDay(k);
  var d=S.days[k]; d.weed=d.weed||{sessions:[],clean:false,fog:0};
  d.weed.sessions=d.weed.sessions||[]; d.scores=d.scores||{}; d.prayers=d.prayers||{};
  d.muhasaba=d.muhasaba||{shukr:'',khata:'',kal:''};
  d.gym=d.gym||{}; d.food=d.food||{};
  if(!Array.isArray(d.friction)||d.friction.length!==5) d.friction=[false,false,false,false,false];
  return d}
function has(k){return Object.prototype.hasOwnProperty.call(S.days,k)}

var CUR=(function(){
  try{var v=sessionStorage.getItem('mizan.cur');
    if(v&&/^\d{4}-\d{2}-\d{2}$/.test(v)) return v}catch(e){}
  return iso(new Date());
})();
function setCur(k){CUR=k; try{sessionStorage.setItem('mizan.cur',k)}catch(e){}}

/* ---------------- prayer times ---------------- */
var DEG=Math.PI/180;
function sind(d){return Math.sin(d*DEG)} function cosd(d){return Math.cos(d*DEG)}
function tand(d){return Math.tan(d*DEG)}
function asind(x){return Math.asin(x)/DEG} function acosd(x){return Math.acos(x)/DEG}
function atan2d(y,x){return Math.atan2(y,x)/DEG} function acotd(x){return Math.atan(1/x)/DEG}
function fix(a,b){a=a-b*Math.floor(a/b);return a<0?a+b:a}
function fixh(a){return fix(a,24)}
function julian(y,m,d){ if(m<=2){y-=1;m+=12}
  var A=Math.floor(y/100), B=2-A+Math.floor(A/4);
  return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+B-1524.5}
function sunPos(jd){
  var D=jd-2451545.0;
  var g=fix(357.529+0.98560028*D,360);
  var q=fix(280.459+0.98564736*D,360);
  var L=fix(q+1.915*sind(g)+0.020*sind(2*g),360);
  var e=23.439-0.00000036*D;
  var RA=fixh(atan2d(cosd(e)*sind(L),cosd(L))/15);
  return {decl:asind(sind(e)*sind(L)), eqt:q/15-RA};
}
var METHODS={ISNA:{fajr:15,isha:15},MWL:{fajr:18,isha:17},EGYPT:{fajr:19.5,isha:17.5},
  KARACHI:{fajr:18,isha:18},MAKKAH:{fajr:18.5,isha:null,ishaMin:90}};
function prayerTimes(dateObj){
  var st=S.settings, lat=+st.lat, lng=+st.lng, meth=METHODS[st.method]||METHODS.ISNA;
  var asrF=+st.asr||1;
  var tz=-dateObj.getTimezoneOffset()/60;
  var jd=julian(dateObj.getFullYear(),dateObj.getMonth()+1,dateObj.getDate())-lng/15/24;
  function midDay(t){return fixh(12-sunPos(jd+t/24).eqt)}
  function angleTime(angle,t,ccw){
    var decl=sunPos(jd+t/24).decl;
    var c=(-sind(angle)-sind(decl)*sind(lat))/(cosd(decl)*cosd(lat));
    if(c>1||c<-1) return NaN;
    var T=acosd(c)/15; return midDay(t)+(ccw?-T:T);
  }
  function asrTime(t){
    var decl=sunPos(jd+t/24).decl;
    var angle=-acotd(asrF+tand(Math.abs(lat-decl)));
    return angleTime(angle,t,false);
  }
  var t={fajr:5,sunrise:6,dhuhr:12,asr:13,maghrib:18,isha:19};
  for(var i=0;i<3;i++){
    t={ fajr:angleTime(meth.fajr,t.fajr,true),
        sunrise:angleTime(0.833,t.sunrise,true),
        dhuhr:midDay(t.dhuhr)+2/60,
        asr:asrTime(t.asr),
        maghrib:angleTime(0.833,t.maghrib,false),
        isha: meth.isha!=null? angleTime(meth.isha,t.isha,false) : angleTime(0.833,t.maghrib,false)+meth.ishaMin/60 };
  }
  var adj=tz-lng/15, out={};
  Object.keys(t).forEach(function(k){out[k]=isNaN(t[k])?NaN:t[k]+adj});
  return out;
}
function windows(pt){
  return {fajr:[pt.fajr,pt.sunrise],dhuhr:[pt.dhuhr,pt.asr],asr:[pt.asr,pt.maghrib],
          maghrib:[pt.maghrib,pt.isha],isha:[pt.isha,Math.min(24,pt.fajr+24)]};
}
function windowOf(pt,h){
  var w=windows(pt),k;
  for(k in w){ if(!w.hasOwnProperty(k))continue;
    var a=w[k][0],b=w[k][1];
    if(k==='isha'){ if(h>=a||h<pt.fajr) return 'isha'; }
    else if(h>=a&&h<b) return k; }
  return null;
}

/* ---------------- scoring ---------------- */
function salahScore(d){
  var v={'in':1,'late':0.5,'miss':0},s=0;
  PRAYERS.forEach(function(p){var st=d.prayers[p.id]; if(st) s+=v[st]||0});
  return s>=5?3:s>=4?2:s>=2.5?1:0;
}
function amalScore(d){
  var s=Math.min(+d.sprints||0,3);
  if(d.oneThingDone) s=Math.min(3,s+1);
  return s;
}
function scoreOf(d,id){
  if(id==='salah') return salahScore(d);
  if(id==='amal') return amalScore(d);
  if(id==='body') return badanScore(d);
  var v=d.scores[id]; return v==null?null:+v;
}
function phaseFor(k){
  var n=dayDiff(S.settings.start,k)+1;
  if(n<1) return null;
  if(n<=10) return PHASES[0]; if(n<=20) return PHASES[1];
  if(n<=30) return PHASES[2]; if(n<=40) return PHASES[3];
  return PHASES[3];
}
function activeMeasures(k){
  var p=phaseFor(k);
  return p? p.ms : MEASURES.map(function(m){return m.id});
}
function indexOf(k){
  var d=S.days[k]; if(!d) return null;
  var act=activeMeasures(k),W=S.settings.weights,tot=0,got=0,any=false;
  act.forEach(function(id){
    var s=scoreOf(d,id); var w=+W[id]||0;
    if(s==null) return; any=true; tot+=w; got+=(s/3)*w;
  });
  if(!any||tot===0) return null;
  return Math.round(got/tot*100);
}
function facultyScore(k){
  var d=S.days[k]; if(!d) return {};
  var W=S.settings.weights,out={},act=activeMeasures(k);
  Object.keys(FACULTY).forEach(function(f){
    var tot=0,got=0,any=false;
    FACULTY[f].forEach(function(id){
      if(act.indexOf(id)<0) return;
      var s=scoreOf(d,id); if(s==null) return; any=true;
      tot+=+W[id]||0; got+=(s/3)*(+W[id]||0);
    });
    out[f]=any&&tot?Math.round(got/tot*100):null;
  });
  return out;
}
function recentKeys(n,endK){
  var end=endK||todayK(),out=[];
  for(var i=n-1;i>=0;i--) out.push(addDays(end,-i));
  return out;
}
function todayK(){return iso(new Date())}

/* ---------------- ladder ---------------- */
function ladderEval(){
  var ks=recentKeys(14),days=ks.map(function(k){return S.days[k]}).filter(Boolean);
  var idx=ks.map(indexOf).filter(function(v){return v!=null});
  var med=median(idx);
  var closed=days.filter(function(d){return d.closed}).length;
  function cnt(id,thr){return ks.filter(function(k){var d=S.days[k];
    if(!d)return false; var s=scoreOf(d,id); return s!=null&&s>=thr}).length}
  var logged=days.length;
  var cleanDays=days.filter(function(d){return !d.weed.sessions.length}).length;
  var cleanRatio=logged? cleanDays/logged : 0;
  var medAll=MEASURES.every(function(m){
    var v=ks.map(function(k){var d=S.days[k];return d?scoreOf(d,m.id):null})
            .filter(function(x){return x!=null});
    return v.length>=7 && median(v)>=2;
  });
  var g1=[['≥7 of 14 days closed',closed>=7,closed+'/14'],
          ['14-day median index ≥ 40',med>=40,Math.round(med)],
          ['Ṣalāh ≥ 2 on ≥ 9 days',cnt('salah',2)>=9,cnt('salah',2)+'/14']];
  var g2=[['14-day median index ≥ 60',med>=60,Math.round(med)],
          ['Ẓabt ≥ 2 on ≥ 10 days',cnt('zabt',2)>=10,cnt('zabt',2)+'/14'],
          ['Clean-day ratio ≥ 60%',cleanRatio>=0.6,Math.round(cleanRatio*100)+'%']];
  var g3=[['14-day median index ≥ 78',med>=78,Math.round(med)],
          ['≥12 of 14 days closed',closed>=12,closed+'/14'],
          ['Iḥsān ≥ 2 on ≥ 10 days',cnt('ihsan',2)>=10,cnt('ihsan',2)+'/14'],
          ['Every measure median ≥ 2',medAll,medAll?'yes':'no']];
  var p1=g1.every(function(g){return g[1]});
  var p2=p1&&g2.every(function(g){return g[1]});
  var p3=p2&&g3.every(function(g){return g[1]});
  return {stage:p3?3:p2?2:p1?1:0,gates:[g1,g2,g3],med:med,closed:closed};
}
var STAGES=[
 {n:0,t:'Bekhudī',ar:'بے خودی',s:'drift',d:'Not a moral verdict — a measurement state. The instrument does not yet have enough evidence, or the evidence says the line is not holding. Everyone starts here, including after a good month.'},
 {n:1,t:'Iṭāʿat',ar:'إِطَاعَة',s:'obedience to the law',d:'Iqbal’s first stage. Form is installed and holds without negotiation. He uses the camel: enduring, patient, going where it is pointed. Not yet free — but load-bearing, which is the prerequisite for everything after.'},
 {n:2,t:'Ẓabt-e-nafs',ar:'ضَبْطُ ٱلنَّفْس',s:'self-control',d:'The self now argues with itself and wins more often than it loses. This is the stage the Qur’an swears by — <em>an-nafs al-lawwāmah</em>. The internal argument is the sound of it working, not of it failing.'},
 {n:3,t:'Niyābat-e-Ilāhī',ar:'نِيَابَتِ إِلٰہی',s:'vicegerency',d:'The self strong enough to be entrusted. Iqbal’s <em>mard-e-mo’min</em> — not a mystic in retreat but a maker: creative, responsible, world-facing. Measured in what leaves your hands.'}
];

/* ---------------- ledger analytics ---------------- */
function realDays(){return Object.keys(S.days).filter(function(k){return !S.days[k].synthetic})}
function ledger(n){
  var ks=recentKeys(n||30),sess=[],logged=0,clean=0,cleanStreak=0,best=0,run=0;
  ks.forEach(function(k){
    var d=S.days[k]; if(!d) return;
    var used=d.weed.sessions.length>0;
    if(used||d.weed.clean||d.closed){logged++; if(!used) clean++;}
    d.weed.sessions.forEach(function(s){sess.push(Object.assign({date:k},s))});
  });
  var all=Object.keys(S.days).sort();
  all.forEach(function(k){
    var d=S.days[k]; if(d.synthetic) return;
    if(d.weed.sessions.length){run=0} else if(d.weed.clean||d.closed){run++; if(run>best)best=run}
  });
  var k=todayK();
  while(true){ var d=S.days[k];
    if(!d||d.synthetic) break;
    if(d.weed.sessions.length) break;
    if(!(d.weed.clean||d.closed)) break;
    cleanStreak++; k=addDays(k,-1); }
  var byTrig={},byDisp={};
  sess.forEach(function(s){byTrig[s.trigger]=(byTrig[s.trigger]||0)+1;
    byDisp[s.displaced]=(byDisp[s.displaced]||0)+1});
  var avoid=sess.filter(function(s){return s.trigger==='avoidance'}).length;
  return {sessions:sess,logged:logged,clean:clean,streak:cleanStreak,best:best,
    byTrig:byTrig,byDisp:byDisp,avoidRatio:sess.length?avoid/sess.length:0,
    useRate:logged?(logged-clean)/logged:0};
}
function collisions(k){
  var d=S.days[k]; if(!d||!d.weed.sessions.length) return [];
  var pt=prayerTimes(parseISO(k)),out=[];
  d.weed.sessions.forEach(function(s){
    var h=timeToH(s.time); if(h==null) return;
    var w=windowOf(pt,h);
    if(w && d.prayers[w]!=='in') out.push({time:s.time,w:w});
  });
  return out;
}
function timeToH(t){ if(!t) return null; var p=String(t).split(':');
  if(p.length<2) return null; var h=+p[0]+(+p[1])/60; return isNaN(h)?null:h}

function guardrails(){
  var ks=recentKeys(14),ex=[],tests=[];
  var st=S.settings;
  var collideN=0,earlyN=0,consecN=0,capN=0,avoidN=0,fogN=0,sessN=0,aloneT=0;
  var weekCount={};
  ks.forEach(function(k,i){
    var d=S.days[k]; if(!d) return;
    var ss=d.weed.sessions; sessN+=ss.length;
    collideN+=collisions(k).length;
    var wk=weekKey(k); weekCount[wk]=(weekCount[wk]||0)+ss.length;
    var aScore=amalScore(d);
    ss.forEach(function(s){
      var h=timeToH(s.time);
      if((h!=null && h<st.floorHour) || aScore<2) earlyN++;
      if(s.trigger==='avoidance') avoidN++;
      if(s.setting==='alone') aloneT++;
    });
    var prev=S.days[addDays(k,-1)];
    if(ss.length && prev && prev.weed.sessions.length) consecN++;
    if(ss.length && (+d.weed.fog||0)>=2) fogN++;
  });
  Object.keys(weekCount).forEach(function(w){if(weekCount[w]>st.cap) capN++});
  tests=[
   ['No session inside a prayer window before that prayer is made (4:43)',collideN],
   ['Not before hour '+st.floorHour+':00, and not on a day the ʿamal did not happen',earlyN],
   ['Never as an escape from a hard task',avoidN],
   ['Never two days running',consecN],
   ['Weekly cap of '+st.cap+' sessions',capN],
   ['Sleep protected — no session followed by fog ≥ 2',fogN]
  ];
  var total=tests.reduce(function(a,t){return a+t[1]},0);
  return {tests:tests,exceptions:total,sessions:sessN,alone:sessN?aloneT/sessN:0};
}
function weekKey(k){ var d=parseISO(k); var day=(d.getDay()+6)%7;
  d.setDate(d.getDate()-day); return iso(d)}
function taper(){
  var st=S.settings, start=st.start;
  var n=dayDiff(start,todayK());
  var wk=Math.floor(n/7)+1;
  var base=0;
  for(var i=0;i<7;i++){var d=S.days[addDays(start,i)]; if(d) base+=d.weed.sessions.length}
  if(base===0){ var l=ledger(14); base=Math.max(1,Math.round(l.sessions.length/2)) }
  var sched=[];
  for(var w=1;w<=8;w++){
    var a= w===1? base : Math.max(0,Math.round(base*(1-(w-1)/7)));
    if(w===8) a=0;
    sched.push(a);
  }
  var thisWeek=weekKey(todayK()),used=0;
  recentKeys(14).forEach(function(k){ if(weekKey(k)===thisWeek){var d=S.days[k];
    if(d) used+=d.weed.sessions.length} });
  var allow= wk>=1&&wk<=8? sched[wk-1] : 0;
  return {week:clamp(wk,1,9),sched:sched,base:base,allow:allow,used:used};
}

/* ==================================================================
   RENDER
   ================================================================== */
function donut(el,val){
  var r=36,c=2*Math.PI*r,v=val==null?0:clamp(val,0,100);
  var col=val==null?'var(--line2)':v>=80?'var(--good)':v>=65?'var(--accent)':v>=40?'var(--signal)':'var(--bad)';
  el.innerHTML='<circle cx="43" cy="43" r="'+r+'" fill="none" stroke="var(--line)" stroke-width="7"/>'+
   '<circle cx="43" cy="43" r="'+r+'" fill="none" stroke="'+col+'" stroke-width="7" stroke-linecap="round" '+
   'stroke-dasharray="'+(c*v/100).toFixed(1)+' '+c.toFixed(1)+'" transform="rotate(-90 43 43)"/>';
}

function renderToday(){
  if(!$('#todayTitle')) return;
  var d=day(CUR),dt=parseISO(CUR);
  $('#dayPicker').value=CUR;
  var n=dayDiff(S.settings.start,CUR)+1;
  $('#todayTitle').textContent = CUR===todayK()? 'Today’s sheet' : dt.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});
  var ph=phaseFor(CUR);
  $('#todayMeta').innerHTML = dt.toLocaleDateString(undefined,{weekday:'long',year:'numeric',month:'long',day:'numeric'})
    +(ph? ' · day '+n+' · phase '+ph.n+' — '+ph.t+' · '+ph.ms.length+' measures active':'');

  var idx=indexOf(CUR);
  $('#idxNum').textContent=idx==null?'—':idx;
  donut($('#dialSvg'),idx);
  var prev=indexOf(addDays(CUR,-1));
  $('#idxDelta').innerHTML = (idx!=null&&prev!=null)
    ? (idx-prev>=0?'▲ +':'▼ ')+(idx-prev)+' vs yesterday' : '';

  var f=facultyScore(CUR);
  $('#facultyRow').innerHTML=Object.keys(FACULTY).map(function(k){
    return '<div class="stat"><div class="k">'+FACNAME[k]+'</div><div class="v">'+
      (f[k]==null?'—':f[k])+'<small> / 100</small></div></div>'}).join('');

  var L=ladderEval();
  $('#stageNow').innerHTML=STAGES[L.stage].t+' <span class="tag">· stage '+L.stage+'</span>';
  $('#stageNote').textContent=STAGES[L.stage].s+' · 14-day median '+Math.round(L.med);

  $('#fcInput').value=d.forecast==null?'':d.forecast;
  $('#kvFc').textContent=d.forecast==null?'—':d.forecast;
  $('#kvAc').textContent=idx==null?'—':idx;
  $('#kvEr').innerHTML=(d.forecast!=null&&idx!=null)
    ? (function(){var e=idx-d.forecast;return '<span style="color:'+(Math.abs(e)<=7?'var(--good)':Math.abs(e)<=15?'var(--signal)':'var(--bad)')+'">'+(e>0?'+':'')+e+'</span>'})() : '—';

  $('#oneThing').value=d.oneThing||'';
  $('#oneThingDone').checked=!!d.oneThingDone;
  $('#mShukr').value=d.muhasaba.shukr||'';
  $('#mKhata').value=d.muhasaba.khata||'';
  $('#mKal').value=d.muhasaba.kal||'';
  $('#hyper').value=d.hyper||'';
  var cp=$('#closedPill');
  cp.textContent=d.closed?'closed':'open';
  cp.className='pill '+(d.closed?'good':'');
  $('#sprintCount').textContent=d.sprints||0;
  var s7=recentKeys(7).map(function(k){return S.days[k]?(S.days[k].sprints||0):null})
    .filter(function(x){return x!=null});
  $('#sprint7').textContent=s7.length?mean(s7).toFixed(1):'—';

}

function renderPrayers(d,dt){
  if(!$('#prayerGrid')) return;
  var pt=prayerTimes(dt),W=windows(pt);
  var now=new Date(),nowH=(CUR===todayK())? now.getHours()+now.getMinutes()/60 : null;
  var curW=nowH!=null? windowOf(pt,nowH):null;
  $('#spineMeta').textContent=S.settings.method+' · asr '+(S.settings.asr==2?'ḥanafī':'std')+
    ' · '+(+S.settings.lat).toFixed(3)+', '+(+S.settings.lng).toFixed(3);
  $('#prayerGrid').innerHTML=PRAYERS.map(function(p){
    var st=d.prayers[p.id];
    return '<div class="pcell'+(curW===p.id?' now':'')+'"><div class="pn">'+p.n+'</div>'+
      '<div class="pt">'+hm(pt[p.id])+'</div>'+
      '<div class="seg sm" data-prayer="'+p.id+'">'+
      ['in','late','miss'].map(function(v,i){
        return '<button data-v="'+v+'" class="'+(st===v?('on '+(v==='miss'?'s0':v==='late'?'s1':'')):'')+'">'+
          (v==='in'?'in':v==='late'?'late':'✕')+'</button>'}).join('')+
      '</div></div>'}).join('');

  // spine svg
  var X=function(h){return clamp(h,0,24)/24*1000};
  var g='';
  g+='<rect x="0" y="0" width="1000" height="96" fill="none"/>';
  for(var h=0;h<=24;h+=3){ g+='<line x1="'+X(h)+'" y1="0" x2="'+X(h)+'" y2="96" stroke="var(--line)" stroke-width="1"/>'+
    '<text x="'+(X(h)+4)+'" y="12" fill="var(--faint)" font-size="9" font-family="ui-monospace,monospace">'+pad(h)+'</text>'; }
  PRAYERS.forEach(function(p){
    var w=W[p.id],a=X(w[0]),b=X(Math.min(w[1],24));
    if(isNaN(a)||isNaN(b)||b<=a) return;
    var st=d.prayers[p.id];
    var fill=st==='in'?'rgba(69,170,180,.34)':st==='late'?'rgba(224,162,68,.30)':st==='miss'?'rgba(212,102,79,.28)':'rgba(120,140,160,.13)';
    g+='<rect x="'+a+'" y="20" width="'+(b-a)+'" height="30" fill="'+fill+'" stroke="var(--line2)" stroke-width=".5"/>';
    g+='<text x="'+(a+5)+'" y="39" fill="var(--muted)" font-size="10" font-family="ui-monospace,monospace">'+p.n+'</text>';
  });
  d.weed.sessions.forEach(function(s){
    var h=timeToH(s.time); if(h==null) return;
    g+='<rect x="'+(X(h)-2)+'" y="56" width="4" height="26" fill="var(--bad)"/>';
  });
  var sp=(d.sprints||0);
  for(var i=0;i<sp;i++){
    g+='<rect x="'+(X(9+i*1.2)-2)+'" y="56" width="4" height="14" fill="var(--gold)" opacity=".8"/>';
  }
  if(isGymDay(CUR)){
    var ga=X(+S.settings.gymHour), gb=X(+S.settings.gymHour+1.5);
    g+='<rect x="'+ga+'" y="52" width="'+(gb-ga)+'" height="7" fill="var(--good)" opacity=".8"/>';
    g+='<text x="'+(ga+4)+'" y="70" fill="var(--good)" font-size="9" font-family="ui-monospace,monospace">gym</text>';
  }
  if(nowH!=null){ g+='<line x1="'+X(nowH)+'" y1="14" x2="'+X(nowH)+'" y2="90" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="3 3"/>'; }
  $('#spineSvg').innerHTML=g;

  var col=collisions(CUR);
  $('#collisionWarn').innerHTML= col.length?
    '<div class="notice"><b>'+col.length+' collision'+(col.length>1?'s':'')+' with a prayer window.</b> '+
    col.map(function(c){return c.time+' fell inside '+c.w}).join('; ')+
    '. This is the 4:43 boundary — not a verdict, just the instrument showing you where the day’s spine and the ledger overlapped.</div>':'';
}

function renderMeasures(d){
  if(!$('#measureList')) return;
  var act=activeMeasures(CUR);
  $('#measureList').innerHTML=MEASURES.map(function(m){
    var on=act.indexOf(m.id)>=0;
    var s=scoreOf(d,m.id);
    var ctl;
    if(m.auto){
      ctl='<div style="text-align:right"><div class="mono" style="font-size:1.5rem;font-weight:600;color:'+
        (s>=2?'var(--accent)':'var(--muted)')+'">'+s+'<span style="font-size:.7rem;color:var(--faint)">/3</span></div>'+
        '<div class="tag">computed</div></div>';
    } else {
      ctl='<div class="seg" data-measure="'+m.id+'">'+[0,1,2,3].map(function(v){
        return '<button data-v="'+v+'" class="'+(s===v?('on '+(v===0?'s0':v===1?'s1':'')):'')+'">'+v+'</button>'}).join('')+'</div>';
    }
    return '<div class="measure" style="'+(on?'':'opacity:.38')+'">'+
      '<div><div class="name">'+m.name+' <span class="ar">'+m.ar+'</span>'+
      '<span class="tag">· '+m.sub+' · w'+(S.settings.weights[m.id])+
      (on?'':' · off this phase')+'</span></div>'+
      '<div class="why">'+m.why+'</div>'+
      '<div class="cite">'+m.cite+'</div>'+
      '<div class="rubric">'+m.rubric.map(function(r,i){
        return '<b>'+i+'</b> '+r}).join(' &nbsp;·&nbsp; ')+'</div></div>'+
      ctl+'</div>';
  }).join('');
  var dm=$('#dhikrMinWrap'); if(dm) dm.remove();
}

function renderFriction(d){
  if(!$('#frictionList')) return;
  $('#frictionList').innerHTML=FRICTION.map(function(f,i){
    return '<label class="chk"><input type="checkbox" data-fr="'+i+'"'+(d.friction[i]?' checked':'')+
      ' /><span>'+f+'</span></label>'}).join('');
}

function renderHyperLog(){
  if(!$('#hyperLog')) return;
  var ks=recentKeys(14).reverse().filter(function(k){return S.days[k]&&S.days[k].hyper});
  $('#hyperLog').innerHTML=ks.length? '<div class="tag" style="margin-bottom:6px">Recent</div>'+
    ks.slice(0,5).map(function(k){return '<div class="kv"><span class="k">'+k.slice(5)+'</span><span class="v" style="text-align:right;font-family:var(--display)">'+esc(S.days[k].hyper)+'</span></div>'}).join('')
    : '';
}

/* ---------------- ledger ui ---------------- */
function renderLedgerToday(d){
  if(!$('#pathPills')) return;
  $('#pathPills').innerHTML=
    '<button class="btn '+(S.settings.path==='taper'?'primary':'')+'" data-path="taper">Path A · taper to zero</button>'+
    '<button class="btn '+(S.settings.path==='guard'?'primary':'')+'" data-path="guard">Path B · guardrails</button>';

  $('#sessionList').innerHTML = d.weed.sessions.length
    ? '<table class="t"><tr><th>Time</th><th>Trigger</th><th>Setting</th><th>Displaced</th><th></th></tr>'+
      d.weed.sessions.map(function(s,i){
        return '<tr><td class="n">'+esc(s.time)+'</td><td>'+esc(lbl(TRIGGERS,s.trigger))+'</td>'+
        '<td>'+esc(lbl(SETTINGS_LIST,s.setting))+'</td><td>'+esc(lbl(DISPLACED,s.displaced))+'</td>'+
        '<td style="text-align:right"><button class="icon-btn" data-delsess="'+i+'">✕</button></td></tr>'}).join('')+
      '</table>'
    : (d.weed.clean? '<div class="pill good">clean day logged</div>'
       : '<div class="tiny">No entry yet for this day. An unlogged day is not a clean day — log one or the other.</div>');

  $('#fogSeg').innerHTML=[0,1,2,3].map(function(v){
    return '<button data-fog="'+v+'" class="'+((+d.weed.fog||0)===v?('on '+(v>=2?'s0':v===1?'s1':'')):'')+'">'+
      ['none','slight','heavy','wrote off the morning'][v]+'</button>'}).join('');

  var l=ledger(30);
  $('#weedStats').innerHTML=
    kv('Current clean streak',l.streak+' d')+
    kv('Best clean streak',l.best+' d')+
    kv('Days logged (30d)',l.logged)+
    kv('Use rate',l.logged?Math.round(l.useRate*100)+'%':'—')+
    kv('Sessions (30d)',l.sessions.length)+
    kv('Avoidance share',l.sessions.length?Math.round(l.avoidRatio*100)+'%':'—');

  var u=S.urges.length,passed=S.urges.filter(function(x){return x.outcome==='passed'}).length;
  $('#urgeN').textContent=u;
  $('#urgePct').textContent=u?Math.round(passed/u*100)+'%':'—';

  renderPathPanel();
  renderTriggerCharts(l);
}
function lbl(list,v){for(var i=0;i<list.length;i++){if(list[i][0]===v)return list[i][1]} return v||'—'}
function kv(k,v){return '<div class="kv"><span class="k">'+k+'</span><span class="v">'+v+'</span></div>'}

function renderPathPanel(){
  if(!$('#pathPanel')) return;
  var el=$('#pathPanel');
  if(S.settings.path==='taper'){
    var t=taper();
    el.innerHTML='<p class="eyebrow gold">Path A · tark — the staged withdrawal</p>'+
      '<p class="small" style="margin-top:0">Eight weeks, following the Qur’an’s own sequence: acknowledge, ring-fence, then remove. The allowance is derived from <b>your measured baseline</b> ('+t.base+' in the first week), not from a number someone else picked.</p>'+
      '<div class="grid g3" style="gap:10px;margin:12px 0">'+
      '<div class="stat"><div class="k">Week</div><div class="v">'+t.week+'<small> / 8</small></div></div>'+
      '<div class="stat"><div class="k">Allowance</div><div class="v">'+t.allow+'</div></div>'+
      '<div class="stat"><div class="k">Used this week</div><div class="v" style="color:'+(t.used>t.allow?'var(--bad)':'var(--good)')+'">'+t.used+'</div></div>'+
      '</div>'+
      '<div class="chartbox"><h4>Schedule</h4>'+
      '<table class="t"><tr><th>Week</th>'+t.sched.map(function(_,i){return '<th>'+(i+1)+'</th>'}).join('')+'</tr>'+
      '<tr><td class="n">allow</td>'+t.sched.map(function(a,i){
        return '<td class="n" style="'+(i+1===t.week?'color:var(--gold);font-weight:700':'')+'">'+a+'</td>'}).join('')+'</tr></table>'+
      '<div class="tiny" style="margin-top:10px"><b>Tightening rules, in order.</b> Wk 1–2: nothing changes but the log, and the hour floor moves to '+S.settings.floorHour+':00. Wk 3–4: never on a day the One Thing did not move — it stops being an escape. Wk 5–6: never alone. Wk 7: one session, named in advance, on a chosen day. Wk 8: none, and the evening it would have filled gets a replacement written down before the week starts. <b>Plan the replacement, or the slot will plan itself.</b></div></div>';
  } else {
    var g=guardrails();
    el.innerHTML='<p class="eyebrow gold">Path B · ḥudūd — control testing on your own rules</p>'+
      '<p class="small" style="margin-top:0">If zero is not where you are, then the honest alternative is not "less" — it is <b>bounded, and tested</b>. These are the boundaries; below is the exception report over 14 days, run exactly the way you would run it on someone else’s control environment.</p>'+
      '<table class="t" style="margin-top:12px"><tr><th>Control</th><th style="text-align:right">Exceptions</th></tr>'+
      g.tests.map(function(t){
        return '<tr><td>'+t[0]+'</td><td class="n" style="text-align:right;color:'+(t[1]?'var(--bad)':'var(--good)')+'">'+
          (t[1]||'—')+'</td></tr>'}).join('')+'</table>'+
      '<div class="notice '+(g.exceptions>3?'':'teal')+'" style="margin-top:12px">'+
      (g.exceptions===0? '<b>No exceptions in 14 days.</b> Path B is holding. Keep the re-evaluation date — a control that has never been stressed has not been tested, and quiet fortnights are exactly when the review gets skipped.'
        : g.exceptions<=3? '<b>'+g.exceptions+' exceptions in 14 days.</b> Within tolerance, but every one of them has a story. Read them; do not average them.'
        : '<b>'+g.exceptions+' exceptions in 14 days.</b> This is the finding. When a control fails this often, the conclusion is not "try harder to comply" — it is that the control is not designed for the risk. That is the case for Path A, made by your own data rather than by anybody’s lecture.')+
      '</div>'+
      (g.sessions&&g.alone>0.7? '<div class="tiny" style="margin-top:10px"><b>'+Math.round(g.alone*100)+'% of sessions were alone.</b> Solitary use is the pattern most closely tied to the escape function rather than the enjoyment one. If the stated aim is to actually enjoy it, that number is the first thing to move — and moving it costs nothing in restraint.</div>':'');
  }
}

function renderTriggerCharts(l){
  if(!$('#triggerChart')) return;
  function bars(el,obj,list,color){
    var tot=Object.keys(obj).reduce(function(a,k){return a+obj[k]},0);
    if(!tot){ el.innerHTML='<div class="tiny">No sessions logged in the last 30 days.</div>'; return }
    el.innerHTML=list.map(function(p){
      var v=obj[p[0]]||0,pct=v/tot*100;
      if(!v) return '';
      var c=(p[0]==='avoidance'||p[0]==='sleep')?'var(--bad)':color;
      return '<div style="margin-bottom:9px"><div class="spread" style="margin-bottom:3px">'+
        '<span style="font-size:.84rem">'+p[1]+'</span><span class="mono" style="font-size:.75rem;color:var(--faint)">'+v+' · '+Math.round(pct)+'%</span></div>'+
        '<div style="height:7px;background:var(--raise);border-radius:4px;overflow:hidden">'+
        '<div style="height:100%;width:'+pct+'%;background:'+c+'"></div></div></div>'}).join('');
  }
  bars($('#triggerChart'),l.byTrig,TRIGGERS,'var(--accent)');
  bars($('#displaceChart'),l.byDisp,DISPLACED,'var(--gold)');
}

/* ---------------- reference / ladder / phases ---------------- */
function renderReference(){
  if(!$('#measureRef')) return;
  $('#measureRef').innerHTML=MEASURES.map(function(m){
    return '<div class="card"><div class="spread" style="align-items:flex-start">'+
      '<div><h3 style="font-size:1.05rem">'+m.name+' <span style="font-family:var(--arabic);color:var(--gold);font-weight:400">'+m.ar+'</span></h3>'+
      '<div class="tag">'+m.sub+'</div></div>'+
      '<div class="mono" style="font-size:1.3rem;color:var(--accent)">'+S.settings.weights[m.id]+'</div></div>'+
      '<div class="small" style="margin-top:10px">'+m.why+'</div>'+
      '<div class="cite" style="font-family:var(--mono);font-size:.62rem;letter-spacing:.1em;color:var(--gold);text-transform:uppercase;margin-top:9px">'+m.cite+'</div>'+
      '<div class="rubric" style="margin-top:9px">'+m.rubric.map(function(r,i){return '<div><b>'+i+'</b> — '+r+'</div>'}).join('')+'</div>'+
      '</div>'}).join('');
  var W=S.settings.weights,tot=MEASURES.reduce(function(a,m){return a+(+W[m.id]||0)},0);
  $('#weightTable').innerHTML=MEASURES.map(function(m){
    var w=+W[m.id]||0;
    return '<div style="margin-bottom:7px"><div class="spread" style="margin-bottom:2px">'+
      '<span style="font-size:.85rem">'+m.name+'</span><span class="mono" style="font-size:.75rem;color:var(--faint)">'+w+'</span></div>'+
      '<div style="height:6px;background:var(--raise);border-radius:3px;overflow:hidden">'+
      '<div style="height:100%;width:'+(w/tot*100)+'%;background:var(--accent)"></div></div></div>'}).join('')+
      '<div class="kv" style="margin-top:8px"><span class="k">Total</span><span class="v">'+tot+'</span></div>';
}
function renderLadder(){
  if(!$('#ladderGrid')) return;
  var L=ladderEval();
  $('#ladderGrid').innerHTML=STAGES.map(function(s,i){
    var cls=i===L.stage?'rung active':i<L.stage?'rung done':'rung';
    var gates=i>0? L.gates[i-1]:null;
    return '<div class="'+cls+'">'+(i===L.stage?'<div class="badge">you are here</div>':'')+
      '<div class="stg">stage '+i+'</div>'+
      '<h3>'+s.t+' <span class="ar">'+s.ar+'</span></h3>'+
      '<div class="tag">'+s.s+'</div>'+
      '<div class="small" style="margin-top:9px">'+s.d+'</div>'+
      (gates? '<div class="gate">'+gates.map(function(g){
        return '<div class="gate-line"><span>'+g[0]+'</span><span class="'+(g[1]?'ok':'no')+'">'+g[2]+'</span></div>'}).join('')+'</div>':'')+
      '</div>'}).join('');
}
function renderPhases(){
  if(!$('#phaseGrid')) return;
  var cur=phaseFor(todayK());
  $('#phaseGrid').innerHTML=PHASES.map(function(p){
    var isCur=cur&&cur.n===p.n;
    var wk=weekKey(todayK());
    return '<div class="phase'+(isCur?' cur':'')+'">'+
      '<div class="d">'+p.d+'</div><h4>'+p.t+' <span class="ar">'+p.ar+'</span></h4>'+
      '<div class="tag">'+p.s+' · '+p.ms.length+' measures</div>'+
      '<ul>'+p.li.map(function(x){return '<li>'+x+'</li>'}).join('')+'</ul>'+
      (p.n===4? '<label class="chk" style="margin-top:8px"><input type="checkbox" id="shipChk"'+
        (S.ships[wk]?' checked':'')+' /><span>Something left my hands this week</span></label>':'')+
      '</div>'}).join('');
  var n=dayDiff(S.settings.start,todayK())+1;
  $('#dayN').textContent=n>0?Math.min(n,40):'—';
  $('#startDate').value=S.settings.start;
  $('#phaseNow').innerHTML=cur? 'Currently in <b>phase '+cur.n+' — '+cur.t+'</b>. '+
    (n>40? 'You are past day 40 — re-baseline below and raise the targets.' : (41-n)+' days to re-baseline.') : 'Path not started.';
}

/* ---------------- charts ---------------- */
function renderTrend(){
  if(!$('#trendStats')) return;
  var ks=recentKeys(60),vals=ks.map(indexOf);
  var have=vals.filter(function(v){return v!=null});
  var closed=ks.filter(function(k){return S.days[k]&&S.days[k].closed}).length;
  var l=ledger(30);
  var realN=realDays().length;
  $('#trendStats').innerHTML=
    '<div class="stat"><div class="k">60-day median</div><div class="v">'+(have.length?Math.round(median(have)):'—')+'</div></div>'+
    '<div class="stat"><div class="k">Days closed</div><div class="v">'+closed+'<small> / 60</small></div></div>'+
    '<div class="stat"><div class="k">Clean streak</div><div class="v">'+l.streak+'<small> d</small></div></div>'+
    '<div class="stat"><div class="k">Entries on record</div><div class="v">'+realN+'</div></div>';

  // line chart
  var W=640,H=220,PL=34,PR=8,PT=10,PB=22;
  var X=function(i){return PL+i/(ks.length-1)*(W-PL-PR)};
  var Y=function(v){return PT+(1-v/100)*(H-PT-PB)};
  var g='';
  [0,25,50,75,100].forEach(function(v){
    g+='<line x1="'+PL+'" y1="'+Y(v)+'" x2="'+(W-PR)+'" y2="'+Y(v)+'" stroke="var(--line)" stroke-width="1"/>'+
       '<text x="'+(PL-6)+'" y="'+(Y(v)+3)+'" text-anchor="end" fill="var(--faint)" font-size="9" font-family="ui-monospace,monospace">'+v+'</text>';
  });
  var seg=[],pts=[];
  vals.forEach(function(v,i){ if(v==null){ if(seg.length){pts.push(seg);seg=[]} }
    else seg.push([X(i),Y(v)]) });
  if(seg.length) pts.push(seg);
  pts.forEach(function(p){
    if(p.length===1){g+='<circle cx="'+p[0][0]+'" cy="'+p[0][1]+'" r="2" fill="var(--accent)"/>';return}
    g+='<polyline points="'+p.map(function(q){return q[0].toFixed(1)+','+q[1].toFixed(1)}).join(' ')+
      '" fill="none" stroke="var(--accent)" stroke-width="1.6" stroke-linejoin="round"/>';
  });
  // 7-day rolling median
  var roll=vals.map(function(_,i){
    var w=vals.slice(Math.max(0,i-6),i+1).filter(function(v){return v!=null});
    return w.length>=3? median(w):null});
  var rseg=[],rp=[];
  roll.forEach(function(v,i){ if(v==null){if(rseg.length){rp.push(rseg);rseg=[]}} else rseg.push([X(i),Y(v)])});
  if(rseg.length) rp.push(rseg);
  rp.forEach(function(p){ if(p.length<2) return;
    g+='<polyline points="'+p.map(function(q){return q[0].toFixed(1)+','+q[1].toFixed(1)}).join(' ')+
      '" fill="none" stroke="var(--gold)" stroke-width="2" stroke-dasharray="4 3" opacity=".9"/>'});
  vals.forEach(function(v,i){ if(v!=null&&S.days[ks[i]]&&S.days[ks[i]].weed.sessions.length)
    g+='<circle cx="'+X(i).toFixed(1)+'" cy="'+Y(v).toFixed(1)+'" r="2.6" fill="var(--bad)"/>'});
  g+='<text x="'+PL+'" y="'+(H-6)+'" fill="var(--faint)" font-size="9" font-family="ui-monospace,monospace">'+ks[0].slice(5)+'</text>'+
     '<text x="'+(W-PR)+'" y="'+(H-6)+'" text-anchor="end" fill="var(--faint)" font-size="9" font-family="ui-monospace,monospace">'+ks[ks.length-1].slice(5)+'</text>'+
     '<text x="'+(W/2)+'" y="'+(H-6)+'" text-anchor="middle" fill="var(--bad)" font-size="9" font-family="ui-monospace,monospace">● = session logged</text>';
  $('#lineChart').innerHTML=g;

  // heat
  $('#heatGrid').innerHTML=ks.map(function(k){
    var v=indexOf(k);
    var c=v==null?'var(--raise)':v>=80?'rgba(79,168,122,.95)':v>=65?'rgba(69,170,180,.85)':v>=40?'rgba(224,162,68,.85)':'rgba(212,102,79,.85)';
    return '<i style="background:'+c+'" title="'+k+(v==null?' — no entry':' — '+v)+'"></i>'}).join('');

  // deviation
  var W2=640,H2=260,mid=W2*0.52,rowH=(H2-30)/MEASURES.length;
  var d='';
  d+='<line x1="'+mid+'" y1="6" x2="'+mid+'" y2="'+(H2-24)+'" stroke="var(--muted)" stroke-width="1.5"/>';
  d+='<text x="'+mid+'" y="'+(H2-8)+'" text-anchor="middle" fill="var(--muted)" font-size="9" font-family="ui-monospace,monospace">target 2.5 / 3</text>';
  MEASURES.forEach(function(m,i){
    var k14=recentKeys(14).map(function(k){var dd=S.days[k];return dd?scoreOf(dd,m.id):null})
      .filter(function(x){return x!=null});
    var mu=k14.length?mean(k14):null;
    var y=10+i*rowH;
    d+='<text x="4" y="'+(y+rowH/2)+'" fill="var(--muted)" font-size="10" font-family="ui-monospace,monospace">'+m.name.replace(/&amp;/,'&')+'</text>';
    if(mu==null){ d+='<text x="'+(mid+8)+'" y="'+(y+rowH/2)+'" fill="var(--faint)" font-size="9" font-family="ui-monospace,monospace">no data</text>'; return }
    var dev=mu-2.5, px=dev/2.5*(W2-mid-20);
    var x0=Math.min(mid,mid+px), w=Math.abs(px);
    d+='<rect x="'+x0+'" y="'+(y+rowH/2-7)+'" width="'+Math.max(w,1.5)+'" height="14" fill="'+(dev<0?'var(--bad)':'var(--good)')+'" opacity=".82"/>'+
       '<text x="'+(dev<0? x0-5 : x0+w+5)+'" y="'+(y+rowH/2+4)+'" text-anchor="'+(dev<0?'end':'start')+'" fill="var(--faint)" font-size="9" font-family="ui-monospace,monospace">'+mu.toFixed(2)+'</text>';
  });
  $('#devChart').innerHTML=d;

  // calibration
  var pairs=Object.keys(S.days).filter(function(k){var dd=S.days[k];
    return !dd.synthetic && dd.forecast!=null && indexOf(k)!=null})
    .map(function(k){return [S.days[k].forecast,indexOf(k)]});
  var W3=640,H3=260,P=34;
  var CX=function(v){return P+v/100*(W3-P-14)}, CY=function(v){return H3-24-v/100*(H3-24-10)};
  var c='';
  c+='<line x1="'+CX(0)+'" y1="'+CY(0)+'" x2="'+CX(100)+'" y2="'+CY(100)+'" stroke="var(--muted)" stroke-width="1" stroke-dasharray="4 4"/>';
  c+='<line x1="'+P+'" y1="'+CY(0)+'" x2="'+(W3-14)+'" y2="'+CY(0)+'" stroke="var(--line2)"/>';
  c+='<line x1="'+P+'" y1="'+CY(0)+'" x2="'+P+'" y2="'+CY(100)+'" stroke="var(--line2)"/>';
  c+='<text x="'+(W3/2)+'" y="'+(H3-4)+'" text-anchor="middle" fill="var(--faint)" font-size="9" font-family="ui-monospace,monospace">forecast →</text>';
  c+='<text x="10" y="18" fill="var(--faint)" font-size="9" font-family="ui-monospace,monospace">actual ↑</text>';
  pairs.forEach(function(p){
    c+='<circle cx="'+CX(p[0]).toFixed(1)+'" cy="'+CY(p[1]).toFixed(1)+'" r="3.4" fill="var(--accent)" opacity=".8"/>'});
  $('#calChart').innerHTML=c;
  if(pairs.length>=3){
    var errs=pairs.map(function(p){return p[1]-p[0]});
    var bias=mean(errs), mae=mean(errs.map(Math.abs));
    var over=errs.filter(function(e){return e<0}).length;
    $('#calStats').innerHTML='<b>n = '+pairs.length+'</b> · MAE '+mae.toFixed(1)+
      ' · bias '+(bias>0?'+':'')+bias.toFixed(1)+' · optimistic on '+over+' of '+pairs.length+' days. '+
      (bias<-4? '<b>You are systematically over-forecasting yourself.</b> This is the same failure you study — confidence outrunning the evidence base. The correction is not to try harder; it is to <b>forecast the day you usually have, not the day you intend</b>.'
       : bias>4? 'You are under-forecasting — scoring higher than you predict. Either the mornings are pessimistic or the scoring is generous. Re-read the rubrics before assuming the first.'
       : 'Well calibrated. Your read on yourself is holding within a few points, which is more than most models manage.');
  } else {
    $('#calStats').innerHTML='Needs at least three days with both a morning forecast and a closed evening. '+
      'This is the panel worth waiting for — it is the only one that measures your judgment rather than your behaviour.';
  }
}

/* ---------------- settings ---------------- */
function renderSettings(){
  if(!$('#setLat')) return;
  var st=S.settings;
  $('#setLat').value=st.lat; $('#setLng').value=st.lng;
  $('#setMethod').value=st.method; $('#setAsr').value=st.asr;
  $('#weightEditor').innerHTML=MEASURES.map(function(m){
    return '<div class="field" style="margin-bottom:8px"><label class="fl">'+m.name+'</label>'+
      '<input type="number" min="0" max="60" data-w="'+m.id+'" value="'+st.weights[m.id]+'" /></div>'}).join('');
  var real=realDays().length,syn=Object.keys(S.days).length-real;
  $('#dataStats').innerHTML=kv('Real day entries',real)+kv('Synthetic entries',syn)+
    kv('Urge decisions',S.urges.length)+
    kv('Storage used',(JSON.stringify(S).length/1024).toFixed(1)+' KB');

}

/* ---------------- render all ---------------- */
var NAV=[['','Dashboard'],['day/','Day'],['khudi/','Khudī'],['badan/','Badan'],
         ['ledger/','Ledger'],['record/','Record']];
/* ---- khudi force diagram ---- */
function renderForceDiagram(){
  var el=$('#forceDiagram'); if(!el) return;
  var L=ladderEval(),cur=L.stage;
  var STG=[{t:'Niyābat-e-Ilāhī',a:'نِيَابَة',s:'vicegerency · the self entrusted',n:3},
           {t:'Ẓabt-e-nafs',a:'ضَبْطُ ٱلنَّفْس',s:'self-control · the self that argues and wins',n:2},
           {t:'Iṭāʿat',a:'إِطَاعَة',s:'obedience · form holds without negotiation',n:1},
           {t:'Bekhudī',a:'بے خودی',s:'drift · the self spent, not built',n:0}];
  var UP=['ʿIshq — directed love','Faqr — detachment','Himmat — resolve',
          'Kasb-e-ḥalāl — earned bread','Taskhīr — mastery'];
  var DN=['Su’āl — asking','Taqlīd — imitation','Yās — despair',
          'Ghulāmī — subjection','The trance — dissolution'];
  var g='',BX=250,BW=270,BH=62,y0=44,gap=18;
  // stage boxes
  STG.forEach(function(st,i){
    var y=y0+i*(BH+gap),on=st.n===cur;
    g+='<rect x="'+BX+'" y="'+y+'" width="'+BW+'" height="'+BH+'" rx="3" '+
       'fill="'+(on?'var(--gold-wash)':'var(--surface)')+'" stroke="'+(on?'var(--gold)':'var(--line2)')+
       '" stroke-width="'+(on?2:1)+'"/>';
    g+='<text x="'+(BX+14)+'" y="'+(y+25)+'" fill="var(--ink)" font-size="13" font-weight="600" '+
       'font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif">'+st.t+'</text>';
    g+='<text x="'+(BX+BW-14)+'" y="'+(y+25)+'" text-anchor="end" fill="'+(on?'var(--gold)':'var(--faint)')+
       '" font-size="14">'+st.a+'</text>';
    g+='<text x="'+(BX+14)+'" y="'+(y+44)+'" fill="var(--muted)" font-size="10.5" '+
       'font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif">'+st.s+'</text>';
    if(on) g+='<text x="'+(BX+14)+'" y="'+(y+58)+'" fill="var(--gold)" font-size="9" '+
       'letter-spacing="1.4" font-family="ui-monospace,monospace">YOU ARE HERE</text>';
  });
  var top=y0-10, bot=y0+4*(BH+gap)-gap+10;
  // upward arrow (right)
  g+='<line x1="600" y1="'+bot+'" x2="600" y2="'+(top+12)+'" stroke="var(--accent)" stroke-width="2.5"/>'+
     '<polygon points="600,'+top+' 594,'+(top+14)+' 606,'+(top+14)+'" fill="var(--accent)"/>';
  UP.forEach(function(t,i){
    var y=top+26+i*((bot-top-34)/4);
    g+='<line x1="600" y1="'+y+'" x2="612" y2="'+y+'" stroke="var(--accent)" stroke-width="1.5"/>'+
       '<text x="618" y="'+(y+4)+'" fill="var(--ink)" font-size="11" '+
       'font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif">'+t+'</text>';
  });
  g+='<text x="618" y="'+(top-6)+'" fill="var(--accent)" font-size="9" letter-spacing="1.6" '+
     'font-family="ui-monospace,monospace">RAISES</text>';
  // downward arrow (left)
  g+='<line x1="160" y1="'+top+'" x2="160" y2="'+(bot-12)+'" stroke="var(--bad)" stroke-width="2.5"/>'+
     '<polygon points="160,'+bot+' 154,'+(bot-14)+' 166,'+(bot-14)+'" fill="var(--bad)"/>';
  DN.forEach(function(t,i){
    var y=top+26+i*((bot-top-34)/4);
    g+='<line x1="148" y1="'+y+'" x2="160" y2="'+y+'" stroke="var(--bad)" stroke-width="1.5"/>'+
       '<text x="142" y="'+(y+4)+'" text-anchor="end" fill="var(--ink)" font-size="11" '+
       'font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif">'+t+'</text>';
  });
  g+='<text x="142" y="'+(top-6)+'" text-anchor="end" fill="var(--bad)" font-size="9" letter-spacing="1.6" '+
     'font-family="ui-monospace,monospace">THINS</text>';
  g+='<text x="380" y="'+(bot+26)+'" text-anchor="middle" fill="var(--muted)" font-size="10.5" '+
     'font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif">'+
     'The ladder does not hold you at a rung — absent upward force, the descent is the default.</text>';
  el.innerHTML=g;
}
function renderDayBar(){
  var el=$('#dayBar'); if(!el) return;
  el.innerHTML='<div class="tag">Viewing</div><div class="row">'+
    '<button class="btn" id="prevDay">← prev</button>'+
    '<input type="date" id="dayPicker" value="'+CUR+'" style="width:160px" />'+
    '<button class="btn" id="nextDay">next →</button>'+
    (CUR!==todayK()? '<button class="btn gold" id="todayBtn">today</button>':'')+'</div>';
  el.querySelector('#prevDay').onclick=function(){setCur(addDays(CUR,-1)); renderAll()};
  el.querySelector('#nextDay').onclick=function(){setCur(addDays(CUR,1)); renderAll()};
  el.querySelector('#dayPicker').onchange=function(e){setCur(e.target.value||todayK()); renderAll()};
  var t=el.querySelector('#todayBtn'); if(t) t.onclick=function(){setCur(todayK()); renderAll()};
}
function renderNav(){
  var root=document.body.getAttribute('data-root')||'',
      cur=document.body.getAttribute('data-page')||'', el=$('#navLinks');
  if(el) el.innerHTML=NAV.map(function(n){
    var id=n[0].replace('/','')||'dash';
    return '<a href="'+((root+n[0])||'./')+'" class="'+(cur===id?'on':'')+'">'+n[1]+'</a>'}).join('');
  var f=$('#footVer');
  if(f) f.textContent='mizan.v1 · '+realDays().length+' entries · '+todayK();
}
function renderAll(){
  var d=day(CUR),dt=parseISO(CUR);
  renderNav(); renderDayBar(); renderToday(); renderPrayers(d,dt); renderMeasures(d); renderFriction(d);
  renderHyperLog(); renderLedgerToday(d); renderReference(); renderLadder(); renderPhases();
  renderTrend(); renderSettings(); renderBadan(); renderDash(); renderForceDiagram();
}

/* ==================================================================
   DASHBOARD — kicker cards only. Every number here is a link to the
   page that can do something about it.
   ================================================================== */
function leftmostFailing(){
  var act=activeMeasures(todayK()),worst=null;
  MEASURES.forEach(function(m){
    if(act.indexOf(m.id)<0) return;
    var v=recentKeys(14).map(function(k){var d=S.days[k];return d?scoreOf(d,m.id):null})
      .filter(function(x){return x!=null});
    if(v.length<4) return;
    var mu=mean(v);
    if(!worst||mu<worst.mu) worst={m:m,mu:mu,n:v.length};
  });
  return worst;
}
var PAGEOF={salah:'day/',dhikr:'day/',amal:'day/',attn:'day/',zabt:'ledger/',
            body:'badan/',ihsan:'day/'};
function renderDash(){
  if(!$('#dashGrid')) return;
  var idx=indexOf(todayK()),L=ladderEval(),l=ledger(30),ph=phaseFor(todayK());
  var n=dayDiff(S.settings.start,todayK())+1;
  var d=day(todayK());
  donut($('#dashDial'),idx);
  txt('#dashIdx', idx==null?'—':idx);
  html('#dashStage', STAGES[L.stage].t+' <span class="tag">· stage '+L.stage+'</span>');
  txt('#dashStageSub', STAGES[L.stage].s+' · 14-day median '+Math.round(L.med));
  html('#dashPhase', ph? 'Day <b>'+Math.min(n,40)+'</b> of 40 · phase '+ph.n+' — '+ph.t+
    ' · '+ph.ms.length+' measures active' : 'Path not started');
  html('#dashClosed', d.closed? '<span class="pill good">today closed</span>'
    : '<span class="pill warn">today still open</span>');

  var ng=nextGymDay(),sched=0,done=0;
  recentKeys(28).forEach(function(k){ if(!isGymDay(k)) return; sched++;
    var x=S.days[k]; if(x&&x.gym&&x.gym.status==='done') done++ });
  var pairs=Object.keys(S.days).filter(function(k){var x=S.days[k];
    return !x.synthetic&&x.forecast!=null&&indexOf(k)!=null})
    .map(function(k){return indexOf(k)-S.days[k].forecast});
  var closed14=recentKeys(14).filter(function(k){return S.days[k]&&S.days[k].closed}).length;

  var tiles=[
   {k:'Clean streak',v:l.streak,u:'d',href:'ledger/',
    note:l.best?'best '+l.best+' d':'no history yet'},
   {k:'Days closed',v:closed14,u:'/14',href:'day/',
    note:closed14>=12?'audit trail complete':closed14>=7?'holding':'the record has gaps'},
   {k:'Next session',v:ng?(ng===todayK()?'today':DOW[parseISO(ng).getDay()]):'—',u:'',href:'badan/',
    note:ng?hm(S.settings.gymHour)+' · '+((ROT[parseISO(ng).getDay()]||{}).n||''):'no training days set'},
   {k:'Training 28d',v:sched?Math.round(done/sched*100):'—',u:sched?'%':'',href:'badan/',
    note:sched?done+' of '+sched+' sessions':'nothing scheduled'},
   {k:'Calibration',v:pairs.length>=3?(mean(pairs)>0?'+':'')+mean(pairs).toFixed(1):'—',u:'',href:'record/',
    note:pairs.length>=3?(mean(pairs)<-4?'over-forecasting yourself':mean(pairs)>4?'under-forecasting':'well calibrated')
      :'needs '+(3-pairs.length)+' more forecast days'},
   {k:'Best 50',v:Math.round(B50.reduce(function(a,x){return a+(+(S.best50||{})[x.id]||0)},0)/25*100),u:'%',href:'badan/',
    note:'composite of five standards'}
  ];
  $('#dashGrid').innerHTML=tiles.map(function(t){
    var root=document.body.getAttribute('data-root')||'';
    return '<a class="stat tile" href="'+root+t.href+'"><div class="k">'+t.k+'</div>'+
      '<div class="v">'+t.v+'<small>'+t.u+'</small></div>'+
      '<div class="tiny" style="margin-top:3px">'+t.note+'</div></a>'}).join('');

  var w=leftmostFailing(),root=document.body.getAttribute('data-root')||'';
  html('#dashWorst', w
    ? '<div class="tag" style="margin-bottom:6px">Leftmost failing control</div>'+
      '<div style="font-size:1.06rem;font-weight:600">'+w.m.name+' <span class="tag">· 14-day mean '+
      w.mu.toFixed(2)+' / 3 over '+w.n+' scored days</span></div>'+
      '<div class="small" style="margin-top:7px">'+w.m.why+'</div>'+
      '<div class="btn-row" style="margin-top:12px"><a class="btn primary" href="'+root+
      (PAGEOF[w.m.id]||'day/')+'">Work on this</a></div>'
    : '<div class="tag" style="margin-bottom:6px">Leftmost failing control</div>'+
      '<div class="small">Not enough scored days yet — this needs four scored days on an active measure '+
      'before it will name anything. Ranking a control on two observations is how audits get overturned.</div>');
}

/* ==================================================================
   EVENTS
   ================================================================== */
function txt(sel,t){var e=$(sel); if(e) e.textContent=t}
function html(sel,h){var e=$(sel); if(e) e.innerHTML=h}
function on(sel,ev,fn){var e=$(sel); if(e) e.addEventListener(ev,fn)}
function touch(){save(); renderAll()}

document.addEventListener('click',function(e){
  var t=e.target;
  if(t.tagName!=='BUTTON') return;
  var segM=t.closest('[data-measure]');
  if(segM){ var d=day(CUR); d.scores[segM.getAttribute('data-measure')]=+t.getAttribute('data-v'); touch(); return }
  var segP=t.closest('[data-prayer]');
  if(segP){ var d2=day(CUR),id=segP.getAttribute('data-prayer'),v=t.getAttribute('data-v');
    d2.prayers[id]= d2.prayers[id]===v? null : v; touch(); return }
  if(t.hasAttribute('data-fog')){ day(CUR).weed.fog=+t.getAttribute('data-fog'); touch(); return }
  if(t.hasAttribute('data-path')){ S.settings.path=t.getAttribute('data-path'); touch(); return }
  if(t.hasAttribute('data-delsess')){ day(CUR).weed.sessions.splice(+t.getAttribute('data-delsess'),1); touch(); return }
});

document.addEventListener('change',function(e){
  var t=e.target;
  if(t.hasAttribute&&t.hasAttribute('data-fr')){ day(CUR).friction[+t.getAttribute('data-fr')]=t.checked; save(); return }
  if(t.id==='shipChk'){ S.ships[weekKey(todayK())]=t.checked; save(); return }
  if(t.hasAttribute&&t.hasAttribute('data-w')){
    S.settings.weights[t.getAttribute('data-w')]=clamp(+t.value||0,0,60); touch(); return }
});

on('#dayPicker','change',function(e){setCur(e.target.value||todayK()); renderAll()});
on('#prevDay','click',function(){setCur(addDays(CUR,-1)); renderAll()});
on('#nextDay','click',function(){setCur(addDays(CUR,1)); renderAll()});
on('#fcInput','change',function(e){var v=e.target.value;
  day(CUR).forecast= v===''? null : clamp(+v,0,100); touch()});
on('#oneThing','input',function(e){day(CUR).oneThing=e.target.value; save()});
on('#oneThingDone','change',function(e){day(CUR).oneThingDone=e.target.checked; touch()});
on('#hyper','input',function(e){day(CUR).hyper=e.target.value; save()});
['#mShukr','#mKhata','#mKal'].forEach(function(sel){
  on(sel,'input',function(e){
    var f={'mShukr':'shukr','mKhata':'khata','mKal':'kal'}[e.target.id];
    day(CUR).muhasaba[f]=e.target.value; save()})});
on('#closeDay','click',function(){
  var d=day(CUR); d.closed=!d.closed;
  if(d.closed&&!d.weed.sessions.length) d.weed.clean=true;
  touch()});
on('#freeDayBtn','click',function(){var d=day(CUR); d.weed.clean=true; d.weed.sessions=[]; touch()});

on('#addSession','click',function(){
  var host=$('#sessionList');
  if($('#sessForm')) return;
  var now=new Date();
  var f=document.createElement('div'); f.id='sessForm'; f.className='card flat';
  f.style.marginTop='12px';
  f.innerHTML='<div class="grid g2" style="gap:10px">'+
    '<div class="field" style="margin:0"><label class="fl">Time</label><input type="time" id="sTime" value="'+pad(now.getHours())+':'+pad(now.getMinutes())+'" /></div>'+
    '<div class="field" style="margin:0"><label class="fl">Trigger — be honest, this is the whole point</label><select id="sTrig">'+
      TRIGGERS.map(function(t){return '<option value="'+t[0]+'">'+t[1]+'</option>'}).join('')+'</select></div>'+
    '<div class="field" style="margin:0"><label class="fl">Setting</label><select id="sSet">'+
      SETTINGS_LIST.map(function(t){return '<option value="'+t[0]+'">'+t[1]+'</option>'}).join('')+'</select></div>'+
    '<div class="field" style="margin:0"><label class="fl">What it displaced</label><select id="sDisp">'+
      DISPLACED.map(function(t){return '<option value="'+t[0]+'">'+t[1]+'</option>'}).join('')+'</select></div>'+
    '</div><div class="btn-row" style="margin-top:12px"><button class="btn primary" id="sSave">Log it</button>'+
    '<button class="btn" id="sCancel">Cancel</button></div>';
  host.parentNode.insertBefore(f,host.nextSibling);
  $('#sSave').addEventListener('click',function(){
    var d=day(CUR);
    d.weed.sessions.push({time:$('#sTime').value||'00:00',trigger:$('#sTrig').value,
      setting:$('#sSet').value,displaced:$('#sDisp').value});
    d.weed.clean=false; f.remove(); touch()});
  $('#sCancel').addEventListener('click',function(){f.remove()});
});

/* ---- timers ---- */
function mkTimer(elSel,stateSel,mins,onDone){
  var end=null,iv=null,el=$(elSel),st=$(stateSel);
  function tick(){
    var left=Math.max(0,Math.round((end-Date.now())/1000));
    el.textContent=pad(Math.floor(left/60))+':'+pad(left%60);
    if(left<=0){ clearInterval(iv); iv=null; el.className='timer done';
      if(st) st.textContent='complete'; onDone&&onDone(); }
  }
  return {
    start:function(m){ end=Date.now()+(m||mins)*60000; el.className='timer run';
      if(st) st.textContent='running'; if(iv)clearInterval(iv); iv=setInterval(tick,250); tick()},
    stop:function(){ if(iv)clearInterval(iv); iv=null; el.className='timer';
      if(st) st.textContent='stopped'; el.textContent=pad(mins)+':00'},
    running:function(){return !!iv}
  };
}
var sprint=mkTimer('#sprintTimer','#sprintState',25,function(){
  var d=day(CUR); d.sprints=(d.sprints||0)+1; touch();
  try{ if(window.Notification&&Notification.permission==='granted')
    new Notification('Sprint complete — log it and stand up.') }catch(e){}
});
on('#sprintStart','click',function(){
  var m=+$('#sprintLen').value||25; sprint.start(m);
  try{ if(window.Notification&&Notification.permission==='default') Notification.requestPermission() }catch(e){}
});
on('#sprintStop','click',function(){sprint.stop()});

var urge=mkTimer('#urgeTimer','#urgeState',20,function(){
  var el=$('#urgeState');
  if(el) el.innerHTML='<b>Twenty minutes are up.</b> Now choose deliberately — that is the only difference between a decision and a reflex.';
});
on('#urgeStart','click',function(){ urge.start(20);
  S.urges.push({ts:Date.now(),date:CUR,task:$('#urgeTask').value||'',outcome:null}); save()});
function resolveUrge(outcome){
  for(var i=S.urges.length-1;i>=0;i--){ if(S.urges[i].outcome==null){S.urges[i].outcome=outcome;break} }
  urge.stop(); touch();
}
on('#urgePassed','click',function(){resolveUrge('passed')});
on('#urgeUsed','click',function(){resolveUrge('used')});

/* ---- settings ---- */
['#setLat','#setLng','#setMethod','#setAsr'].forEach(function(sel){
  on(sel,'change',function(e){
    var f={'setLat':'lat','setLng':'lng','setMethod':'method','setAsr':'asr'}[e.target.id];
    S.settings[f]= (f==='lat'||f==='lng'||f==='asr')? +e.target.value : e.target.value;
    touch()})});
on('#geoBtn','click',function(){
  if(!navigator.geolocation){alert('Geolocation unavailable — enter coordinates manually.');return}
  navigator.geolocation.getCurrentPosition(function(p){
    S.settings.lat=+p.coords.latitude.toFixed(4); S.settings.lng=+p.coords.longitude.toFixed(4); touch();
  },function(){alert('Location denied — enter coordinates manually.')});
});
on('#resetWeights','click',function(){S.settings.weights=Object.assign({},DEFW); touch()});
on('#startDate','change',function(e){S.settings.start=e.target.value||todayK(); touch()});
on('#restartPath','click',function(){
  if(confirm('Start a new 40-day cycle from today? Your logged days are kept — only the phase clock resets.')){
    S.settings.start=todayK(); touch()}});
on('#exportBtn','click',function(){
  var blob=new Blob([JSON.stringify(S,null,2)],{type:'application/json'});
  var a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download='mizan-'+todayK()+'.json'; a.click(); URL.revokeObjectURL(a.href)});
on('#importBtn','click',function(){$('#importFile').click()});
on('#importFile','change',function(e){
  var f=e.target.files[0]; if(!f) return;
  var r=new FileReader();
  r.onload=function(){ try{ var o=JSON.parse(r.result);
    if(!o||!o.days) throw new Error('not a mizan file');
    if(confirm('Replace all current data with this file?')){ S=o; load2(); touch() }
  }catch(err){ alert('Could not read that file: '+err.message) } };
  r.readAsText(f)});
function load2(){ var d=defaults();
  S.settings=Object.assign({},d.settings,S.settings||{});
  S.settings.weights=Object.assign({},DEFW,S.settings.weights||{});
  S.days=S.days||{}; S.urges=S.urges||[]; S.ships=S.ships||{};
  S.measures=S.measures||[]; S.best50=S.best50||{};
  if(!Array.isArray(S.settings.gymDays)) S.settings.gymDays=[0,2,4,6] }
on('#wipeBtn','click',function(){
  if(confirm('Erase every entry permanently? Export first if you want a copy.')){
    localStorage.removeItem(KEY); S=defaults(); touch()}});
on('#sampleBtn','click',function(){ makeSample(); touch();
  location.hash='#trend'});

on('#themeBtn','click',function(){
  var root=document.documentElement;
  var next=(root.getAttribute('data-theme')||'dark')==='dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  try{localStorage.setItem('mizan.theme',next)}catch(e){}
  renderAll();
});

/* ---- sample data (clearly synthetic) ---- */
function makeSample(){
  var seed=7; function rnd(){seed=(seed*1103515245+12345)%2147483648; return seed/2147483648}
  for(var i=13;i>=0;i--){
    var k=addDays(todayK(),-i);
    if(has(k)&&!S.days[k].synthetic) continue;
    var d=blankDay(k); d.synthetic=true;
    var arc=(14-i)/14;
    var pr=0.45+arc*0.5;
    PRAYERS.forEach(function(p){ var r=rnd();
      d.prayers[p.id]= r<pr?'in': r<pr+0.2?'late':'miss'});
    d.sprints=Math.floor(rnd()*3+arc*1.6);
    d.oneThingDone=rnd()<0.3+arc*0.45;
    d.oneThing='sample target';
    ['dhikr','zabt','attn','ihsan'].forEach(function(id){
      d.scores[id]=clamp(Math.round(rnd()*2+arc*1.4),0,3)});
    d.sleepHrs=+(5.8+rnd()*2.4).toFixed(2);
    d.moved=rnd()<0.4;
    if(isGymDay(k)) d.gym={status: rnd()<0.35+arc*0.4?'done':(rnd()<0.6?'missed-me':'missed-partner'),rpe:Math.round(5+rnd()*4)};
    d.food={protein:rnd()<0.4+arc*0.4,window:rnd()<0.5+arc*0.3,thirds:rnd()<0.45+arc*0.3,late:rnd()<0.5+arc*0.3};
    if(rnd()<0.55-arc*0.35){
      d.weed.sessions.push({time:(rnd()<0.4?'16':'21')+':'+(rnd()<0.5?'15':'40'),
        trigger:TRIGGERS[Math.floor(rnd()*TRIGGERS.length)][0],
        setting:rnd()<0.7?'alone':'partner',
        displaced:DISPLACED[Math.floor(rnd()*DISPLACED.length)][0]});
      d.weed.fog=Math.floor(rnd()*3);
    } else d.weed.clean=true;
    d.closed=rnd()<0.55+arc*0.35;
    d.muhasaba={shukr:'sample',khata:'sample',kal:'sample'};
    S.days[k]=d;
    d.forecast=clamp(Math.round(45+arc*35+rnd()*18),0,100);
  }
}

/* ==================================================================
   BADAN — training, food, measurement index, Best 50
   ================================================================== */
var ROT={
 6:{n:'Legs & Glutes',skill:'Pistol squat',
    work:'Squat pattern heavy · split squats · RDL · calf work · single-leg balance'},
 0:{n:'Push — Chest & Shoulders',skill:'Air pushup hold',
    work:'Press · incline · lateral raise · pseudo-planche lean · wrist prep'},
 2:{n:'Pull — Back & Biceps',skill:'Human flag',
    work:'Row · pulldown · curl · side-plank & oblique work · grip'},
 4:{n:'Legs II · conditioning & mobility',skill:'Front split · burpee ladder',
    work:'Lunge pattern · hamstring range · hip flexor · burpee intervals · long stretch'}
};
var DOW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
var FOODRULES=[
 ['protein','Protein floor met'],
 ['window','Ate inside the window'],
 ['thirds','Stopped at two-thirds'],
 ['late','Nothing after ʿIshāʾ']
];
var B50=[
 {id:'flag',n:'Human flag',lv:['not started','vertical flag on the pole, feet assisted','tucked flag, 5s','one leg extended, 5s','straddle flag, 5s','full flag, 5s'],
  drill:['Hang and hollow-body holds. Build the side-plank to 60s a side first.','Vertical flag hold — hips stacked over the low hand, 5×10s.','Tuck flag negatives from vertical, 5×3 slow.','Extend one leg only. Keep the low arm locked; that is the whole lift.','Straddle wide — the wider the legs, the shorter the lever.','Hold it. Then hold it longer.']},
 {id:'split',n:'Front split',lv:['gap over 12 in','8–12 in','4–8 in','2–4 in','under 2 in','flat'],
  drill:['Daily 90/90 and couch stretch, 2 min a side. Range is a frequency game, not an intensity game.','Half-split holds with a long exhale, 3×90s a side.','Add loaded hamstring range — RDL through full length — then stretch after.','Elevated back-foot split holds, contract-relax 5×.','Blocks under the front hamstring, decreasing height weekly.','Maintain it — three sessions a week or it walks back.']},
 {id:'pushhold',n:'Air pushup hold, hands back',lv:['not started','pseudo-planche lean, 10s','tuck planche, 5s','advanced tuck, 5s','straddle planche, 3s','full planche, 3s'],
  drill:['Wrist prep first, every session. Then planche lean on knees, 5×10s.','Lean further — shoulders past the wrists. Protract hard.','Tuck negatives and one-second holds. Elbows locked.','Open the knees a few degrees each week.','Straddle holds on parallettes to spare the wrists.','Hold it.']},
 {id:'pistol',n:'Pistol squat',lv:['not started','box pistol to a high box','to a low box','assisted full — band or TRX','one clean rep each leg','three clean reps each leg'],
  drill:['Ankle range first — knee-to-wall test. Then heel-elevated split squats.','Box pistols, 3×5 a side, controlled descent.','Lower the box an inch a week. Counterweight a plate at the chest.','TRX-assisted full range; take the hands off progressively.','One rep, then stand up straight before celebrating.','Three, clean, no hand touch, both sides.']},
 {id:'burpees',n:'50 burpees in 2:00',lv:['under 20 in 2:00','20–29','30–37','38–44','45–49','50 or more'],
  drill:['Build the engine: 8×20s hard / 40s easy, twice a week.','Practise the step-back version to save the shoulders. Cadence over speed.','Intervals at target pace: 5×20 burpees, 60s rest.','Two sets of 25 with 45s rest. Close the gap.','One set of 40 at pace, then finish.','Test it, then keep it — this one decays fastest.']}
];

function gymRotFor(k){ return ROT[parseISO(k).getDay()]||null }
function isGymDay(k){ return S.settings.gymDays.indexOf(parseISO(k).getDay())>=0 }
function nextGymDay(){ var k=todayK();
  for(var i=0;i<8;i++){ var kk=addDays(k,i); if(isGymDay(kk)) return kk } return null }
function badanScore(d){
  var g=d.gym||{},f=d.food||{},n=0;
  if(d.sleepHrs!=null && +d.sleepHrs>=+S.settings.sleepTarget) n++;
  if(g.status==='done'||d.moved) n++;
  if(f.protein) n++;
  if(f.window&&f.thirds&&f.late) n++;
  return n>=3?3:n;
}
function gymPrayerRule(k){
  var pt=prayerTimes(parseISO(k)),a=+S.settings.gymHour,b=a+1.5,W=windows(pt),out=[];
  PRAYERS.forEach(function(p){
    var t=pt[p.id],w=W[p.id];
    if(isNaN(t)) return;
    if(t>a && t<b) out.push({p:p,when:'during',t:t});
    else if(t<=a && w[1]>a) out.push({p:p,when:'open',t:t});
    else if(t>=b && t<b+1.25) out.push({p:p,when:'after',t:t});
  });
  return {hits:out,start:a,end:b,pt:pt};
}

function renderBadan(){
  if(!$('#gymSched')) return;
  var d=day(CUR),st=S.settings;
  $('#partnerName').textContent=st.partner;
  $('#gymSched').textContent=st.gymDays.slice().sort().map(function(i){return DOW[i]}).join(' · ')+
    ' at '+hm(st.gymHour)+' · 90 min';
  var ng=nextGymDay();
  $('#nextGym').textContent= ng? (ng===todayK()?'today':DOW[parseISO(ng).getDay()])+' '+hm(st.gymHour)+
    ' — '+(ROT[parseISO(ng).getDay()]||{}).n : '—';

  // today's session
  var rot=gymRotFor(CUR),g=d.gym||{};
  if(!isGymDay(CUR)){
    $('#gymToday').innerHTML='<div class="notice teal"><b>Not a training day.</b> The Badan measure still needs movement — a walk, a stretch sequence, anything that is not sitting. Tick it below.</div>'+
      '<label class="chk"><input type="checkbox" id="movedChk"'+(d.moved?' checked':'')+' /><span>I moved today — walk, mobility, or anything deliberate</span></label>';
  } else {
    $('#gymToday').innerHTML=
      '<div class="spread" style="margin-bottom:10px"><div><div style="font-weight:600;font-size:1.02rem">'+rot.n+'</div>'+
      '<div class="tiny">'+rot.work+'</div>'+
      '<div class="tag" style="margin-top:5px;color:var(--gold)">skill block · '+rot.skill+'</div></div></div>'+
      '<div class="seg" id="gymSeg">'+
        [['done','done'],['missed-me','I no-showed'],['missed-partner','partner no-showed']].map(function(o){
          return '<button data-gym="'+o[0]+'" class="'+(g.status===o[0]?('on '+(o[0]==='missed-me'?'s0':o[0]==='missed-partner'?'s1':'')):'')+'">'+o[1]+'</button>'}).join('')+
      '</div>'+
      '<div class="grid g2" style="gap:10px;margin-top:12px">'+
      '<div class="field" style="margin:0"><label class="fl">RPE (1–10)</label><input type="number" id="gymRpe" min="1" max="10" value="'+(g.rpe||'')+'" /></div>'+
      '<div class="field" style="margin:0"><label class="fl">Note</label><input type="text" id="gymNote" value="'+esc(g.note||'')+'" placeholder="top set, what moved" /></div></div>';
  }

  // prayer collision
  if(isGymDay(CUR)){
    var r=gymPrayerRule(CUR),lines=[];
    r.hits.forEach(function(h){
      if(h.when==='open') lines.push('<b>'+h.p.n+'</b> is already in at '+hm(h.t)+' — pray it before you leave.');
      if(h.when==='during') lines.push('<b>'+h.p.n+'</b> enters at '+hm(h.t)+', mid-session — pray at the gym, not after.');
      if(h.when==='after') lines.push('<b>'+h.p.n+'</b> arrives at '+hm(h.t)+', just as you finish — pray on arrival, before food.');
    });
    $('#gymPrayerNote').innerHTML= lines.length
      ? '<div class="notice gold"><div class="tag" style="margin-bottom:6px">Session '+hm(r.start)+'–'+hm(r.end)+' vs today’s windows</div>'+lines.join('<br/>')+
        '<div class="tiny" style="margin-top:8px">The failure mode is not missing the prayer, it is the fifteen minutes of drift after the session when you are already changed and hungry. Decide it now, in the morning, while it costs nothing.</div></div>'
      : '<div class="notice teal">The session clears every prayer window today.</div>';
  } else $('#gymPrayerNote').innerHTML='';

  // package + stats
  var allDone=Object.keys(S.days).filter(function(k){var x=S.days[k];
    return !x.synthetic && x.gym && x.gym.status==='done'}).length;
  $('#pkgN').textContent=(allDone%20)+'';
  var sched=0,done=0,me=0,partner=0;
  recentKeys(28).forEach(function(k){
    if(!isGymDay(k)) return; sched++;
    var x=S.days[k]; if(!x||!x.gym) return;
    if(x.gym.status==='done') done++;
    else if(x.gym.status==='missed-me') me++;
    else if(x.gym.status==='missed-partner') partner++;
  });
  $('#gymStats').innerHTML=kv('Scheduled (28d)',sched)+kv('Completed',done)+
    kv('Adherence',sched?Math.round(done/sched*100)+'%':'—')+
    kv('No-show · you',me)+kv('No-show · partner',partner);

  // effect on output
  var on=[],off=[],slept=[],short=[];
  Object.keys(S.days).forEach(function(k){
    var x=S.days[k]; if(x.synthetic||!x.closed) return;
    var v=indexOf(k); if(v==null) return;
    if(x.gym&&x.gym.status==='done') on.push(v); else off.push(v);
    if(x.sleepHrs!=null){ (+x.sleepHrs>=+S.settings.sleepTarget?slept:short).push(v) }
  });
  function cmp(a,b,la,lb,unit){
    if(a.length<3||b.length<3) return '<div class="kv"><span class="k">'+la+' vs '+lb+'</span><span class="v">needs '+
      Math.max(0,3-Math.min(a.length,b.length))+' more closed days</span></div>';
    var da=mean(a),db=mean(b),diff=da-db;
    return '<div class="kv"><span class="k">'+la+' (n='+a.length+')</span><span class="v">'+da.toFixed(1)+'</span></div>'+
      '<div class="kv"><span class="k">'+lb+' (n='+b.length+')</span><span class="v">'+db.toFixed(1)+'</span></div>'+
      '<div class="kv"><span class="k">Difference</span><span class="v" style="color:'+(diff>0?'var(--good)':'var(--bad)')+'">'+
      (diff>0?'+':'')+diff.toFixed(1)+' pts</span></div>';
  }
  $('#gymEffect').innerHTML='<div class="tag" style="margin-bottom:6px">Khudī index, trained vs not</div>'+
    cmp(on,off,'Trained','Did not')+
    '<div class="tag" style="margin:12px 0 6px">Khudī index, slept vs short</div>'+
    cmp(slept,short,'≥'+S.settings.sleepTarget+'h','Under');

  // food
  var f=d.food||{};
  $('#foodList').innerHTML=FOODRULES.map(function(r){
    var label=r[1]+(r[0]==='protein'?' ('+S.settings.proteinTarget+' g)':'');
    return '<label class="chk"><input type="checkbox" data-food="'+r[0]+'"'+(f[r[0]]?' checked':'')+
      ' /><span>'+label+'</span></label>'}).join('');
  $('#wtToday').value=d.weight==null?'':d.weight;
  $('#sleepHrs').value=d.sleepHrs==null?'':d.sleepHrs;

  // rotation grid
  $('#rotationGrid').innerHTML=st.gymDays.slice().sort(function(a,b){
      return (a===6?-1:b===6?1:a-b)}).map(function(i){
    var r=ROT[i]; if(!r) return '';
    var isToday=parseISO(CUR).getDay()===i;
    return '<div class="card flat" style="padding:12px'+(isToday?';border-color:var(--gold)':'')+'">'+
      '<div class="tag">'+DOW[i]+'</div><div style="font-weight:600;font-size:.9rem;margin-top:3px">'+r.n+'</div>'+
      '<div class="tiny" style="margin-top:4px">'+r.work+'</div>'+
      '<div class="tag" style="margin-top:6px;color:var(--gold)">'+r.skill+'</div></div>'}).join('');

  renderMeasurements();
  renderB50();
  renderCoach();
  // settings
  $('#setPartner').value=st.partner; $('#setGymHour').value=st.gymHour;
  $('#setProtein').value=st.proteinTarget; $('#setSleep').value=st.sleepTarget;
  $('#gymDayPick').innerHTML=DOW.map(function(n,i){
    return '<button data-gd="'+i+'" class="'+(st.gymDays.indexOf(i)>=0?'on':'')+'">'+n+'</button>'}).join('');
}

function renderMeasurements(){
  if(!$('#wtChart')) return;
  var M=(S.measures||[]).slice().sort(function(a,b){return a.date<b.date?-1:1});
  var W=640,H=240,PL=38,PR=42,PT=12,PB=26;
  if(M.length<2){
    $('#wtChart').innerHTML='<text x="20" y="120" fill="var(--faint)" font-size="12" font-family="ui-monospace,monospace">Log at least two measurements to draw the trend.</text>';
    $('#wtNote').textContent='No measurement history yet — import a backup or use "Log a measurement".';
  } else {
    var t0=parseISO(M[0].date).getTime(),t1=parseISO(M[M.length-1].date).getTime();
    var span=Math.max(1,t1-t0);
    var X=function(dt){return PL+(parseISO(dt).getTime()-t0)/span*(W-PL-PR)};
    function series(key,col,side){
      var pts=M.filter(function(m){return m[key]!=null});
      if(pts.length<2) return '';
      var vs=pts.map(function(m){return +m[key]});
      var lo=Math.min.apply(null,vs),hi=Math.max.apply(null,vs);
      if(hi-lo<1){hi=lo+1}
      var pad=(hi-lo)*0.18; lo-=pad; hi+=pad;
      var Y=function(v){return PT+(1-(v-lo)/(hi-lo))*(H-PT-PB)};
      var g='<polyline points="'+pts.map(function(m){return X(m.date).toFixed(1)+','+Y(+m[key]).toFixed(1)}).join(' ')+
        '" fill="none" stroke="'+col+'" stroke-width="2" stroke-linejoin="round"/>';
      pts.forEach(function(m){g+='<circle cx="'+X(m.date).toFixed(1)+'" cy="'+Y(+m[key]).toFixed(1)+'" r="2.6" fill="'+col+'"/>'});
      var last=pts[pts.length-1];
      g+='<text x="'+(side==='l'?PL-6:W-PR+6)+'" y="'+(Y(+last[key])+4)+'" text-anchor="'+(side==='l'?'end':'start')+
        '" fill="'+col+'" font-size="10" font-family="ui-monospace,monospace">'+last[key]+'</text>';
      g+='<text x="'+(side==='l'?PL-6:W-PR+6)+'" y="'+(Y(hi-pad)+4)+'" text-anchor="'+(side==='l'?'end':'start')+
        '" fill="var(--faint)" font-size="9" font-family="ui-monospace,monospace">'+(hi-pad).toFixed(0)+'</text>';
      return g;
    }
    var g='<line x1="'+PL+'" y1="'+(H-PB)+'" x2="'+(W-PR)+'" y2="'+(H-PB)+'" stroke="var(--line)"/>';
    g+=series('weight','var(--accent)','l');
    g+=series('lwaist','var(--gold)','r');
    g+='<text x="'+PL+'" y="'+(H-8)+'" fill="var(--faint)" font-size="9" font-family="ui-monospace,monospace">'+M[0].date+'</text>'+
       '<text x="'+(W-PR)+'" y="'+(H-8)+'" text-anchor="end" fill="var(--faint)" font-size="9" font-family="ui-monospace,monospace">'+M[M.length-1].date+'</text>'+
       '<text x="'+(W/2)+'" y="'+(H-8)+'" text-anchor="middle" font-size="9" font-family="ui-monospace,monospace">'+
       '<tspan fill="var(--accent)">— weight</tspan>  <tspan fill="var(--gold)">— lower waist</tspan></text>';
    $('#wtChart').innerHTML=g;
    var wts=M.filter(function(m){return m.weight!=null});
    if(wts.length>=2){
      var a=wts[0],b=wts[wts.length-1];
      $('#wtNote').innerHTML='<b>'+a.weight+' lb ('+a.date+') → '+b.weight+' lb ('+b.date+')</b>, a change of '+
        (b.weight-a.weight>0?'+':'')+(b.weight-a.weight).toFixed(1)+' lb across '+
        Math.round(dayDiff(a.date,b.date)/30.4)+' months. The number that matters is not the weight, it is the waist against it — losing weight while the waist holds is losing the wrong tissue.';
    }
  }
  // ratio
  var last=null;
  for(var i=M.length-1;i>=0;i--){ if(M[i].shoulders!=null&&M[i].lwaist!=null){last=M[i];break} }
  if(last){
    var r=+last.shoulders/+last.lwaist;
    $('#swRatio').textContent=r.toFixed(3);
    var lo=1.30,hi=1.70,X2=function(v){return 14+(clamp(v,lo,hi)-lo)/(hi-lo)*(400-28)};
    $('#swBar').innerHTML='<rect x="14" y="14" width="'+(400-28)+'" height="8" rx="4" fill="var(--raise)"/>'+
      '<rect x="14" y="14" width="'+(X2(r)-14)+'" height="8" rx="4" fill="var(--accent)"/>'+
      '<line x1="'+X2(1.618)+'" y1="8" x2="'+X2(1.618)+'" y2="28" stroke="var(--gold)" stroke-width="2"/>'+
      '<text x="'+X2(1.618)+'" y="42" text-anchor="middle" fill="var(--gold)" font-size="9" font-family="ui-monospace,monospace">1.618</text>'+
      '<text x="'+X2(r)+'" y="42" text-anchor="middle" fill="var(--accent)" font-size="9" font-family="ui-monospace,monospace">'+r.toFixed(2)+'</text>';
    var needW=(+last.shoulders/1.618),needS=(+last.lwaist*1.618);
    $('#swNote').innerHTML='At <b>'+last.shoulders+'</b> shoulders and <b>'+last.lwaist+'</b> lower waist you are at <b>'+r.toFixed(3)+'</b>. '+
      'Closing to the reference means either a waist of '+needW.toFixed(1)+'" at current shoulders, or shoulders of '+needS.toFixed(1)+
      '" at the current waist. <b>The waist side is the cheaper half</b> — and it is the one that is also a health marker rather than an aesthetic one. '+
      'Neither number moves on a weekly timescale; measure monthly, same time of day, exhaled but not braced.';
  } else { $('#swRatio').textContent='—'; $('#swNote').textContent='Log shoulders and lower waist to compute this.'; }
  $('#measTable').innerHTML= M.length? '<table class="t"><tr><th>Date</th><th>Wt</th><th>Shldr</th><th>L.waist</th><th>Chest</th><th>Thigh</th></tr>'+
    M.slice(-6).reverse().map(function(m){
      return '<tr><td class="n">'+m.date+'</td><td class="n">'+(m.weight||'—')+'</td><td class="n">'+(m.shoulders||'—')+
      '</td><td class="n">'+(m.lwaist||'—')+'</td><td class="n">'+(m.chest||'—')+'</td><td class="n">'+(m.thighs||'—')+'</td></tr>'}).join('')+
    '</table>' : '';
}

function renderB50(){
  if(!$('#b50List')) return;
  var b=S.best50||{},tot=0;
  $('#b50List').innerHTML=B50.map(function(s){
    var lv=+b[s.id]||0; tot+=lv;
    var nxt=Math.min(5,lv+1);
    return '<div class="measure"><div>'+
      '<div class="name">'+s.n+' <span class="tag">· level '+lv+' / 5</span></div>'+
      '<div class="why" style="margin-top:5px"><b>Now:</b> '+s.lv[lv]+'</div>'+
      (lv<5? '<div class="why" style="margin-top:3px;color:var(--gold)"><b>Next:</b> '+s.lv[nxt]+'</div>'+
             '<div class="rubric" style="margin-top:5px"><b>Drill</b> '+s.drill[lv]+'</div>'
           : '<div class="why" style="margin-top:3px;color:var(--good)"><b>Standard met.</b> '+s.drill[5]+'</div>')+
      '</div><div class="seg" data-b50="'+s.id+'">'+[0,1,2,3,4,5].map(function(v){
        return '<button data-v="'+v+'" class="'+(lv===v?('on '+(v===0?'s0':v<=1?'s1':'')):'')+'">'+v+'</button>'}).join('')+
      '</div></div>'}).join('');
  $('#b50Score').textContent=Math.round(tot/25*100)+'%';
}

function renderCoach(){
  if(!$('#coachRead')) return;
  var out=[],st=S.settings;
  var sched=0,done=0;
  recentKeys(28).forEach(function(k){ if(!isGymDay(k)) return; sched++;
    var x=S.days[k]; if(x&&x.gym&&x.gym.status==='done') done++ });
  var adh=sched?done/sched:null;
  var fk=recentKeys(28).filter(function(k){return S.days[k]&&S.days[k].food}),
      pf=fk.filter(function(k){return S.days[k].food.protein}).length;
  var legDays=0,totDays=0;
  recentKeys(56).forEach(function(k){var x=S.days[k];
    if(x&&x.gym&&x.gym.status==='done'){ totDays++;
      if(parseISO(k).getDay()===6||parseISO(k).getDay()===4) legDays++ }});
  var M=(S.measures||[]).slice().sort(function(a,b){return a.date<b.date?-1:1});

  if(adh==null||sched===0) out.push(['Training','No scheduled sessions in the window — check the training days are set.']);
  else if(adh>=0.85) out.push(['Training','<b>'+done+' of '+sched+' sessions ('+Math.round(adh*100)+'%).</b> That is a control operating effectively. Do not add volume; add <em>quality</em> — one hard set taken close to failure per movement beats a fifth day.']);
  else if(adh>=0.6) out.push(['Training','<b>'+done+' of '+sched+' ('+Math.round(adh*100)+'%).</b> The gap is not motivation, it is the 4:45pm decision. Pre-commit: bag packed the night before, and the session is non-negotiable on the two leg days even if it becomes twenty minutes.']);
  else out.push(['Training','<b>'+done+' of '+sched+' ('+Math.round(adh*100)+'%).</b> This is the leftmost failing control. Everything else in this module is downstream of showing up — fix nothing else until this is above 70%.']);

  if(fk.length>=5){
    var r=pf/fk.length;
    out.push(['Food', r>=0.8? '<b>Protein floor hit on '+Math.round(r*100)+'% of logged days.</b> That is the hard part done. The waist moves from the window and the thirds, not from more protein.'
      : '<b>Protein floor hit on '+Math.round(r*100)+'% of logged days.</b> Under-eating protein while training four days a week means training for tissue you are not feeding. Fix it at breakfast — that is where the deficit almost always starts.']);
  } else out.push(['Food','Fewer than five logged days. The four rules take about nine seconds a day; log them for a fortnight before judging them.']);

  if(totDays>=6){
    var lr=legDays/totDays;
    out.push(['Balance', lr>=0.4? '<b>Legs are '+Math.round(lr*100)+'% of completed sessions.</b> The historic gap is closing. Keep it there — this is the single change with the largest effect on the Best-50 composite.'
      : '<b>Legs are only '+Math.round(lr*100)+'% of completed sessions.</b> Same pattern as the last six years. Saturday and Thursday are the leg days; if one gets dropped, drop a push day instead.']);
  }

  if(M.length>=2){
    var wts=M.filter(function(m){return m.weight!=null});
    if(wts.length>=2){
      var a=wts[wts.length-2],b2=wts[wts.length-1],dw=b2.weight-a.weight;
      var dwst=(a.lwaist!=null&&b2.lwaist!=null)? b2.lwaist-a.lwaist : null;
      out.push(['Composition','Between '+a.date+' and '+b2.date+', weight moved <b>'+(dw>0?'+':'')+dw.toFixed(1)+' lb</b>'+
        (dwst!=null? ' and lower waist <b>'+(dwst>0?'+':'')+dwst.toFixed(1)+'"</b>. '+
          (dw>0&&dwst<=0? 'Weight up, waist flat or down — that is the direction you want; it is tissue you are adding, not fat.'
           : dw<=0&&dwst<0? 'Both down. Clean.'
           : dw>0&&dwst>0? 'Both up. If the intent was a build, it is running slightly hot — pull the window in by an hour before touching anything else.'
           : 'Weight down, waist up. That combination means muscle is leaving. Raise protein and keep the leg days before cutting anything.')
        : '.')]);
    }
  }
  var b=S.best50||{},lowest=null;
  B50.forEach(function(s){var lv=+b[s.id]||0; if(!lowest||lv<lowest.lv) lowest={s:s,lv:lv}});
  if(lowest) out.push(['Best 50','Lowest standard is <b>'+lowest.s.n+'</b> at level '+lowest.lv+
    '. That is where the composite is cheapest to move. This month’s drill: '+lowest.s.drill[lowest.lv]]);

  $('#coachRead').innerHTML='<table class="t">'+out.map(function(o){
    return '<tr><td style="width:110px"><b>'+o[0]+'</b></td><td class="small">'+o[1]+'</td></tr>'}).join('')+'</table>'+
    '<div class="tiny" style="margin-top:12px">Generated from your logged data by fixed rules — no model judgment, nothing inferred. If a line looks wrong, the input is wrong.</div>';
}

/* ---- badan events ---- */
document.addEventListener('click',function(e){
  var t=e.target; if(t.tagName!=='BUTTON') return;
  if(t.hasAttribute('data-gym')){ var d=day(CUR); d.gym=d.gym||{};
    var v=t.getAttribute('data-gym'); d.gym.status= d.gym.status===v? null : v; touch(); return }
  var b5=t.closest('[data-b50]');
  if(b5){ S.best50=S.best50||{}; S.best50[b5.getAttribute('data-b50')]=+t.getAttribute('data-v'); touch(); return }
  if(t.hasAttribute('data-gd')){
    var i=+t.getAttribute('data-gd'),arr=S.settings.gymDays,j=arr.indexOf(i);
    if(j>=0) arr.splice(j,1); else arr.push(i);
    touch(); return }
});
document.addEventListener('change',function(e){
  var t=e.target; if(!t.hasAttribute) return;
  if(t.hasAttribute('data-food')){ var d=day(CUR); d.food=d.food||{};
    d.food[t.getAttribute('data-food')]=t.checked; touch(); return }
  if(t.id==='movedChk'){ day(CUR).moved=t.checked; touch(); return }
});
on('#gymRpe','change',function(e){var d=day(CUR); d.gym=d.gym||{}; d.gym.rpe=+e.target.value||null; save()});
on('#gymNote','input',function(e){var d=day(CUR); d.gym=d.gym||{}; d.gym.note=e.target.value; save()});
on('#wtToday','change',function(e){var v=e.target.value; day(CUR).weight= v===''?null:+v; touch()});
on('#sleepHrs','change',function(e){var v=e.target.value; day(CUR).sleepHrs= v===''?null:+v; touch()});
on('#setPartner','change',function(e){S.settings.partner=e.target.value||'partner'; touch()});
on('#setGymHour','change',function(e){S.settings.gymHour=clamp(+e.target.value||17,4,23); touch()});
on('#setProtein','change',function(e){S.settings.proteinTarget=clamp(+e.target.value||150,60,300); touch()});
on('#setSleep','change',function(e){S.settings.sleepTarget=clamp(+e.target.value||7,4,10); touch()});
on('#addMeas','click',function(){
  if($('#mForm')) return;
  var host=$('#measForm');
  var fields=[['date','Date','date'],['weight','Weight (lb)','number'],['shoulders','Shoulders','number'],
    ['chest','Chest','number'],['uwaist','Upper waist','number'],['lwaist','Lower waist','number'],
    ['thighs','Thigh','number'],['biceps','Bicep','number'],['calves','Calf','number'],['neck','Neck','number']];
  host.innerHTML='<div class="card flat" id="mForm" style="margin-top:12px"><div class="grid g2" style="gap:8px">'+
    fields.map(function(f){
      return '<div class="field" style="margin:0"><label class="fl">'+f[1]+'</label><input type="'+f[2]+
        '" step="0.25" id="m_'+f[0]+'"'+(f[0]==='date'?' value="'+todayK()+'"':'')+' /></div>'}).join('')+
    '</div><div class="btn-row" style="margin-top:12px"><button class="btn primary" id="mSave">Save</button>'+
    '<button class="btn" id="mCancel">Cancel</button></div></div>';
  $('#mSave').addEventListener('click',function(){
    var o={date:$('#m_date').value||todayK()};
    fields.slice(1).forEach(function(f){var v=$('#m_'+f[0]).value; if(v!=='') o[f[0]]=+v});
    S.measures=S.measures||[]; S.measures.push(o); host.innerHTML=''; touch();
  });
  $('#mCancel').addEventListener('click',function(){host.innerHTML=''});
});

/* The single-page scroll-spy that used to live here is gone: nav links are now
   page URLs, not in-page anchors, and toggling .on by href match stripped the
   current-page marker off every link. renderNav() owns that class. */

/* ---- boot ---- */
try{ var th=localStorage.getItem('mizan.theme'); if(th) document.documentElement.setAttribute('data-theme',th) }catch(e){}
load();
renderAll();
setInterval(function(){ if(CUR===todayK()) renderPrayers(day(CUR),parseISO(CUR)) },60000);

})();
