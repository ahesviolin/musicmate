import test from 'node:test';
import assert from 'node:assert/strict';
import {SAMPLE,maskNames,organize,sampleDraft,verifyEvidence,finalize,clone,DOMAINS} from '../core.js';
test('긴 이름 우선, 정규식 문자 이스케이프, 치환 결과 재치환 방지',()=>{
 assert.equal(maskNames('김가나와 김가, A+B와 A01',[{name:'김가',code:'B02'},{name:'김가나',code:'A01'},{name:'A+B',code:'동석자01'},{name:'A01',code:'C03'}]),'A01와 B02, 동석자01와 C03');
});
test('예시와 다른 원문은 점수·서술을 생성하지 않음',()=>{const d=organize('오늘 박수 놀이를 했다.',SAMPLE);assert.equal(d.mode,'manual');for(const [id] of DOMAINS)assert.equal(d.scores[id].value,null);assert.equal(d.soap.O,'');});
test('예시 점수에는 원문 근거, 불충분한 빈도는 빈칸 유지',()=>{const d=sampleDraft(),scores=verifyEvidence(d.scores,SAMPLE);assert.equal(scores.interaction.verification,'matched');assert.equal(scores.posture.value,null);assert.equal(scores.attention.value,null);assert.equal(scores.music.value,null);});
test('없는 근거 및 근거 없는 수동 점수에 확인 필요',()=>{const d=sampleDraft();d.scores.music={value:4,evidence:'원문에 없는 문장'};d.scores.attention={value:3,evidence:''};const s=verifyEvidence(d.scores,SAMPLE);assert.equal(s.music.verification,'missing');assert.equal(s.attention.verification,'missing');});
test('확정 시 원문, 초안, 수정본 분리 및 항목별 수정 기록',()=>{const ai=sampleDraft(),final=clone(ai);final.scores.interaction.value=4;final.soap.P='금요일 낮 보강. 강사 확인.';const work={raw:SAMPLE,maskedText:SAMPLE,ai,final,edits:[{path:'soap.P',before:ai.soap.P,after:final.soap.P}],student:'A01',session:2,date:'2026-11-02',companion:'활동지원사'};const record=finalize(work);assert.equal(record.raw,SAMPLE);assert.equal(record.ai.scores.interaction.value,3);assert.equal(record.final.scores.interaction.value,4);assert.equal(record.fieldStatus['scores.interaction.value'],'teacher');assert.equal(record.fieldStatus['soap.S'],'ai');work.final.soap.P='다시 변경';assert.notEqual(record.final.soap.P,work.final.soap.P);assert.ok(record.confirmedAt);});
