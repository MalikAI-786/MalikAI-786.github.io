(function(){
'use strict';

/* ==================================================================
   MĪZĀN · MONEY — accounts, cash flow, debts and the mortgage.
   Stage 1 of 2: everything here is read from files the owner
   downloads from the bank and drops in. No connector, no server, no
   network. The data lives in this browser under its OWN key
   (mizan.money.v1), deliberately separate from mizan.v1, so the
   weekly Mīzān export never carries bank data unless asked to.
   Stage 2 (live Plaid sync from a private Supabase backend) is in
   .claude/skills/mizan/references/money-plan.md.
   ================================================================== */

var KEY='mizan.money.v1';
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var pad=function(n){return String(n).padStart(2,'0')};
function iso(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function parseISO(s){var p=s.split('-');return new Date(+p[0],+p[1]-1,+p[2])}
function addDays(s,n){var d=parseISO(s);d.setDate(d.getDate()+n);return iso(d)}
function dayDiff(a,b){return Math.round((parseISO(b)-parseISO(a))/864e5)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){
  return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function todayK(){return iso(new Date())}
function median(a){if(!a.length)return 0;var s=a.slice().sort(function(x,y){return x-y});var m=Math.floor(s.length/2);return s.length%2?s[m]:(s[m-1]+s[m])/2}
function money(v,dp){ if(v==null||isNaN(v)) return '—'; var n=Math.abs(v);
  var s=n.toLocaleString('en-US',{minimumFractionDigits:dp==null?0:dp,maximumFractionDigits:dp==null?0:dp});
  return (v<0?'−':'')+'$'+s }
function on(sel,ev,fn){var e=$(sel); if(e) e.addEventListener(ev,fn)}
function html(sel,h){var e=$(sel); if(e) e.innerHTML=h}

/* ---------------- state ---------------- */
var M=null;
function defaults(){return {v:1,accounts:{},txns:[],loans:{},rules:{},seen:{}}}
function load(){ try{var r=localStorage.getItem(KEY); M=r?JSON.parse(r):defaults()}catch(e){M=defaults()}
  var d=defaults(); Object.keys(d).forEach(function(k){ if(M[k]==null) M[k]=d[k] }) }
function save(){ try{localStorage.setItem(KEY,JSON.stringify(M))}catch(e){} }
function touch(){ save(); render() }

/* ---------------- categories ----------------
   Keyword rules are a starting guess, and every one is overridable per
   merchant. A wrong category that the owner can fix in one tap is worth
   more than a clever classifier he cannot see into. */
var CATS=[
 ['income','Income','payroll|salary|direct dep|deposit from|unemployment|dol |ui benefit|refund|interest paid|dividend'],
 ['housing','Mortgage & housing','mortgage|rent|hoa|escrow|property tax|home loan'],
 ['utilities','Utilities','water|electric|pseg|con ed|gas co|national grid|verizon|t-mobile|at&t|comcast|xfinity|optimum|internet|spectrum'],
 ['groceries','Groceries','whole foods|trader joe|shoprite|stop & shop|kroger|aldi|costco|wegmans|h mart|patel|grocery|market'],
 ['dining','Dining','restaurant|cafe|coffee|starbucks|dunkin|doordash|uber eats|grubhub|pizza|halal|chipotle|mcdonald'],
 ['transport','Transport','uber|lyft|nj transit|mta|path |e-zpass|ezpass|shell|exxon|bp |mobil|gas station|parking|toll'],
 ['insurance','Insurance','insurance|geico|state farm|allstate|progressive|premium'],
 ['health','Health','pharmacy|cvs|walgreens|medical|doctor|dental|clinic|hospital'],
 ['education','Education','tuition|fiu|university|college|coursera|textbook'],
 ['subscriptions','Subscriptions','netflix|spotify|apple\\.com|icloud|google \\*|youtube|amazon prime|adobe|microsoft|openai|anthropic|notion|github'],
 ['shopping','Shopping','amazon|target|walmart|best buy|ebay|etsy'],
 ['travel','Travel','airline|jetblue|delta|united|american air|hotel|airbnb|expedia'],
 ['giving','Giving & zakāt','zakat|sadaqah|donation|charity|masjid|mosque|islamic relief'],
 ['transfer','Transfers','transfer|zelle|venmo|paypal|cash app|payment thank you|autopay|online pmt|credit card payment'],
 ['other','Other','']
];
var CATNAME={}; CATS.forEach(function(c){CATNAME[c[0]]=c[1]});
function merchantKey(desc){ return String(desc||'').toLowerCase().replace(/\d{3,}/g,'').replace(/[#*]+/g,' ').replace(/\s+/g,' ').trim().slice(0,32) }
function categorize(t){
  var mk=merchantKey(t.desc); if(M.rules[mk]) return M.rules[mk];
  var d=' '+String(t.desc||'').toLowerCase()+' ';
  for(var i=0;i<CATS.length-1;i++) if(new RegExp(CATS[i][2]).test(d)) return CATS[i][0];
  return t.amt>0?'income':'other';
}

/* ---------------- parsing ---------------- */
function csvRows(text){
  var rows=[],row=[],f='',q=false;
  for(var i=0;i<text.length;i++){ var c=text[i];
    if(q){ if(c==='"'){ if(text[i+1]==='"'){f+='"';i++} else q=false } else f+=c }
    else if(c==='"') q=true;
    else if(c===','){ row.push(f); f='' }
    else if(c==='\n'||c==='\r'){ if(c==='\r'&&text[i+1]==='\n') i++; row.push(f); f=''; if(row.some(function(x){return x.trim()!==''})) rows.push(row); row=[] }
    else f+=c }
  row.push(f); if(row.some(function(x){return x.trim()!==''})) rows.push(row);
  return rows;
}
function toISODate(s){ s=String(s||'').trim(); var m;
  if((m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))) return m[1]+'-'+pad(+m[2])+'-'+pad(+m[3]);
  if((m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/))) return (m[3].length===2?'20'+m[3]:m[3])+'-'+pad(+m[1])+'-'+pad(+m[2]);
  if((m=s.match(/^(\d{4})(\d{2})(\d{2})/))) return m[1]+'-'+m[2]+'-'+m[3];
  return null }
function num(s){ if(s==null) return NaN; s=String(s).trim(); var neg=/^\(.*\)$/.test(s)||/^-/.test(s)||/-$/.test(s);
  var v=parseFloat(s.replace(/[^0-9.]/g,'')); return isNaN(v)?NaN:(neg?-v:v) }
/* CSV exports disagree on almost everything: column names, one signed
   amount column vs separate debit/credit, and whether a card purchase is
   positive or negative. Detect what can be detected; the preview shows the
   result and offers one "flip signs" switch for the rest. */
function parseCSV(text){
  var rows=csvRows(text); if(rows.length<2) return {err:'No rows found.'};
  var hi=0; for(var r=0;r<Math.min(rows.length,12);r++){ if(rows[r].some(function(h){return /date/i.test(h)})){hi=r;break} }
  var H=rows[hi].map(function(h){return h.toLowerCase().trim()});
  function col(re){ for(var i=0;i<H.length;i++) if(re.test(H[i])) return i; return -1 }
  var cD=col(/^(transaction |posted |posting |trans\.? )?date$|^date/),cDesc=col(/description|payee|merchant|name|memo|details/),
      cAmt=col(/^amount|amount$/),cDeb=col(/debit|withdrawal|outflow/),cCred=col(/credit|deposit|inflow/),cBal=col(/balance/);
  if(cD<0||cDesc<0||(cAmt<0&&cDeb<0&&cCred<0)) return {err:'Could not find date, description and amount columns. Headers seen: '+H.join(', ')};
  var out=[],lastBal=null;
  for(var i=hi+1;i<rows.length;i++){ var c=rows[i], d=toISODate(c[cD]); if(!d) continue;
    var a; if(cAmt>=0) a=num(c[cAmt]); else { var dv=num(c[cDeb]),cv=num(c[cCred]); a=(isNaN(cv)?0:Math.abs(cv))-(isNaN(dv)?0:Math.abs(dv)) }
    if(isNaN(a)) continue;
    // banks sort newest-first or oldest-first; keep the balance on the latest-dated row either way
    if(cBal>=0){ var b=num(c[cBal]); if(!isNaN(b)&&(!lastBal||d>lastBal.d)) lastBal={v:b,d:d} }
    out.push({date:d,desc:(c[cDesc]||'').trim(),amt:Math.round(a*100)/100}) }
  return {txns:out,balance:lastBal,kind:'csv'};
}
function ofxTag(block,tag){ var m=block.match(new RegExp('<'+tag+'>([^<\\r\\n]*)','i')); return m?m[1].trim():'' }
function parseOFX(text){
  var cc=/<CCACCTFROM>/i.test(text),acct=ofxTag(text,'ACCTID'),out=[];
  var re=/<STMTTRN>([\s\S]*?)(?:<\/STMTTRN>|(?=<STMTTRN>)|(?=<\/BANKTRANLIST>))/gi,m;
  while((m=re.exec(text))){ var b=m[1],d=toISODate(ofxTag(b,'DTPOSTED')),a=num(ofxTag(b,'TRNAMT'));
    if(!d||isNaN(a)) continue;
    out.push({date:d,desc:(ofxTag(b,'NAME')+' '+ofxTag(b,'MEMO')).trim(),amt:Math.round(a*100)/100,fitid:ofxTag(b,'FITID')}) }
  var lb=text.match(/<LEDGERBAL>[\s\S]*?<BALAMT>([^<\r\n]+)[\s\S]*?<DTASOF>([^<\r\n]+)/i);
  return {txns:out,balance:lb?{v:num(lb[1]),d:toISODate(lb[2])}:null,kind:'ofx',type:cc?'credit':'checking',last4:acct.slice(-4)};
}

/* ---------------- import flow: preview, then apply ---------------- */
var PENDING=null;
function txId(acct,t){ return t.fitid? acct+'|'+t.fitid : acct+'|'+t.date+'|'+t.amt.toFixed(2)+'|'+merchantKey(t.desc) }
function readFile(f){ return new Promise(function(res,rej){ var r=new FileReader(); r.onload=function(){res(r.result)}; r.onerror=rej; r.readAsText(f) }) }
function onFiles(files){
  var f=files&&files[0]; if(!f) return;
  readFile(f).then(function(text){
    var p=/<OFX>|OFXHEADER/i.test(text)?parseOFX(text):parseCSV(text);
    if(p.err){ html('#mImportOut','<div class="notice">'+esc(p.err)+'</div>'); return }
    PENDING={file:f.name,p:p,flip:false};
    renderPreview();
  });
}
function renderPreview(){
  var P=PENDING; if(!P) { html('#mImportOut',''); return }
  var p=P.p,t=p.txns.map(function(x){return {date:x.date,desc:x.desc,amt:P.flip?-x.amt:x.amt,fitid:x.fitid}});
  var inflow=t.filter(function(x){return x.amt>0}).reduce(function(a,x){return a+x.amt},0),
      outflow=t.filter(function(x){return x.amt<0}).reduce(function(a,x){return a+x.amt},0);
  var range=t.length?t.map(function(x){return x.date}).sort():[];
  var accts=Object.keys(M.accounts).map(function(id){var a=M.accounts[id]; return '<option value="'+esc(id)+'">'+esc(a.name)+'</option>'}).join('');
  html('#mImportOut','<div class="card flat" style="padding:14px;margin-top:12px">'+
    '<div class="tag">'+esc(P.file)+' · '+p.kind.toUpperCase()+'</div>'+
    '<div style="margin:6px 0"><b>'+t.length+'</b> transactions'+(range.length?' · '+range[0]+' → '+range[range.length-1]:'')+
    ' · in <b style="color:var(--good)">'+money(inflow)+'</b> · out <b style="color:var(--bad)">'+money(outflow)+'</b>'+
    (p.balance?' · balance '+money(p.balance.v,2)+' on '+p.balance.d:'')+'</div>'+
    '<div class="tiny">Purchases should show as money <b>out</b>. Credit-card files often have it backwards — if spending is showing as income, flip it.</div>'+
    '<label class="chk"><input type="checkbox" id="mFlip" '+(P.flip?'checked':'')+' /> Flip signs</label>'+
    '<div class="grid g2" style="gap:10px">'+
      '<div class="field" style="margin:0"><label class="fl" for="mAcct">Into account</label><select id="mAcct"><option value="__new">+ new account</option>'+accts+'</select></div>'+
      '<div class="field" style="margin:0" id="mNewWrap"><label class="fl" for="mNewName">New account name</label><input type="text" id="mNewName" placeholder="e.g. Checking ··'+esc(p.last4||'1234')+'" /></div>'+
    '</div>'+
    '<div class="field" style="margin-top:10px" id="mTypeWrap"><label class="fl" for="mType">Type</label><select id="mType">'+
      [['checking','Checking'],['savings','Savings'],['credit','Credit card'],['investment','Investment']].map(function(o){
        return '<option value="'+o[0]+'"'+((p.type||'checking')===o[0]?' selected':'')+'>'+o[1]+'</option>'}).join('')+'</select></div>'+
    '<div class="btn-row" style="margin-top:10px"><button class="btn primary" id="mApply">Add to Money</button><button class="btn" id="mCancel">Cancel</button></div>'+
    '</div>');
  on('#mFlip','change',function(e){ PENDING.flip=e.target.checked; renderPreview() });
  on('#mAcct','change',function(e){ $('#mNewWrap').style.display=$('#mTypeWrap').style.display=e.target.value==='__new'?'':'none' });
  on('#mCancel','click',function(){ PENDING=null; renderPreview() });
  on('#mApply','click',applyImport);
}
function applyImport(){
  var P=PENDING,sel=$('#mAcct').value,id=sel;
  if(sel==='__new'){ var name=$('#mNewName').value.trim()||(P.p.last4?'Account ··'+P.p.last4:'Account '+(Object.keys(M.accounts).length+1));
    id='a'+Date.now().toString(36); M.accounts[id]={name:name,type:$('#mType').value,balance:null,asOf:null} }
  var added=0,dup=0;
  P.p.txns.forEach(function(x){ var t={date:x.date,desc:x.desc,amt:P.flip?-x.amt:x.amt,fitid:x.fitid,acct:id};
    var k=txId(id,t); if(M.seen[k]){dup++;return} M.seen[k]=1; t.id=k; t.cat=categorize(t); M.txns.push(t); added++ });
  if(P.p.balance){ var a=M.accounts[id],b=P.p.balance.v*(P.flip?-1:1);
    if(!a.asOf||P.p.balance.d>=a.asOf){ a.balance=b; a.asOf=P.p.balance.d } }
  M.txns.sort(function(a,b){return a.date<b.date?1:a.date>b.date?-1:0});
  PENDING=null; touch();
  html('#mImportOut','<div class="notice teal">Added <b>'+added+'</b> transactions'+(dup?', skipped <b>'+dup+'</b> already on record':'')+'.</div>');
}

/* ---------------- analysis ---------------- */
function monthKey(d){return d.slice(0,7)}
function lastMonths(n){ var out=[],d=new Date(); d.setDate(1); for(var i=n-1;i>=0;i--){ var x=new Date(d.getFullYear(),d.getMonth()-i,1); out.push(x.getFullYear()+'-'+pad(x.getMonth()+1)) } return out }
function isTransfer(t){ return t.cat==='transfer' }
/* Recurring: the same merchant at least three times, roughly monthly, at a
   similar amount. That is what a bill looks like from the outside, and it is
   the list most people cannot write from memory. */
function recurring(){
  var by={}; M.txns.forEach(function(t){ if(t.amt>=0||isTransfer(t)) return; var k=merchantKey(t.desc); (by[k]=by[k]||[]).push(t) });
  var out=[];
  Object.keys(by).forEach(function(k){ var l=by[k].slice().sort(function(a,b){return a.date<b.date?-1:1}); if(l.length<3) return;
    var gaps=[]; for(var i=1;i<l.length;i++) gaps.push(dayDiff(l[i-1].date,l[i].date));
    var g=median(gaps); if(g<25||g>35) return;
    var amts=l.map(function(t){return -t.amt}),med=median(amts);
    // a bill is the same amount every month; a grocery run that happens monthly is not a bill
    if(amts.some(function(a){return Math.abs(a-med)>Math.max(2,med*0.10)})) return;
    var last=l[l.length-1]; out.push({name:last.desc,amt:med,next:addDays(last.date,Math.round(g)),cat:last.cat,n:l.length}) });
  return out.sort(function(a,b){return a.next<b.next?-1:1});
}
/* Amortisation for a fixed-rate loan. n = −ln(1 − rB/P) / ln(1 + r). */
function loanMath(L){
  var B=+L.balance,r=(+L.rate)/1200,P=+L.payment,x=+(L.extra||0);
  function run(pay){ if(!(B>0)||!(pay>0)) return null;
    if(r===0) return {n:Math.ceil(B/pay),interest:0};
    if(pay<=B*r) return {n:Infinity,interest:Infinity};
    var n=-Math.log(1-r*B/pay)/Math.log(1+r);
    // statement payments are rounded to the cent, which leaves a few cents for one more month; that is not a payment
    n=(n-Math.floor(n)<0.01)?Math.floor(n):Math.ceil(n);
    return {n:n,interest:Math.max(0,n*pay-B)} }
  var base=run(P),fast=x>0?run(P+x):null;
  function end(n){ if(!isFinite(n)) return null; var d=parseISO(L.nextDue||todayK()); d.setMonth(d.getMonth()+n-1); return iso(d).slice(0,7) }
  return {base:base,fast:fast,endBase:base&&end(base.n),endFast:fast&&end(fast.n),interestThisMonth:B*r};
}

/* ---------------- render ---------------- */
function render(){
  if(!$('#money')) return;
  var accts=Object.keys(M.accounts).map(function(id){return Object.assign({id:id},M.accounts[id])});
  var assets=accts.filter(function(a){return a.type!=='credit'&&a.balance!=null}).reduce(function(s,a){return s+a.balance},0);
  var cards=accts.filter(function(a){return a.type==='credit'&&a.balance!=null}).reduce(function(s,a){return s+Math.abs(a.balance)},0);
  var loans=Object.keys(M.loans).map(function(id){return Object.assign({id:id},M.loans[id])});
  var loanBal=loans.reduce(function(s,l){return s+(+l.balance||0)},0);
  var months=lastMonths(6),flow={}; months.forEach(function(m){flow[m]={in:0,out:0}});
  M.txns.forEach(function(t){ var m=monthKey(t.date); if(!flow[m]||isTransfer(t)) return; if(t.amt>0) flow[m].in+=t.amt; else flow[m].out+=-t.amt });
  var cur=flow[months[5]],prev=flow[months[4]];
  html('#mTiles',[
    ['Net position',money(assets-cards-loanBal),'cash & savings − cards − loans'],
    ['Cash & savings',money(assets),accts.filter(function(a){return a.type!=='credit'}).length+' account(s)'],
    ['Owed',money(cards+loanBal),'cards '+money(cards)+' · loans '+money(loanBal)],
    ['This month',money(cur.in-cur.out),'in '+money(cur.in)+' · out '+money(cur.out)]
  ].map(function(x){return '<div class="stat"><div class="k">'+x[0]+'</div><div class="v">'+x[1]+'</div><div class="tiny">'+x[2]+'</div></div>'}).join(''));

  // accounts
  html('#mAccounts', accts.length? accts.map(function(a){
      return '<div class="spread" style="gap:10px;padding:10px 0;border-bottom:1px solid var(--line);flex-wrap:wrap">'+
        '<div><div style="font-weight:600">'+esc(a.name)+'</div><div class="tiny">'+a.type+(a.asOf?' · as of '+a.asOf:'')+'</div></div>'+
        '<div class="btn-row">'+(a.balance==null?'<input type="number" step="0.01" data-bal="'+a.id+'" placeholder="balance" style="width:120px" />'
          :'<span class="mono" style="font-weight:600">'+money(a.balance,2)+'</span>')+
        '<button class="btn" data-delacct="'+a.id+'">remove</button></div></div>'}).join('')
    : '<div class="tiny">No accounts yet. Import a statement file above to create one.</div>');

  // cash-flow chart: 6 months, in vs out, transfers excluded
  var W=640,H=200,P=34,F=15,mx=Math.max.apply(null,months.map(function(m){return Math.max(flow[m].in,flow[m].out)}).concat([1]));
  var bw=(W-2*P)/6,g='<line x1="'+P+'" y1="'+(H-P)+'" x2="'+(W-P)+'" y2="'+(H-P)+'" stroke="var(--line)"/>';
  months.forEach(function(m,i){ var x=P+i*bw,hi=(flow[m].in/mx)*(H-2*P),ho=(flow[m].out/mx)*(H-2*P);
    g+='<rect x="'+(x+bw*0.14)+'" y="'+(H-P-hi)+'" width="'+bw*0.34+'" height="'+hi+'" fill="var(--good)"><title>'+m+' in '+money(flow[m].in)+'</title></rect>'+
       '<rect x="'+(x+bw*0.52)+'" y="'+(H-P-ho)+'" width="'+bw*0.34+'" height="'+ho+'" fill="var(--bad)"><title>'+m+' out '+money(flow[m].out)+'</title></rect>'+
       '<text x="'+(x+bw/2)+'" y="'+(H-P+18)+'" text-anchor="middle" font-size="'+F+'" fill="var(--faint)" font-family="var(--mono)">'+m.slice(5)+'</text>' });
  if(!M.txns.length) g+='<text x="'+W/2+'" y="'+H/2+'" text-anchor="middle" font-size="'+F+'" fill="var(--faint)">Import a statement to see money in and out by month.</text>';
  $('#mFlow').setAttribute('viewBox','0 0 '+W+' '+H); $('#mFlow').innerHTML=g;
  html('#mFlowNote', M.txns.length? 'Green in, red out, transfers between your own accounts excluded. Last month: in '+money(prev.in)+', out '+money(prev.out)+'.' : '');

  // categories this month and last 90 days
  var since=addDays(todayK(),-90),cat={};
  M.txns.forEach(function(t){ if(t.date<since||t.amt>=0||isTransfer(t)) return; cat[t.cat]=(cat[t.cat]||0)+(-t.amt) });
  var cl=Object.keys(cat).sort(function(a,b){return cat[b]-cat[a]}),ctot=cl.reduce(function(s,k){return s+cat[k]},0);
  html('#mCats', cl.length? cl.map(function(k){ var pc=cat[k]/ctot*100;
      return '<div class="kv"><span class="k">'+esc(CATNAME[k]||k)+'</span><span class="v">'+money(cat[k])+' · '+pc.toFixed(0)+'%</span></div>'+
        '<div style="height:4px;background:var(--line);margin:2px 0 6px"><i style="display:block;height:100%;width:'+pc.toFixed(1)+'%;background:var(--accent)"></i></div>'}).join('')
    : '<div class="tiny">Spending by category over the last 90 days appears here.</div>');

  // recurring bills
  var rec=recurring();
  html('#mRecurring', rec.length? rec.map(function(r){ var due=dayDiff(todayK(),r.next);
      return '<div class="spread" style="gap:10px;padding:8px 0;border-bottom:1px solid var(--line)">'+
        '<div><div style="font-weight:600">'+esc(r.name)+'</div><div class="tiny">'+esc(CATNAME[r.cat]||r.cat)+' · seen '+r.n+'× · next about '+r.next+(due<=7&&due>=0?' · <b style="color:var(--signal)">in '+due+' days</b>':'')+'</div></div>'+
        '<div class="mono" style="font-weight:600;white-space:nowrap">'+money(r.amt,2)+'</div></div>'}).join('')+
      '<div class="tiny" style="margin-top:8px">Recurring outflows a month: <b>'+money(rec.reduce(function(s,r){return s+r.amt},0))+'</b>.</div>'
    : '<div class="tiny">Bills that repeat monthly at the same amount are detected after three occurrences.</div>');

  // loans and mortgage
  html('#mLoans', loans.length? loans.map(function(L){ var m=loanMath(L),b=m.base,f=m.fast;
      return '<div class="card flat" style="padding:14px;margin-bottom:10px"><div class="spread"><b>'+esc(L.name)+'</b><button class="btn" data-delloan="'+L.id+'">remove</button></div>'+
        '<div class="kv"><span class="k">Balance</span><span class="v">'+money(+L.balance,2)+'</span></div>'+
        '<div class="kv"><span class="k">Rate · payment (P&amp;I)</span><span class="v">'+(+L.rate).toFixed(3)+'% · '+money(+L.payment,2)+(L.escrow?' + escrow '+money(+L.escrow,2):'')+'</span></div>'+
        '<div class="kv"><span class="k">Interest in this month’s payment</span><span class="v">'+money(m.interestThisMonth,2)+'</span></div>'+
        (b? (isFinite(b.n)? '<div class="kv"><span class="k">Paid off at this payment</span><span class="v">'+m.endBase+' · '+b.n+' payments · '+money(b.interest)+' interest still to pay</span></div>'
             : '<div class="notice">The payment does not cover the monthly interest — the balance grows. Check the figures.</div>') : '')+
        '<div class="field" style="margin-top:10px"><label class="fl">Extra principal per month · <b>'+money(+(L.extra||0))+'</b></label>'+
        '<input type="range" min="0" max="'+Math.max(500,Math.round(+L.payment||0))+'" step="25" value="'+(+(L.extra||0))+'" data-extra="'+L.id+'" style="width:100%" /></div>'+
        (f&&b&&isFinite(f.n)&&isFinite(b.n)? '<div class="notice teal">Paid off <b>'+m.endFast+'</b> — '+(b.n-f.n)+' payments sooner, <b>'+money(b.interest-f.interest)+'</b> less interest.</div>':'')+
        '<div class="tiny">Next due '+esc(L.nextDue||'—')+'. Figures from the statement you entered; the bank’s own payoff quote is the authority.</div></div>'}).join('')
    : '<div class="tiny">Add the mortgage or any loan from its latest statement below.</div>');
}

/* ---------------- events ---------------- */
on('#mFile','change',function(e){ onFiles(e.target.files); e.target.value='' });
var dz=$('#mDrop'); if(dz){ ['dragover','dragenter'].forEach(function(ev){dz.addEventListener(ev,function(e){e.preventDefault();dz.style.borderColor='var(--accent)'})});
  dz.addEventListener('drop',function(e){e.preventDefault();dz.style.borderColor='';onFiles(e.dataTransfer.files)}) }
on('#mLoanAdd','click',function(){
  var g=function(id){return $(id).value.trim()},L={name:g('#lName')||'Mortgage',balance:+g('#lBal'),rate:+g('#lRate'),payment:+g('#lPay'),escrow:+g('#lEsc')||0,nextDue:g('#lDue')||null,extra:0};
  if(!(L.balance>0)||!(L.rate>=0)||!(L.payment>0)){ html('#lErr','Balance, rate and monthly payment are needed.'); return }
  M.loans['l'+Date.now().toString(36)]=L; html('#lErr',''); ['#lName','#lBal','#lRate','#lPay','#lEsc','#lDue'].forEach(function(s){$(s).value=''}); touch();
});
document.addEventListener('click',function(e){ var t=e.target;
  if(t.matches('[data-delacct]')){ var id=t.getAttribute('data-delacct'); if(!confirm('Remove this account and its transactions from this device?')) return;
    delete M.accounts[id]; M.txns=M.txns.filter(function(x){ if(x.acct===id){ delete M.seen[x.id]; return false } return true }); touch() }
  if(t.matches('[data-delloan]')){ delete M.loans[t.getAttribute('data-delloan')]; touch() }
});
document.addEventListener('change',function(e){ var t=e.target;
  if(t.matches('[data-bal]')){ var a=M.accounts[t.getAttribute('data-bal')],v=parseFloat(t.value); if(a&&!isNaN(v)){ a.balance=v; a.asOf=todayK(); touch() } }
  if(t.matches('[data-extra]')){ M.loans[t.getAttribute('data-extra')].extra=+t.value; touch() }
});
on('#mExport','click',function(){ var a=document.createElement('a');
  a.href='data:application/json;charset=utf-8,'+encodeURIComponent(JSON.stringify(M)); a.download='mizan-money-'+todayK()+'.json';
  document.body.appendChild(a); a.click(); a.remove() });
on('#mErase','click',function(){ if(confirm('Erase all Money data on this device? There is no undo.')){ try{localStorage.removeItem(KEY)}catch(e){} M=defaults(); touch() } });

load(); render();
})();
