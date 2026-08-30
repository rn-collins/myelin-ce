/* Record builders need scripting, so their buttons ship hidden in the HTML. */
document.querySelectorAll('[data-jsonly]').forEach(el=>{ el.hidden=false; });
const key='myelin-field-tools-v1';let records={claim:null,data:null,oversight:null};try{records={...records,...JSON.parse(localStorage.getItem(key)||'{}')}}catch{}const v=id=>document.getElementById(id).value.trim(),stamp=()=>new Date().toISOString();function save(type,text,data){records[type]={createdAt:stamp(),data,text};localStorage.setItem(key,JSON.stringify(records));document.getElementById(type+'Result').textContent=text}
document.querySelector('[data-build=claim]').onclick=()=>{let d={claim:v('clClaim'),type:v('clType'),risk:v('clRisk'),source:v('clSource'),pinpoint:v('clPin'),support:v('clSupport'),limitations:v('clLimits'),currency:v('clCurrent'),disposition:v('clDecision'),reviewer:v('clReviewer')};let missing=['claim','source','support','disposition'].filter(x=>!d[x]);let text=missing.length?'INCOMPLETE — resolve: '+missing.join(', '):`CLAIM VERIFICATION RECORD\nClaim: ${d.claim}\nType / consequence: ${d.type} / ${d.risk}\nSource / pinpoint: ${d.source} / ${d.pinpoint||'not recorded'}\nSupport: ${d.support}\nLimitations: ${d.limitations||'none recorded—verify'}\nCurrency: ${d.currency||'not recorded'}\nDisposition: ${d.disposition}\nReviewer: ${d.reviewer||'not recorded'}`;save('claim',text,d)};
document.querySelector('[data-build=data]').onclick=()=>{let signals=[...document.querySelectorAll('.signal:checked')].map(x=>x.value),d={purpose:v('dgPurpose'),data:v('dgData'),authority:v('dgAuthority'),tool:v('dgTool'),controls:v('dgControls'),owner:v('dgOwner'),signals};let missing=['purpose','data','authority','tool','controls','owner'].filter(x=>!d[x]),decision=missing.length?'STOP — required facts are missing':signals.length?'ESCALATE — one or more sensitivity/change signals require qualified review':'PROCEED CONDITIONALLY — on the facts recorded; preserve approval and monitor change';let text=`${decision}\nMissing: ${missing.join(', ')||'none'}\nSignals: ${signals.join('; ')||'none selected'}\nPurpose: ${d.purpose||'—'}\nData: ${d.data||'—'}\nAuthority: ${d.authority||'—'}\nTool/configuration: ${d.tool||'—'}\nControls: ${d.controls||'—'}\nOwner: ${d.owner||'—'}`;save('data',text,d)};
document.querySelector('[data-build=oversight]').onclick=()=>{let ids=['ovDecision','ovAI','ovImpact','ovReviewer','ovEvidence','ovAuthority','ovContest','ovMonitor'],d=Object.fromEntries(ids.map(x=>[x,v(x)])),missing=ids.filter(x=>!d[x]);let text=(missing.length?'INCOMPLETE CONTROL — resolve: '+missing.join(', ')+'\n':'CONTROL RECORD COMPLETE FOR HUMAN REVIEW\n')+`Decision: ${d.ovDecision||'—'}\nAI contribution: ${d.ovAI||'—'}\nImpact/reversibility: ${d.ovImpact||'—'}\nReviewer: ${d.ovReviewer||'—'}\nRequired evidence: ${d.ovEvidence||'—'}\nAuthority/escalation: ${d.ovAuthority||'—'}\nContest/remedy: ${d.ovContest||'—'}\nMonitoring/pause: ${d.ovMonitor||'—'}`;save('oversight',text,d)};exportBtn.onclick=()=>{let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({schema:'myelin-field-tool-records',exportedAt:stamp(),...records},null,2)],{type:'application/json'}));a.download='myelin-field-tool-records.json';a.click()};deleteBtn.onclick=()=>{if(confirm('Delete all Myelin field-tool records from this browser?')){localStorage.removeItem(key);records={claim:null,data:null,oversight:null};document.querySelectorAll('.result').forEach(x=>x.textContent='Local record deleted.')}};for(const t of Object.keys(records))if(records[t])document.getElementById(t+'Result').textContent=records[t].text;
/* Restore what you last entered, so a reload does not cost you the form.
   Values live in this browser only and are cleared by the delete button above. */
const FIELD_MAP={
  claim:{claim:'clClaim',type:'clType',risk:'clRisk',source:'clSource',pinpoint:'clPin',support:'clSupport',limitations:'clLimits',currency:'clCurrent',disposition:'clDecision',reviewer:'clReviewer'},
  data:{purpose:'dgPurpose',data:'dgData',authority:'dgAuthority',tool:'dgTool',controls:'dgControls',owner:'dgOwner'},
  oversight:{ovDecision:'ovDecision',ovAI:'ovAI',ovImpact:'ovImpact',ovReviewer:'ovReviewer',ovEvidence:'ovEvidence',ovAuthority:'ovAuthority',ovContest:'ovContest',ovMonitor:'ovMonitor'}
};
for(const t of Object.keys(FIELD_MAP)){
  const r=records[t];
  if(!r||!r.data) continue;
  const map=FIELD_MAP[t];
  for(const k of Object.keys(map)){
    const el=document.getElementById(map[k]);
    const val=r.data[k];
    if(el&&typeof val==='string') el.value=val;
  }
  if(t==='data'&&Array.isArray(r.data.signals)){
    document.querySelectorAll('.signal').forEach(c=>{ c.checked=r.data.signals.indexOf(c.value)>-1; });
  }
}
