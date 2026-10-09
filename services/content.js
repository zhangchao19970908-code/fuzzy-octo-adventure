const fortunes=require('../data/fortunes'),legacy=require('../legacy/fortune-texts-v1');
function getFortune(id,version=2){const item=fortunes.find(x=>x.id===id);if(!item)return null;return version===1&&legacy[id]?{...item,...legacy[id],source:{kind:'original',label:'原创日常签 · 旧版内容'}}:item;}
module.exports={getFortune};
