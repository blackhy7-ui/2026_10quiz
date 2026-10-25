// Only this lazy-loaded module references the AI runtime. Quiz and booth remain offline-capable after loading.
const descriptors=[
 {text:'a close-up photo of a succulent with mostly green leaves'},
 {text:'a close-up photo of a succulent with visibly yellow leaves'},
 {text:'a close-up photo of a succulent with visibly wrinkled shriveled leaves'},
 {text:'a close-up photo of a succulent with smooth plump leaves'},
 {text:'a close-up photo of a succulent with red or purple leaves'},
 {text:'a photo of an object or scene without a plant'}
];
const names=['초록색 잎 설명','노란색 잎 설명','눈에 보이는 주름진 잎 설명','매끈하고 통통한 잎 설명','붉거나 보라색 잎 설명','식물이 없는 사진 설명'];
export function resultSummary(ranked){
 const nonPlant=ranked[0].index===5;
 const uncertain=nonPlant||ranked[0].score-ranked[1].score<.1;
 return {nonPlant,uncertain,title:nonPlant?'다육이 사진을 업로드해 주세요':uncertain?'특징을 구분하기 어려워요':'사진과 설명의 상대 유사도',note:nonPlant?'모델이 식물이 없는 사진 설명에 가장 높은 점수를 냈어요. 다육이가 아닌 사진이거나 식물이 잘 보이지 않을 수 있어요. 잎과 식물 전체가 선명하게 보이는 사진으로 다시 선택해 주세요.': '실제 CLIP 출력이에요. 설명을 바꾸면 점수도 달라지며, 점수는 특징이 맞을 확률이나 진단 정확도가 아니에요. 아래 순위만으로 물 부족·과습을 판단하지 않아요.'};
}
const KEY='succulent-home-v2';let modelPromise=null;
const getModel=()=>modelPromise??=(async()=>{let phase='runtime';try{const {pipeline,env}=await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1');env.allowLocalModels=false;phase='model';return await pipeline('zero-shot-image-classification','Xenova/clip-vit-base-patch32',{dtype:'q8',device:'wasm'});}catch(cause){modelPromise=null;const error=new Error('AI preparation failed',{cause});error.aiPhase=phase;throw error}})();
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
export function careAdvice({soil,leaf,drain,last},prediction=null){
 const lines=[];
 // Guidance depends on observations, never on CLIP as a diagnosis.
 if(leaf==='soft'||leaf==='yellow')lines.push('잎이 물렁하거나 변색했다면 과습 외에도 여러 원인이 있을 수 있어요. 물을 바로 추가하지 말고 잎·줄기·배수 상태를 확인하고, 증상이 번지면 운영자나 식물 전문가에게 물어보세요.');
 else if(soil==='wet'||soil==='moist')lines.push('흙에 수분이 남아 있어요. 지금은 물을 더 주지 말고 속흙이 마르는지 살펴보세요. 주름이 있어도 물 부족으로 단정하지 않아요.');
 else if(soil==='dry')lines.push(leaf==='wrinkled'?'속흙이 마르고 직접 확인한 잎에 주름이 있어요. 물주기를 고려하되 배수구·뿌리 상태·계절을 먼저 확인해요.':'속흙이 말랐어도 바로 물을 줄 필요가 있다고 단정할 수 없어요. 잎의 탄력과 식물 종류, 생장기인지 함께 살펴보세요.');
 else lines.push('먼저 속흙을 확인해요. 나무젓가락 등으로 안쪽까지 말랐는지 살펴보고, 확인이 어렵다면 물을 서둘러 추가하지 않아요.');
 if(drain==='no')lines.push('배수구가 없으면 물이 고이기 쉬워요. 배수 가능한 화분으로 옮기는 방법을 어른과 상의해요.');else if(drain==='unknown')lines.push('화분 바닥에 배수구가 있는지 먼저 확인해 주세요.');else lines.push('물줄 조건이 맞을 때는 배수구로 물이 빠지도록 주고, 받침에 고인 물은 버려요.');
 if(prediction)lines.push(`사진에서는 ‘${names[prediction[0].index]}’과의 상대 유사도가 가장 높았어요. 이는 특징의 확인이나 수분·질병 진단이 아니며, 직접 관찰한 상태가 우선이에요.`);
 if(last){const days=Math.round((new Date(today()+'T12:00:00')-new Date(last+'T12:00:00'))/86400000);if(Number.isFinite(days)&&days>=0)lines.push(`마지막 물주기 후 ${days}일이 지났어요. 지난 날짜만으로 다음 물주기를 정하지 않아요.`)}
 return lines;
}
export function mountDoctor(){
 const $=id=>document.getElementById(id);let url=null,revision=0,alive=true,busy=false,prediction=null;
 let logs=[];const fields=['soil','last','leaf','drain'];$('last').max=today();
 try{const saved=JSON.parse(localStorage.getItem(KEY))||JSON.parse(localStorage.getItem('succulent-care-v1'));if(saved){for(const key of fields)if(typeof saved[key]==='string')$(key).value=saved[key];$('plant-name').value=typeof saved.name==='string'?saved.name.slice(0,30):'';logs=Array.isArray(saved.logs)?saved.logs.filter(x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)).slice(0,50):[]}}catch{}
 function history(){$('water-history').textContent=logs.length?'최근 물주기 기록: '+logs.slice(0,8).join(' · '):'아직 물주기 기록이 없어요.'}history();
 const values=()=>({...Object.fromEntries(fields.map(k=>[k,$(k).value])),name:$('plant-name').value.trim(),logs});
 function invalidateCare(){$('care-result').classList.add('hidden')}
 fields.forEach(k=>$(k).onchange=invalidateCare);
 async function selectFile(event){const file=event.target.files?.[0];if(!file)return;revision++;prediction=null;invalidateCare();$('ai-output').classList.add('hidden');$('preview').classList.add('hidden');$('analyze').disabled=true;if(url){URL.revokeObjectURL(url);url=null}if(!file.type.startsWith('image/')){$('ai-status').textContent='사진 파일을 선택해 주세요.';return}if(file.size>20*1024*1024){$('ai-status').textContent='사진이 너무 커요. 20MB 이하의 사진을 선택해 주세요.';return}const own=revision;try{const temp=URL.createObjectURL(file);try{const image=new Image();image.src=temp;await image.decode();if(!alive||own!==revision)return;const scale=Math.min(1,1024/Math.max(image.width,image.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.9));if(!blob)throw Error('decode');if(!alive||own!==revision)return;url=URL.createObjectURL(blob);$('preview').src=url;$('preview').classList.remove('hidden');$('ai-status').textContent='사진이 준비됐어요. 모델 비교는 물 부족이나 병을 진단하지 않아요.';$('analyze').disabled=busy;}finally{URL.revokeObjectURL(temp)}}catch{if(!alive||own!==revision)return;$('ai-status').textContent='이 사진을 읽지 못했어요. JPEG 또는 PNG 사진으로 다시 선택해 주세요.'}}
 $('camera').onchange=selectFile;$('photo').onchange=selectFile;
 $('analyze').onclick=async()=>{if(!url||busy)return;busy=true;const own=revision,source=url;prediction=null;$('ai-output').classList.add('hidden');invalidateCare();$('analyze').disabled=true;$('camera').disabled=true;$('photo').disabled=true;let phase='download';$('ai-status').textContent='무료 이미지 모델을 내려받고 준비하고 있어요. 첫 실행에는 수 분이 걸릴 수 있어요. 퀴즈는 별도로 이용할 수 있어요.';try{const model=await getModel();if(!alive||own!==revision)return;phase='infer';$('ai-status').textContent='내 기기에서 사진과 설명의 상대 유사도를 비교하고 있어요…';const output=await model(source,descriptors.map(x=>x.text));if(!alive||own!==revision)return;const ranked=output.map(x=>({index:descriptors.findIndex(c=>c.text===x.label),score:x.score})).filter(x=>x.index>=0&&Number.isFinite(x.score)).sort((a,b)=>b.score-a.score);if(ranked.length!==descriptors.length)throw Error('invalid output');const {nonPlant,uncertain,title:heading,note:explanation}=resultSummary(ranked);prediction=uncertain?null:ranked;const out=$('ai-output');out.replaceChildren();const title=document.createElement('h3');title.textContent=heading;out.append(title);const note=document.createElement('p');note.textContent=explanation;out.append(note);const list=document.createElement('ul');list.className='scores';for(const r of ranked){const li=document.createElement('li');li.textContent=`${names[r.index]} · 상대 점수 ${r.score.toFixed(3)}`;const meter=document.createElement('meter');meter.min=0;meter.max=1;meter.value=r.score;meter.setAttribute('aria-label',names[r.index]);li.append(meter);list.append(li)}if(!nonPlant)out.append(list);out.classList.remove('hidden');$('ai-status').textContent=nonPlant?'다육이 사진을 다시 선택해 주세요. 사진만으로 다육식물 여부를 완벽하게 구분하지는 못해요.':'비교 완료 · CLIP ViT-B/32 · 기기 내 실행. 실제 관찰한 상태를 입력해 관리 방법을 확인해 주세요.';}catch(error){if(!alive||own!==revision)return;$('ai-status').textContent=phase==='download'?(error.aiPhase==='runtime'?'AI 실행 파일 다운로드에 실패했어요. 인터넷 연결과 브라우저의 외부 파일 차단 설정을 확인해 주세요. 사진 없는 관리 안내와 퀴즈는 계속 이용할 수 있어요.':'AI 모델 다운로드 또는 준비에 실패했어요. 모델 제공처 연결·브라우저 지원·기기 메모리를 확인해 주세요. 사진 없는 관리 안내와 퀴즈는 계속 이용할 수 있어요.'):'사진 추론에 실패했어요. 다른 사진이나 최신 브라우저로 다시 시도해 주세요. 분석 결과를 대신 만들어 표시하지 않아요.';}finally{busy=false;if(alive){$('analyze').disabled=!url;$('camera').disabled=false;$('photo').disabled=false}}};
 function validate(){if($('last').value&&$('last').value>today()){$('last').setCustomValidity('미래 날짜는 선택할 수 없어요.');$('last').reportValidity();return false}$('last').setCustomValidity('');return true}
 $('last').addEventListener('input',()=>$('last').setCustomValidity(''));
 function save(){try{localStorage.setItem(KEY,JSON.stringify(values()));$('saved').textContent='날짜와 선택값을 이 기기에 저장했어요. 사진은 저장하지 않았어요.'}catch{$('saved').textContent='이 브라우저에서는 기록을 저장할 수 없어요. 현재 화면에서는 계속 이용할 수 있어요.'}}
 $('care').onclick=()=>{if(!validate())return;save();const result=$('care-result');result.replaceChildren();const heading=document.createElement('h2');heading.textContent='우리 다육이 관리 안내';result.append(heading);for(const text of careAdvice(values(),prediction)){const p=document.createElement('p');p.textContent=text;result.append(p)}const light=document.createElement('p');light.textContent='☀️ 밝고 통풍이 되는 곳에서 키워요. 어두운 곳에서 갑자기 강한 직사광선으로 옮기지 말고 서서히 적응시켜요. 고온·저온과 잎 사이에 오래 고이는 물을 주의해요. 겨울 휴면기나 뿌리가 다친 뒤에는 물주기를 더 신중히 판단해요.';result.append(light);result.classList.remove('hidden');result.scrollIntoView({behavior:'smooth',block:'start'})};
 $('water').onclick=()=>{if(!confirm('오늘 실제로 물을 주었나요? 기록을 위해 물을 주지는 마세요.'))return;$('last').value=today();$('last').setCustomValidity('');if(logs[0]!==today())logs.unshift(today());logs=logs.slice(0,50);save();history();invalidateCare()};
 $('clear-care').onclick=()=>{if(!confirm('이 기기에 저장된 관리 기록을 삭제할까요?'))return;try{localStorage.removeItem(KEY);localStorage.removeItem('succulent-care-v1');$('saved').textContent='기기 관리 기록을 삭제했어요.'}catch{$('saved').textContent='저장소 접근에 실패했어요. 브라우저 설정에서 사이트 데이터를 삭제할 수 있어요.'}for(const k of fields)$(k).value=k==='last'?'':'unknown';$('plant-name').value='';logs=[];history();invalidateCare()};
 return ()=>{alive=false;revision++;if(url)URL.revokeObjectURL(url)};
}
