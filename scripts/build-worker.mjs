import {readFile,writeFile,mkdir,readdir,copyFile,rm} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..'),assets={};
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'};
async function collect(dir){for(const item of await readdir(dir,{withFileTypes:true})){if(item.name==='server'||item.name==='.openai')continue;const file=path.join(dir,item.name);if(item.isDirectory())await collect(file);else{const relative='/'+path.relative(path.join(root,'dist'),file).replaceAll(path.sep,'/');if(!types[path.extname(file)])continue;assets[relative]={type:types[path.extname(file)],data:(await readFile(file)).toString('base64')};}}}
await collect(path.join(root,'dist'));
let combined='';for(const file of ['dist/domain.js','server/push.mjs','server/stores.mjs','server/backend.mjs']){let source=await readFile(path.join(root,file),'utf8');source=source.replace(/^import .*;\n/gm,'').replace(/\bexport (?=(?:async )?function|const|let)/g,'');combined+='\n'+source;}
combined+='\nconst STATIC_ASSETS='+JSON.stringify(assets)+';\n'+await readFile(path.join(root,'worker/entry.mjs'),'utf8');
await mkdir(path.join(root,'worker'),{recursive:true});await writeFile(path.join(root,'worker/index.js'),combined);
await mkdir(path.join(root,'dist/server'),{recursive:true});await mkdir(path.join(root,'dist/.openai'),{recursive:true});
await writeFile(path.join(root,'dist/server/index.js'),combined);await copyFile(path.join(root,'.openai/hosting.json'),path.join(root,'dist/.openai/hosting.json'));
console.log('Built Worker with '+Object.keys(assets).length+' embedded assets.');
