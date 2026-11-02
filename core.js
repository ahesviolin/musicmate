export const DOMAINS = [
 ['music','음악적 반응','소리에 귀 기울임 · 소리의 차이 구별'],
 ['expression','능동적 표현','스스로 소리 내기 · 원하는 소리 표현'],
 ['interaction','상호작용','소리 주고받기 · 안내와 제안에 반응'],
 ['posture','신체·자세','악기 올리기 · 활 잡기 · 자세 유지'],
 ['attention','집중도','활동 지속 · 주의 전환 후 복귀']
];
export const SCALE=['거의 관찰되지 않음','드물게 (촉구가 많이 필요)','때때로','자주','수업 전반에서 일관됨'];
export const SOAP=[['S','관찰된 모습'],['O','수업 내용'],['A','평가'],['P','다음 계획']];
export const AI_INSTRUCTIONS=`음악교육 수업 기록을 정리한다. 장애의 사회모델·자립생활모델의 관점으로 음악적 반응, 표현, 참여를 기록한다.
1. 각 점수에 원문에서 가져온 근거 문장을 붙인다. 근거가 없으면 점수는 null로 둔다.
2. 원문에 없는 사실을 만들지 않는다.
3. 진단, 의학적 해석, 증상 판단을 쓰지 않는다. 음악 활동과 행동만 기록한다.
4. '하기 싫어함', '산만함' 같은 판단하는 표현은 상황과 행동을 쓰는 표현으로 바꾸어 제안한다. 원래 표현과 바꾼 표현을 함께 돌려준다. 행동 근거가 부족하면 확인 질문을 남긴다.
5. 수업 전 상황, 악기 변화, 컨디션처럼 점수에 영향을 준 요인은 A에 적는다. 낮은 점수를 발달의 후퇴로 해석하지 않는다.
6. 동반자나 가족의 사적인 정보는 기록에서 뺀다.
7. 어려웠던 장면, 거부, 촉구가 필요했던 순간을 지우거나 순화하지 않는다. 표현은 바꾸되 사실은 남긴다.
8. JSON으로 출력한다: scores: {영역키: {value: 1~5 또는 null, evidence: 원문 문장}}, soap: {S,O,A,P}, changes: [{id, original, replacement, section}], questions: [질문].
영역: music 음악적 반응, expression 능동적 표현, interaction 상호작용, posture 신체·자세, attention 집중도.
점수: 1 거의 관찰되지 않음 / 2 드물게(촉구가 많이 필요) / 3 때때로 / 4 자주 / 5 수업 전반에서 일관됨.
SOAP: S 관찰된 모습 / O 수업 내용(활동 순서대로) / A 평가(진전, 어려움과 원인으로 보이는 것, 발견한 강점) / P 다음 계획.`;
export const SAMPLE=`3시 40분에 왔는데 편의점에 가려다 못 가서 속상한 상태로 들어왔어요.
나무 음표판에 사인펜으로 그리길래 다른 친구들도 쓰는 거라 종이에 그리자고 했더니
종이에 그렸어요. 4시에 수업 시작했는데 집에서 1/2 악기를 가져와서 무거워하고
하기 싫어했어요. 활을 주먹으로 쥐었어요. 교실의 1/4 악기로 바꿔서 20분 정도 했어요.
비행기 노래 배우고 싶냐니까 고개는 끄덕였는데 악기는 안 들었어요.
나중엔 의자에 웅크리고 잠들었어요. 활동지원사님 통해 어머니께 말씀드리고
금요일 낮에 보강하기로 했어요.`;
export const studentsSeed=[
 {code:'A01',age:'만 6세',instrument:'바이올린',size:'1/4',program:'초록숨 · 1:1 40분',preferences:'분홍색 사인펜, 그리기·오리기, 작은 피규어',avoidance:'미입력',communication:'미입력',motivation:'보상 약속에 긍정 반응',companion:'활동지원사',schedule:'미입력',goal:'미입력',planned:2},
 {code:'B02',age:'만 9세',instrument:'바이올린',size:'1/2',program:'초록숨 · 1:1 40분',preferences:'리듬 놀이, 박수',avoidance:'큰 소리',communication:'미입력',motivation:'미입력',companion:'보호자',schedule:'미입력',goal:'미입력',planned:1}
];
export const clone = x=>structuredClone(x);
export const normalize = s=>s.replace(/\s+/g,' ').trim();
export function maskNames(raw,bindings){
 const entries=bindings.filter(x=>x.name.trim()).sort((a,b)=>b.name.length-a.name.length);
 if(!entries.length)return raw;
 const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const lookup=new Map(entries.map(x=>[x.name,x.code]));
 return raw.replace(new RegExp(entries.map(x=>escape(x.name)).join('|'),'g'),name=>lookup.get(name));
}
export function verifyEvidence(scores,source){
 return Object.fromEntries(DOMAINS.map(([id])=>{
  const s=scores[id];return [id,{...s,verification:!s.evidence.trim()?(s.value===null?'empty':'missing'):normalize(source).includes(normalize(s.evidence))?'matched':'missing'}];
 }));
}
export function blankDraft(){return {mode:'manual',scores:Object.fromEntries(DOMAINS.map(([id])=>[id,{value:null,evidence:''}])),soap:{S:'',O:'',A:'',P:''},changes:[],questions:['예시와 다른 원문입니다. 실제 AI 연결 전까지 점수와 서술을 강사가 직접 작성해 주세요.']};}
export function sampleDraft(){return {mode:'example',scores:{
 music:{value:null,evidence:''},expression:{value:null,evidence:''},
 interaction:{value:3,evidence:'비행기 노래 배우고 싶냐니까 고개는 끄덕였는데 악기는 안 들었어요.'},
 posture:{value:null,evidence:'활을 주먹으로 쥐었어요.'},
 attention:{value:null,evidence:'교실의 1/4 악기로 바꿔서 20분 정도 했어요.'}
 },soap:{
 S:'수업 전 편의점에 가지 못해 속상한 상태로 들어왔다고 기록됨. 수업 후반 의자에 웅크리고 잠들었다.',
 O:'① 나무 음표판에 그림을 그렸다. 종이에 그리자는 안내 후 종이에 그렸다.\n② 4시 수업 시작. 집에서 가져온 1/2 악기를 무거워했다고 기록됨. 악기를 하려 하지 않았다고 기록됨(당시 구체적인 행동 확인 필요). 활을 주먹으로 쥐었다.\n③ 교실의 1/4 악기로 바꾸어 약 20분 활동했다.\n④ 비행기 노래 제안에 고개를 끄덕였으나 악기는 들지 않았다.\n⑤ 이후 의자에 웅크리고 잠들었다.',
 A:'종이에 그리자는 안내에 반응했고, 노래 제안에 고개를 끄덕이는 반응이 관찰되었다. 수업 전 상황, 1/2 악기의 무게, 악기 교체, 후반에 잠든 상황을 참여를 이해할 맥락으로 함께 고려한다. 상황과 참여의 인과관계는 확정할 수 없다. 소리 구별이나 자발적 소리 표현에 관한 근거는 없다. 활 잡기와 활동 시간은 기록되어 있으나 빈도·촉구 정도를 판단할 정보가 부족하다. 이전 회차 대비 진전 여부는 이 기록만으로 판단하지 않는다.',
 P:'금요일 낮에 보강하기로 했다.'
 },changes:[{id:'c1',original:'하기 싫어했어요.',replacement:'악기를 하려 하지 않았다고 기록됨(당시 구체적인 행동 확인 필요).',section:'O'}],questions:['악기를 하려 하지 않았던 순간에 어떤 행동이나 말이 있었나요? 촉구는 얼마나 필요했나요?','활 잡기·자세 유지와 약 20분의 활동 중 참여 빈도는 어땠나요?','소리를 듣고 구별하거나 스스로 소리 낸 장면이 있었나요?']};}
