import {existsSync,readFileSync} from 'node:fs';
let worker=false;try{const config=JSON.parse(readFileSync('.openai/hosting.json','utf8'));worker=!config.static&&!!config.r2;}catch{}
if(process.env.NETLIFY==='true'||!worker)await import('./netlify-build.mjs');else await import('./build-worker.mjs');
