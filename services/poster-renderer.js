const themes=require('../data/share-themes');
const palettes=[['#f7f2e6','#173f48','#b5a16d'],['#f8f5eb','#34524d','#b5aa80'],['#f4f6f0','#274b58','#acaf88'],['#f5f1e9','#243749','#b6a178'],['#faf2e6','#654d35','#be9d67'],['#f9f5e9','#4a5d4d','#bdad7e']];
function lines(ctx,s,width){const out=[];let current='';for(const c of String(s)){if(ctx.measureText(current+c).width>width&&current){out.push(current);current=c}else current+=c;}if(current)out.push(current);return out;}
function text(ctx,s,x,y,width,size,color,height,max=20,family='ExplorerSerif, "Songti SC", serif'){ctx.font=`${size}px ${family}`;ctx.fillStyle=color;ctx.textBaseline='alphabetic';const a=lines(ctx,s,width);if(a.length>max)throw Error('卡片文字过长，请换个模板');a.forEach((line,i)=>ctx.fillText(line,x,y+i*height));return y+a.length*height;}
function load(canvas,src){return new Promise((resolve,reject)=>{const img=canvas.createImage();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('插画加载失败'));img.src=src;});}
function cover(ctx,img,x,y,w,h){const iw=img.width||720,ih=img.height||1200,scale=Math.max(w/iw,h/ih),sw=w/scale,sh=h/scale;ctx.drawImage(img,(iw-sw)/2,(ih-sh)/2,sw,sh,x,y,w,h);}
function line(ctx,x,y,w,color){ctx.strokeStyle=color;ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w,y);ctx.stroke();}
function plate(ctx,x,y,w,h,color,alpha=.95){ctx.globalAlpha=alpha;ctx.fillStyle=color;ctx.fillRect(x,y,w,h);ctx.globalAlpha=1;}
function shade(ctx,from,to,color,reverse=false){const g=ctx.createLinearGradient(0,from,0,to);g.addColorStop(reverse?1:0,color);g.addColorStop(reverse?0:1,'rgba(250,248,241,0)');ctx.fillStyle=g;ctx.fillRect(0,from,720,to-from);}
async function prepare(){if(typeof wx!=='undefined'&&wx.loadSubpackage){await new Promise((resolve,reject)=>wx.loadSubpackage({name:'card-art',success:resolve,fail:()=>reject(Error('卡片素材暂未加载，请重试'))}));}if(typeof getApp==='function'){const app=getApp();if(app&&app.globalData.fontReady)await app.globalData.fontReady;}}
async function render(page,content,id){const theme=themes.find(t=>t.id===id);if(!theme)throw Error('模板不存在');await prepare();const canvas=await new Promise((resolve,reject)=>wx.createSelectorQuery().in(page).select('#poster').fields({node:true,size:true}).exec(r=>r&&r[0]&&r[0].node?resolve(r[0].node):reject(Error('Canvas 尚未就绪'))));canvas.width=720;canvas.height=1200;const ctx=canvas.getContext('2d'),[paper,ink,gold]=palettes[theme.palette],img=await load(canvas,theme.artPath);cover(ctx,img,0,0,720,1200);
 if(content.kind==='profile'){
  shade(ctx,0,400,paper);shade(ctx,780,1200,paper,true);ctx.strokeStyle=gold;ctx.lineWidth=1.4;ctx.strokeRect(20,20,680,1160);
  const v=theme.variant;const top=v===0?64:78;
  text(ctx,'我的人格偏好',42,top,630,23,ink,32);line(ctx,42,top+17,145,gold);
  text(ctx,content.type,38,top+127,640,v===0?112:98,ink,126,1,'ExplorerSerif, Georgia, serif');
  text(ctx,content.title,42,top+184,636,37,ink,50,2);
  plate(ctx,34,903,652,241,paper,.94);line(ctx,66,929,588,gold);
  text(ctx,content.shareDescription,66,980,588,34,ink,50,3);
  text(ctx,content.shareTags.join('　·　'),66,1118,588,24,ink,34,1,'sans-serif');
  text(ctx,'人格偏好探索 · 仅供自我探索参考',42,1170,636,18,ink,24,1,'sans-serif');
 }else{
  const variants=[{y:130,h:480},{y:360,h:500},{y:610,h:470},{y:220,h:500}],pos=variants[theme.variant];
  ctx.strokeStyle=gold;ctx.lineWidth=1.5;ctx.strokeRect(20,20,680,1160);plate(ctx,55,pos.y,610,pos.h,paper,.94);
  line(ctx,88,pos.y+78,544,gold);text(ctx,'今日签 · '+content.category,88,pos.y+53,544,22,ink,30,1);
  let y=text(ctx,content.title,88,pos.y+130,544,29,ink,40,1);
  y=text(ctx,content.mainText,88,y+48,544,42,ink,62,4);
  const source=content.source&&content.source.label||'原创日常短句';text(ctx,source,88,Math.min(y+26,pos.y+pos.h-38),544,20,ink,28,2,'sans-serif');
  text(ctx,'正向日常签 · 一句好话，留给今天',45,1166,630,19,paper,28,1,'sans-serif');
 }
 return new Promise((resolve,reject)=>wx.canvasToTempFilePath({canvas,fileType:'png',success:r=>resolve(r.tempFilePath),fail:()=>reject(Error('分享图导出失败'))},page));
}
module.exports={render,lines,cover,prepare};
