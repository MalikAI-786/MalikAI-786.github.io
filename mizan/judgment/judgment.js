(function(){
  'use strict';
  var $=function(id){return document.getElementById(id)};
  var tracks={
    iqbal:{name:'Iqbal · close reading',label:'Reading question',
      question:'Before reading the source: what would distinguish Iqbal reporting a Sufi thinker\'s view from Iqbal endorsing that view? State a test you could apply to a passage.',
      challenge:'Read chapter V, printed pp. 112–116. Mark the speaker or thinker attached to each claim. Does Iqbal explicitly endorse the position, reconstruct its reasoning, or criticize it? Find a sentence that could challenge your first test. A historical account can explain a doctrine without adopting it.',
      note:'Source: Iqbal (1908), introduction pp. x–xi and chapter V, pp. 112–116; linked below. Record printed page numbers. This exercise does not infer his later philosophy from the 1908 review.'},
    dba:{name:'DBA · evidence before an inherited rating',label:'Fictional case · constructed for practice',
      question:'A review team inspects 40 files and finds 8 missing approvals. What can you conclude about the wider process, and what do you still need to know? Give your independent answer before seeing the earlier reviewer\'s note.',
      challenge:'The earlier note called the process “low risk” and quoted a 5% exception rate from a different population. This time, the 40 files were selected because they might contain exceptions. The 8 of 40 describes this selected set; neither percentage by itself establishes the current population rate. Which evidence would justify a wider conclusion, and which part of the earlier note could pull you toward an unsupported judgment?',
      note:'All organizations, files, counts and reviewer statements in this case are fictional. The anchoring paper below motivates the question; this is not its experimental procedure and does not measure your bias.'},
    newsletter:{name:'Newsletter · an evidence-bounded claim',label:'Fictional case · constructed for practice',
      question:'A draft says: “An AI checklist improved our reviews.” In 12 observed reviews, average completion time fell from 50 to 35 minutes after the checklist was introduced. What could a newsletter responsibly claim from these facts?',
      challenge:'There was no comparison group. The later reviews were less complex, and error rates were not recorded. Distinguish an observed time difference from a causal claim about the checklist and from a claim about quality. Write a sentence that preserves the observation and makes its limits clear.',
      note:'This is an original fictional editing exercise. It is not a finding from the owner\'s research or a claim about a real organization. Do not turn these invented numbers into a published result.'}
  };
  var first=null;
  var revisionIds=['evidence','counterEvidence','revision','revisedConfidence','nextStep'];
  function hasText(id){return $(id).value.trim().length>0}
  function validConfidence(id){var e=$(id),n=Number(e.value);return e.value.trim()!==''&&isFinite(n)&&n>=0&&n<=100&&Math.floor(n)===n}
  function update(){
    $('reveal').disabled=!!first||!hasText('firstAnswer')||!validConfidence('firstConfidence');
    $('export').disabled=!first||!hasText('evidence')||!hasText('counterEvidence')||!hasText('revision')||!validConfidence('revisedConfidence')||!hasText('nextStep');
  }
  function reset(){
    first=null;
    ['firstAnswer','firstConfidence'].concat(revisionIds).forEach(function(id){$(id).value='';$(id).disabled=false});
    $('track').disabled=false;
    $('challengeSection').hidden=true;$('revisionSection').hidden=true;
    $('firstStatus').textContent='Enter your answer and confidence to continue.';
    $('exportStatus').textContent='Complete the evidence, revision, confidence and next check before exporting.';
    var t=tracks[$('track').value];$('caseLabel').textContent=t.label;$('question').textContent=t.question;
    $('challenge').textContent='';$('readingNote').textContent='';update();
  }
  $('track').addEventListener('change',reset);
  ['firstAnswer','firstConfidence'].concat(revisionIds).forEach(function(id){$(id).addEventListener('input',update)});
  $('firstForm').addEventListener('submit',function(e){
    e.preventDefault();if(first||!hasText('firstAnswer')||!validConfidence('firstConfidence'))return;
    first={track:$('track').value,answer:$('firstAnswer').value.trim(),confidence:Number($('firstConfidence').value)};
    var t=tracks[first.track];$('challenge').textContent=t.challenge;$('readingNote').textContent=t.note;
    $('firstAnswer').disabled=true;$('firstConfidence').disabled=true;$('track').disabled=true;
    $('challengeSection').hidden=false;$('revisionSection').hidden=false;
    $('firstStatus').textContent='Your first answer is held unchanged for this exercise. Clear the worksheet to begin a new attempt.';
    update();$('challengeTitle').focus();
  });
  $('clear').addEventListener('click',function(){reset();$('firstAnswer').focus()});
  $('export').addEventListener('click',function(){
    update();if($('export').disabled)return;
    var t=tracks[first.track];
    var lines=['MĪZĀN · JUDGMENT PRACTICE','Constructed educational exercise. Unscored; not research evidence.','Track: '+t.name,'','QUESTION',t.question,'','INDEPENDENT FIRST ANSWER',first.answer,'Confidence: '+first.confidence+'%','','CHALLENGE',t.challenge,t.note,'','EVIDENCE CHECKED',$('evidence').value.trim(),'','SUPPORTING / CONTRARY EVIDENCE',$('counterEvidence').value.trim(),'','REVISED JUDGMENT AND REASON',$('revision').value.trim(),'Confidence after checking: '+Number($('revisedConfidence').value)+'%','','NEXT CHECK / PUBLICATION BOUNDARY',$('nextStep').value.trim(),'','SOURCE LINKS','Iqbal (1908): https://www.gutenberg.org/ebooks/41707','Tversky & Kahneman (1974): https://doi.org/10.1126/science.185.4157.1124','','Exported by the user. No score or claim of bias reduction is implied.'];
    var blob=new Blob([lines.join('\n')+'\n'],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='mizan-judgment.txt';document.body.appendChild(a);a.click();a.remove();
    window.setTimeout(function(){URL.revokeObjectURL(url)},1000);
    $('exportStatus').textContent='Download requested. Check your browser\'s downloads for the worksheet; nothing was sent to another person.';
  });
  window.addEventListener('pagehide',reset);
  reset();
}());
