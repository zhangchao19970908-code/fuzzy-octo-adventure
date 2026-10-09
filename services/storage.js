const KEY='explorer:v1';
const empty=()=>({version:1,quiz:null,tests:[],fortunes:[],cards:[],recentQuestions:[],recentTemplates:[],daily:{},preferences:{}});
let memory=empty();
function read(){try{const s=typeof wx==='undefined'?memory:wx.getStorageSync(KEY);if(!s)return empty();const d=typeof s==='string'?JSON.parse(s):s;if(!d||d.version!==1)return empty();const base=empty();['tests','fortunes','cards','recentQuestions','recentTemplates'].forEach(k=>{if(Array.isArray(d[k]))base[k]=d[k]});base.quiz=d.quiz&&Array.isArray(d.quiz.ids)&&Array.isArray(d.quiz.answers)?d.quiz:null;base.daily=d.daily&&typeof d.daily==='object'?d.daily:{};base.preferences=d.preferences&&typeof d.preferences==='object'?d.preferences:{};return base;}catch(e){return empty();}}
function write(d){if(typeof wx==='undefined')memory=JSON.parse(JSON.stringify(d));else wx.setStorageSync(KEY,d);return d;}
function update(fn){const d=read();fn(d);return write(d);}
function add(k,item){return update(d=>{d[k]=[item,...d[k]].slice(0,30);});}
function clear(){if(typeof wx==='undefined')memory=empty();else wx.removeStorageSync(KEY);}
function remove(k,id){if(!['tests','fortunes','cards'].includes(k))throw Error('无效记录类别');return update(d=>{d[k]=d[k].filter(x=>x.id!==id);});}
module.exports={read,write,update,add,clear,remove,empty};
