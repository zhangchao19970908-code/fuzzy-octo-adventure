// Structural and syntax checks complement tests; they do not replace WeChat compilation.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.join(__dirname,'..');let scripts=0,jsons=0,bytes=0;
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(['.git','node_modules'].includes(entry.name))continue;const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else{if(file.endsWith('.js')){cp.execFileSync(process.execPath,['--check',file]);scripts++;}if(file.endsWith('.json')){JSON.parse(fs.readFileSync(file,'utf8'));jsons++;}if(!file.includes(path.sep+'tests'+path.sep))bytes+=fs.statSync(file).size;}}}
walk(root);if(bytes>=2*1024*1024)throw Error('Application source/resources exceed conservative 2 MiB budget');
console.log(`JavaScript syntax: ${scripts} files passed; JSON: ${jsons} files passed; application source/resources: ${bytes} bytes (< 2 MiB).`);
