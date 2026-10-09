const storage=require('../../services/storage'),engine=require('../../services/quiz-engine'),art=require('../../services/art'),ui=require('../../services/ui');
Page({
 data:{ready:false},
 onLoad(){this.quiz=storage.read().quiz;if(!engine.valid(this.quiz)){wx.showToast({title:'进度已失效，请重新开始',icon:'none'});wx.switchTab({url:'/pages/test/index'});return}if(wx.enableAlertBeforeUnload)wx.enableAlertBeforeUnload({message:'答案已保存在本机，离开后可以继续。'});this.show()},
 show(){const q=this.quiz,question=engine.get(q.ids[q.index],q.version),answer=engine.option(question,q.answers[q.index]);this.setData({ready:true,index:q.index,total:q.mode,question,scene:art.quiz(question.illustrationId),answer:answer?answer.id:null,progress:Math.round((q.index+1)/q.mode*100),fallback:q.fallback,legacy:q.version===1})},
 persist(candidate){storage.update(d=>{d.quiz=candidate});this.quiz=candidate;this.show()},
 pick(ev){ui.safely(()=>{const q=JSON.parse(JSON.stringify(this.quiz)),item=engine.option(engine.get(q.ids[q.index],q.version),ev.currentTarget.dataset.value);if(!item)throw Error('无效回答');q.answers[q.index]=item.id;this.persist(q)})},
 prev(){if(this.quiz.index>0)this.move(-1)},
 move(delta){ui.safely(()=>{const q=JSON.parse(JSON.stringify(this.quiz));q.index+=delta;this.persist(q)})},
 replace(){if(this.quiz.version!==2)return;wx.showModal({title:'换一道同类情境题？',content:'本题答案会清除，题目数量与偏好配额不变。',success:r=>{if(r.confirm){try{this.persist(engine.replace(this.quiz,storage.read().recentQuestions))}catch(e){wx.showToast({title:e.message,icon:'none'})}}}})},
 next(){const q=this.quiz;if(q.answers[q.index]===null)return;if(q.index<q.mode-1){this.move(1);return}if(this.finishing)return;this.finishing=true;try{const result=engine.score(q.ids,q.answers,q.version),id='test-'+Date.now();storage.update(d=>{d.tests=[{id,time:Date.now(),mode:q.mode,questionVersion:q.version,result,questionIds:q.ids,answers:q.answers},...d.tests].slice(0,30);d.recentQuestions=q.ids.concat(d.recentQuestions).filter((v,i,a)=>a.indexOf(v)===i).slice(0,120);d.quiz=null});if(wx.disableAlertBeforeUnload)wx.disableAlertBeforeUnload();wx.redirectTo({url:'/pages/result/index?id='+id})}catch(e){ui.fail(e);this.finishing=false}},
 exit(){wx.showModal({title:'保存进度并退出？',content:'已选答案自动保存在本机，下次可以继续。',success:r=>{if(r.confirm){if(wx.disableAlertBeforeUnload)wx.disableAlertBeforeUnload();wx.switchTab({url:'/pages/test/index'})}}})},
 onUnload(){if(wx.disableAlertBeforeUnload)wx.disableAlertBeforeUnload()}
});
