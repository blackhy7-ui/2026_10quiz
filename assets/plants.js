// Based on the user's six appearance groups, not confirmed cultivar identifications.
export const boothPlants=[
 {id:'a',title:'A · 청록색 넓은 잎형',candidate:'에케베리아 계열 후보 · 품종 미확인',feature:'넓고 도톰한 청록색 잎이 꽃처럼 모여요.',light:'밝은 곳에서 키우고 강한 햇빛에는 천천히 적응시켜요.',water:'속흙이 충분히 마른 뒤 잎·뿌리 상태도 확인해요.',caution:'붉은 잎끝만으로 품종이나 건강을 판단하지 않아요.'},
 {id:'b',title:'B · 초록색 윤광형',candidate:'아에오니움 등 후보 · 품종 미확인',feature:'둥근 초록 잎이 겹쳐 모이고 표면에 윤기가 보여요.',light:'밝고 통풍이 잘되는 곳에 두고 여름 과열을 피해요.',water:'정해진 주기보다 흙의 마름과 생장 상태를 확인해요.',caution:'아에오니움으로 확인되면 여름 휴면 여부도 확인해요.'},
 {id:'c',title:'C · 붉은 잎끝형',candidate:'에케베리아 계열 후보 · 품종 미확인',feature:'뾰족한 잎끝과 가장자리에 붉은색이 보여요.',light:'밝은 곳에서 키우되 갑자기 강한 햇빛에 내놓지 않아요.',water:'속흙과 잎 상태를 확인하고 받침의 고인 물은 버려요.',caution:'붉은색을 진하게 만들려고 과도한 햇빛을 쬐지 않아요.'},
 {id:'d',title:'D · 은청색 긴 잎형',candidate:'그라프토페탈룸·교배종 등 후보',feature:'길고 뾰족한 잎에 은청색의 하얀 분이 보여요.',light:'밝은 곳에서 서서히 빛에 적응시키고 통풍을 챙겨요.',water:'속흙이 마른지 확인한 뒤 흙 쪽으로 물을 줘요.',caution:'잎의 하얀 분은 문지르면 지워져요. 만지지 않아요.'},
 {id:'e',title:'E · 분홍색 줄기형',candidate:'계열·품종 미확인',feature:'작은 초록·분홍 잎이 줄기를 따라 층층이 자라요.',light:'밝은 간접광에서 키우며 강한 햇빛은 서서히 늘려요.',water:'속흙이 마른지 확인하고 배수·통풍을 함께 살펴요.',caution:'아나캄프세로스나 크라슐라로 이름을 확정하지 않아요.'},
 {id:'f',title:'F · 연두색 둥근 잎형',candidate:'에케베리아·세데베리아 등 후보',feature:'밝은 연두색의 둥글고 통통한 잎이 모여 있어요.',light:'밝고 통풍이 잘되는 곳에 두고 여름 과열을 피해요.',water:'날짜보다 속흙과 잎 상태를 보고 물주기를 결정해요.',caution:'배수구 있는 화분을 쓰고 잎을 깊이 묻지 않아요.'}
];
export function plantProfiles(){return boothPlants.map(p=>`<article class="plant-profile"><h3>${p.title}</h3><figure class="plant-figure"><img class="plant-reference" src="assets/plant-${p.id}.webp" alt="${p.title.slice(4)}의 특징을 표현한 설명용 삽화" width="384" height="384" loading="lazy"><figcaption>설명용 삽화</figcaption></figure><p class="plant-feature">${p.feature}</p><p class="plant-candidate">${p.candidate}</p><dl class="plant-care"><div><dt>☀️ 햇빛</dt><dd>${p.light}</dd></div><div><dt>💧 물주기</dt><dd>${p.water}</dd></div><div><dt>🌱 주의</dt><dd>${p.caution}</dd></div></dl></article>`).join('')}