// The adapter receives only masked lesson text. No profile or original name is accepted.
export function organize(maskedText,maskedExample){return normalize(maskedText)===normalize(maskedExample)?sampleDraft():blankDraft();}
export function provenance(ai,final){
 const fields={};
 for(const [id] of DOMAINS)for(const key of ['value','evidence'])fields[`scores.${id}.${key}`]=JSON.stringify(ai.scores[id][key])===JSON.stringify(final.scores[id][key])?'ai':'teacher';
 for(const [id] of SOAP)fields[`soap.${id}`]=ai.soap[id]===final.soap[id]?'ai':'teacher';
 fields.changes=JSON.stringify(ai.changes)===JSON.stringify(final.changes)?'ai':'teacher';
 return fields;
}
export function finalize(work){
 const ai=clone(work.ai),final=clone(work.final);
 final.scores=verifyEvidence(final.scores,work.maskedText);
 return {id:crypto.randomUUID(),student:work.student,session:Number(work.session),date:work.date,companion:work.companion,raw:work.raw,maskedText:work.maskedText,ai,final,fieldStatus:provenance(ai,final),edits:clone(work.edits),confirmedAt:new Date().toISOString()};
}
export function seedRecord(){const ai=sampleDraft();ai.scores=verifyEvidence(ai.scores,SAMPLE);return {...finalize({student:'A01',session:1,date:'2026-10-30',companion:'활동지원사',raw:SAMPLE,maskedText:SAMPLE,ai,final:ai,edits:[]}),id:'sample-a01-1',confirmedAt:'2026-10-30T08:00:00.000Z',isSeed:true};}
