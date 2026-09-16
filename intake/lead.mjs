export const tracks = Object.freeze({
  business: {label: 'Business operations & responsible AI', note: 'We will start with one workflow, its baseline and the risks of changing it. Automation is an option—not the assumed answer.', next: 'Map one workflow, its owner, baseline and control requirements.'},
  hospitality: {label: 'Hospitality & multi-location readiness', note: 'Think repeatable service, manager training, operating controls and unit economics. Expansion demand and franchise readiness must be tested—not assumed.', next: 'Review repeatable operations and the evidence needed for an expansion decision.'},
  education: {label: 'Education & workforce collaboration', note: 'Possible starting points: an employer-defined student project, hospitality operations case, or responsible-AI workshop. A faculty sponsor and institutional approval would be needed.', next: 'Identify the faculty or program sponsor, learning outcomes and approval path.'},
  explore: {label: 'Exploratory conversation', note: 'No polished pitch needed. Start with the decision you need to make.', next: 'Frame the problem and identify who owns the decision.'}
});
export const fields = ['name','email','organization','role','track','location','source','challenge','outcome','evidence','assumption','readiness','timeline','budget','constraints'];
const limits = {name:100,email:160,organization:120,role:100,location:120,challenge:800,outcome:500,evidence:500,assumption:500,constraints:500};
export function makeLead(values, {id, now} = {}) {
  const answers = Object.fromEntries(fields.map(key => [key, String(values[key] || '').trim().slice(0, limits[key] || 160)]));
  for (const key of ['name','email','organization','role','track','challenge','outcome','readiness','timeline']) if (!answers[key]) throw new Error('Please complete all required questions.');
  if (!tracks[answers.track] || !['exploring','sponsor','ready'].includes(answers.readiness)) throw new Error('Please select a valid conversation path and stage.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.email)) throw new Error('Please enter a valid email address.');
  if (!values.consent) throw new Error('Please confirm the contact and privacy acknowledgement.');
  const gaps = ['evidence','assumption','constraints'].filter(key => !answers[key]);
  return {schema_version:'1.0', lead_id:id || crypto.randomUUID(), prepared_at:now || new Date().toISOString(), status:'prepared_not_received', channel:'website_intake', answers, contact_consent:{inquiry_only:true,newsletter:false}, triage:{track:tracks[answers.track].label, next_step:tracks[answers.track].next, readiness:answers.readiness, missing_context:gaps, qualification:'unreviewed', note:'Self-reported information. Human review required; no automated acceptance or scoring.'}};
}
export function briefText(lead) {
  const a=lead.answers;
  const labels={name:'Name',email:'Email',organization:'Organization',role:'Role',track:'Conversation',location:'Market',source:'Source',challenge:'Problem',outcome:'Desired outcome',evidence:'Current evidence',assumption:'Assumptions / disconfirming evidence',readiness:'Decision stage',timeline:'Timing',budget:'Budget status',constraints:'Constraints / approvals'};
  return ['DISCOVERY BRIEF — Yasir A. Malik',`Reference: ${lead.lead_id}`,`Prepared: ${lead.prepared_at}`,'Status: Prepared locally; receipt not confirmed.','',...fields.map(k=>`${labels[k]}: ${k==='track'?lead.triage.track:(a[k]||'Not provided')}`),'',`Suggested agenda: ${lead.triage.next_step}`,`Missing context: ${lead.triage.missing_context.join(', ')||'None flagged; verify during discovery.'}`,'Qualification: Unreviewed; all information is self-reported.','Contact permission: This inquiry only. No newsletter subscription.','', 'Proposed sequence: initial 1:1 → scoped discovery if mutually useful → written pilot scope and approval.'].join('\n');
}
export function emailHref(lead, text) {
  const subject=`Discovery inquiry — ${lead.answers.organization}`;
  const full=`mailto:yasiramalik@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
  if(full.length<=1800) return {href:full,short:false};
  return {href:`mailto:yasiramalik@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent('Hello Yasir,\n\nI would like to discuss an opportunity. I will paste or attach my discovery brief below before sending.\n\nReference: '+lead.lead_id)}`,short:true};
}
