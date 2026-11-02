import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('dialog',d=>d.accept());
const count=()=>page.evaluate(async()=>{const db=await new Promise(resolve=>{const r=indexedDB.open('musicmate-pilot',1);r.onsuccess=()=>resolve(r.result);});return new Promise(resolve=>{const r=db.transaction('records').objectStore('records').count();r.onsuccess=()=>resolve(r.result);});});
const saved=()=>page.evaluate(async()=>{const db=await new Promise(resolve=>{const r=indexedDB.open('musicmate-pilot',1);r.onsuccess=()=>resolve(r.result);});return new Promise(resolve=>{const r=db.transaction('records').objectStore('records').getAll();r.onsuccess=()=>resolve(r.result);});});
try{
 await page.goto('http://127.0.0.1:3000');await page.locator('[data-new="A01"]').waitFor();assert.equal(await count(),1);
 await mkdir('test-results',{recursive:true});await page.screenshot({path:'test-results/home-mobile.png',fullPage:true});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.locator('[data-new="A01"]').click();await page.locator('[data-sample]').click();const raw=await page.locator('#raw').inputValue();await page.getByRole('button',{name:'정리하기'}).click();
 await page.getByRole('heading',{name:'참여의 다섯 영역'}).waitFor();assert.equal(await count(),1);
 assert.equal(await page.locator('[data-score="music"][aria-pressed="true"]').count(),0);
 await page.locator('[data-score="interaction"][data-value="4"]').click();
 await page.locator('[data-path="soap.P"]').fill('금요일 낮에 보강하기로 했다. 악기 크기를 확인한다.');
 await page.locator('[data-revert]').click();
 assert.ok((await page.locator('[data-path="soap.O"]').inputValue()).includes('하기 싫어했어요.'));
 await page.locator('[data-path="scores.music.evidence"]').fill('원문에 없는 소리를 구별했다.');
 await page.locator('[data-score="music"][data-value="2"]').click();await page.getByText('확인 필요',{exact:true}).first().waitFor();
 await page.screenshot({path:'test-results/review-mobile.png',fullPage:true});
 await page.locator('#reviewed').check();await page.locator('[data-confirm]').click();await page.getByRole('heading',{name:'A01 기록 이력'}).waitFor();assert.equal(await count(),2);
 let records=await saved(),record=records.find(r=>r.session===2);assert.equal(record.raw,raw);assert.equal(record.ai.scores.interaction.value,3);assert.equal(record.final.scores.interaction.value,4);assert.equal(record.final.scores.music.verification,'missing');assert.equal(record.final.scores.attention.value,null);assert.ok(record.edits.length>=4);assert.equal(record.fieldStatus['soap.P'],'teacher');
 await page.screenshot({path:'test-results/history-mobile.png',fullPage:true});
 await page.reload();await page.locator('[data-new="A01"]').waitFor();assert.equal(await count(),2);
 await page.locator('[data-history="A01"]').click();await page.locator(`[data-detail="${record.id}"]`).click();await page.locator('[data-tab="raw"]').click();assert.equal(await page.locator('.panel pre').first().textContent(),raw);
 await page.locator('[data-go="settings"]').click();await page.locator('[name="bindings"]').fill('가상학생=A01\n가상동석자=동석자01');await page.getByRole('button',{name:'가리기 설정 저장'}).click();await page.getByRole('status').filter({hasText:'설정을 저장'}).waitFor();
 await page.locator('[data-go="home"]').click();await page.locator('[data-new="A01"]').click();await page.locator('#raw').fill('가상학생이 가상동석자와 박수를 쳤다.');await page.getByRole('button',{name:'정리하기'}).click();await page.getByText('AI 입력용 가린 텍스트 보기').click();assert.ok(await page.getByText('A01이 동석자01와 박수를 쳤다.',{exact:true}).isVisible());assert.equal(await page.locator('[aria-pressed="true"]').count(),0);assert.equal(await count(),2);
 await page.reload();await page.locator('[data-new="A01"]').waitFor();assert.equal(await count(),2);
 await page.locator('[data-new="A01"]').click();await page.locator('[name="session"]').fill('2');await page.locator('[data-sample]').click();await page.getByRole('button',{name:'정리하기'}).click();await page.getByRole('status').filter({hasText:'이미 확정된 회차'}).waitFor();assert.equal(await count(),2);
 await page.locator('[data-go="home"]').click();await page.locator('[data-profile="A01"]').click();await page.locator('[name="code"]').fill('A03');await page.getByRole('button',{name:'프로파일 저장'}).click();await page.getByRole('status').filter({hasText:'프로파일을 저장'}).waitFor();await page.locator('[data-go="home"]').click();await page.locator('[data-history="A01"]').click();await page.getByRole('heading',{name:'A03 기록 이력'}).waitFor();assert.equal(await page.locator('[data-detail]').count(),2);
 assert.deepEqual(errors,[]);console.log('PASS: mobile input → review → edit/revert → confirm → history; immutable original; independent draft; evidence mismatch; null scores; masked names; no pre-confirm save; reload persistence; duplicate prevention; no browser errors.');
}finally{await browser.close();}

// A real persistent browser profile: confirm, close Chromium, reopen, then check IndexedDB.
const profile=await mkdtemp(join(tmpdir(),'musicmate-test-'));
let persistent;
try{
 const options={executablePath:'/usr/bin/chromium',args:['--no-sandbox'],viewport:{width:390,height:844}};
 persistent=await chromium.launchPersistentContext(profile,options);
 let p=await persistent.newPage();await p.goto('http://127.0.0.1:3000');await p.locator('[data-new="B02"]').click();await p.locator('#raw').fill('리듬에 맞춰 박수를 쳤다.');await p.getByRole('button',{name:'정리하기'}).click();await p.locator('[data-path="soap.O"]').fill('리듬에 맞춰 박수를 쳤다.');await p.locator('#reviewed').check();await p.locator('[data-confirm]').click();await p.getByRole('heading',{name:'B02 기록 이력'}).waitFor();await persistent.close();
 persistent=await chromium.launchPersistentContext(profile,options);p=await persistent.newPage();await p.goto('http://127.0.0.1:3000');await p.locator('[data-history="B02"]').click();assert.equal(await p.locator('[data-detail]').count(),1);await p.locator('[data-detail]').click();await p.locator('[data-tab="raw"]').click();assert.equal(await p.locator('.panel pre').first().textContent(),'리듬에 맞춰 박수를 쳤다.');console.log('PASS: confirmed record survives Chromium close and restart; manual workflow works with all scores empty.');
}finally{await persistent?.close();await rm(profile,{recursive:true,force:true});}
