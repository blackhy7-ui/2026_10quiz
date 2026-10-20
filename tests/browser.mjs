const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
import assert from 'node:assert/strict';
import {quizzes} from '../assets/quiz.js';
const base=process.env.BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:390,height:844}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const remote=[];page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1'))remote.push(r.url())});
await page.goto(base);
await page.screenshot({path:'/tmp/succulent-home.png',fullPage:true});
assert.match(await page.locator('h1').textContent(),/내 다육이를/);
assert.equal(await page.locator('main a[href="#booth"]').count(),1);
await page.goto(base+'/#ticket');assert.match(await page.locator('h1').textContent(),/체험권을 받아요/);
for(const level of ['elementary','secondary']){
 await page.goto(base+'/#quiz');await page.locator(`[data-level=${level}]`).click();
 for(const q of quizzes[level]){
  assert.equal(await page.locator('[data-answer]').count(),4);
  await page.locator(`[data-answer="${(q[2]+1)%4}"]`).click();
  assert.match(await page.locator('#feedback').textContent(),/다시/);
  assert.equal(await page.locator('#next').isVisible(),false);
  await page.locator(`[data-answer="${q[2]}"]`).click();
  assert.match(await page.locator('#feedback').textContent(),/정답/);
  await page.locator('#next').click();
 }
 await page.waitForURL('**/#ticket');assert.match(await page.locator('.ticket').textContent(),/5문제를 모두 완료/);
}
await page.reload();assert.equal(await page.locator('.ticket').count(),1);
for(let i=0;i<7;i++){
 await page.goto(`${base}/#make/${i}`);
 assert.equal(await page.locator('svg').count(),1);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 if(i===1)await page.screenshot({path:'/tmp/succulent-step.png',fullPage:true});
}
await page.goto(base+'/#gift');assert.match(await page.locator('main').textContent(),/쿠폰 제출하고 선물 받기/);
assert.equal(remote.length,0,'no external requests for booth or quiz');
await page.goto(base+'/#doctor');await page.waitForFunction(()=>document.querySelector('#care').onclick!==null);
await page.locator('#soil').selectOption('wet');await page.locator('#leaf').selectOption('wrinkled');await page.locator('#care').click();assert.match(await page.locator('#care-result').textContent(),/지금은 물을 더 주지 말고/);
await page.locator('#soil').selectOption('dry');assert.equal(await page.locator('#care-result').isVisible(),false);
await page.locator('#drain').selectOption('no');await page.locator('#care').click();assert.match(await page.locator('#care-result').textContent(),/배수 가능한 화분/);
await page.locator('#last').fill('2099-01-01');await page.locator('#care').click();assert.equal(await page.locator('#last').evaluate(e=>e.checkValidity()),false);
await page.locator('#last').fill('');
await page.screenshot({path:'/tmp/succulent-doctor.png',fullPage:true});
await page.locator('#photo').setInputFiles({name:'not-image.txt',mimeType:'text/plain',buffer:Buffer.from('hi')});assert.match(await page.locator('#ai-status').textContent(),/사진 파일/);
await page.locator('#photo').setInputFiles('/tmp/succulent-home.png');await page.waitForFunction(()=>!document.querySelector('#analyze').disabled);
await page.locator('#analyze').click();
await page.waitForFunction(()=>!document.querySelector('#analyze').disabled,{},{timeout:120000});
console.log('AI status:',await page.locator('#ai-status').textContent());
assert.match(await page.locator('#ai-status').textContent(),/실패|비교 완료/);
if((await page.locator('#ai-status').textContent()).includes('실패'))assert.equal(await page.locator('#ai-output').isVisible(),false);
await page.goto(base+'/#quiz');await page.locator('[data-level=elementary]').click();assert.equal(await page.locator('[data-answer]').count(),4);
assert.deepEqual(errors,[]);
console.log('PASS: both quizzes, tickets, 7 illustrations, gift flow, mobile overflow, care branches, future date, invalid upload, real model attempt/error, quiz independence.');
console.log('External requests:',remote);
await browser.close();
