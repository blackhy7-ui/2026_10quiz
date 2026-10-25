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
await page.goto(base+'/#doctor');await page.waitForSelector('.care-app');
assert.equal(await page.locator('input[type=file]').count(),0);
await page.locator('.care-tabs [data-view=check]').click();
await page.locator('#soil').selectOption('wet');await page.locator('#leaf').selectOption('wrinkled');await page.locator('.care-wide').click();
assert.match(await page.locator('.care-title').textContent(),/기다려요/);
await page.locator('.care-tabs [data-view=home]').click();await page.locator('#last').fill('2026-10-20');await page.locator('#last').dispatchEvent('change');await page.reload();await page.waitForSelector('#last');assert.equal(await page.locator('#last').inputValue(),'2026-10-20');
assert.deepEqual(errors,[]);assert.equal(remote.length,0,'no external runtime or model requests');
console.log('PASS quizzes, tickets, seven making steps, gifts, photo-free care, auto-save and no external requests');await browser.close();
