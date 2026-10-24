(function(){
'use strict';

/* ==================================================================
   MĪZĀN · LAB — the participant edition
   A separate instrument for people other than the owner. Same seven
   measures, same weights, same phase-gating and ladder gates as core.js,
   so that a participant's feedback is about the model and not about a
   different model. No dependencies, no network. Everything a participant
   writes stays in this browser under its own key; the only thing that
   ever leaves is a feedback packet they build and send themselves.

   MEASURES / DEFW / PHASES / STAGES below MIRROR core.js — change both
   or neither. scripts/smoke.js checks that the rubrics still agree.
   ================================================================== */

var KEY='mizan.lab.v1';
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
function todayK(){return iso(new Date())}
function txt(sel,t){var e=$(sel); if(e) e.textContent=t}
function html(sel,h){var e=$(sel); if(e) e.innerHTML=h}
function on(sel,ev,fn){var e=$(sel); if(e) e.addEventListener(ev,fn)}

/* ---------------- measures (mirror of core.js) ---------------- */
var MEASURES=[
 {id:'salah',name:'Ṣalāh',ar:'ٱلصَّلَاة',sub:'the spine',fac:'yaqin',kind:'count',
  cite:'Q 4:103 · 20:14',
  why:'The only measure with an <b>external clock</b>. Count the prayers you held inside their window today. It is a tally, not an opinion.',
  rubric:['nothing, or one','two or three','four, or five with slippage','all five, each inside its window']},
 {id:'dhikr',name:'Dhikr &amp; Qur’ān',ar:'ٱلذِّكْر',sub:'the ground',fac:'yaqin',
  cite:'Q 13:28 · 33:41 · 73:6',
  why:'A fixed daily portion, however small, held on the days you do not feel like it. <b>Small and unbroken beats large and occasional.</b>',
  rubric:['none','under five minutes, distracted','five to fifteen, attentive','the fixed portion kept, whatever the day did']},
 {id:'amal',name:'ʿAmal',ar:'ٱلْعَمَل',sub:'ceaseless action',fac:'amal',kind:'amal',
  cite:'Q 53:39 · 94:7 · 62:10',
  why:'Counted, not felt. Each focused block scores one, capped at three; moving the One Thing adds one. <b>This score cannot be talked up at the end of the day.</b>',
  rubric:['no focused block ran','one block','two blocks','three blocks, or two and the One Thing moved']},
 {id:'zabt',name:'Ẓabt-e-nafs',ar:'ضَبْطُ ٱلنَّفْس',sub:'restraint',fac:'ishq',
  cite:'Q 79:40–41 · 7:31 · 25:67',
  why:'Not abstinence — <b>restraint under load</b>. Name the one commitment you are holding this month, then score whether it held today and whether the pressure on it was real.',
  rubric:['commitment broken, unexamined','broken, but the trigger was named honestly','held, with no real pressure on it','held under genuine pressure, trigger named']},
 {id:'attn',name:'Ḥifẓ al-intibāh',ar:'ٱللَّغْو',sub:'the laghw filter',fac:'amal',
  cite:'Q 23:3 · 17:36',
  why:'Where the first hour of the day went, and where the phone was during work. <b>The first hour sets the register for the other fifteen.</b>',
  rubric:['the feed had the first hour','fragmented; phone within reach all day','sprints were protected','first hour protected and phone out of the room']},
 {id:'body',name:'Badan',ar:'ٱلْبَدَن',sub:'the mount',fac:'amal',kind:'body',
  cite:'Q 2:247 · Ṣaḥīḥ al-Bukhārī — "your body has a right over you"',
  why:'Four inputs, ticked not rated: slept to target, moved, protein floor, eating window held. <b>Not wellness garnish — an input to every other measure.</b>',
  rubric:['none of the four','one of the four','two of the four','three or four of: slept · moved · protein · window held']},
 {id:'ihsan',name:'Iḥsān',ar:'ٱلْإِحْسَان',sub:'toward people',fac:'ishq',
  cite:'Q 55:60 · 4:36 · 2:177',
  why:'One concrete act toward a specific person. <b>Not a disposition — a transaction with a date on it.</b> The measure that stops the exercise curdling into instrumented self-absorption.',
  rubric:['nothing','passive kindness — you were pleasant','one deliberate act, named','an act that cost you time, money or ego']}
];
var MI={}; MEASURES.forEach(function(m){MI[m.id]=m});
var DEFW={salah:22,amal:18,zabt:16,dhikr:14,attn:12,body:10,ihsan:8};
var FACULTY={yaqin:['salah','dhikr'],amal:['amal','attn','body'],ishq:['zabt','ihsan']};
var FACNAME={yaqin:'Yaqīn · conviction',amal:'ʿAmal · action',ishq:'ʿIshq · love'};
var PHASES=[
 {n:1,d:'Days 1–10',t:'Iṭāʿat',ar:'إِطَاعَة',s:'Form. Baseline.',ms:['salah','body','amal']},
 {n:2,d:'Days 11–20',t:'Ẓabt-e-nafs',ar:'ضَبْطُ ٱلنَّفْس',s:'One tightening.',ms:['salah','body','amal','zabt','attn']},
 {n:3,d:'Days 21–30',t:'ʿIshq',ar:'عِشْق',s:'Put something in.',ms:['salah','body','amal','zabt','attn','dhikr','ihsan']},
 {n:4,d:'Days 31–40',t:'Niyābat',ar:'نِيَابَة',s:'Ship.',ms:['salah','body','amal','zabt','attn','dhikr','ihsan']}
];
var STAGES=[
 {n:0,t:'Bekhudī',ar:'بے خودی',s:'drift'},
 {n:1,t:'Iṭāʿat',ar:'إِطَاعَة',s:'obedience to the law'},
 {n:2,t:'Ẓabt-e-nafs',ar:'ضَبْطُ ٱلنَّفْس',s:'self-control'},
 {n:3,t:'Niyābat-e-Ilāhī',ar:'نِيَابَتِ إِلٰہی',s:'vicegerency'}
];
var BODY_INPUTS=[['slept','slept to target'],['moved','moved'],['protein','protein floor'],['window','eating window held']];
var FIT=['did not fit my day at all','fit badly in places','mostly fit','fit — nothing to change today'];

/* ---------------- state ---------------- */
var S=null,CUR=null;
function blankDay(k){return {date:k,salahCount:0,sprints:0,oneThing:'',oneThingDone:false,
  body:{slept:false,moved:false,protein:false,window:false},scores:{},
  close:'',closed:false,fit:null,fb:{worked:'',wrong:'',change:'',measure:''}}}
function defaults(){return {v:1,profile:null,
  settings:{start:todayK(),weights:Object.assign({},DEFW)},days:{}}}
function load(){
  try{var raw=localStorage.getItem(KEY); S=raw?JSON.parse(raw):defaults()}catch(e){S=defaults()}
  if(!S.days) S.days={}; if(!S.settings) S.settings=defaults().settings;
  if(!S.settings.weights) S.settings.weights=Object.assign({},DEFW);
  Object.keys(S.days).forEach(day);
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function day(k){ if(!S.days[k]) S.days[k]=blankDay(k);
  var d=S.days[k],b=blankDay(k);
  Object.keys(b).forEach(function(f){ if(d[f]===undefined) d[f]=b[f] });
  Object.keys(b.body).forEach(function(f){ if(d.body[f]===undefined) d.body[f]=false });
  Object.keys(b.fb).forEach(function(f){ if(d.fb[f]===undefined) d.fb[f]='' });
  return d }
function touch(){save(); renderAll()}
function setCur(k){CUR=k; try{sessionStorage.setItem('mizan.lab.cur',k)}catch(e){}}

/* ---------------- scoring (same contract as core.js) ---------------- */
function salahScore(d){var s=+d.salahCount||0; return s>=5?3:s>=4?2:s>=2?1:0}
function amalScore(d){var s=Math.min(+d.sprints||0,3); if(d.oneThingDone) s=Math.min(3,s+1); return s}
function bodyScore(d){var n=0; BODY_INPUTS.forEach(function(b){if(d.body[b[0]]) n++}); return n>=3?3:n}
function scoreOf(d,id){
  if(id==='salah') return salahScore(d);
  if(id==='amal') return amalScore(d);
  if(id==='body') return bodyScore(d);
  var v=d.scores[id]; return v==null?null:+v;
}
function dayNo(k){return dayDiff(S.settings.start,k)+1}
function phaseFor(k){var n=dayNo(k); if(n<1) return null;
  return PHASES[n<=10?0:n<=20?1:n<=30?2:3]}
function activeMeasures(k){var p=phaseFor(k); return p?p.ms:MEASURES.map(function(m){return m.id})}
function indexOf(k){
  var d=S.days[k]; if(!d) return null;
  var act=activeMeasures(k),W=S.settings.weights,tot=0,got=0,any=false;
  act.forEach(function(id){var s=scoreOf(d,id),w=+W[id]||0; if(s==null) return; any=true; tot+=w; got+=(s/3)*w});
  if(!any||tot===0) return null;
  return Math.round(got/tot*100);
}
function recentKeys(n,endK){var end=endK||todayK(),out=[]; for(var i=n-1;i>=0;i--) out.push(addDays(end,-i)); return out}
function ladderEval(){
  var ks=recentKeys(14),days=ks.map(function(k){return S.days[k]}).filter(Boolean);
  var idx=ks.map(indexOf).filter(function(v){return v!=null}),med=median(idx);
  var closed=days.filter(function(d){return d.closed}).length;
  function cnt(id,thr){return ks.filter(function(k){var d=S.days[k]; if(!d) return false;
    var s=scoreOf(d,id); return s!=null&&s>=thr}).length}
  var medAll=MEASURES.every(function(m){
    var v=ks.map(function(k){var d=S.days[k];return d?scoreOf(d,m.id):null}).filter(function(x){return x!=null});
    return v.length>=7&&median(v)>=2});
  /* The Lab has no intoxicant ledger, so the clean-day gate of stage 2 is
     replaced by its nearest honest analogue: restraint held on most days. */
  var g1=[['≥7 of 14 days closed',closed>=7,closed+'/14'],
          ['14-day median index ≥ 40',med>=40,Math.round(med)],
          ['Ṣalāh ≥ 2 on ≥ 9 days',cnt('salah',2)>=9,cnt('salah',2)+'/14']];
  var g2=[['14-day median index ≥ 60',med>=60,Math.round(med)],
          ['Ẓabt ≥ 2 on ≥ 10 days',cnt('zabt',2)>=10,cnt('zabt',2)+'/14'],
          ['Ẓabt ≥ 3 on ≥ 8 days',cnt('zabt',3)>=8,cnt('zabt',3)+'/14']];
  var g3=[['14-day median index ≥ 78',med>=78,Math.round(med)],
          ['≥12 of 14 days closed',closed>=12,closed+'/14'],
          ['Iḥsān ≥ 2 on ≥ 10 days',cnt('ihsan',2)>=10,cnt('ihsan',2)+'/14'],
          ['Every measure median ≥ 2',medAll,medAll?'yes':'no']];
  var p1=g1.every(function(g){return g[1]}),p2=p1&&g2.every(function(g){return g[1]}),
      p3=p2&&g3.every(function(g){return g[1]});
  return {stage:p3?3:p2?2:p1?1:0,gates:[g1,g2,g3],med:med,closed:closed};
}

/* ---------------- participant id ---------------- */
function newPid(){
  var a='23456789ABCDEFGHJKLMNPQRSTUVWXYZ',s='P-';
  var r=new Uint32Array(4);
  if(window.crypto&&crypto.getRandomValues) crypto.getRandomValues(r);
  else for(var j=0;j<4;j++) r[j]=Math.floor(Math.random()*4294967296);
  for(var i=0;i<4;i++) s+=a[r[i]%a.length];
  return s;
}
function qs(){var o={},q=location.search.replace(/^\?/,'').split('&');
  q.forEach(function(p){if(!p)return; var i=p.indexOf('='),k=decodeURIComponent(p.slice(0,i<0?p.length:i)),
    v=i<0?'':decodeURIComponent(p.slice(i+1).replace(/\+/g,' ')); o[k]=v}); return o}

/* ---------------- onboarding ---------------- */
function renderOnboard(){
  var el=$('#onboard'); if(!el) return;
  var app=$('#app');
  if(S.profile){ el.hidden=true; if(app) app.hidden=false; return }
  el.hidden=false; if(app) app.hidden=true;
  var q=qs();
  if(q.to&&!$('#obTo').value) $('#obTo').value=q.to;
  if(q.partner&&!$('#obPartner').value) $('#obPartner').value=q.partner;
  var sel=$('#obHardest');
  if(sel&&!sel.options.length) sel.innerHTML='<option value="">— choose one —</option>'+MEASURES.map(function(m){
    return '<option value="'+m.id+'">'+m.name+' · '+m.sub+'</option>'}).join('');
}
function finishOnboard(){
  var handle=$('#obHandle').value.trim(),field=$('#obField').value.trim(),
      hardest=$('#obHardest').value,stage=$('#obStage').value,
      intention=$('#obIntention').value.trim(),to=$('#obTo').value.trim(),
      partner=$('#obPartner').value.trim(),zabt=$('#obZabt').value.trim();
  var miss=[];
  if(!field) miss.push('what you work on');
  if(!hardest) miss.push('the hardest measure');
  if(!stage) miss.push('your self-placement');
  if(!$('#obConsent').checked) miss.push('the one line about what leaves this device');
  if(miss.length){ txt('#obErr','Still needed: '+miss.join(', ')+'.'); return }
  S.profile={pid:newPid(),handle:handle,field:field,hardest:hardest,stagePlaced:+stage,
    intention:intention,zabt:zabt,to:to,partner:partner||'your research partner',
    started:todayK(),edition:'lab'};
  S.settings.start=todayK();
  touch();
}

/* ---------------- renderers ---------------- */
function renderNav(){
  var el=$('#navLinks'); if(!el) return;
  var cur=document.body.getAttribute('data-page')||'lab';
  var root=document.body.getAttribute('data-root')||'';
  var N=[['','Sheet'],['log/','Log']];
  el.innerHTML=N.map(function(n){var id=n[0].replace('/','')||'lab';
    return '<a href="'+((root+n[0])||'./')+'" class="'+(cur===id?'on':'')+'">'+n[1]+'</a>'}).join('');
  var f=$('#footVer');
  if(f) f.textContent='mizan.lab.v1 · '+Object.keys(S.days).length+' entries · '+(S.profile?S.profile.pid:'not started');
}
function renderDayBar(){
  var el=$('#dayBar'); if(!el||!S.profile) return;
  var dt=parseISO(CUR),n=dayNo(CUR),ph=phaseFor(CUR);
  el.innerHTML='<div class="spread" style="flex-wrap:wrap;gap:10px">'+
    '<div><p class="eyebrow">The sheet</p><h2>'+(CUR===todayK()?'Today':esc(dt.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})))+'</h2>'+
    '<div class="sub">'+(ph?'Day '+Math.min(n,40)+' of 40 · phase '+ph.n+' — '+ph.t+' · '+ph.ms.length+' measures active':'before day 1')+'</div></div>'+
    '<div class="row" style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" id="prevDay">← prev</button>'+
    '<input type="date" id="dayPicker" value="'+CUR+'" style="width:160px" />'+
    '<button class="btn" id="nextDay">next →</button><button class="btn" id="todayBtn">today</button></div></div>';
  on('#prevDay','click',function(){setCur(addDays(CUR,-1)); renderAll()});
  on('#nextDay','click',function(){setCur(addDays(CUR,1)); renderAll()});
  on('#todayBtn','click',function(){setCur(todayK()); renderAll()});
  on('#dayPicker','change',function(e){setCur(e.target.value||todayK()); renderAll()});
}
function donut(el,val){
  if(!el) return;
  var r=36,c=2*Math.PI*r,v=val==null?0:clamp(val,0,100);
  var col=val==null?'var(--line2)':v>=80?'var(--good)':v>=65?'var(--accent)':v>=40?'var(--signal)':'var(--bad)';
  el.innerHTML='<circle cx="43" cy="43" r="'+r+'" fill="none" stroke="var(--line)" stroke-width="7"/>'+
   '<circle cx="43" cy="43" r="'+r+'" fill="none" stroke="'+col+'" stroke-width="7" stroke-linecap="round" '+
   'stroke-dasharray="'+(c*v/100).toFixed(1)+' '+c.toFixed(1)+'" transform="rotate(-90 43 43)"/>';
}
function renderHead(){
  if(!$('#idxNum')||!S.profile) return;
  var idx=indexOf(CUR),L=ladderEval(),p=S.profile;
  donut($('#dialSvg'),idx);
  txt('#idxNum',idx==null?'—':idx);
  html('#stageNow',STAGES[L.stage].t+' <span class="tag">· stage '+L.stage+'</span>');
  txt('#stageNote',STAGES[L.stage].s+' · 14-day median '+Math.round(L.med)+
    ' · you placed yourself at stage '+p.stagePlaced);
  html('#profileLine','<b>'+esc(p.handle||p.pid)+'</b> · '+esc(p.field)+
    (p.intention?' · <em>'+esc(p.intention)+'</em>':'')+
    ' · expected hardest: <b>'+MI[p.hardest].name+'</b>');
  var fs={};
  Object.keys(FACULTY).forEach(function(f){var tot=0,got=0,any=false,act=activeMeasures(CUR),d=day(CUR);
    FACULTY[f].forEach(function(id){if(act.indexOf(id)<0)return; var s=scoreOf(d,id); if(s==null)return; any=true;
      tot+=+DEFW[id]; got+=(s/3)*DEFW[id]}); fs[f]=any&&tot?Math.round(got/tot*100):null});
  html('#facultyRow',Object.keys(FACULTY).map(function(f){
    return '<div class="stat"><div class="k">'+FACNAME[f]+'</div><div class="v">'+(fs[f]==null?'—':fs[f])+'<small> /100</small></div></div>'}).join(''));
}
function seg(id,val,max){var b='';for(var i=0;i<=(max==null?3:max);i++)
  b+='<button type="button" data-seg="'+id+'" data-v="'+i+'" class="'+(val===i?'on s'+i:'')+'">'+i+'</button>';
  return '<div class="seg">'+b+'</div>'}
function renderMeasures(){
  var el=$('#measures'); if(!el||!S.profile) return;
  var d=day(CUR),act=activeMeasures(CUR),p=S.profile;
  el.innerHTML=MEASURES.map(function(m){
    var on=act.indexOf(m.id)>=0,s=scoreOf(d,m.id),ctl='';
    if(!on) return '<div class="measure" style="opacity:.45"><div><div class="name">'+m.name+' <span class="ar">'+m.ar+'</span>'+
      '<span class="tag">off until phase '+(PHASES.filter(function(ph){return ph.ms.indexOf(m.id)>=0})[0]||{}).n+'</span></div></div></div>';
    if(m.kind==='count') ctl='<div class="tag" style="margin-bottom:6px">prayers held in their window today</div>'+seg('salahCount',+d.salahCount||0,5);
    else if(m.kind==='amal') ctl='<div class="tag" style="margin-bottom:6px">focused blocks that actually ran</div>'+seg('sprints',Math.min(+d.sprints||0,3),3)+
      '<label class="chk" style="margin-top:6px"><input type="checkbox" data-chk="oneThingDone" '+(d.oneThingDone?'checked':'')+'/> the One Thing moved</label>';
    else if(m.kind==='body') ctl=BODY_INPUTS.map(function(b){return '<label class="chk"><input type="checkbox" data-body="'+b[0]+'" '+(d.body[b[0]]?'checked':'')+'/> '+b[1]+'</label>'}).join('');
    else ctl=seg(m.id,s,3);
    var rub=s==null?'<span class="tiny">not scored</span>':'<span class="tiny">'+esc(m.rubric[s])+'</span>';
    return '<div class="measure"><div><div class="name">'+m.name+' <span class="ar">'+m.ar+'</span><span class="tag">'+m.sub+(p.hardest===m.id?' · you expected this to be hardest':'')+'</span></div>'+
      '<div class="small" style="margin-top:6px">'+m.why+(m.id==='zabt'&&p.zabt?' <b>Your line:</b> '+esc(p.zabt):'')+'</div>'+
      '<div class="tiny mono" style="margin-top:6px">'+m.cite+' · weight '+DEFW[m.id]+'</div></div>'+
      '<div style="min-width:200px"><div class="tag" style="margin-bottom:6px">score · '+(s==null?'—':s+'/3')+'</div>'+ctl+'<div style="margin-top:6px">'+rub+'</div></div></div>';
  }).join('');
}
function renderClose(){
  if(!$('#oneThing')||!S.profile) return;
  var d=day(CUR);
  $('#oneThing').value=d.oneThing||'';
  $('#closeLine').value=d.close||'';
  $('#closedChk').checked=!!d.closed;
}
function renderFeedback(){
  var el=$('#fbMeasure'); if(!el||!S.profile) return;
  var d=day(CUR);
  if(!el.options.length) el.innerHTML='<option value="">the whole instrument</option>'+MEASURES.map(function(m){
    return '<option value="'+m.id+'">'+m.name+'</option>'}).join('')+
    '<option value="weights">the weights</option><option value="phases">the phase gating</option><option value="ladder">the ladder gates</option>';
  el.value=d.fb.measure||'';
  $('#fbWorked').value=d.fb.worked||''; $('#fbWrong').value=d.fb.wrong||''; $('#fbChange').value=d.fb.change||'';
  html('#fitSeg',seg('fit',d.fit,3)+'<div class="tiny" style="margin-top:6px">'+(d.fit==null?'how well did the instrument fit today?':esc(FIT[d.fit]))+'</div>');
  var n=Object.keys(S.days).filter(function(k){var x=S.days[k]; return x.fb.worked||x.fb.wrong||x.fb.change||x.fit!=null}).length;
  txt('#fbCount',n+' day'+(n===1?'':'s')+' with feedback on record');
}
function renderTrend(){
  var el=$('#trendSvg'); if(!el||!S.profile) return;
  var ks=recentKeys(30),W=640,H=160,P=28,F=15;
  var pts=ks.map(function(k,i){var v=indexOf(k); return v==null?null:[P+i*(W-2*P)/29,H-P-(v/100)*(H-2*P)]});
  var segs=[],cur=[];
  pts.forEach(function(p){ if(p) cur.push(p.join(',')); else { if(cur.length) segs.push(cur); cur=[] } });
  if(cur.length) segs.push(cur);
  var have=pts.filter(Boolean).length;
  var g='<line x1="'+P+'" y1="'+(H-P)+'" x2="'+(W-P)+'" y2="'+(H-P)+'" stroke="var(--line)"/>';
  [0,50,100].forEach(function(v){var y=H-P-(v/100)*(H-2*P);
    g+='<text x="'+(P-6)+'" y="'+(y+5)+'" text-anchor="end" font-size="'+F+'" fill="var(--faint)" font-family="var(--mono)">'+v+'</text>'+
       '<line x1="'+P+'" y1="'+y+'" x2="'+(W-P)+'" y2="'+y+'" stroke="var(--line)" stroke-dasharray="2 4"/>'});
  segs.forEach(function(s){ g+=s.length>1?'<polyline points="'+s.join(' ')+'" fill="none" stroke="var(--accent)" stroke-width="2.5"/>':
    '<circle cx="'+s[0].split(',')[0]+'" cy="'+s[0].split(',')[1]+'" r="4" fill="var(--accent)"/>' });
  if(!have) g+='<text x="'+(W/2)+'" y="'+(H/2)+'" text-anchor="middle" font-size="'+F+'" fill="var(--faint)">No scored days yet — the line appears after your first sheet.</text>';
  el.setAttribute('viewBox','0 0 '+W+' '+H); el.innerHTML=g;
  txt('#trendNote',have+' of the last 30 days scored · index is a weighted % over the measures active in your phase');
}
function renderLadder(){
  var el=$('#ladderGates'); if(!el||!S.profile) return;
  var L=ladderEval();
  el.innerHTML=L.gates.map(function(g,i){
    return '<div class="rung '+(L.stage>i?'done':L.stage===i?'active':'')+'"><div class="stg">gate to stage '+(i+1)+' · '+STAGES[i+1].t+'</div>'+
      '<div class="gate">'+g.map(function(x){return (x[1]?'<span style="color:var(--good)">✓</span>':'<span style="color:var(--faint)">○</span>')+' '+x[0]+' <span class="tiny">('+x[2]+')</span>'}).join('<br>')+'</div></div>'}).join('');
}
function renderAll(){
  if(!CUR) CUR=todayK();
  renderNav(); renderOnboard(); if(!S.profile) return;
  renderDayBar(); renderHead(); renderMeasures(); renderClose(); renderFeedback(); renderTrend(); renderLadder();
  var pk=$('#packetOut'); if(pk&&pk.dataset.open==='1') pk.textContent=packetText(buildPacket());
}

/* ---------------- the feedback packet ----------------
   What leaves the device, and only when the participant sends it:
   participant code, profile answers (field, hardest, self-placed stage),
   per-day computed scores and closure, fit ratings, and the three free-text
   feedback fields. NOT included: the handle, the One Thing, the closing
   line, the restraint line. Those are the participant's own record. */
function buildPacket(){
  var p=S.profile,ks=Object.keys(S.days).sort(),days=[],fb=[];
  ks.forEach(function(k){var d=S.days[k],sc={};
    MEASURES.forEach(function(m){var s=scoreOf(d,m.id); if(s!=null&&activeMeasures(k).indexOf(m.id)>=0) sc[m.id]=s});
    if(Object.keys(sc).length||d.closed||d.fit!=null) days.push({date:k,day:dayNo(k),scores:sc,idx:indexOf(k),closed:!!d.closed,fit:d.fit});
    if(d.fb.worked||d.fb.wrong||d.fb.change) fb.push({date:k,about:d.fb.measure||'instrument',worked:d.fb.worked,wrong:d.fb.wrong,change:d.fb.change})});
  var L=ladderEval();
  return {v:1,edition:'lab',pid:p.pid,built:new Date().toISOString(),started:p.started,
    profile:{field:p.field,hardest:p.hardest,stagePlaced:p.stagePlaced},
    computed:{stage:L.stage,median14:Math.round(L.med),closed14:L.closed},days:days,feedback:fb};
}
function packetText(pk){return 'MIZAN-LAB-PACKET\n'+JSON.stringify(pk)+'\nEND-PACKET'}
function sendPacket(){
  var pk=buildPacket(),p=S.profile,body=packetText(pk);
  var subj='Mīzān Lab packet · '+pk.pid+' · '+todayK();
  var to=p.to||'';
  var href='mailto:'+encodeURIComponent(to)+'?subject='+encodeURIComponent(subj)+'&body='+encodeURIComponent(body);
  if(href.length>1800){ /* long packets will not survive a mailto: — fall back to copy + paste */
    txt('#packetNote','This packet is too long for a mail link. It has been copied — paste it into an email to '+esc(p.partner)+(to?' ('+to+')':'')+'.');
    copyPacket(); return }
  location.href=href;
  txt('#packetNote','Your mail app should have opened with the packet in the body. If it did not, use Copy and paste it yourself.');
}
function copyPacket(){
  var t=packetText(buildPacket());
  var out=$('#packetOut'); out.textContent=t; out.dataset.open='1'; out.hidden=false;
  try{ if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(t).catch(function(){});
       else { var r=document.createRange(); r.selectNodeContents(out); var s=getSelection(); s.removeAllRanges(); s.addRange(r); document.execCommand('copy') } }catch(e){}
  if(!$('#packetNote').textContent) txt('#packetNote','Copied. Paste it into a message to '+esc(S.profile.partner)+'. Nothing was sent by this page.');
}
function downloadPacket(){
  var t=packetText(buildPacket()),a=document.createElement('a');
  a.href='data:application/json;charset=utf-8,'+encodeURIComponent(t);
  a.download='mizan-lab-'+S.profile.pid+'-'+todayK()+'.txt'; document.body.appendChild(a); a.click(); a.remove();
}

/* ---------------- events ---------------- */
document.addEventListener('click',function(e){
  var b=e.target.closest('[data-seg]'); if(!b||!S.profile) return;
  var d=day(CUR),id=b.getAttribute('data-seg'),v=+b.getAttribute('data-v');
  if(id==='salahCount') d.salahCount=v; else if(id==='sprints') d.sprints=v;
  else if(id==='fit') d.fit=(d.fit===v?null:v); else d.scores[id]=(d.scores[id]===v?null:v);
  touch();
});
document.addEventListener('change',function(e){
  var t=e.target; if(!S.profile) return; var d=day(CUR);
  if(t.matches('[data-chk]')) { d[t.getAttribute('data-chk')]=t.checked; touch() }
  else if(t.matches('[data-body]')) { d.body[t.getAttribute('data-body')]=t.checked; touch() }
  else if(t.id==='closedChk') { d.closed=t.checked; touch() }
  else if(t.id==='fbMeasure') { d.fb.measure=t.value; save() }
});
document.addEventListener('input',function(e){
  var t=e.target; if(!S.profile) return; var d=day(CUR);
  if(t.id==='oneThing') { d.oneThing=t.value; save() }
  else if(t.id==='closeLine') { d.close=t.value; save() }
  else if(t.id==='fbWorked') { d.fb.worked=t.value; save() }
  else if(t.id==='fbWrong') { d.fb.wrong=t.value; save() }
  else if(t.id==='fbChange') { d.fb.change=t.value; save() }
});
on('#obGo','click',finishOnboard);
on('#sendBtn','click',sendPacket);
on('#copyBtn','click',copyPacket);
on('#dlBtn','click',downloadPacket);
on('#resetBtn','click',function(){ if(confirm('Erase everything this page holds on this device? There is no undo.')){
  try{localStorage.removeItem(KEY)}catch(e){} S=defaults(); touch() }});
on('#themeBtn','click',function(){
  var root=document.documentElement,next=(root.getAttribute('data-theme')||'dark')==='dark'?'light':'dark';
  root.setAttribute('data-theme',next); try{localStorage.setItem('mizan.theme',next)}catch(e){}
});

/* ---------------- boot ---------------- */
try{var th=localStorage.getItem('mizan.theme'); if(th) document.documentElement.setAttribute('data-theme',th)}catch(e){}
load();
try{CUR=sessionStorage.getItem('mizan.lab.cur')||todayK()}catch(e){CUR=todayK()}
if(!/^\d{4}-\d{2}-\d{2}$/.test(CUR)) CUR=todayK();
renderAll();
})();
