// Tests error handling with a deliberately failed runtime request, never fake predictions.
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
const base=process.env.BASE_URL||'http://127.0.0.1:4173';
for(const leave of [false,true]){
 const page=await browser.newPage({viewport:{width:360,height:640}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 let release,requested;const gate=new Promise(r=>release=r),started=new Promise(r=>requested=r);
 await page.route('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1',async route=>{requested();await gate;await route.abort('failed')});
 await page.goto(base+'/#doctor');await page.locator('[data-section=kinds]').click();await page.locator('.photo-entry').click();
 await page.locator('#photo').setInputFiles(new URL('../assets/plant-a.webp',import.meta.url).pathname);
 await page.waitForFunction(()=>!document.querySelector('#analyze').disabled);await page.getByRole('button',{name:'선택한 사진 분석하기 →',exact:true}).click();await page.locator('#analyze').click();await started;
 if(leave)await page.goto(base+'/#quiz');release();
 if(!leave){await page.waitForFunction(()=>!document.querySelector('#analyze').disabled);assert.match(await page.locator('#ai-status').textContent(),/실행 파일 다운로드에 실패/);assert.equal(await page.locator('#ai-output').isVisible(),false);assert.ok(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+1))}
 else{await page.waitForTimeout(200);assert.equal(await page.locator('[data-level]').count(),2)}
 assert.deepEqual(errors,[]);console.log('PASS runtime failure, no fabricated result, navigate away:',leave);await page.close();
}
await browser.close();
