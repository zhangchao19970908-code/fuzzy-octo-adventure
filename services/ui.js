function fail(e){wx.showToast({title:e&&e.message==='无效回答'?'请完成全部题目':'操作未完成，请稍后重试',icon:'none'});}
function safely(fn){try{return fn()}catch(e){fail(e);return null;}}
function date(t){const d=new Date(t);return `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;}
module.exports={fail,safely,date};
