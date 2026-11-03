import {access,rm} from 'node:fs/promises';
for(const file of ['dist/index.html','dist/app.js','dist/domain.js','netlify/functions/api.mjs','netlify/functions/reminders.mjs'])await access(file);
await rm('dist/server',{recursive:true,force:true});await rm('dist/.openai',{recursive:true,force:true});
console.log('Daylight: frontend, sync API and scheduled reminder function ready.');
