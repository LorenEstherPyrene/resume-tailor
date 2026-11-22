(()=>{
  const statuses=['准备中','已投递','面试中','等待结果','已结束'];
  state.applications=Array.isArray(state.applications)?state.applications:[];
  const countText=value=>String(value||'').trim().length;
  function profileScore(){
    const p=state.profile||{},checks=[p.name,p.email,p.location,p.degree,p.selfEvaluation,p.education,p.skills];
    const filled=checks.filter(countText).length+(p.experiences?.length?2:0)+(state.portfolio?.text?1:0);
    return Math.min(100,Math.round(filled/10*100));
  }
  function readiness(){
    const p=state.profile||{},exp=p.experiences||[];
    return [
      ['基础资料',[p.name,p.email,p.location,p.degree].filter(countText).length/4],
      ['经历证据',Math.min(1,exp.length/3)],
      ['技能与教育',[p.skills,p.education].filter(countText).length/2],
      ['作品集',state.portfolio?.text?.trim()?1:0]
    ];
  }
  function renderEvidence(){
    const p=state.profile||{},exp=p.experiences||[],withResults=exp.filter(x=>/\d|成果|完成|上线|交付|增长|提升|优化/.test(x.details||'')).length;
    const rows=[
      ['独立经历',exp.length,'工作、项目或创作经历'],
      ['含成果证据',withResults,'包含数字、交付物或可核实结果'],
      ['作品集材料',state.portfolio?.text?.trim()?1:0,'与原始简历分开保存'],
      ['技能条目',String(p.skills||'').split(/[、，,；;\n]/).filter(x=>x.trim()).length,'仅使用资料中已有技能']
    ];
    const root=document.querySelector('#evidenceRings');
    if(root)root.innerHTML=rows.map(x=>`<div class="evidence-row"><span>${x[0]}</span><b>${x[1]}</b><small>${x[2]}</small></div>`).join('');
  }
  function renderApplications(){
    const root=document.querySelector('#applicationBoard');if(!root)return;
    if(!state.applications.length){root.innerHTML='<div class="application-empty">还没有申请记录。添加岗位后，可在这里持续跟进下一节点。</div>';return}
    root.innerHTML=statuses.map(status=>`<section class="application-column"><h4>${status} · ${state.applications.filter(x=>x.status===status).length}</h4>${state.applications.filter(x=>x.status===status).map(x=>`<article class="application-item"><b>${esc(x.role)}</b><span>${esc(x.company)}</span>${x.nextDate?`<small>下一节点 ${esc(x.nextDate)}</small>`:''}<button type="button" data-remove-app="${x.id}" aria-label="删除 ${esc(x.company)} ${esc(x.role)}">×</button></article>`).join('')}</section>`).join('');
    root.querySelectorAll('[data-remove-app]').forEach(button=>button.onclick=()=>{state.applications=state.applications.filter(x=>x.id!==button.dataset.removeApp);save();renderHub()});
  }
  function renderHub(){
    const score=profileScore();
    const metrics={hubCompleteness:score+'%',hubEvidence:(state.profile.experiences||[]).length,hubResumes:(state.resumes||[]).length,hubApplications:state.applications.length};
    Object.entries(metrics).forEach(([id,value])=>{const el=document.querySelector('#'+id);if(el)el.textContent=value});
    const target=document.querySelector('#hubTargetRole');if(target&&document.activeElement!==target)target.value=state.profile.target||'';
    const list=document.querySelector('#readinessList');if(list)list.innerHTML=readiness().map(([label,value])=>`<div class="readiness-item"><span>${label}</span><div class="readiness-track"><i style="width:${Math.round(value*100)}%"></i></div><em>${Math.round(value*100)}%</em></div>`).join('');
    renderEvidence();renderApplications();
  }
  const target=document.querySelector('#hubTargetRole');if(target)target.oninput=()=>{state.profile.target=target.value;save();renderHub()};
  const form=document.querySelector('#applicationForm');if(form)form.onsubmit=e=>{e.preventDefault();const data=new FormData(form);state.applications.unshift({id:'app_'+Date.now(),company:String(data.get('company')||'').trim(),role:String(data.get('role')||'').trim(),status:String(data.get('status')||'准备中'),nextDate:String(data.get('nextDate')||'')});save();form.reset();renderHub();toast('已添加申请记录')};
  const portfolio=document.querySelector('#hubOpenPortfolio');if(portfolio)portfolio.onclick=()=>document.querySelector('#portfolioDialog')?.showModal();
  document.querySelectorAll('[data-panel="hub"],[data-go="hub"]').forEach(button=>button.addEventListener('click',()=>setTimeout(renderHub)));
  window.renderCareerHub=renderHub;renderHub();
})();
