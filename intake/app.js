import {tracks, makeLead, briefText, emailHref} from './lead.mjs';
const form=document.querySelector('#intake'), result=document.querySelector('#result'), status=document.querySelector('#status');
let lead=null, text='';
const invalidate=()=>{lead=null;text='';result.hidden=true;document.querySelector('#brief').textContent='';document.querySelector('#email-link').removeAttribute('href');status.textContent='';};
form.addEventListener('input',invalidate);
form.addEventListener('change',()=>{invalidate();document.querySelector('#track-note').textContent=tracks[form.elements.track.value]?.note||'';});
form.addEventListener('reset',()=>{invalidate();document.querySelector('#track-note').textContent='';});
form.addEventListener('submit',event=>{
  event.preventDefault();
  try { lead=makeLead(Object.fromEntries(new FormData(form))); }
  catch(error){alert(error.message);return;}
  text=briefText(lead);document.querySelector('#brief').textContent=text;
  document.querySelector('#next-step').textContent=`Suggested first conversation: ${lead.triage.next_step}`;
  const email=emailHref(lead,text);document.querySelector('#email-link').href=email.href;
  status.textContent=email.short?'Your brief is too long for a reliable email link. Copy it or download the text, then paste or attach it to the draft before sending.':'';
  result.hidden=false;document.querySelector('#result-title').focus();
});
document.querySelector('#copy').addEventListener('click',async()=>{if(!lead)return;try{await navigator.clipboard.writeText(text);status.textContent='Brief copied. Paste it into your email and review before sending.';}catch{status.textContent='Clipboard unavailable. Select and copy the brief above, or download the text.';}});
function download(content,extension,type){if(!lead)return;const url=URL.createObjectURL(new Blob([content],{type}));const link=document.createElement('a');link.href=url;link.download=`discovery-${lead.lead_id}.${extension}`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='Downloaded to your device—not submitted. Keep this file private.';}
document.querySelector('#download-json').addEventListener('click',()=>download(JSON.stringify(lead,null,2),'json','application/json'));
document.querySelector('#download-text').addEventListener('click',()=>download(text,'txt','text/plain'));
// Enable only after the local submit handler is installed: no native GET fallback.
form.querySelector('button[type="submit"]').disabled=false;
