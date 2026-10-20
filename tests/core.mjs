import {test} from 'node:test';
import assert from 'node:assert/strict';
import {quizzes} from '../assets/quiz.js';
import {careAdvice} from '../assets/doctor.js';
test('two levels, five valid four-choice questions per level',()=>{
 assert.deepEqual(Object.keys(quizzes),['elementary','secondary']);
 for(const list of Object.values(quizzes)){
  assert.equal(list.length,5);
  for(const [question,options,answer,explanation,hint] of list){assert.ok(question&&explanation&&hint);assert.equal(options.length,4);assert.equal(new Set(options).size,4);assert.ok(Number.isInteger(answer)&&answer>=0&&answer<4)}
 }
});
test('math answers remain 12, 8, 8, 25 percent',()=>{
 assert.equal(quizzes.elementary[3][1][quizzes.elementary[3][2]],'12개');
 assert.equal(quizzes.elementary[4][1][quizzes.elementary[4][2]],'8개');
 assert.equal(quizzes.secondary[3][1][quizzes.secondary[3][2]],'8개');
 assert.equal(quizzes.secondary[4][1][quizzes.secondary[4][2]],'25%');
});
test('wet soil with wrinkles does not produce thirst diagnosis',()=>{
 const text=careAdvice({soil:'wet',leaf:'wrinkled',drain:'yes',last:''}).join(' ');
 assert.match(text,/물을 더 주지 말고/);assert.match(text,/물 부족으로 단정하지/);
});
test('unknown soil and missing drainage request observation',()=>{
 const text=careAdvice({soil:'unknown',leaf:'unknown',drain:'no',last:''}).join(' ');
 assert.match(text,/속흙을 확인/);assert.match(text,/배수 가능한 화분/);
});
test('soft leaves take priority over dry soil',()=>{
 const text=careAdvice({soil:'dry',leaf:'soft',drain:'yes',last:''}).join(' ');
 assert.match(text,/물을 바로 추가하지 말고/);
});
test('all 60 soil, leaf and drain combinations produce guidance',()=>{
 for(const soil of ['unknown','wet','moist','dry'])for(const leaf of ['unknown','normal','wrinkled','soft','yellow'])for(const drain of ['unknown','yes','no'])assert.ok(careAdvice({soil,leaf,drain,last:''}).length>=2);
});

test('non-plant result requests a new succulent photo without diagnosis',async()=>{
 const {resultSummary}=await import('../assets/doctor.js');
 const result=resultSummary([{index:5,score:.895},{index:3,score:.042}]);
 assert.equal(result.nonPlant,true);assert.equal(result.uncertain,true);
 assert.equal(result.title,'다육이 사진을 업로드해 주세요');
 assert.match(result.note,/다시 선택/);
 const close=resultSummary([{index:0,score:.4},{index:1,score:.36}]);
 assert.equal(close.nonPlant,false);assert.equal(close.uncertain,true);
});
