// Reuses the same form and result nodes: changing steps never uploads or resets a photo.
export function mountMobileDoctor(){

 const app=document.querySelector('#app'),cards=app.querySelector(':scope > .cards');
 if(!cards)return ()=>{};
 const [photo,form]=cards.children,guide=cards.nextElementSibling,result=document.querySelector('#care-result'),ai=document.querySelector('#ai-output');
 const disclaimer=result.nextElementSibling;
 const pages=[];
 function page(title,node){node.classList.add('doctor-page');pages.push({title,node});return node}
 const root=document.createElement('section');root.className='doctor-wizard';
 const select=document.createElement('select');select.setAttribute('aria-label','주치의 화면 선택');
 const banner=document.createElement('div');banner.className='doctor-page-menu';banner.append(select);
 const stage=document.createElement('div');
 const controls=document.createElement('div');controls.className='actions doctor-controls';
 const prev=document.createElement('button'),next=document.createElement('button');prev.className='btn secondary';next.className='btn';prev.type=next.type='button';controls.append(prev,next);
 root.append(banner,stage,controls);
 const title=app.querySelector('h1');title.textContent='우리 다육이 주치의';
 const intro=title.nextElementSibling;if(intro?.tagName==='P')intro.textContent='종류 알아보기와 물주기를 따로 이용해요.';
 ai.remove();const analysis=document.createElement('section');analysis.className='card analysis-page';analysis.innerHTML='<h2>선택한 사진 분석하기</h2><p class="muted">사진은 기기 안에서만 처리해요. 첫 실행에는 무료 모델 다운로드가 필요해요.</p>';analysis.append(document.getElementById('preview'),document.getElementById('analyze'),document.getElementById('ai-status'));const openAnalysis=document.createElement('button');openAnalysis.type='button';openAnalysis.className='btn';openAnalysis.textContent='선택한 사진 분석하기 →';photo.append(openAnalysis);page('사진 선택',photo);
 const first=document.createElement('section');first.className='card';first.innerHTML='<h2>흙과 물주기</h2>';
 for(const id of ['plant-name','soil','last']){const input=document.getElementById(id),label=form.querySelector(`[for="${id}"]`);first.append(label,input)}page('흙·날짜 입력',first);
 const second=document.createElement('section');second.className='card';second.innerHTML='<h2>잎과 배수구</h2>';
 for(const id of ['leaf','drain']){const input=document.getElementById(id),label=form.querySelector(`[for="${id}"]`);second.append(label,input)}second.append(document.getElementById('care'));page('잎·배수구 입력',second);
 const aiPage=document.createElement('section');aiPage.className='card';aiPage.append(ai);page('사진 비교 결과',aiPage);
 page('관리 안내',result);
 const record=document.createElement('section');record.className='card';record.innerHTML='<h2>물주기 기록</h2><p class="muted">실제로 물을 준 날에만 기록해요. 날짜만 보고 물주기를 결정하지 않아요.</p>';
 record.append(document.getElementById('water').parentElement,document.getElementById('water-history'),document.getElementById('saved'));page('기록·삭제',record);
 const groups=[...guide.querySelector('.cards').children];
 const guideIntro=document.createElement('section');guideIntro.className='card';guideIntro.innerHTML='<h2>부스 다육이 6가지</h2><p>어제 제공한 부스 식물 자료를 바탕으로 그림과 관리법을 모았어요. 그림은 설명용 삽화이며 이름은 외형별 후보예요. 정확한 품종은 이름표로 확인해요.</p><img class="guide-plant" src="assets/succulent-garden.webp" alt="세 화분의 다육식물">';page('외형 안내 시작',guideIntro);
 groups.forEach((g,i)=>{const card=document.createElement('section');card.className='card';card.innerHTML=`<span class="tag">외형 안내 ${i+1} / 6</span>`;card.append(g);page(`부스 다육이 ${String.fromCharCode(65+i)} · 관리법`,card)});
 const tips=document.createElement('section');tips.className='card';tips.innerHTML='<h2>함께 기억할 관리법</h2>';tips.append(guide.querySelector('.checklist'),guide.lastElementChild);page('기본 관리법',tips);
 const about=document.createElement('section');about.className='card';about.innerHTML='<h2>사진 분석 안내</h2>';about.append(disclaimer);page('분석의 한계',about);page('사진 분석 실행',analysis);
 cards.replaceWith(root);guide.remove();form.remove();app.querySelector('.footer')?.remove();
 pages.forEach(({title,node},i)=>{stage.append(node);const option=document.createElement('option');option.value=i;option.textContent=title;select.append(option)});
 let index=0,currentGroup=null;const subState=new Map();
 const hub=document.createElement('div');hub.className='doctor-hub';root.prepend(hub);
 const sectionBack=document.createElement('button');sectionBack.type='button';sectionBack.className='back section-back';sectionBack.textContent='← 주치의 메뉴';banner.prepend(sectionBack);sectionBack.onclick=()=>showHub();
 const groupsBySection={kinds:[0,15,3,6,7,8,9,10,11,12,14],water:[1,2,4,5,13]};
 function resultParts(node){
  const heading=node.querySelector('h2,h3');
  if(node===result)return [...node.children].filter(x=>x!==heading).map(p=>[heading,p]);
  const paras=[...node.children].filter(x=>x.tagName==='P'),lis=[...node.querySelectorAll('li')];
  return [...paras.map(p=>[heading,p].filter(Boolean)),...Array.from({length:Math.ceil(lis.length/3)},(_,i)=>[heading,...lis.slice(i*3,i*3+3)])];
 }
 function visiblePages(){return groupsBySection[currentGroup||'kinds'].filter(i=>i!==3||!ai.classList.contains('hidden')).filter(i=>i!==4||!result.classList.contains('hidden'))}
 function showHub(group=null){intro?.classList.remove('wizard-off');currentGroup=group;hub.classList.remove('wizard-off');banner.classList.add('wizard-off');stage.classList.add('wizard-off');controls.classList.add('wizard-off');
  if(!group){hub.innerHTML=`<div class="doctor-category-grid"><button type="button" class="doctor-category" data-section="kinds"><img src="assets/plant-a.webp" alt=""><div><span class="tag">종류 · 사진</span><h2>어떤 다육이일까요?</h2><p>그림으로 종류를 살펴보고<br>AI로 사진 특징을 비교해요.</p><b>종류 알아보기 →</b></div></button><button type="button" class="doctor-category" data-section="water"><img src="assets/succulent-garden.webp" alt=""><div><span class="tag">물주기 · 기록</span><h2>물 줘도 될까요?</h2><p>흙과 잎 상태로 관리법을 보고<br>물 준 날을 기록해요.</p><b>물주기 도우미 →</b></div></button></div>`;hub.querySelector('[data-section="kinds"]').onclick=()=>showHub('kinds');hub.querySelector('[data-section="water"]').onclick=()=>{currentGroup='water';show(1)}}
  else{hub.innerHTML=`<button type="button" class="back hub-back">← 주치의 메뉴</button><button type="button" class="btn photo-entry">📷 AI 사진 특징 비교</button><p class="kind-hint">품종을 확정하는 기능은 아니에요. 아래 그림과도 비교해요.</p><div class="kind-picker">${groups.slice(0,6).map((g,i)=>`<button type="button" data-kind="${i+7}"><img src="assets/plant-${String.fromCharCode(97+i)}.webp" alt=""><span>${g.querySelector('h3').textContent.replace(/^[A-F] · /,'')}</span></button>`).join('')}</div>`;hub.querySelector('.hub-back').onclick=()=>showHub();hub.querySelector('.photo-entry').onclick=()=>show(0);hub.querySelectorAll('[data-kind]').forEach(b=>b.onclick=()=>show(Number(b.dataset.kind)))}window.scrollTo(0,0);
 }
 function show(i,sub=0){intro?.classList.add('wizard-off');index=i;if([1,2,4,5,13].includes(i))currentGroup='water';else currentGroup='kinds';hub.classList.add('wizard-off');banner.classList.remove('wizard-off');stage.classList.remove('wizard-off');controls.classList.remove('wizard-off');pages.forEach((p,j)=>p.node.classList.toggle('wizard-off',j!==i));select.value=i;
  for(const opt of select.options){opt.hidden=!groupsBySection[currentGroup].includes(Number(opt.value));opt.disabled=!visiblePages().includes(Number(opt.value))}
  sectionBack.textContent=currentGroup==='kinds'?'← 종류 목록':'← 주치의 메뉴';sectionBack.onclick=()=>showHub(currentGroup==='kinds'?'kinds':null);
  const output=i===3?ai:i===4?result:null;let count=1;if(output){const parts=resultParts(output);count=Math.max(parts.length,1);sub=Math.min(Math.max(0,sub),count-1);subState.set(i,sub);output.querySelectorAll('h2,h3,p,li').forEach(el=>el.classList.toggle('wizard-off',!parts[sub]?.includes(el)))}
  prev.disabled=false;prev.textContent='← 이전';const available=visiblePages(),last=available.indexOf(i)===available.length-1;
  next.textContent=sub<count-1?'다음 안내 →':i===15||i===14||i===12?'종류 목록으로':last?'주치의 메뉴로':'다음 →';root.dataset.sub=sub;root.dataset.count=count;window.scrollTo(0,0);
 }
 openAnalysis.onclick=()=>show(15);
 prev.onclick=()=>{if(index===15)return show(0);const sub=Number(root.dataset.sub);if(sub>0)return show(index,sub-1);const available=visiblePages(),p=available.indexOf(index);if(p>0)show(available[p-1],subState.get(available[p-1])||0);else showHub(currentGroup==='kinds'?'kinds':null)};
 next.onclick=()=>{const sub=Number(root.dataset.sub),count=Number(root.dataset.count);if(sub<count-1)return show(index,sub+1);if([15,14,12].includes(index))return showHub('kinds');const available=visiblePages(),p=available.indexOf(index);if(p<available.length-1)show(available[p+1]);else showHub()};
 select.onchange=()=>show(Number(select.value));const invalidDate=()=>show(1);document.getElementById('last').addEventListener('invalid',invalidDate);
 const observers=[];for(const [node,i] of [[ai,3],[result,4]]){let wasVisible=!node.classList.contains('hidden');const observer=new MutationObserver(records=>{const visible=!node.classList.contains('hidden');if(visible&&(!wasVisible||records.some(r=>r.type==='childList')))show(i);else if(!visible&&index===i)show(1);wasVisible=visible;});observer.observe(node,{childList:true,attributes:true,attributeFilter:['class']});observers.push(observer)}
 showHub();return ()=>{observers.forEach(o=>o.disconnect());document.getElementById('last')?.removeEventListener('invalid',invalidDate)};
}
