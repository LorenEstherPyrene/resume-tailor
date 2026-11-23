(()=>{
  state.careerTools=state.careerTools||{evaluations:[],trendHistory:[],trendNotes:''};
  const $=selector=>document.querySelector(selector);
  const clamp=n=>Math.max(0,Math.min(100,Math.round(n)));
  function setTool(name){
    document.querySelectorAll('[data-tool-tab]').forEach(x=>x.classList.toggle('active',x.dataset.toolTab===name));
    document.querySelectorAll('[data-tool-panel]').forEach(x=>x.classList.toggle('active',x.dataset.toolPanel===name));
  }
  document.querySelectorAll('[data-tool-tab]').forEach(x=>x.onclick=()=>setTool(x.dataset.toolTab));

  function evidenceCoverage(){const ks=typeof words==='function'?words():[],text=typeof corpus==='function'?corpus():'';return ks.length?ks.filter(k=>text.includes(k)).length/ks.length:0}
  function evaluateJob(event){
    event.preventDefault();const form=event.currentTarget,data=new FormData(form),coverage=evidenceCoverage(),profileReady=Math.min(1,((state.profile.experiences||[]).length+Number(!!state.profile.skills)+Number(!!state.profile.education))/5),jdReady=Math.min(1,(state.job.jdText||'').trim().length/500),interest=Number(data.get('interest'))/5,feasibility=Number(data.get('feasibility'))/5;
    const parts=[['证据匹配',coverage],['资料准备',profileReady],['JD完整度',jdReady],['个人兴趣',interest],['现实可行性',feasibility]],score=clamp(coverage*35+profileReady*20+jdReady*15+interest*15+feasibility*15);
    const label=score>=80?'优先申请':score>=65?'值得准备':score>=45?'补证据后再决定':'暂缓投入';
    const gaps=[];if(coverage<.5)gaps.push('当前资料对 JD 关键词覆盖不足，先补充真实证据。');if(profileReady<.6)gaps.push('经历、技能或教育资料尚不完整。');if(jdReady<.5)gaps.push('JD 正文较短，分析结果可能失真。');if(feasibility<.6)gaps.push('地点、薪资或时间条件需要先确认。');
    $('#evaluationScore').textContent=score;$('#evaluationResult').innerHTML=`<div class="decision-head"><b>${label}</b><span>${score} / 100</span></div><div class="score-breakdown">${parts.map(x=>`<div class="score-line"><span>${x[0]}</span><i style="width:${clamp(x[1]*100)}%"></i><b>${clamp(x[1]*100)}</b></div>`).join('')}</div><ul class="decision-list">${(gaps.length?gaps:['当前资料基础较完整，可进入定向简历与投递准备。']).map(x=>`<li>${x}</li>`).join('')}</ul>`;
    state.careerTools.evaluations.unshift({id:Date.now(),company:String(data.get('company')||state.job.company||''),role:String(data.get('role')||state.job.jobTitle||''),score,label,notes:String(data.get('notes')||''),createdAt:new Date().toISOString()});state.careerTools.evaluations=state.careerTools.evaluations.slice(0,20);save();
  }
  const evaluationForm=$('#evaluationForm');if(evaluationForm){evaluationForm.onsubmit=evaluateJob;evaluationForm.company.value=state.job.company||'';evaluationForm.role.value=state.job.jobTitle||''}

  function auditResume(){
    const p=state.profile||{},paper=$('#resumePaper'),text=paper?.innerText.trim()||'',checks=[
      ['身份信息完整',p.name&&p.email&&p.location,'姓名、邮箱和所在地均已填写'],
      ['存在独立经历',(p.experiences||[]).length>0,'至少保存一份工作、项目或创作经历'],
      ['成果有事实依据',(p.experiences||[]).some(x=>/\d|交付|完成|上线|成果|提升|优化/.test(x.details||'')),'至少一份经历包含数字、交付物或可核实结果'],
      ['当前 JD 足够完整',(state.job.jdText||'').trim().length>=150,'建议粘贴完整职责和任职要求'],
      ['简历已经生成',text.length>=200,'成品区已有可编辑简历内容'],
      ['避免空栏目',text&&!/待填写|待补充/.test(text),'成品中没有“待填写”或“待补充”占位词'],
      ['篇幅可控',text.length>0&&text.length<5000,'正文存在且未超过约 5000 字'],
      ['作品证据可追溯',Boolean(state.portfolio?.text||(p.experiences||[]).length),'作品集或经历事实库至少存在一种证据来源']
    ];
    const passed=checks.filter(x=>x[1]).length;$('#auditSummary').innerHTML=`<strong>${passed} / ${checks.length} 项通过</strong><span>${passed===checks.length?'可以进入最终人工确认。':'优先处理黄色项目，再导出投递。'}</span>`;$('#auditGrid').innerHTML=checks.map(x=>`<article class="audit-item ${x[1]?'pass':'warn'}"><i>${x[1]?'✓':'!'}</i><div><b>${x[0]}</b><small>${x[2]}</small></div></article>`).join('');
  }
  const auditButton=$('#runResumeAudit');if(auditButton)auditButton.onclick=auditResume;

  const sourceMeta={github:['GitHub','仓库、Skill 与近期更新'],youtube:['YouTube','演示、访谈与教程'],reddit:['Reddit','使用反馈与社区讨论'],web:['网页资讯','新闻、博客与招聘信息']};
  function sourceUrl(source,topic){const q=encodeURIComponent(`${topic} after:${new Date(Date.now()-30*86400000).toISOString().slice(0,10)}`);if(source==='github')return`https://github.com/search?q=${q}&type=repositories&s=updated&o=desc`;if(source==='youtube')return`https://www.youtube.com/results?search_query=${q}`;if(source==='reddit')return`https://www.reddit.com/search/?q=${q}&sort=new`;return`https://www.google.com/search?q=${q}`}
  function renderTrendHistory(){const root=$('#trendHistory');if(!root)return;root.innerHTML=(state.careerTools.trendHistory||[]).slice(0,8).map(x=>`<div class="trend-history-item"><b>${esc(x.topic)}</b><span>${new Date(x.createdAt).toLocaleDateString('zh-CN')} · ${x.sources.length} 个来源</span></div>`).join('')}
  function buildTrendLinks(event){event.preventDefault();const data=new FormData(event.currentTarget),topic=String(data.get('topic')||'').trim(),sources=data.getAll('source');if(!sources.length)return toast('请至少选择一个信息来源');$('#trendLinks').innerHTML=sources.map(source=>`<a class="trend-link" href="${sourceUrl(source,topic)}" target="_blank" rel="noopener noreferrer"><b>${sourceMeta[source][0]}</b><small>${sourceMeta[source][1]}</small></a>`).join('');state.careerTools.trendHistory.unshift({topic,sources,createdAt:new Date().toISOString()});state.careerTools.trendHistory=state.careerTools.trendHistory.slice(0,20);save();renderTrendHistory();toast('已生成近30天研究入口')}
  const trendForm=$('#trendForm');if(trendForm)trendForm.onsubmit=buildTrendLinks;const trendNotes=$('#trendNotes');if(trendNotes){trendNotes.value=state.careerTools.trendNotes||'';trendNotes.oninput=()=>{state.careerTools.trendNotes=trendNotes.value;save()}}
  const end=new Date(),start=new Date(Date.now()-30*86400000);if($('#trendWindow'))$('#trendWindow').textContent=`${start.toLocaleDateString('zh-CN')} — ${end.toLocaleDateString('zh-CN')}`;renderTrendHistory();
})();
