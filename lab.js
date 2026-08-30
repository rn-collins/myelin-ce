/* Myelin applied lab — enhancement only.
   All three courses, every lesson and all eight questions each, are already in
   lab.html and readable with scripting turned off. This file adds: attestation
   memory, scenario notes, scoring with feedback, and the browser-local record.
   Nothing is transmitted; every value lives in this browser's local storage. */
(function(){
  var ANSWERS={"evidence":[[1,"Bundled claims require different evidence and should be separated before research."],[1,"Publication status alone does not establish fit between the study and the vendor claim."],[1,"Absolute baseline and uncertainty are necessary to interpret relative change."],[1,"Procedural status is part of the legal proposition."],[1,"Citation placement alone cannot replace support analysis."],[1,"A citation you cannot inspect cannot complete verification."],[1,"Material limitations define the boundary of support."],[1,"Reproducibility—not fluency—is the completion standard."]],"privacy":[[1,"Classification and authority come before tool selection."],[1,"Minimization is a safeguard, not permission."],[1,"Controls must be verified for the actual product and configuration."],[0,"A secure transfer can still support an unauthorized purpose."],[1,"Unknown reuse is a decision-relevant uncertainty."],[0,"Public availability is only one part of the analysis."],[1,"Material system changes can alter exposure and authorization."],[1,"A reproducible decision record captures the full use context."]],"governance":[[1,"Triage can change access and delay even without issuing the final decision."],[1,"Human presence without time and authority is not effective control."],[1,"Aggregate performance cannot erase concentrated harm."],[1,"A challenge process must be usable and capable of changing the outcome."],[1,"Override patterns are operational evidence requiring investigation."],[1,"Release evidence must fit the actual use, population, and version."],[1,"Verification of the fix is part of closure."],[1,"People, policy, interfaces, data, incentives, and downstream actions shape risk."]]};
  var LESSONS=6, PASS=7, TOTAL=8;

  /* Attestations, scenario boxes and scoring need scripting, so they ship hidden. */
  [].forEach.call(document.querySelectorAll('[data-jsonly]'),function(el){ el.hidden=false; });

  function read(k){ try{ return JSON.parse(localStorage.getItem(k)||'{}')||{}; }catch(e){ return {}; } }
  function write(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }

  [].forEach.call(document.querySelectorAll('.course'),function(sec){
    var id=sec.getAttribute('data-course'),
        code=sec.getAttribute('data-code'),
        storeKey=sec.getAttribute('data-key'),
        answers=ANSWERS[id];
    if(!answers) return;

    var blank={lessons:[false,false,false,false,false,false],attempts:[],passed:false,notes:{},completedAt:null,recordId:null};
    var state=Object.assign({},blank,read(storeKey));
    if(!Array.isArray(state.lessons)||state.lessons.length!==LESSONS) state.lessons=blank.lessons.slice();
    if(!Array.isArray(state.attempts)) state.attempts=[];
    if(!state.notes||typeof state.notes!=='object') state.notes={};

    var boxes=[].slice.call(sec.querySelectorAll('input[data-i]')),
        notes=[].slice.call(sec.querySelectorAll('textarea[data-note]')),
        progressText=sec.querySelector('.progressText'),
        bar=sec.querySelector('.bar'),
        quiz=sec.querySelector('form'),
        result=sec.querySelector('.result'),
        record=sec.querySelector('.record'),
        completed=sec.querySelector('.completed'),
        score=sec.querySelector('.score'),
        recordId=sec.querySelector('.recordId');

    function finalize(){
      var passing=null;
      for(var i=state.attempts.length-1;i>=0;i--){ if(state.attempts[i]&&state.attempts[i].score>=PASS){ passing=state.attempts[i]; break; } }
      if(passing&&state.lessons.every(Boolean)&&!state.passed){
        state.passed=true;
        state.completedAt=new Date().toISOString();
        state.completionScore=passing.score;
        state.recordId='MY-'+code+'-'+((crypto&&crypto.randomUUID)?crypto.randomUUID().slice(0,8):String(Date.now()).slice(-8)).toUpperCase();
      }
    }
    function save(){ finalize(); write(storeKey,state); render(); }

    function render(){
      boxes.forEach(function(b,i){ b.checked=!!state.lessons[i]; });
      notes.forEach(function(t,i){ if(document.activeElement!==t) t.value=state.notes[i]||''; });
      var n=state.lessons.filter(Boolean).length;
      progressText.textContent=n+' of '+LESSONS+' lessons complete';
      bar.style.width=(n/LESSONS*100)+'%';
      var last=state.attempts[state.attempts.length-1];
      result.textContent=last?('Latest: '+last.score+'/'+TOTAL+' · '+(last.score>=PASS?'mastery met':'review the feedback and retry')+' · '+state.attempts.length+' attempt(s)'):'';
      record.classList.toggle('show',!!state.passed);
      if(state.passed){
        completed.textContent=new Date(state.completedAt).toLocaleString();
        var cs=(state.completionScore!=null)?state.completionScore:(last?last.score:PASS);
        score.textContent=cs+'/'+TOTAL;
        recordId.textContent=state.recordId;
      }
    }

    boxes.forEach(function(b,i){ b.addEventListener('change',function(){ state.lessons[i]=b.checked; save(); }); });
    notes.forEach(function(t,i){ t.addEventListener('change',function(){ state.notes[i]=t.value; write(storeKey,state); }); });

    quiz.addEventListener('submit',function(e){
      e.preventDefault();
      var f=new FormData(quiz), s=0, prefix=sec.getAttribute('data-prefix');
      answers.forEach(function(a,i){
        var ok=Number(f.get(prefix+'-q'+i))===a[0];
        if(ok) s++;
        var el=document.getElementById(prefix+'-fb'+i);
        el.textContent=(ok?'Correct. ':'Review: ')+a[1];
        el.className='feedback '+(ok?'correct':'incorrect');
      });
      state.attempts.push({score:s,at:new Date().toISOString()});
      save();
      if(s>=PASS&&!state.lessons.every(Boolean)){
        result.textContent='Mastery met. Complete all six lesson scenarios to unlock the record.';
      }
    });

    var printBtn=sec.querySelector('.printBtn'), exportBtn=sec.querySelector('.exportBtn'), deleteBtn=sec.querySelector('.deleteBtn');
    printBtn.addEventListener('click',function(){ window.print(); });
    exportBtn.addEventListener('click',function(){
      var payload=Object.assign({schema:'myelin-noncredit-record',version:2,course:code,credit:0,credential:'non-credit record'},state);
      var a=document.createElement('a');
      a.href=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
      a.download=code.toLowerCase()+'-record.json'; a.click();
      setTimeout(function(){ URL.revokeObjectURL(a.href); },0);
    });
    deleteBtn.addEventListener('click',function(){
      if(!confirm('Delete '+code+' progress, notes, and attempts from this browser?')) return;
      try{ localStorage.removeItem(storeKey); }catch(e){}
      state=Object.assign({},blank); state.lessons=blank.lessons.slice(); state.notes={}; state.attempts=[];
      quiz.reset();
      [].forEach.call(sec.querySelectorAll('.feedback'),function(x){ x.textContent=''; x.className='feedback'; });
      render();
    });

    render();
  });

  /* Deep links of the form /lab?course=evidence still land on the right course. */
  var want=new URLSearchParams(location.search).get('course');
  var target=want&&document.getElementById('c-'+want);
  if(target&&!location.hash){
    target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
    [].forEach.call(document.querySelectorAll('.picker .pill'),function(a){
      a.classList.toggle('active',a.getAttribute('data-id')===want);
    });
  }
})();
