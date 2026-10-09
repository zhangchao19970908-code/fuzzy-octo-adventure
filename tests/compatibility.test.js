const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
function files(dir,extension){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name),extension):e.name.endsWith(extension)?[path.join(dir,e.name)]:[]);}
test('WXML bindings contain valid expressions rather than HTML entity operators',()=>{
 const pages=files(path.join(root,'pages'),'.wxml');
 assert.equal(pages.length,10);
 for(const file of pages){
  const source=fs.readFileSync(file,'utf8');
  for(const match of source.matchAll(/\{\{([\s\S]*?)\}\}/g)){
   assert.ok(!/&(?:amp|lt|gt|quot|apos|#\d+);/.test(match[1]),`${file}: entity in binding`);
   assert.doesNotThrow(()=>new vm.Script(`(${match[1]})`),`${file}: invalid expression`);
  }
 }
 assert.ok(fs.readFileSync(path.join(root,'pages/share-preview/index.wxml'),'utf8').includes('wx:if="{{error && valid}}"'));
});
test('WXSS omits universal and attribute selectors rejected or unsupported by mini program styling',()=>{
 const sheets=[path.join(root,'app.wxss'),...files(path.join(root,'pages'),'.wxss')];
 for(const file of sheets){
  const source=fs.readFileSync(file,'utf8');
  for(const match of source.matchAll(/(?:^|})([^{}]*)\{/g)){
   assert.ok(!match[1].includes('*'),`${file}: universal selector`);
   assert.ok(!match[1].includes('['),`${file}: attribute selector`);
  }
 }
 const app=fs.readFileSync(sheets[0],'utf8');
 for(const element of ['view','text','button'])assert.ok(app.includes(`.row > ${element}`));
});
