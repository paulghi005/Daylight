export const COLLECTIONS=['tasks','projects','series','templates','sessions'];
export function normalizeSubtasks(raw,makeId=()=>crypto.randomUUID()){
 if(!Array.isArray(raw))return [];const seen=new Set();return raw.slice(0,100).filter(x=>x&&typeof x.title==='string'&&x.title.trim()).map(x=>{let id=typeof x.id==='string'&&x.id.length<100?x.id:makeId();if(seen.has(id))id=makeId();seen.add(id);return {id,title:x.title.trim().slice(0,180),done:!!x.done};});
}
export function normalizeReminder(raw){if(!raw||![0,5,10,15,30,60,120,1440].includes(raw.minutes))return null;let timeZone=raw.timeZone||'Europe/Berlin';try{new Intl.DateTimeFormat('de',{timeZone}).format();}catch{timeZone='Europe/Berlin';}return {minutes:raw.minutes,anchor:raw.anchor==='due'?'due':'planned',clock:/^([01]\d|2[0-3]):[0-5]\d$/.test(raw.clock)?raw.clock:'09:00',timeZone};}
export function zonedTimestamp(day,time,timeZone){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(day||'')||!/^\d\d:\d\d$/.test(time||''))return null;
 const [y,m,d]=day.split('-').map(Number),[h,min]=time.split(':').map(Number),target=Date.UTC(y,m-1,d,h,min);let guess=target,previous;
 const formatter=new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
 for(let i=0;i<5;i++){const p=Object.fromEntries(formatter.formatToParts(new Date(guess)).map(x=>[x.type,x.value])),actual=Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute,+p.second),next=guess+(target-actual);if(next===guess)return guess;if(next===previous)return Math.max(guess,next);previous=guess;guess=next;}return guess;
}
export function reminderTimestamp(task){const r=normalizeReminder(task.reminder);if(!r||task.status==='done')return null;const day=r.anchor==='due'?task.due:task.planned;if(!day)return null;const time=r.anchor==='planned'&&task.time?task.time:r.clock;return zonedTimestamp(day,time,r.timeZone)-r.minutes*60000;}
export function stampSnapshot(data,previous,device,at=new Date().toISOString()){
 data.deleted??={};for(const name of COLLECTIONS){data[name]??=[];data.deleted[name]??={};const old=new Map((previous?.[name]||[]).map(x=>[x.id,x]));const now=new Set(data[name].map(x=>x.id));for(const id of old.keys())if(!now.has(id))data.deleted[name][id]={at,by:device};for(const record of data[name]){const before=old.get(record.id),withoutStamp=x=>{const {updatedAt,updatedBy,...rest}=x;return JSON.stringify(rest)};if(before&&withoutStamp(before)!==withoutStamp(record)){record.updatedAt=new Date(Math.max(Date.parse(at),Date.parse(before?.updatedAt||'1970-01-01')+1,Date.parse(data.deleted[name][record.id]?.at||'1970-01-01')+1)).toISOString();record.updatedBy=device;}else if(!before&&(!record.updatedAt||data.deleted[name][record.id])){record.updatedAt=new Date(Math.max(Date.parse(at),Date.parse(before?.updatedAt||'1970-01-01')+1,Date.parse(data.deleted[name][record.id]?.at||'1970-01-01')+1)).toISOString();record.updatedBy=device;}if(data.deleted[name][record.id]&&compareStamp({at:record.updatedAt,by:record.updatedBy},data.deleted[name][record.id])>0)delete data.deleted[name][record.id];}}
 if(!previous||data.name!==previous.name)data.profileStamp={at,by:device};return data;
}
function compareStamp(a, b) {
  return String(a?.at || '').localeCompare(String(b?.at || ''))
    || String(a?.by || '').localeCompare(String(b?.by || ''));
}
export function mergeSnapshots(local,remote){
 if(!remote)return structuredClone(local);const out=structuredClone(local);out.deleted={};
 for(const name of COLLECTIONS){const deleted={...(local.deleted?.[name]||{})};for(const [id,stamp]of Object.entries(remote.deleted?.[name]||{}))if(!deleted[id]||compareStamp(stamp,deleted[id])>0)deleted[id]=stamp;const records=new Map();for(const record of [...(local[name]||[]),...(remote[name]||[])]){const other=records.get(record.id);const stamp={at:record.updatedAt||record.createdAt||'',by:record.updatedBy||''},old={at:other?.updatedAt||other?.createdAt||'',by:other?.updatedBy||''};if(!other||compareStamp(stamp,old)>0||(compareStamp(stamp,old)===0&&JSON.stringify(record)>JSON.stringify(other)))records.set(record.id,structuredClone(record));}out[name]=[...records.values()].filter(r=>!deleted[r.id]||compareStamp({at:r.updatedAt||r.createdAt||'',by:r.updatedBy||''},deleted[r.id])>0);out.deleted[name]=deleted;}
 if(compareStamp(remote.profileStamp,local.profileStamp)>0){out.name=remote.name;out.profileStamp=remote.profileStamp;}out.demo=out.tasks.some(t=>t.sample);return out;
}
export function mergeFirstSync(local,remote){const untouchedExamples=local.demo&&local.tasks.every(t=>t.sample&&(!t.updatedBy||t.updatedBy==='legacy'))&&!(local.templates||[]).length&&!(local.series||[]).length&&!(local.sessions||[]).length;return mergeSnapshots(remote&&untouchedExamples?{...local,tasks:[]}:local,remote);}
