import {COLLECTIONS,SNAPSHOT_VERSION,isCalendarEvent,calendarEventDay,isRemovedOccurrence,hasUntouchedExamples,normalizeSubtasks,normalizeReminder,reminderTimestamp,stampSnapshot,mergeSnapshots,mergeFirstSync} from "./domain.js?v=7";
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const iconPaths = {
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>',
 sunrise:'<path d="M4 17a8 8 0 0 1 16 0M2 21h20M12 2v3M3.5 6.5l2 2m15-2-2 2M1 14h2m18 0h2"/>',
 check:'<path d="m5 12 4 4L19 6"/>', plus:'<path d="M12 5v14M5 12h14"/>',
 grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
 list:'<path d="M9 6h12M9 12h12M9 18h12m-18-12 1 1 2-2m-3 7 1 1 2-2m-3 7 1 1 2-2"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18m-13 4h2m4 0h2"/>',
 board:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16m6-16v16M5.5 8h1m4.5 0h1m4.5 0h1M5.5 12h1m4.5 0h1"/>',
 timer:'<circle cx="12" cy="14" r="8"/><path d="M12 6V2m-3 0h6m3 5 2-2m-8 5v4l3 2"/>',
 search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
 right:'<path d="m9 5 7 7-7 7"/>', left:'<path d="m15 5-7 7 7 7"/>', down:'<path d="m6 9 6 6 6-6"/>',
 arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>', clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 star:'<path d="m12 3 2.8 5.7 6.3.9-4.55 4.44 1.08 6.28L12 17.35l-5.63 2.96 1.08-6.28L2.9 9.6l6.3-.9Z"/>',
 settings:'<path d="m9 3-.6 2a8 8 0 0 0-1.6.9l-2-.5-2 3.4L4.3 10a8 8 0 0 0 0 2l-1.5 1.3 2 3.4 2-.5a8 8 0 0 0 1.6.9L9 20h4l.6-2a8 8 0 0 0 1.6-.9l2 .5 2-3.4-1.5-1.3a8 8 0 0 0 0-2l1.5-1.3-2-3.4-2 .5a8 8 0 0 0-1.6-.9L13 3Z"/><circle cx="11" cy="11.5" r="3"/>',
 flag:'<path d="M5 21V4m0 0c5-4 9 4 14 0v10c-5 4-9-4-14 0"/>', more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
 play:'<path d="m9 5 11 7-11 7Z"/>', pause:'<path d="M8 5v14M16 5v14"/>', reset:'<path d="M3 10a9 9 0 1 1 2 8M3 4v6h6"/>',
 close:'<path d="m6 6 12 12M6 18 18 6"/>', trash:'<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
 edit:'<path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-5-5L4 14Z"/>', menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
 inbox:'<path d="M4 4h16l2 12v4H2v-4ZM2 15h6l2 3h4l2-3h6"/>',
 leaf:'<path d="M20 3c0 12-3 18-11 17-8-1-8-12 0-13 4-1 7-1 11-4ZM4 21 15 10"/>',
 spark:'<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5ZM20 2v4m-2-2h4"/>',
 download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>', upload:'<path d="M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5"/>',
 shield:'<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 12 3 3 5-6"/>',
 coffee:'<path d="M3 8h13v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4ZM16 8h2a3 3 0 0 1 0 6h-2M6 2v3m4-3v3m4-3v3"/>',
 mountain:'<path d="m2 20 7-15 5 8 3-5 5 12ZM6 11l3 2 3-3"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/>',
 grip:'<circle cx="9" cy="5" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="19" r="1"/>'
};
const icon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${iconPaths[name] || iconPaths.sun}</svg>`;
const uid = () => crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const keyOf = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const dateOf = key => { const [y,m,d] = key.split('-').map(Number); return new Date(y,m-1,d,12); };
const addDays = (key,n) => { const d = dateOf(key); d.setDate(d.getDate()+n); return keyOf(d); };
const dayDifference = (start,end) => (Date.parse(end)-Date.parse(start))/86400000;
const today = () => keyOf();
const weekdayLong = key => dateOf(key).toLocaleDateString('de-DE',{weekday:'long'});
const shortDate = key => key ? dateOf(key).toLocaleDateString('de-DE',{day:'numeric',month:'short'}) : 'Ohne Datum';
const longDate = key => dateOf(key).toLocaleDateString('de-DE',{day:'numeric',month:'long'});
const relativeDate = key => !key ? 'Ohne Datum' : key === today() ? 'Heute' : key === addDays(today(),1) ? 'Morgen' : shortDate(key);
const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(dateOf(value).getTime()) && keyOf(dateOf(value))===value;
const validTime = value => typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
const normalizeDuration = value => value===null||value===''?null:Math.min(720,Math.max(5,Number(value)||30));
const durationLabel = n => n==null?'Keine Angabe':n >= 60 ? `${Math.floor(n/60)} Std.${n%60 ? ` ${n%60} Min.` : ''}` : `${n} Min.`;
const clockMinutes = time => {const [hours,minutes]=time.split(':').map(Number);return hours*60+minutes;};
const endTime = (time,duration) => {
 const total=clockMinutes(time)+duration;
 return `${String(Math.floor(total/60)%24).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;
};
const eventDuration = value => Number.isInteger(value)&&value>0&&value<1440 ? value : null;
const weekStart = key => { const d = dateOf(key); return addDays(key,-((d.getDay()+6)%7)); };
const weekNumber = key => { const d = dateOf(key); d.setDate(d.getDate()+3-((d.getDay()+6)%7)); const start = new Date(d.getFullYear(),0,4); return 1+Math.round(((d-start)/86400000-3+((start.getDay()+6)%7))/7); };
const projectColors = [
 ['#9e9ac1','Lavendel'], ['#829fb4','Blau'], ['#96ad7d','Salbeigrün'], ['#c5a28c','Terrakotta'],
 ['#b3a16b','Gold'], ['#90b5ac','Türkis'], ['#ba94a5','Rosé'], ['#9caaa0','Grau'],
 ['#46765f','Waldgrün'], ['#387fa1','Ozeanblau'], ['#8062a6','Pflaume'], ['#b75f7d','Himbeere'],
 ['#c86a4d','Koralle'], ['#b98130','Bernstein'], ['#4f877f','Petrol'], ['#566978','Schiefer'],
];
const palette = projectColors.map(([color])=>color);
const FOCUS_PRESETS = [25,50];
const BREAK_PRESETS = [5,15];
const FOCUS_MAX_MINUTES = 720;
const validFocusMinutes = value => Number.isInteger(value) && value >= 1 && value <= FOCUS_MAX_MINUTES;
const STORE = 'daylight-data-v1';
const WEEKDAYS=[{day:1,short:'Mo',name:'Montag'},{day:2,short:'Di',name:'Dienstag'},{day:3,short:'Mi',name:'Mittwoch'},{day:4,short:'Do',name:'Donnerstag'},{day:5,short:'Fr',name:'Freitag'},{day:6,short:'Sa',name:'Samstag'},{day:0,short:'So',name:'Sonntag'}];
function demoState(){
 const t = today();
 const task = (id,title,project,due,time,duration,priority,status,top,notes='') => ({id:`demo-${id}`,title,project,planned:due,due:'',time,duration,priority,status,top,notes,createdAt:new Date().toISOString(),completedAt:status==='done'?new Date().toISOString():null,sample:true});
 return {version:SNAPSHOT_VERSION,templates:[],deleted:{},series:[],name:'G',demo:true,projects:[{id:'uni',name:'Studium',color:palette[0]},{id:'work',name:'Arbeit',color:palette[1]},{id:'life',name:'Privat',color:palette[2]},{id:'move',name:'Bewegung',color:palette[3]}],tasks:[
  task('1','Den Tag in Ruhe planen','life',t,'08:30',15,3,'done',false),
  task('2','E-Mails sortieren & beantworten','work',t,'09:00',30,2,'done',false),
  task('3','Präsentation überarbeiten','uni',t,'10:00',60,1,'doing',true,'Die Einleitung kürzen und die letzten beiden Folien überarbeiten.'),
  task('4','30 Minuten Französisch üben','uni',t,'14:00',30,2,'todo',true,'Vokabeln wiederholen, dann eine kurze Übung machen.'),
  task('5','Eine Runde rausgehen','move',t,'16:30',30,3,'todo',false),
  task('6','Wocheneinkauf erledigen','life',t,'18:00',45,2,'todo',false,'Obst, Haferflocken, Milch, Gemüse und Pasta.'),
  task('7','Die Woche grob vorausplanen','life',t,'',20,2,'todo',true),
  {...task('8','Exposé fertigstellen','uni',t,'12:00',90,1,'todo',false,'Fragestellung konkretisieren und die wichtigsten Quellen ergänzen.'),due:addDays(t,4)},
  task('9','Unterlagen für das Meeting lesen','work',addDays(t,1),'09:30',30,2,'todo',false),
  task('10','Training einplanen','move',addDays(t,2),'17:00',60,2,'todo',false),
  task('11','Ideen für das Wochenende sammeln','life','','',20,3,'todo',false),
  task('12','Rückfrage zur Hausarbeit klären','uni',addDays(t,-1),'',15,2,'todo',false)
 ],focus:defaultFocus(),sessions:[]};
}
function defaultFocus(){
 return {kind:'focus',mode:25,custom:false,customMinutes:25,remaining:1500,running:false,endAt:null,taskId:null};
}
function validateFocus(value,taskIds){
 if(!value || !Number.isFinite(value.remaining)) return defaultFocus();
 const kind = value.kind || (BREAK_PRESETS.includes(value.mode) ? 'break' : 'focus');
 const allowed = kind==='break' ? BREAK_PRESETS.includes(value.mode) : kind==='focus' && validFocusMinutes(value.mode);
 if(!allowed) return defaultFocus();
 const custom = kind==='focus' && (Boolean(value.custom) || !FOCUS_PRESETS.includes(value.mode));
 const endAt = Number.isFinite(value.endAt) ? value.endAt : null;
 return {kind,mode:value.mode,custom,customMinutes:validFocusMinutes(value.customMinutes)?value.customMinutes:custom?value.mode:25,
  remaining:Math.max(0,Math.min(value.mode*60,Math.round(value.remaining))),running:Boolean(value.running && endAt!==null),
  endAt,taskId:taskIds.has(value.taskId)?value.taskId:null};
}
let storageAvailable = true, initialReadFailed = false;
function validateBackup(raw){
 if(!raw || ![1,2,3,4,SNAPSHOT_VERSION].includes(raw.version) || !Array.isArray(raw.tasks) || raw.tasks.length>50000 || !Array.isArray(raw.projects) || raw.projects.length>30) throw new Error('Das ist keine gültige Daylight-Sicherung.');
 const seenProjects = new Set();
 const projects=raw.projects.map((p,i)=>{if(!p || !safeId(p.id) || seenProjects.has(p.id) || typeof p.name!=='string' || !p.name.trim()) throw new Error('Die Bereiche in der Datei sind ungültig.');seenProjects.add(p.id);return {id:p.id,name:p.name.trim().slice(0,40),color:palette.includes(p.color)?p.color:palette[i%palette.length],...recordStamp(p)};});
 const series=validateSeries(raw.version>=3?(raw.series||[]):[],seenProjects),seriesById=new Map(series.map(s=>[s.id,s]));
 const seenTasks = new Set();
 const tasks=raw.tasks.map(t=>{
  const series=seriesById.get(t?.seriesId);
  if(!t || !safeId(t.id) || seenTasks.has(t.id) || typeof t.title!=='string' || !t.title.trim() ||
     !['todo','doing','done'].includes(t.status) ||
     (t.due && !validDate(t.due)) || (raw.version>=2 && t.planned && !validDate(t.planned)) ||
     (t.time && !validTime(t.time)) || (series && !validDate(t.occurrenceDate))) {
   throw new Error('Die Einträge in der Datei sind ungültig.');
  }
  const planned=raw.version===1?(t.due||''):(t.planned||'');
  if(t.kind==='event' && !planned && !series) throw new Error('Einem Termin fehlt das Datum.');
  seenTasks.add(t.id);
  const kind=t.kind==='event'||t.kind==='task'?t.kind:series?.kind==='event'&&t.status==='done'?'task':'';
  return {id:t.id,...(kind?{kind}:{}),title:t.title.trim().slice(0,180),notes:String(t.notes||'').slice(0,4000),
   project:seenProjects.has(t.project)?t.project:'',planned,due:t.due||'',time:planned?(t.time||''):'',
   duration:isCalendarEvent(t,series)?eventDuration(t.duration):normalizeDuration(t.duration??null),
   priority:[1,2,3].includes(t.priority)?t.priority:2,status:t.status||'todo',top:!!t.top,
   subtasks:normalizeSubtasks(t.subtasks),reminder:normalizeReminder(t.reminder),...recordStamp(t),
   seriesId:series?.id||null,occurrenceDate:series?t.occurrenceDate:'',seriesOverride:!!t.seriesOverride,sample:!!t.sample,
   createdAt:typeof t.createdAt==='string'?t.createdAt:new Date().toISOString(),
   completedAt:t.status==='done'?(typeof t.completedAt==='string'?t.completedAt:new Date().toISOString()):null};
 });
 const sessions=Array.isArray(raw.sessions)?raw.sessions.filter(s=>s&&validDate(s.date)&&Number.isFinite(s.minutes)&&s.minutes>0&&s.minutes<=720).slice(-1000).map((s,i)=>({id:typeof s.id==='string'?s.id:`legacy-session-${s.date}-${i}`,date:s.date,minutes:s.minutes,taskId:typeof s.taskId==='string'?s.taskId:null,...recordStamp(s)})):[];
 const templates=validateTemplates(raw.version>=4?raw.templates||[]:[],seenProjects);
 const focus=validateFocus(raw.focus,new Set(tasks.filter(t=>!isCalendarEvent(t,seriesById.get(t.seriesId))).map(t=>t.id)));
 return {version:SNAPSHOT_VERSION,series,templates,deleted:normalizeDeleted(raw.deleted),profileStamp:raw.profileStamp||null,name:typeof raw.name==='string'?raw.name.slice(0,30):'G',demo:!!raw.demo,projects,tasks,focus,sessions};
}
function readState(){
 try{
  const saved=localStorage.getItem(STORE);
  return saved?validateBackup(JSON.parse(saved)):demoState();
 }catch(error){
  storageAvailable=error.name!=='SecurityError';
  initialReadFailed=true;
  window.setTimeout(()=>toast('Gespeicherte Daten konnten nicht geladen werden. Bitte prüfe deine Sicherung.'),500);
  return demoState();
 }
}
let data=readState();
const DEVICE_ID=localSetting('daylight-device')||uid();try{localStorage.setItem('daylight-device',DEVICE_ID);}catch{}
let previousSavedSnapshot=structuredClone(data),cloudEnabled=localSetting('daylight-sync-enabled')==='true',syncBusy=false,syncTimer=null,syncAgain=false,cloudConfig=null,syncMessage=cloudEnabled?'Verbindung wird geprüft':'Auf diesem Gerät gespeichert';
let pendingBackgroundRender=false;
let view='today', selectedDay=today(), activeProject='', taskFilter='open', taskSort='date', monthCursor=new Date(dateOf(today()).getFullYear(),dateOf(today()).getMonth(),1), calendarMode='month', weekOffset=0, mobileMenu=false;
let lastSeenDay=selectedDay;
let toastTimer, toastAction=null, dialogCleanup=null, lastFocus=null, draggedId=null;
const app=$('#app'), dialogRoot=$('#dialog-root');
const quickDrafts=new Map(), openPanels=new Set();
function save({sync=true}={}){try{stampSnapshot(data,previousSavedSnapshot,DEVICE_ID);localStorage.setItem(STORE,JSON.stringify(data));previousSavedSnapshot=structuredClone(data);storageAvailable=true;if(sync)scheduleSync();return true;}catch{storageAvailable=false;toast('Speichern nicht möglich. Bitte exportiere eine Sicherung.');return false;}}
const projectOf = task => data.projects.find(p=>p.id===task.project);
const projectPill = task => { const p=projectOf(task);return p?`<span class="pill" style="background:${p.color}18;color:${p.color}"><span class="dot" style="background:${p.color}"></span>${esc(p.name)}</span>`:''; };
const statusName = status => ({todo:'Offen',doing:'In Arbeit',done:'Erledigt'}[status]);
const seriesOf = entry => entry?.seriesId ? data.series.find(s=>s.id===entry.seriesId) : undefined;
const isEvent = entry => isCalendarEvent(entry,entry?.kind?undefined:seriesOf(entry));
const inSelectedArea = entry => !activeProject || entry.project===activeProject;
const occursOn = (task,key) => task.planned===key || task.due===key;
const effectiveDate = task => [task.planned,task.due].filter(Boolean).sort()[0] || '';
const isOverdue = task => !!task.due && task.due<today() && task.status!=='done';
const tasksFor = key => data.tasks.filter(t=>!isEvent(t)&&occursOn(t,key)&&inSelectedArea(t));
function eventsFor(key){
 const previousDay=addDays(key,-1);
 return data.tasks.filter(entry=>{
  if(!isEvent(entry)||!inSelectedArea(entry))return false;
  const start=calendarEventDay(entry);
  return start===key || (start===previousDay && entry.time && entry.duration && clockMinutes(entry.time)+entry.duration>1440);
 }).sort((a,b)=>agendaOrder(a,key).localeCompare(agendaOrder(b,key))||a.title.localeCompare(b.title,'de'));
}
function agendaOrder(entry,day){
 if(isEvent(entry)){
  if(!entry.time)return '';
  if(calendarEventDay(entry)<day)return '00:00';
 }
 return entry.time;
}
function deadlineMarkup(t){if(!t.due)return '';const late=isOverdue(t);return `<span class="deadline-tag ${late?'late':t.due===today()&&t.status!=='done'?'due-now':''}">${icon('flag')}${late?'Überfällig · ':t.due===today()?'Deadline heute':`Bis ${esc(relativeDate(t.due))}`}${late?esc(shortDate(t.due)):''}</span>`;}
function taskDates(t){return `${t.planned?`<span class="meta-time">${icon('calendar')}${esc(relativeDate(t.planned))}</span>`:''}${deadlineMarkup(t)}`;}
function makeTask(fields={}){return {id:uid(),title:'',notes:'',project:'',planned:'',due:'',time:'',duration:null,priority:2,status:'todo',top:false,createdAt:new Date().toISOString(),completedAt:null,sample:false,seriesId:null,occurrenceDate:'',seriesOverride:false,subtasks:[],reminder:null,...fields};}
function priorityDay(t){return t.planned||t.due||'';}
function priorityLimitReached(t,id=t.id){return data.tasks.filter(x=>x.id!==id&&!isEvent(x)&&priorityDay(x)===priorityDay(t)&&x.top&&x.status!=='done').length>=3;}
function futureDate(t){return [t.planned,t.due].filter(d=>d&&d>today()).sort()[0]||'';}
function sortTasks(tasks){return [...tasks].sort((a,b)=>{if((a.status==='done')!==(b.status==='done')) return a.status==='done'?1:-1;if(taskSort==='priority'&&a.priority!==b.priority)return a.priority-b.priority;if(taskSort==='title')return a.title.localeCompare(b.title,'de');return (effectiveDate(a)||'9999').localeCompare(effectiveDate(b)||'9999')||(a.time||'99').localeCompare(b.time||'99')||a.priority-b.priority;});}
function toast(message,actionLabel,action){clearTimeout(toastTimer);toastAction=action||null;const el=$('#toast');el.innerHTML=`<span>${esc(message)}</span>${actionLabel?`<button data-action="toast-action">${esc(actionLabel)}</button>`:''}`;el.classList.add('visible');toastTimer=setTimeout(()=>el.classList.remove('visible'),action?7000:4200);}
function spark(target){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const rect=target?.getBoundingClientRect();if(!rect)return;const el=document.createElement('span');el.className='completion-spark';el.textContent='✦';el.style.cssText=`left:${rect.x+4}px;top:${rect.y-5}px;color:#b7a16a`;document.body.append(el);setTimeout(()=>el.remove(),1000);}
function greeting(){const h=new Date().getHours();return h<11?'Guten Morgen':h<18?'Hallo':'Guten Abend';}
function nameGreeting(){return `${greeting()}${data.name?`, ${esc(data.name)}`:''}`;}
function navButton(id,label,name,count){return `<button class="nav-item ${view===id&&!activeProject?'active':''}" data-action="nav" data-view="${id}">${icon(name)}<span>${label}</span>${count!=null?`<span class="nav-count">${count}</span>`:''}</button>`;}
const viewLabels={templates:'Vorlagen',series:'Wiederholungen',today:'Mein Tag',tasks:'Alle Aufgaben',inbox:'Ideensammlung',upcoming:'Demnächst',calendar:'Kalender',board:'Board',focus:'Fokuszeit'};
function sidebar(){const open=data.tasks.filter(t=>!isEvent(t)&&t.status!=='done');return `<div class="mobile-menu-overlay ${mobileMenu?'visible':''}" data-action="close-menu"></div><aside id="side-menu" class="sidebar ${mobileMenu?'mobile-open':''}" aria-label="Seitenmenü">
 <div class="sidebar-scroll">
 <button class="brand" data-action="nav" data-view="today" aria-label="Daylight Startseite">${icon('sunrise')}<span>daylight<em>.</em></span></button>
 <div class="workspace"><div class="workspace-icon">${icon('grid')}</div><div><strong>Mein persönlicher Raum</strong><p>Ein bisschen mehr Überblick.</p></div></div>
 <div class="nav-group"><div class="nav-label">DEIN ALLTAG</div>${navButton('today','Mein Tag','sun',open.filter(t=>occursOn(t,today())).length)}${navButton('inbox','Ideensammlung','inbox',open.filter(t=>!t.planned&&!t.due).length)}${navButton('upcoming','Demnächst','calendar',null)}</div>
 <div class="nav-group"><div class="nav-label">DEINE ANSICHTEN</div>${navButton('tasks','Alle Aufgaben','list',open.length)}${navButton('calendar','Kalender','calendar')}${navButton('board','Board','board')}${navButton('focus','Fokuszeit','timer')}${navButton('series','Wiederholungen','reset')}${navButton('templates','Vorlagen','list')}</div>
 <div class="nav-group"><div class="nav-label">DEINE BEREICHE<button class="icon-btn" data-action="add-project" aria-label="Bereich hinzufügen">${icon('plus')}</button></div>${data.projects.map(p=>`<div class="sidebar-project"><button class="nav-item project-link ${activeProject===p.id?'active':''}" data-action="project" data-id="${esc(p.id)}"><span class="dot" style="background:${p.color}"></span><span>${esc(p.name)}</span><span class="nav-count">${open.filter(t=>t.project===p.id).length}</span></button><button class="icon-btn area-edit" data-action="edit-project" data-id="${esc(p.id)}" aria-label="${esc('Bereich '+p.name+' bearbeiten')}">${icon('edit')}</button></div>`).join('')}</div>
 </div>
 <div class="sidebar-bottom"><div class="sidebar-note"><svg class="sunrise icon" viewBox="0 0 24 24" aria-hidden="true">${iconPaths.sunrise}</svg><h4>Ein Tag nach<br>dem anderen.</h4><p>Du musst nicht alles schaffen.<br>Nur das, was heute zählt.</p></div><button class="nav-item sidebar-settings" data-action="settings">${icon('settings')}<span>Einstellungen</span></button></div></aside>`;}
function topbar(){return `<header class="topbar"><div class="breadcrumb">Mein Raum ${icon('right')} <strong>${esc(activeProject?data.projects.find(p=>p.id===activeProject)?.name:viewLabels[view])}</strong></div><div class="mobile-logo"><button class="icon-btn" data-action="menu" aria-label="Menü öffnen" aria-controls="side-menu" aria-expanded="${mobileMenu}">${icon('menu')}</button><button class="brand" data-action="nav" data-view="today">${icon('sunrise')}<span>daylight<em>.</em></span></button></div><div class="top-actions"><button class="search-trigger" data-action="search" aria-label="Aufgaben und Termine durchsuchen">${icon('search')}<span>Aufgaben und Termine durchsuchen</span><kbd>⌘ K</kbd></button>${data.demo&&view!=='today'?'<button class="sample-badge" data-action="settings"><span class="dot"></span>Beispieldaten</button>':''}<button class="icon-btn" data-action="settings" aria-label="Einstellungen">${icon('settings')}</button>${view==='calendar'?`<button class="btn btn-primary" data-action="add-event" aria-label="Neuen Termin erstellen">${icon('plus')} Neuer Termin</button>`:view!=='today'?`<button class="btn btn-primary" data-action="add-task" aria-label="Neue Aufgabe erstellen">${icon('plus')} Neue Aufgabe</button>`:''}</div></header>`;}
function mobileNav(){return `<nav class="mobile-nav" aria-label="Hauptnavigation">${[['today','Mein Tag','sun'],['tasks','Aufgaben','list'],['calendar','Kalender','calendar'],['board','Board','board'],['focus','Fokus','timer']].map(([id,label,i])=>`<button class="${view===id?'active':''}" data-action="nav" data-view="${id}">${icon(i)}<span>${label}</span></button>`).join('')}</nav>`;}
function pageFooter(){return `<footer class="page-footer"><span>${icon('shield')}<span id="footer-sync-status">${cloudEnabled?esc(syncMessage):'Lokal gespeichert · Geräteabgleich in Einstellungen'}</span></span><button data-action="settings">Sichern & Einstellungen ${icon('right')}</button></footer>`;}
function welcome(title,subtitle,tag,extra=''){return `<div class="welcome"><div><div class="eyebrow">${esc(tag)}</div><h1>${title}</h1><p>${esc(subtitle)}</p></div>${extra}</div>`;}
function empty(title,text,add=true,date=selectedDay){return `<div class="empty">${icon('leaf')}<h3>${esc(title)}</h3><p>${esc(text)}</p>${add?`<button class="btn btn-quiet" data-action="add-task" data-date="${esc(date)}">${icon('plus')}Aufgabe hinzufügen</button>`:''}</div>`;}
function baseTaskRow(t,showDate=false){return `<div class="task-row ${t.status==='done'?'done':''}" data-task="${esc(t.id)}"><button class="task-check" data-action="toggle-task" data-id="${esc(t.id)}" aria-label="${esc(t.status==='done'?`${t.title} wieder öffnen`:`${t.title} erledigen`)}" aria-pressed="${t.status==='done'}">${t.status==='done'?icon('check'):''}</button><button class="task-body" data-action="edit-task" data-id="${esc(t.id)}"><span class="task-name">${esc(t.title)}</span><span class="task-meta">${projectPill(t)}${t.seriesId?'<span class="recurrence-mark">'+icon('reset')+'Wöchentlich</span>':''}${showDate?taskDates(t):deadlineMarkup(t)}${t.time?`<span class="meta-time">${icon('clock')}${esc(t.time)}</span>`:''}${t.duration==null?'':`<span>${durationLabel(t.duration)}</span>`}${t.priority===1&&t.status!=='done'?'<span class="pill priority-high">Wichtig</span>':''}${t.status==='doing'?'<span class="pill pill-soft">In Arbeit</span>':''}</span></button><button class="task-star ${t.top?'marked':''}" data-action="star-task" data-id="${esc(t.id)}" aria-label="${esc(t.top?'Aus Tagesprioritäten entfernen':'Als Tagespriorität markieren')}" aria-pressed="${!!t.top}" title="${t.top?'Tagespriorität':'Als Tagespriorität markieren'}">${icon('star')}</button><button class="task-open" data-action="edit-task" data-id="${esc(t.id)}" aria-label="Aufgabe bearbeiten">${icon('more')}</button></div>`;}

function simpleTaskRow(t,options={}){const move=`<button class="icon-btn move-task-button" data-action="quick-move" data-id="${esc(t.id)}" aria-label="${esc(`${t.title} verschieben`)}" title="Verschieben">${icon('calendar')}</button>`;return `<div class="task-item">${baseSimpleTaskRow(t,options).replace('<button class="icon-btn simple-edit"',move+'<button class="icon-btn simple-edit"')}${subtaskList(t)}</div>`;}
function taskRow(t,showDate=false){const move=`<button class="icon-btn move-task-button" data-action="quick-move" data-id="${esc(t.id)}" aria-label="${esc(`${t.title} verschieben`)}">${icon('calendar')}</button>`;return `<div class="task-item">${baseTaskRow(t,showDate).replace('<button class="task-open"',move+'<button class="task-open"')}${subtaskList(t)}</div>`;}
function weekStrip(){const start=addDays(weekStart(today()),weekOffset*7);return `<div class="week-strip"><div class="week-label"><h3>Deine Woche</h3><p>Kalenderwoche ${weekNumber(start)}</p></div><div class="week-days">${Array.from({length:7},(_,i)=>{const key=addDays(start,i),count=tasksFor(key).filter(t=>t.status!=='done').length;return `<button class="week-day ${key===selectedDay?'selected':''} ${key===today()?'is-today':''}" data-action="select-day" data-date="${key}" aria-label="${esc(`${weekdayLong(key)}, ${longDate(key)}, ${count} offene Aufgaben`)}" aria-pressed="${key===selectedDay}"><span class="weekday">${dateOf(key).toLocaleDateString('de-DE',{weekday:'short'}).replace('.','')}</span><strong>${dateOf(key).getDate()}</strong><span class="day-dot ${count?'':'blank'}"></span></button>`;}).join('')}</div><div class="week-arrows"><button class="icon-btn" data-action="week-prev" aria-label="Vorherige Woche">${icon('left')}</button><button class="icon-btn" data-action="week-next" aria-label="Nächste Woche">${icon('right')}</button></div></div>`;}
function progressCard(tasks){const total=tasks.length,done=tasks.filter(t=>t.status==='done').length,ratio=total?done/total:0;return `<section class="card progress-card"><div class="progress-title">Ein Schritt nach dem anderen ${icon('spark')}</div><div class="progress-middle"><div class="progress-ring"><svg viewBox="0 0 80 80" aria-hidden="true"><circle class="track" cx="40" cy="40" r="34"/><circle class="fill" cx="40" cy="40" r="34" stroke-dasharray="213.63" stroke-dashoffset="${213.63*(1-ratio)}"/></svg><span class="value">${done}<small>/ ${total}</small></span></div><div class="progress-copy"><strong>${ratio===1&&total?'Alles geschafft.':done?'Du bist auf einem<br>guten Weg.':'Dein Tag liegt<br>vor dir.'}</strong><p>${total?'Jede erledigte Aufgabe zählt.':'Platz für einen neuen Plan.'}</p></div></div><div class="progress-footer"><strong>${Math.round(ratio*100)} % geschafft</strong><span>${total-done} ${total-done===1?'Aufgabe offen':'Aufgaben offen'}</span></div></section>`;}
function agendaTime(entry,day){
 if(!entry.time)return 'Ganztägig';
 const continued=isEvent(entry)&&calendarEventDay(entry)<day;
 const start=continued?'00:00':entry.time;
 if(entry.duration==null)return start;
 const end=clockMinutes(entry.time)+entry.duration;
 if(isEvent(entry)&&!continued&&end>=1440)return `${start}–24:00`;
 return `${start}–${endTime(entry.time,entry.duration)}`;
}
function eventHasPassed(entry,day){
 const start=calendarEventDay(entry),now=new Date();
 if(!entry.time)return start<keyOf(now);
 const end=dateOf(start);
 end.setHours(0,clockMinutes(entry.time)+(entry.duration||0),0,0);
 return day<=keyOf(now)&&end<=now;
}
function agendaRow(entry,day){
 const event=isEvent(entry),project=projectOf(entry);
 const past=event ? eventHasPassed(entry,day) : entry.status==='done';
 const color=project?.color||'var(--green)';
 const label=event?'Termin':past?'Erledigte Aufgabe':'Aufgabe';
 return `<button class="agenda-row ${past?'agenda-past':''}" data-action="edit-task" data-id="${esc(entry.id)}" style="--entry-color:${color}">
  <span class="agenda-time">${agendaTime(entry,day)}</span><span class="agenda-entry">${icon(event?'calendar':'list')}<span><strong>${esc(entry.title)}</strong><small>${label}${project?` · ${esc(project.name)}`:''}</small></span></span>${icon('right')}
 </button>`;
}
function timelineCard(tasks,events){
 const entries=[...events,...tasks.filter(t=>t.time&&t.planned===selectedDay)]
  .sort((a,b)=>agendaOrder(a,selectedDay).localeCompare(agendaOrder(b,selectedDay)));
 return `<section class="card day-agenda"><header class="agenda-heading"><h2>Tagesplan</h2><button class="text-btn" data-action="add-event" data-date="${selectedDay}">${icon('plus')} Termin</button></header>
 ${entries.length?`<div class="agenda-list">${entries.map(entry=>agendaRow(entry,selectedDay)).join('')}</div>`:'<p class="agenda-empty">Keine Termine oder Zeitblöcke für diesen Tag.</p>'}</section>`;
}
function top3Card(tasks){const picks=tasks.filter(t=>t.top&&priorityDay(t)===selectedDay&&t.status!=='done').slice(0,3);return `<section class="card top3"><div class="card-head"><h3>Was heute wirklich zählt</h3>${icon('star')}</div><div class="top3-list">${picks.length?picks.map((t,i)=>`<div class="top3-item"><span>0${i+1}</span><button data-action="edit-task" data-id="${esc(t.id)}">${esc(t.title)}</button></div>`).join(''):'<div class="top3-item">Ein klarer Kopf beginnt mit einer Priorität.</div>'}</div><p class="top3-info">Markiere bis zu drei Aufgaben mit einem Stern.</p></section>`;}
function baseSimpleTaskRow(t,options={}){const p=projectOf(t),clock=t.time&&t.planned===selectedDay;return `<div class="task-row simple-task-row ${t.status==='done'?'done':''}"><button class="task-check" data-action="toggle-task" data-id="${esc(t.id)}" aria-label="${esc(t.status==='done'?`${t.title} wieder öffnen`:`${t.title} erledigen`)}" aria-pressed="${t.status==='done'}">${t.status==='done'?icon('check'):''}</button><button class="task-body" data-action="edit-task" data-id="${esc(t.id)}"><span class="task-name">${esc(t.title)}</span>${p||clock||t.due||t.seriesId?`<span class="task-meta">${clock?`<span class="meta-time">${icon('clock')}${esc(t.time)}</span>`:''}${deadlineMarkup(t)}${t.seriesId?'<span class="recurrence-mark" title="Wiederkehrender Termin">'+icon('reset')+'Wöchentlich</span>':''}${p?`<span class="simple-area"><span class="dot" style="background:${p.color}"></span>${esc(p.name)}</span>`:''}</span>`:''}</button>${options.replan?`<button class="replan-btn" data-action="plan-today" data-id="${esc(t.id)}" aria-label="${esc(`${t.title} für heute einplanen`)}">Für heute</button>`:''}${t.top?`<span class="simple-priority" aria-label="Tagespriorität" title="Tagespriorität">${icon('star')}</span>`:''}<button class="icon-btn simple-edit" data-action="edit-task" data-id="${esc(t.id)}" aria-label="${esc(`${t.title} bearbeiten`)}">${icon('right')}</button></div>`;}

function todayView(){
 const tasks=tasksFor(selectedDay),open=sortTasks(tasks.filter(t=>t.status!=='done')),done=sortTasks(tasks.filter(t=>t.status==='done'));
 const isToday=selectedDay===today(),unfinished=sortTasks(data.tasks.filter(t=>!isEvent(t)&&t.status!=='done'&&!occursOn(t,selectedDay)&&(isOverdue(t)||(t.planned&&t.planned<today()))&&inSelectedArea(t)));
 return `<div class="simple-day"><header class="simple-day-heading"><div><div class="eyebrow">${esc(weekdayLong(selectedDay))}, ${esc(longDate(selectedDay))}</div><h1>${isToday?'Heute':esc(weekdayLong(selectedDay))}<span class="simple-heading-sun">${icon('sun')}</span></h1><p>${open.length?`Noch <strong>${open.length}</strong> ${open.length===1?'Aufgabe':'Aufgaben'}${isToday?' für heute':''}. Eins nach dem anderen.`:done.length?'Alles erledigt. Genieß deinen Freiraum.':'Was möchtest du dir für diesen Tag vornehmen?'}</p></div><div class="simple-date-nav"><button class="icon-btn" data-action="day-prev" aria-label="Vorheriger Tag">${icon('left')}</button>${!isToday?'<button class="text-btn" data-action="nav" data-view="today">Heute</button>':''}<button class="icon-btn" data-action="day-next" aria-label="Nächster Tag">${icon('right')}</button></div></header>
 <section class="simple-entry" aria-label="Neue Aufgabe"><form id="quick-add" class="simple-quick-add"><label for="quick-title" class="sr-only">Neue Aufgabe für ${esc(isToday?'heute':longDate(selectedDay))}</label><span class="simple-input-icon">${icon('plus')}</span><input id="quick-title" name="title" maxlength="180" value="${esc(quickDrafts.get(selectedDay)||'')}" placeholder="${isToday?'Neue Aufgabe für heute …':'Neue Aufgabe für diesen Tag …'}" autocomplete="off" required enterkeyhint="done"><button type="submit" class="btn btn-primary" aria-label="Aufgabe hinzufügen">${icon('plus')}<span>Hinzufügen</span></button></form><div class="entry-helper"><span>Tippen und mit Enter hinzufügen.</span><button class="simple-add-details" data-action="add-task" data-date="${selectedDay}">${icon('calendar')}Mit Deadline oder Details</button></div></section>
 <div class="simple-day-content">
 ${timelineCard(tasks,eventsFor(selectedDay))}
 <section class="card simple-tasks"><div class="simple-list-heading"><h2>Noch zu erledigen <span>${open.length}</span></h2>${done.length?`<span class="simple-done-count">${icon('check')}${done.length} erledigt</span>`:''}</div><div class="task-list">${open.length?open.map(t=>simpleTaskRow(t)).join(''):empty(done.length?'Für diesen Tag ist alles geschafft.':'Keine offenen Aufgaben.',done.length?'Neue Aufgaben kannst du oben eintragen.':'Trage oben deine erste Aufgabe ein.',false)}</div>${done.length?`<details class="simple-completed" data-keep-open="done-${selectedDay}"><summary>${icon('check')}Erledigte Aufgaben<span>${done.length}</span>${icon('down')}</summary><div class="task-list">${done.map(t=>simpleTaskRow(t)).join('')}</div></details>`:''}</section>
 ${isToday&&unfinished.length?`<details class="simple-fold simple-overdue" data-keep-open="unfinished"><summary>${icon('flag')}Von vorher noch offen <span>${unfinished.length}</span>${icon('down')}</summary><p class="fold-help">Bei Bedarf mit „Für heute“ neu einplanen. Die Deadline bleibt bestehen.</p><div class="card"><div class="task-list">${unfinished.map(t=>simpleTaskRow(t,{replan:true})).join('')}</div></div></details>`:''}
 <details class="simple-fold" data-keep-open="day-priorities"><summary>${icon('star')}Tagesprioritäten${icon('down')}</summary>${top3Card(tasks)}</details></div></div>`;
}

function filters({withSort=true}={}){return `<div class="view-toolbar"><div class="filter-chips"><button class="filter-chip ${!activeProject?'active':''}" data-action="project-filter" data-id="">Alle Bereiche</button>${data.projects.map(p=>`<button class="filter-chip ${activeProject===p.id?'active':''}" data-action="project-filter" data-id="${esc(p.id)}"><span class="dot" style="background:${p.color}"></span>${esc(p.name)}</button>`).join('')}</div>${withSort?`<label class="sr-only" for="task-sort">Aufgaben sortieren</label><select id="task-sort" class="sort-select"><option value="date" ${taskSort==='date'?'selected':''}>Nach Datum sortieren</option><option value="priority" ${taskSort==='priority'?'selected':''}>Nach Priorität sortieren</option><option value="title" ${taskSort==='title'?'selected':''}>Nach Titel sortieren</option></select>`:''}</div>`;}
function allTasksView(){
 const all=data.tasks.filter(t=>!isEvent(t)&&inSelectedArea(t)),isInbox=view==='inbox',isUpcoming=view==='upcoming';
 const scoped=all.filter(t=>taskFilter==='done'?t.status==='done':taskFilter==='all'?true:t.status!=='done');
 let groups;
 if(isInbox)groups=[['Ohne Datum',scoped.filter(t=>!t.planned&&!t.due),'inbox']];
 else if(isUpcoming)groups=[['Morgen',scoped.filter(t=>futureDate(t)===addDays(today(),1)),'calendar'],['Die nächsten 7 Tage',scoped.filter(t=>futureDate(t)>addDays(today(),1)&&futureDate(t)<=addDays(today(),7)),'calendar'],['Später',scoped.filter(t=>futureDate(t)>addDays(today(),7)),'calendar']];
 else {const pending=scoped.filter(t=>t.status!=='done');groups=[['Überfällige Deadlines',pending.filter(isOverdue),'flag'],['Heute',pending.filter(t=>!isOverdue(t)&&occursOn(t,today())),'sun'],['Früher geplant',pending.filter(t=>!isOverdue(t)&&!occursOn(t,today())&&t.planned&&t.planned<today()),'clock'],['Demnächst',pending.filter(t=>!isOverdue(t)&&!occursOn(t,today())&&(!t.planned||t.planned>today())&&futureDate(t)),'calendar'],['Ohne Datum',pending.filter(t=>!t.planned&&!t.due),'inbox'],['Erledigt',scoped.filter(t=>t.status==='done'),'check']];}
 const title=activeProject?esc(data.projects.find(p=>p.id===activeProject)?.name||'Dein Bereich'):isInbox?'Ideensammlung':isUpcoming?'Demnächst':'Alle Aufgaben';
 const open=all.filter(t=>t.status!=='done');
 return `${welcome(title,isInbox?'Gedanken festhalten und später einplanen.':isUpcoming?'Geplante Aufgaben und kommende Deadlines.':'Aufgaben finden, bearbeiten und einplanen.','DEIN ÜBERBLICK')}<div class="task-status-tabs segments" aria-label="Aufgabenstatus">${[['open','Offen'],['all','Alle'],['done','Erledigt']].map(([id,label])=>`<button class="${taskFilter===id?'selected':''}" data-action="task-filter" data-filter="${id}" aria-pressed="${taskFilter===id}">${label}</button>`).join('')}</div>${filters()}<div class="all-tasks-grid"><div>${groups.some(g=>g[1].length)?groups.filter(g=>g[1].length).map(([label,tasks,i])=>`<section class="card task-group"><div class="task-group-head"><span class="${i==='flag'?'overdue-label':''}">${icon(i)}${label}<small>${tasks.length}</small></span><button class="icon-btn" data-action="add-task" ${isInbox?'data-date=""':''} aria-label="Aufgabe hinzufügen">${icon('plus')}</button></div><div class="task-list">${sortTasks(tasks).map(t=>taskRow(t,true)).join('')}</div></section>`).join(''):`<section class="card">${empty(taskFilter==='done'?'Noch nichts erledigt.':'Keine offenen Aufgaben.',taskFilter==='done'?'Abgehakte Aufgaben findest du später hier.':'Du kannst jederzeit eine neue Aufgabe hinzufügen.',taskFilter!=='done',isInbox?'':today())}</section>`}</div><aside class="card insight-card"><h3>Offene Aufgaben</h3><p>Nach deinen Bereichen.</p>${data.projects.map(p=>{const count=open.filter(t=>t.project===p.id).length;return `<div class="area-stat"><span><span class="dot" style="background:${p.color}"></span>${esc(p.name)}</span><span>${count}</span></div><div class="area-bar"><span style="width:${open.length?count/open.length*100:0}%;background:${p.color}"></span></div>`;}).join('')}</aside></div>`;
}

function boardView(){const tasks=data.tasks.filter(t=>!isEvent(t)&&inSelectedArea(t));return `${welcome('Board','Aufgaben nach Status ordnen.','DEIN ÜBERBLICK')}${filters()}<div class="board">${[['todo','Offen','#b6bdad'],['doing','In Arbeit','#b8ae75'],['done','Erledigt','#8ca778']].map(([status,label,color])=>`<section class="board-col" data-status="${status}"><header class="board-col-head"><h3><span class="dot" style="background:${color}"></span>${label}<small>${tasks.filter(t=>t.status===status).length}</small></h3><button class="icon-btn" data-action="add-task" data-status="${status}" aria-label="Aufgabe zu ${label} hinzufügen">${icon('plus')}</button></header>${sortTasks(tasks.filter(t=>t.status===status)).map(t=>`<article class="board-card" draggable="true" data-id="${esc(t.id)}"><div class="board-card-head">${projectPill(t)}<button class="task-star ${t.top?'marked':''}" data-action="star-task" data-id="${esc(t.id)}" aria-label="Tagespriorität ändern">${icon('star')}</button></div><button class="board-card-title" data-action="edit-task" data-id="${esc(t.id)}"><h4>${esc(t.title)}</h4>${t.notes?`<p class="board-note">${esc(t.notes.length>100?t.notes.slice(0,100)+'…':t.notes)}</p>`:''}</button><div class="board-card-foot"><span class="board-dates">${t.planned?`<span>${icon('calendar')}${esc(relativeDate(t.planned))}</span>`:''}${deadlineMarkup(t)}${!t.planned&&!t.due?'Ohne Datum':''}</span><label class="sr-only" for="status-${esc(t.id)}">Status von ${esc(t.title)}</label><select class="status-select" id="status-${esc(t.id)}" data-status-id="${esc(t.id)}">${['todo','doing','done'].map(s=>`<option value="${s}" ${s===status?'selected':''}>${statusName(s)}</option>`).join('')}</select></div></article>`).join('')}<button class="board-add" data-action="add-task" data-status="${status}">${icon('plus')}Aufgabe hinzufügen</button></section>`).join('')}</div><p class="board-help">${icon('grip')}Am Computer: Karten zwischen den Spalten ziehen. Am Handy: Status an der Karte wählen.</p>`;}
function calendarMarker(entry,type,title){
 const color=projectOf(entry)?.color||'var(--green)';
 return `<span class="calendar-marker marker-${type} ${type!=='event'&&entry.status==='done'?'marker-done':''}" style="--entry-color:${color}">
  <span class="marker-symbol">${type==='deadline'?icon('flag'):''}</span><span class="marker-title">${esc(title)}</span>
 </span>`;
}
function calendarDay(key,monthKey){
 const events=eventsFor(key),tasks=sortTasks(tasksFor(key));
 const deadlines=tasks.filter(t=>t.due===key),planned=tasks.filter(t=>t.planned===key&&t.due!==key);
 const cap=calendarMode==='week'?6:2;
 const eventMarkers=events.slice(0,cap).map(t=>calendarMarker(t,'event',`${agendaTime(t,key)} ${t.title}`));
 const taskMarkers=[...deadlines.map(t=>({t,type:'deadline'})),...planned.map(t=>({t,type:'task'}))]
  .slice(0,Math.max(cap-eventMarkers.length,deadlines.length?1:0))
  .map(({t,type})=>calendarMarker(t,type,`${t.time&&t.planned===key?t.time+' ':''}${t.title}`));
 const more=events.length+tasks.length-eventMarkers.length-taskMarkers.length;
 const counts=[events.length===1?'1 Termin':`${events.length} Termine`,tasks.length===1?'1 Aufgabe':`${tasks.length} Aufgaben`];
 if(deadlines.length)counts.push(deadlines.length===1?'1 Deadline':`${deadlines.length} Deadlines`);
 const label=esc(`${weekdayLong(key)}, ${longDate(key)}. ${counts.join(', ')}`);
 return `<button class="calendar-cell ${key===selectedDay?'selected':''} ${key===today()?'today':''} ${key.slice(0,7)!==monthKey.slice(0,7)&&calendarMode==='month'?'other-month':''}" data-action="calendar-day" data-date="${key}" aria-label="${label}" aria-pressed="${key===selectedDay}">
  <strong>${dateOf(key).getDate()}</strong><span class="calendar-markers" aria-hidden="true">${eventMarkers.join('')}${taskMarkers.join('')}${more?`<span class="calendar-more">+${more}</span>`:''}</span>
 </button>`;
}
function calendarView(){
 const monthKey=keyOf(monthCursor),weekly=calendarMode==='week',start=weekStart(weekly?selectedDay:monthKey);
 const daysInMonth=new Date(monthCursor.getFullYear(),monthCursor.getMonth()+1,0).getDate();
 const cellCount=weekly?7:7*Math.ceil(((monthCursor.getDay()+6)%7+daysInMonth)/7);
 const dates=Array.from({length:cellCount},(_,i)=>addDays(start,i));
 const dayTasks=sortTasks(tasksFor(selectedDay)),dayEvents=eventsFor(selectedDay);
 const title=weekly?`${shortDate(dates[0])} – ${shortDate(dates[6])}`:monthCursor.toLocaleDateString('de-DE',{month:'long',year:'numeric'});
 return `${welcome('Kalender','Termine, geplante Aufgaben und Deadlines.','DEIN ÜBERBLICK')}${filters({withSort:false})}<div class="calendar-layout">
  <section class="card calendar-card ${weekly?'week-calendar':''}"><div class="calendar-toolbar"><h2>${title}</h2><div class="row gap">
   <div class="segments"><button data-action="calendar-mode" data-mode="month" class="${!weekly?'selected':''}">Monat</button><button data-action="calendar-mode" data-mode="week" class="${weekly?'selected':''}">Woche</button></div>
   <button class="icon-btn" data-action="calendar-prev" aria-label="Vorheriger Zeitraum">${icon('left')}</button><button class="btn btn-secondary" data-action="calendar-today">Heute</button><button class="icon-btn" data-action="calendar-next" aria-label="Nächster Zeitraum">${icon('right')}</button>
  </div></div>
  <div class="calendar-weekdays">${WEEKDAYS.map(day=>`<span>${day.short}</span>`).join('')}</div>
  <div class="calendar-grid">${dates.map(key=>calendarDay(key,monthKey)).join('')}</div>
  <div class="calendar-explanation calendar-key"><span><i class="key-event"></i> Termin</span><span><i class="key-task"></i> Aufgabe</span><span>${icon('flag')} Deadline</span></div>
  </section>
  <section class="card calendar-side has-selection" id="calendar-selection">
   <header class="calendar-side-head"><div class="eyebrow">${esc(weekdayLong(selectedDay))}</div><h3>${esc(longDate(selectedDay))}</h3></header>
   <div class="calendar-add"><button class="btn btn-primary" data-action="add-event" data-date="${selectedDay}">${icon('plus')} Termin</button><button class="btn btn-secondary" data-action="add-task" data-date="${selectedDay}">${icon('plus')} Aufgabe</button></div>
   ${dayEvents.length?`<div class="calendar-day-agenda"><h4>Termine</h4>${dayEvents.map(t=>agendaRow(t,selectedDay)).join('')}</div>`:''}
   ${dayTasks.length?`<div class="calendar-day-tasks"><h4>Aufgaben</h4><div class="task-list">${dayTasks.map(t=>taskRow(t,true)).join('')}</div></div>`:''}
   ${!dayEvents.length&&!dayTasks.length?'<p class="agenda-empty">Für diesen Tag ist noch nichts geplant.</p>':''}
  </section></div>`;
}
function focusDurationOptions(focus){
 const options=[
  [25,'25 Min.','focus'],[50,'50 Min.','focus'],[null,'Eigene Dauer','focus'],
  [5,'Kurze Pause','break'],[15,'Lange Pause','break'],
 ];
 return options.map(([minutes,label,kind])=>{
  const selected=focus.kind===kind&&(minutes===null?focus.custom:!focus.custom&&focus.mode===minutes);
  const action=minutes===null?'focus-custom':'focus-mode';
  return `<button type="button" class="${selected?'selected':''}" data-action="${action}" data-mode="${minutes??''}" data-kind="${kind}" aria-pressed="${selected}" ${focus.running?'disabled':''}>${label}</button>`;
 }).join('');
}
function focusView(){
 const f=data.focus,task=data.tasks.find(t=>t.id===f.taskId&&!isEvent(t));
 const sessions=data.sessions.filter(s=>s.date===today()),minutes=sessions.reduce((sum,session)=>sum+session.minutes,0);
 const available=sortTasks(data.tasks.filter(t=>!isEvent(t)&&t.status!=='done'&&inSelectedArea(t))).slice(0,12);
 const startLabel=f.running?'Pausieren':f.remaining===0?'Neu starten':f.remaining<f.mode*60?'Fortsetzen':f.kind==='break'?'Pause starten':'Fokus starten';
 return `${welcome('Fokuszeit','Eine Aufgabe auswählen. Timer starten.','DEIN FOKUS')}<div class="focus-layout">
 <section class="focus-stage">
  <div class="segments focus-options" aria-label="Fokusdauer">${focusDurationOptions(f)}</div>
  <div class="focus-clock-wrap"><svg class="focus-clock-ring" viewBox="0 0 260 260" aria-hidden="true"><circle cx="130" cy="130" r="118"/><circle class="timer-fill" cx="130" cy="130" r="118" stroke-dasharray="741.42" stroke-dashoffset="0"/></svg>
   <div class="focus-time"><strong id="focus-digits">${timerDigits()}</strong><span id="focus-state">${f.kind==='break'?'Pause':f.custom?'Eigene Fokusdauer':'Fokuszeit'}</span></div>
  </div>
  <div class="focus-buttons"><button class="btn btn-primary" data-action="focus-toggle" id="focus-toggle">${icon(f.running?'pause':'play')}${startLabel}</button><button class="icon-btn" data-action="focus-reset" aria-label="Timer zurücksetzen">${icon('reset')}</button></div>
  ${task?`<p class="focus-caption">Dein Fokus: <strong>${esc(task.title)}</strong></p>`:''}
  ${task&&task.status!=='done'?`<div class="focus-complete"><button class="btn" data-action="toggle-task" data-id="${esc(task.id)}">${icon('check')} Aufgabe erledigt</button></div>`:''}
 </section>
 <div class="focus-right"><section class="card"><div class="card-head"><h2>Aufgabe auswählen</h2></div><div class="focus-tasklist">
  ${available.map(t=>`<button class="focus-task ${f.taskId===t.id?'selected':''}" data-action="focus-task" data-id="${esc(t.id)}"><span>${f.taskId===t.id?icon('check'):''}</span><div><h4>${esc(t.title)}</h4><p>${esc(t.planned?relativeDate(t.planned):t.due?`Deadline: ${relativeDate(t.due)}`:'Ohne Datum')}</p></div></button>`).join('')||'<p class="agenda-empty">Keine offenen Aufgaben.</p>'}
 </div></section>
 <section class="card focus-day"><h3>Fokuszeit heute</h3><p><strong>${minutes} Min.</strong> · ${sessions.length} abgeschlossene ${sessions.length===1?'Fokuseinheit':'Fokuseinheiten'}</p></section>
 </div></div>`;
}
function render({keepQuickInput=false}={}){
 const scroll=window.scrollY,menuScroll=$('.sidebar-scroll',app)?.scrollTop||0;
 pendingBackgroundRender=false;
 if(ensureSeriesForView())save();
 $$('[data-keep-open]',app).forEach(panel=>{if(panel.open)openPanels.add(panel.dataset.keepOpen);else openPanels.delete(panel.dataset.keepOpen);});
 if(keepQuickInput&&$('#quick-title',app)){
  const updated=document.createElement('template');
  updated.innerHTML=todayView();
  for(const selector of ['.simple-day-heading','.simple-day-content']){
   $(selector,app).replaceWith($(selector,updated.content));
  }
  $('#quick-title',app).placeholder=$('#quick-title',updated.content).placeholder;
  $('label[for="quick-title"]',app).textContent=$('label[for="quick-title"]',updated.content).textContent;
 }else{
 app.innerHTML=`${sidebar()}<main class="main">${topbar()}${!storageAvailable?'<div class="storage-warning">Dein Browser kann gerade nicht speichern. Exportiere deine Einträge in den Einstellungen.</div>':''}<div class="fade-page">${view==='today'?todayView():view==='calendar'?calendarView():view==='board'?boardView():view==='focus'?focusView():view==='series'?seriesView():view==='templates'?templatesView():allTasksView()}</div>${pageFooter()}</main>${mobileNav()}`;
  const menu=$('.sidebar-scroll',app);
  if(mobileMenu&&menu)menu.scrollTop=menuScroll;
  window.scrollTo(0,scroll);
 }
 $$('[data-keep-open]',app).forEach(panel=>{panel.open=openPanels.has(panel.dataset.keepOpen);});
 updateTimerUI();
 updateSyncStatus();
}

function renderBackground(){
 const day=today();
 if(view==='today'&&selectedDay===lastSeenDay){
  const draft=quickDrafts.get(selectedDay),editing=document.activeElement?.id==='quick-title';
  if(day!==lastSeenDay&&!editing&&!draft)selectedDay=day;
 }
 lastSeenDay=day;
 const active=document.activeElement;
 const typingQuick=active?.id==='quick-title' && view==='today';
 if(dialogRoot.children.length || mobileMenu || (!typingQuick && active?.matches('input, textarea, select, [contenteditable="true"]'))){
  pendingBackgroundRender=true;
  return;
 }
 render({keepQuickInput:typingQuick});
}

function navigate(next){view=next;activeProject='';taskFilter='open';mobileMenu=false;if(next==='today'){selectedDay=today();lastSeenDay=selectedDay;weekOffset=0;}if(next==='calendar')monthCursor=new Date(dateOf(selectedDay).getFullYear(),dateOf(selectedDay).getMonth(),1);render();window.scrollTo({top:0,behavior:'instant'});}
function changeTask(id,changes,message='Aufgabe aktualisiert.'){
 const entry=data.tasks.find(t=>t.id===id);
 if(!entry)return;
 const previous=structuredClone(entry);
 const seriesFields=['title','notes','planned','due','time','duration','project','priority','subtasks','reminder'];
 if(entry.seriesId&&seriesFields.some(key=>Object.hasOwn(changes,key)&&JSON.stringify(changes[key])!==JSON.stringify(entry[key])))entry.seriesOverride=true;
 Object.assign(entry,changes);
 if(!isEvent(entry)&&entry.top&&entry.status!=='done'&&priorityLimitReached(entry))entry.top=false;
 if(changes.status&&changes.status!==previous.status)entry.completedAt=changes.status==='done'?new Date().toISOString():null;
 save();
 render();
 if(message)toast(message,'Rückgängig',()=>{
  const index=data.tasks.findIndex(t=>t.id===id);
  if(index<0)return;
  data.tasks[index]=previous;
  save();
  render();
  toast('Änderung rückgängig gemacht.');
 });
}
function toggleTask(id,target){
 const task=data.tasks.find(t=>t.id===id);
 if(!task||isEvent(task))return;
 const done=task.status!=='done';
 if(done)spark(target);
 changeTask(id,{status:done?'done':'todo'},done?'Aufgabe erledigt.':'Aufgabe wieder geöffnet.');
}
function toggleStar(id){
 const task=data.tasks.find(t=>t.id===id);
 if(!task||isEvent(task))return;
 if(!task.top&&priorityLimitReached(task)){toast('Du hast schon drei Tagesprioritäten.');return;}
 changeTask(id,{top:!task.top},task.top?'Tagespriorität entfernt.':'Als Tagespriorität markiert.');
}
function showDialog(html){closeDialog(false);lastFocus=document.activeElement;dialogRoot.innerHTML=`<div class="modal-backdrop" data-action="backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">${html}</section></div>`;document.body.style.overflow='hidden';requestAnimationFrame(()=>{const target=$('[autofocus]',dialogRoot)||$('input, button, select, textarea',dialogRoot);target?.focus();});}
function closeDialog(restore=true){dialogCleanup?.();dialogCleanup=null;dialogRoot.innerHTML='';document.body.style.overflow='';if(restore&&lastFocus?.isConnected)lastFocus.focus();if(restore&&pendingBackgroundRender)renderBackground();}
function modalHead(title,subtitle){return `<div class="modal-head"><div><h2 id="modal-title">${esc(title)}</h2>${subtitle?`<p>${esc(subtitle)}</p>`:''}</div><button class="icon-btn" data-action="close-dialog" aria-label="Schließen">${icon('close')}</button></div>`;}
function taskDialog(id,defaults={}){
 const editingSeries=defaults.seriesEditId?data.series.find(s=>s.id===defaults.seriesEditId):null,template=defaults.templateId?data.templates.find(t=>t.id===defaults.templateId):null;
 const existing=data.tasks.find(t=>t.id===id),draft=Object.hasOwn(defaults,'planned')?defaults.planned:(view==='inbox'?'':selectedDay);
 if(isEvent(existing)||isCalendarEvent(editingSeries)||defaults.kind==='event'){
  eventDialog(existing,editingSeries,defaults);
  return;
 }
 const t=existing||(editingSeries?makeTask({...editingSeries,planned:editingSeries.start,due:editingSeries.dueOffset==null?'':addDays(editingSeries.start,editingSeries.dueOffset),subtasks:normalizeSubtasks(editingSeries.subtasks).map(x=>({...x,done:false}))}):template?makeTask({...template,id:uid(),planned:draft,due:template.dueOffset==null||!draft?'':addDays(draft,template.dueOffset),subtasks:normalizeSubtasks(template.subtasks).map(x=>({...x,id:uid(),done:false}))}):makeTask({planned:draft,project:activeProject||'',status:defaults.status||'todo',title:quickDrafts.get(selectedDay)||''}));
 if(editingSeries)defaults={...defaults,repeat:true,seriesRule:editingSeries};
 const detailsOpen=!!existing&&(t.time||t.notes||t.project||t.top||t.priority!==2||t.status!=='todo');
 showDialog(`${modalHead(editingSeries?'Wochenserie bearbeiten':existing?'Aufgabe bearbeiten':'Neue Aufgabe','Geplant am = daran arbeiten. Deadline = spätestens fertig.')}<form id="task-form" data-id="${esc(existing?.id||'')}" data-series-edit="${esc(editingSeries?.id||'')}" data-reminder-zone="${esc(t.reminder?.timeZone||'')}">${!existing&&!editingSeries&&data.templates.length?'<button type="button" class="template-link text-btn" data-action="pick-template">Aus Vorlage übernehmen</button>':''}<div class="form-field form-title"><label for="task-title">Was möchtest du erledigen?</label><input autofocus id="task-title" name="title" maxlength="180" value="${esc(t.title)}" placeholder="Zum Beispiel: Exposé überarbeiten" required enterkeyhint="next"></div>
 <div class="form-field planned-field"><label for="task-planned">${icon('calendar')}<span id="planned-label">Geplant am</span></label><div class="date-choices" role="group" aria-label="Arbeitstag wählen">${[['today','Heute'],['tomorrow','Morgen'],['none','Noch offen']].map(([choice,label])=>`<button type="button" data-action="choose-plan" data-choice="${choice}" aria-pressed="${t.planned===(choice==='today'?today():choice==='tomorrow'?addDays(today(),1):'')}">${label}</button>`).join('')}</div><input type="date" id="task-planned" name="planned" value="${esc(t.planned)}" min="1900-01-01" max="2200-12-31"><span class="field-hint">An diesem Tag steht die Aufgabe auf deiner Tagesliste.</span></div>
 <div class="form-field deadline-field"><label for="task-due">${icon('flag')}Deadline <span>falls es eine Frist gibt</span></label><div class="date-with-clear"><input type="date" id="task-due" name="due" value="${esc(t.due)}" min="1900-01-01" max="2200-12-31"><button type="button" class="icon-btn" data-action="clear-deadline" aria-label="Deadline entfernen" title="Deadline entfernen">${icon('close')}</button></div></div>
 <p class="date-feedback" id="date-feedback" role="status"></p>
 ${editingSeries?'<p class="settings-note">Änderungen gelten für heutige und künftige offene Termine. Erledigte und einzeln angepasste Termine bleiben erhalten.</p>':''}
 ${recurrenceForm(t,existing,defaults)}
 ${subtasksForm(t.subtasks)}
 <details class="task-more" ${detailsOpen?'open':''}><summary>${icon('more')}Weitere Angaben <span>Uhrzeit, Bereich, Notizen …</span>${icon('down')}</summary><div class="task-more-content"><div class="form-grid"><div class="form-field"><label for="task-time">Startzeit</label><input type="time" id="task-time" name="time" value="${esc(t.time)}"></div><div class="form-field"><label for="task-duration">Geschätzte Dauer</label><select id="task-duration" name="duration"><option value="" ${t.duration==null?'selected':''}>(Keine Angabe)</option>${[5,10,15,20,25,30,45,60,90,120,180,240,360,480,720,...(t.duration!=null&&![5,10,15,20,25,30,45,60,90,120,180,240,360,480,720].includes(t.duration)?[t.duration]:[])].sort((a,b)=>a-b).map(n=>`<option value="${n}" ${n===t.duration?'selected':''}>${durationLabel(n)}</option>`).join('')}</select></div><div class="form-field"><label for="task-project">Bereich</label><select id="task-project" name="project"><option value="">Ohne Bereich</option>${data.projects.map(p=>`<option value="${esc(p.id)}" ${t.project===p.id?'selected':''}>${esc(p.name)}</option>`).join('')}</select></div><div class="form-field task-only"><label for="task-priority">Priorität</label><select id="task-priority" name="priority"><option value="1" ${t.priority===1?'selected':''}>Wichtig</option><option value="2" ${t.priority===2?'selected':''}>Normal</option><option value="3" ${t.priority===3?'selected':''}>Hat Zeit</option></select></div><div class="form-field task-only"><label for="task-status">Status</label><select id="task-status" name="status">${['todo','doing','done'].map(status=>`<option value="${status}" ${t.status===status?'selected':''}>${statusName(status)}</option>`).join('')}</select></div></div>${reminderForm(t.reminder)}<div class="form-field"><label for="task-notes">Notizen</label><textarea id="task-notes" name="notes" maxlength="4000" placeholder="Details oder nächste Schritte …">${esc(t.notes)}</textarea></div><label class="form-check task-only"><input type="checkbox" name="top" ${t.top?'checked':''}>${icon('star')}Eine meiner drei Tagesprioritäten</label></div></details>
 <button type="button" class="text-btn save-template-link" data-action="save-template-from-form">${icon('list')}Als Vorlage speichern</button><div class="modal-actions task-save-actions">${existing?`<button type="button" class="btn btn-danger" data-action="delete-task" data-id="${esc(existing.id)}" aria-label="Aufgabe löschen">${icon('trash')}Löschen</button>`:'<span></span>'}<div class="row"><button type="button" class="btn btn-secondary" data-action="close-dialog">Abbrechen</button><button class="btn btn-primary" type="submit">${icon('check')}${existing||editingSeries?'Speichern':'Hinzufügen'}</button></div></div></form>`);
 syncDateChips();updateReminderForm();
}
function syncDateChips(){const input=$('#task-planned');if(!input)return;if($('#event-times')){updateRecurrenceForm();updateReminderForm();return;}if(!input.value&&$('#task-time'))$('#task-time').value='';$$('[data-action="choose-plan"]',dialogRoot).forEach(btn=>{const value=btn.dataset.choice==='today'?today():btn.dataset.choice==='tomorrow'?addDays(today(),1):'';btn.setAttribute('aria-pressed',String(input.value===value));});const due=$('#task-due')?.value,feedback=$('#date-feedback');if(feedback){feedback.textContent=input.value&&due&&input.value>due?'Dein Arbeitstag liegt nach der Deadline. Prüfe die beiden Daten.':'';feedback.classList.toggle('has-feedback',!!feedback.textContent);}const clear=$('[data-action="clear-deadline"]',dialogRoot);if(clear)clear.hidden=!due;updateRecurrenceForm();}

function saveTaskForm(form){
 if(form.dataset.kind==='event'){saveEventForm(form);return;}
 const fields=new FormData(form),id=form.dataset.id,planned=String(fields.get('planned')||''),time=String(fields.get('time')||'');
 const existing=data.tasks.find(t=>t.id===id),series=data.series.find(s=>s.id===form.dataset.seriesEdit);
 if((id&&(!existing||isEvent(existing)))||(form.dataset.seriesEdit&&(!series||isCalendarEvent(series)))){
  toast('Dieser Eintrag wurde auf einem anderen Gerät geändert.');
  closeDialog();
  return;
 }
 const recurringEvent=fields.get('repeatMode')==='weekly'&&fields.get('repeatKind')==='event'&&!id&&!series;
 const due=recurringEvent?'':String(fields.get('due')||'');
 if((planned&&!validDate(planned))||(due&&!validDate(due))){toast('Bitte gib ein gültiges Datum ein.');return;}
 if(time&&!planned){toast('Wähle zur Startzeit bitte einen geplanten Arbeitstag.');$('#task-planned').focus();return;}
 if(time&&!validTime(time)){toast('Bitte gib eine gültige Uhrzeit ein.');return;}
 const title=String(fields.get('title')||'').trim();if(!title){$('#task-title').focus();return;}
 const basics={title:title.slice(0,180),notes:String(fields.get('notes')||'').slice(0,4000),project:String(fields.get('project')||''),planned,due,time,reminder:readReminder(form,recurringEvent)};
 const duration=normalizeDuration(fields.get('duration'));
 const changes=recurringEvent?{...basics,kind:'event',duration:time?duration:null}:
  {...basics,duration,priority:Number(fields.get('priority')),status:String(fields.get('status')),top:fields.has('top'),subtasks:readSubtasks(form)};
 let recurrence;try{recurrence=readRecurrence(form);}catch(error){toast(error.message);return;}
 if(changes.reminder&&!(changes.reminder.anchor==='due'?due:planned)){toast(changes.reminder.anchor==='due'?'Bitte eine Deadline für die Erinnerung eintragen.':'Bitte einen Arbeitstag für die Erinnerung eintragen.');return;}
 if(form.dataset.seriesEdit&&!recurrence){toast('Eine Wochenserie braucht eine wöchentliche Wiederholung.');return;}
 if(recurrence){try{if(form.dataset.seriesEdit)updateRecurringSeries(form.dataset.seriesEdit,changes,recurrence);else addRecurringSeries(changes,recurrence,id);}catch(error){toast(error.message);}return;}

 if(changes.top&&changes.status!=='done'&&priorityLimitReached(changes,id)){toast('Du hast für diesen Tag schon drei Prioritäten.');return;}
 closeDialog(false);
 if(id)changeTask(id,changes);else{data.tasks.push(makeTask({...changes,completedAt:changes.status==='done'?new Date().toISOString():null}));quickDrafts.delete(selectedDay);save();render();toast(planned?'Aufgabe eingeplant.':due?'Deadline festgehalten.':'Gedanke festgehalten.');}
}

function eventDialog(existing,series,defaults){
 const day=existing?calendarEventDay(existing):series?.start||defaults.planned||selectedDay;
 const entry=existing||series||makeTask({project:activeProject});
 const allDay=Boolean((existing||series)&&!entry.time);
 const end=entry.time&&entry.duration!=null?endTime(entry.time,entry.duration):'';
 // Converted series can carry a reminder linked to an existing deadline.
 const legacyDue=existing?.due||(series?.dueOffset!=null?addDays(day,series.dueOffset):'');
 const title=series?'Terminserie bearbeiten':existing?'Termin bearbeiten':'Neuer Termin';
 if(series)defaults={...defaults,repeat:true,seriesRule:series};
 showDialog(`${modalHead(title,'')}<form id="task-form" data-kind="event" data-id="${esc(existing?.id||'')}" data-series-edit="${esc(series?.id||'')}"
  data-legacy-due="${esc(legacyDue)}" data-legacy-offset="${series?.dueOffset??''}" data-reminder-zone="${esc(entry.reminder?.timeZone||'')}">
  <div class="form-field form-title"><label for="task-title">Titel</label><input id="task-title" name="title" value="${esc(entry.title)}" maxlength="180" placeholder="Zum Beispiel: Fußballtraining" required autofocus enterkeyhint="next"></div>
  <div class="form-field"><label for="task-planned">${icon('calendar')} Datum</label><input id="task-planned" name="planned" type="date" value="${esc(day)}" min="1900-01-01" max="2200-12-31" required></div>
  <label class="form-check event-all-day"><input type="checkbox" name="allDay" id="event-all-day" ${allDay?'checked':''}> Ganztägig</label>
  <div class="form-grid" id="event-times" ${allDay?'hidden':''}>
   <div class="form-field"><label for="task-time">Startzeit</label><input type="time" id="task-time" name="time" value="${esc(entry.time)}" ${allDay?'disabled':'required'}></div>
   <div class="form-field"><label for="event-end">Endzeit <span>optional</span></label><input type="time" id="event-end" name="endTime" value="${esc(end)}" ${allDay?'disabled':''}></div>
  </div>
  <p class="field-hint event-end-hint" id="event-end-hint" hidden>Ende am nächsten Tag.</p>
  ${recurrenceForm({...entry,planned:day},existing,{...defaults,kind:'event'})}
  <div class="form-field"><label for="task-project">Bereich</label><select id="task-project" name="project"><option value="">Ohne Bereich</option>${data.projects.map(p=>`<option value="${esc(p.id)}" ${entry.project===p.id?'selected':''}>${esc(p.name)}</option>`).join('')}</select></div>
  ${reminderForm(entry.reminder,{isEvent:true,legacyDue})}
  <div class="form-field"><label for="task-notes">Notizen</label><textarea id="task-notes" name="notes" maxlength="4000">${esc(entry.notes)}</textarea></div>
  <div class="modal-actions task-save-actions">${existing?`<button type="button" class="btn btn-danger" data-action="delete-task" data-id="${esc(existing.id)}">${icon('trash')} Löschen</button>`:''}<div class="row"><button type="button" class="btn btn-secondary" data-action="close-dialog">Abbrechen</button><button type="submit" class="btn btn-primary">${existing||series?'Speichern':'Termin hinzufügen'}</button></div></div>
 </form>`);
 updateRecurrenceForm();
 updateEventForm();
}
function updateEventForm(){
 const times=$('#event-times');
 if(!times)return;
 const allDay=$('#event-all-day').checked,time=$('#task-time'),end=$('#event-end');
 times.hidden=allDay;
 time.required=!allDay;
 time.disabled=allDay;
 end.disabled=allDay;
 end.setCustomValidity(!allDay&&time.value&&time.value===end.value?'Start und Ende müssen verschieden sein.':'');
 $('#event-end-hint').hidden=allDay||!time.value||!end.value||time.value<=end.value;
 updateReminderForm();
}
function saveEventForm(form){
 const fields=new FormData(form),{id,seriesEdit}=form.dataset;
 const original=data.tasks.find(t=>t.id===id), series=data.series.find(s=>s.id===seriesEdit);
 if((id&&(!original||!isEvent(original)))||(seriesEdit&&!isCalendarEvent(series))){
  toast('Dieser Termin wurde auf einem anderen Gerät geändert.');
  closeDialog();
  return;
 }
 const title=String(fields.get('title')||'').trim().slice(0,180),planned=String(fields.get('planned')||'');
 const allDay=fields.has('allDay'),time=allDay?'':String(fields.get('time')||''),end=allDay?'':String(fields.get('endTime')||'');
 if(!title||!validDate(planned)||(!allDay&&!validTime(time))||(end&&(!validTime(end)||end===time))){
  toast('Bitte prüfe Titel, Datum und Uhrzeiten.');
  return;
 }
 const duration=end?(clockMinutes(end)-clockMinutes(time)+1440)%1440:null;
 const due=original?.due||(series?.dueOffset!=null?addDays(planned,series.dueOffset):'');
 const changes={kind:'event',title,planned,time,duration,due,
  project:String(fields.get('project')||''),notes:String(fields.get('notes')||'').slice(0,4000),reminder:readReminder(form)};
 let recurrence;
 try{
  recurrence=readRecurrence(form);
  if(series&&!recurrence)throw new Error('Wähle die wöchentliche Wiederholung.');
  if(recurrence){
   if(series)updateRecurringSeries(series.id,changes,recurrence);
   else addRecurringSeries(changes,recurrence);
   return;
  }
 }catch(error){toast(error.message);return;}
 closeDialog(false);
 if(original)changeTask(id,changes,'Termin aktualisiert.');
 else{data.tasks.push(makeTask(changes));save();render();toast('Termin eingetragen.');}
}

function projectDialog(id){
 const project=data.projects.find(p=>p.id===id);
 const color=project?.color||palette[data.projects.length%palette.length];
 showDialog(`${modalHead(project?'Bereich bearbeiten':'Neuer Bereich','')}<form id="project-form" data-id="${esc(id||'')}">
  <div class="form-field"><label for="project-name">Name des Bereichs</label><input id="project-name" name="name" maxlength="40" value="${esc(project?.name)}" required autofocus></div>
  <fieldset class="project-colors"><legend>Farbe</legend><div class="color-options">${projectColors.map(([value,label])=>`<label><input type="radio" name="color" value="${value}" aria-label="${label}" ${color===value?'checked':''}><span class="color-swatch" style="--swatch:${value}" title="${label}">${icon('check')}</span></label>`).join('')}</div><p id="project-color-name" class="field-hint">${projectColors.find(([value])=>value===color)?.[1]||''}</p></fieldset>
  <div class="modal-actions"><button class="btn btn-secondary" type="button" data-action="close-dialog">Abbrechen</button><button class="btn btn-primary" type="submit">${project?'Speichern':'Bereich anlegen'}</button></div>
 </form>`);
}
function saveProject(form){
 const fields=new FormData(form),name=String(fields.get('name')||'').trim().slice(0,40);
 const color=fields.get('color'),id=form.dataset.id;
 if(!name||!palette.includes(color))return;
 const project=data.projects.find(p=>p.id===id);
 if(id&&!project){toast('Der Bereich wurde entfernt.');return;}
 if(project)Object.assign(project,{name,color});
 else{
  if(data.projects.length>=30){toast('Du kannst bis zu 30 Bereiche anlegen.');return;}
  data.projects.push({id:uid(),name,color});
 }
 save();
 closeDialog(false);
 render();
 toast(project?'Bereich aktualisiert.':'Bereich angelegt.');
}
function searchDialog(){showDialog(`<div class="search-field"><label for="global-search" class="sr-only" id="modal-title">Aufgaben und Termine durchsuchen</label>${icon('search')}<input id="global-search" autofocus placeholder="Was suchst du?" autocomplete="off"><button class="icon-btn" data-action="close-dialog" aria-label="Suche schließen">${icon('close')}</button></div><div class="search-results" id="search-results"></div>`);$('.modal',dialogRoot).classList.add('search-modal');searchResults('');}
function searchResults(query){
 const q=query.trim().toLocaleLowerCase('de');
 const matches=sortTasks(data.tasks.filter(t=>!q||`${t.title} ${t.notes} ${projectOf(t)?.name||''}`.toLocaleLowerCase('de').includes(q))).slice(0,30);
 $('#search-results').innerHTML=matches.length?matches.map(entry=>{
  const event=isEvent(entry),day=event?calendarEventDay(entry):entry.planned;
  const date=day?`${event?'Termin':'Geplant'}: ${relativeDate(day)}`:entry.due?`Deadline: ${relativeDate(entry.due)}`:'Ohne Datum';
  const description=[date,event&&entry.time?entry.time:'',projectOf(entry)?.name||'Ohne Bereich',event?'':statusName(entry.status)].filter(Boolean).join(' · ');
  return `<button class="search-result" data-action="edit-task" data-id="${esc(entry.id)}">${icon(event?'calendar':entry.status==='done'?'check':'list')}<div>${esc(entry.title)}<p>${esc(description)}</p></div>${icon('right')}</button>`;
 }).join(''):'<p class="search-empty">Keine passenden Einträge gefunden.</p>';
}
function settingsDialog(){showDialog(`${modalHead('Dein Raum, deine Einstellungen.','Ein kleiner Planer mit Platz für deinen Alltag.')}<form id="name-form"><div class="form-field"><label for="profile-name">Wie darf Daylight dich nennen?</label><div class="row gap"><input id="profile-name" name="name" maxlength="30" value="${esc(data.name)}" placeholder="Dein Name"><button class="btn btn-quiet" type="submit">Speichern</button></div></div></form><section class="settings-section"><h3>Deine Daten bleiben bei dir.</h3><p>Einträge werden automatisch in diesem Browser gespeichert. Erstelle eine Sicherung, bevor du Browserdaten löschst oder das Gerät wechselst.</p><div class="row"><button class="btn btn-secondary" data-action="export">${icon('download')}Sicherung exportieren</button><button class="btn btn-secondary" data-action="import">${icon('upload')}Sicherung importieren</button><input class="sr-only" type="file" id="backup-file" accept="application/json,.json"></div></section><section class="settings-section"><h3>Auch auf deinem Home-Bildschirm.</h3><p>Auf dem iPhone: in Safari öffnen, auf „Teilen“ tippen und „Zum Home-Bildschirm“ wählen. Android: im Browsermenü „App installieren“ wählen. Nach dem ersten Öffnen funktioniert der Planer auch offline.</p></section><section class="settings-section"><h3>Wiederkehrende Termine</h3><p>Neue Aufgabe öffnen, „Jede Woche“ wählen und die Wochentage festlegen. Bestehende Serien findest du in „Wiederholungen“.</p><button class="btn btn-secondary" data-action="manage-series">${icon('reset')}Wochenserien verwalten</button></section>${cloudSettingsSection()}<section class="settings-section"><h3>Kalenderexport</h3><p>Termine, geplante Aufgaben und Deadlines als Kalenderdatei speichern.</p><button class="btn btn-secondary" data-action="export-calendar">${icon('calendar')}Einträge als Kalenderdatei</button></section>${data.demo?'<section class="settings-section"><h3>Bereit für deinen eigenen Plan?</h3><p>Die Beispielaufgaben zeigen dir die verschiedenen Möglichkeiten. Du kannst sie entfernen; selbst erstellte Aufgaben bleiben erhalten.</p><button class="btn btn-secondary" data-action="clear-demo">Beispielaufgaben entfernen</button></section>':''}<div class="settings-note">Daylight · Erster interaktiver Entwurf<br>Liste, Kalender, Board und Fokuszeit. Ein Tag nach dem anderen.</div>`);}
function downloadFile(content,type,filename){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
function exportBackup(){downloadFile(JSON.stringify({...data,exportedAt:new Date().toISOString()},null,2),'application/json',`Daylight-Sicherung-${today()}.json`);toast('Sicherung bereit zum Speichern.');}
function calendarEscape(value){return String(value).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');}
function foldICS(line){const encoder=new TextEncoder();let out='',current='';for(const char of line){if(encoder.encode(current+char).length>73){out+=current+'\r\n ';current=char;}else current+=char;}return out+current;}
function exportCalendar(){
 const tasks=data.tasks.filter(t=>isEvent(t)?calendarEventDay(t):((t.planned||t.due)&&t.status!=='done'));
 if(!tasks.length){toast('Es gibt keine Termine oder offenen Aufgaben mit Datum.');return;}
 const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z'),lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Daylight//Tagesplaner//DE','CALSCALE:GREGORIAN','METHOD:PUBLISH'];
 for(const t of tasks){const events=[],event=isEvent(t),planned=event?calendarEventDay(t):t.planned;if(planned)events.push({kind:'plan',day:planned,time:t.time,title:t.title});if(!event&&t.due&&t.due!==t.planned)events.push({kind:'deadline',day:t.due,time:'',title:`Deadline: ${t.title}`});
 for(const event of events){lines.push('BEGIN:VEVENT',`UID:${calendarEscape(t.id)}${event.kind==='deadline'?'-deadline':''}@daylight.local`,`DTSTAMP:${stamp}`,`SUMMARY:${calendarEscape(event.title)}`,`DESCRIPTION:${calendarEscape([t.notes,!event&&t.due?`Deadline: ${t.due}`:''].filter(Boolean).join('\n'))}`);
 if(event.time){const start=dateOf(event.day),[h,m]=event.time.split(':').map(Number);start.setHours(h,m,0,0);const utc=d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');lines.push(`DTSTART:${utc(start)}`);if(t.duration!=null)lines.push(`DTEND:${utc(new Date(start.getTime()+t.duration*60000))}`);}else lines.push(`DTSTART;VALUE=DATE:${event.day.replaceAll('-','')}`,`DTEND;VALUE=DATE:${addDays(event.day,1).replaceAll('-','')}`);lines.push('END:VEVENT');}}
 lines.push('END:VCALENDAR');downloadFile(lines.map(foldICS).join('\r\n')+'\r\n','text/calendar;charset=utf-8',`Daylight-Kalender-${today()}.ics`);toast('Kalenderdatei bereit zum Importieren.');
}

function timerDigits(){const seconds=data.focus.running?Math.max(0,Math.ceil((data.focus.endAt-Date.now())/1000)):data.focus.remaining;return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;}
function updateTimerUI(){const f=data.focus,seconds=f.running?Math.max(0,Math.ceil((f.endAt-Date.now())/1000)):f.remaining;const digits=$('#focus-digits');if(digits)digits.textContent=timerDigits();const circle=$('.timer-fill');if(circle)circle.style.strokeDashoffset=String(741.42*(1-seconds/(f.mode*60)));document.title=f.running?`${timerDigits()} · Daylight`:'Daylight – Dein Tag, dein Tempo';}
function tick(){
 const f=data.focus;
 if(!f.running||Date.now()<f.endAt){updateTimerUI();return;}
 f.running=false;
 f.remaining=0;
 f.endAt=null;
 const focused=f.kind==='focus';
 if(focused)data.sessions.push({id:uid(),date:today(),minutes:f.mode,taskId:f.taskId,createdAt:new Date().toISOString()});
 save({sync:focused});
 renderBackground();
 toast(focused?'Fokuseinheit abgeschlossen.':'Deine Pause ist vorbei.');
}
function setFocusDuration(minutes,kind='focus',custom=false){
 const f=data.focus;
 if(f.running || !(kind==='break'?BREAK_PRESETS.includes(minutes):validFocusMinutes(minutes)))return;
 Object.assign(f,{kind,mode:minutes,custom,remaining:minutes*60,endAt:null});
 if(custom)f.customMinutes=minutes;
 save({sync:false});
 render();
}
function focusDurationDialog(){
 if(data.focus.running)return;
 showDialog(`${modalHead('Eigene Fokusdauer','')}<form id="focus-duration-form"><div class="form-field"><label for="focus-minutes">Minuten</label><input type="number" inputmode="numeric" min="1" max="${FOCUS_MAX_MINUTES}" step="1" name="minutes" id="focus-minutes" value="${data.focus.customMinutes}" required autofocus></div><div class="modal-actions"><button type="button" class="btn btn-secondary" data-action="close-dialog">Abbrechen</button><button type="submit" class="btn btn-primary">Übernehmen</button></div></form>`);
}
function focusToggle(){const f=data.focus;if(f.running){f.remaining=Math.max(0,Math.ceil((f.endAt-Date.now())/1000));f.running=false;f.endAt=null;}else{if(f.remaining<=0)f.remaining=f.mode*60;f.running=true;f.endAt=Date.now()+f.remaining*1000;}save({sync:false});render();}
function focusReset(){data.focus.running=false;data.focus.endAt=null;data.focus.remaining=data.focus.mode*60;save({sync:false});render();}
function validateSeries(raw,projects){
 if(!Array.isArray(raw)||raw.length>200)throw new Error('Die Wiederholungen in der Sicherung sind ungültig.');
 const seen=new Set();
 return raw.map(s=>{
  if(!s||!safeId(s.id)||s.id.length>80||seen.has(s.id)||typeof s.title!=='string'||!s.title.trim()||!validDate(s.start)||!Array.isArray(s.weekdays)||!s.weekdays.length||s.weekdays.some(d=>!Number.isInteger(d)||d<0||d>6)||!['never','weeks','date'].includes(s.endMode)||(s.time&&!validTime(s.time))||(s.stopAfter&&!validDate(s.stopAfter)))throw new Error('Eine Wochenwiederholung ist ungültig.');
  if(s.endMode==='weeks'&&(!Number.isInteger(s.weeks)||s.weeks<1||s.weeks>520))throw new Error('Die Anzahl der Wochen ist ungültig.');
  if(s.endMode==='date'&&(!validDate(s.endDate)||s.endDate<s.start))throw new Error('Das Enddatum einer Wiederholung ist ungültig.');
  if(s.dueOffset!==null&&s.dueOffset!==undefined&&(!Number.isInteger(s.dueOffset)||Math.abs(s.dueOffset)>3650))throw new Error('Der Fristabstand ist ungültig.');
  if(s.excluded&&(!Array.isArray(s.excluded)||s.excluded.length>20000||s.excluded.some(d=>!validDate(d))))throw new Error('Die ausgelassenen Termine sind ungültig.');
  seen.add(s.id);
  return {id:s.id,...(isCalendarEvent(s)?{kind:'event'}:{}),title:s.title.trim().slice(0,180),notes:String(s.notes||'').slice(0,4000),project:projects.has(s.project)?s.project:'',time:s.time||'',duration:isCalendarEvent(s)?eventDuration(s.duration):normalizeDuration(s.duration??null),priority:[1,2,3].includes(s.priority)?s.priority:2,top:!!s.top,subtasks:normalizeSubtasks(s.subtasks),reminder:normalizeReminder(s.reminder),...recordStamp(s),generationFrom:validDate(s.generationFrom)?s.generationFrom:'',start:s.start,weekdays:WEEKDAYS.filter(d=>s.weekdays.includes(d.day)).map(d=>d.day),endMode:s.endMode,weeks:s.endMode==='weeks'?s.weeks:10,endDate:s.endMode==='date'?s.endDate:'',dueOffset:Number.isInteger(s.dueOffset)?s.dueOffset:null,excluded:[...new Set(s.excluded||[])],stopAfter:s.stopAfter||'',createdAt:typeof s.createdAt==='string'?s.createdAt:new Date().toISOString()};
 });
}
function seriesLastDay(s){const end=s.endMode==='weeks'?addDays(s.start,s.weeks*7-1):s.endMode==='date'?s.endDate:'2200-12-31';return s.stopAfter&&s.stopAfter<end?s.stopAfter:end;}
function seriesDates(s,from,to){const start=[s.start,from,s.generationFrom||s.start].sort().at(-1),end=[seriesLastDay(s),to].sort()[0],excluded=new Set(s.excluded||[]),dates=[];if(start>end)return dates;for(let date=start;date<=end;date=addDays(date,1)){if(s.weekdays.includes(dateOf(date).getDay())&&!excluded.has(date))dates.push(date);}return dates;}
function materializeSeries(from,to,onlyId=''){
 const ids=new Set(data.tasks.map(t=>t.id));let count=0;
 for(const s of data.series||[]){if(onlyId&&s.id!==onlyId)continue;const windows=[[from,to]];if(s.dueOffset)windows.push([addDays(from,-s.dueOffset),addDays(to,-s.dueOffset)]);
  for(const [start,end] of windows)for(const date of seriesDates(s,start,end)){
   const id=`${s.id}--${date}`;if(ids.has(id)||isRemovedOccurrence(data.deleted,s,id))continue;if(data.tasks.length>=50000){toast('Sehr viele Einträge: Bitte beende nicht mehr benötigte Serien.');return count;}
   const t=makeTask({id,...(isCalendarEvent(s)?{kind:'event'}:{}),title:s.title,notes:s.notes,project:s.project,planned:date,due:s.dueOffset===null?'':addDays(date,s.dueOffset),time:s.time,duration:s.duration,priority:s.priority,top:s.top,subtasks:normalizeSubtasks(s.subtasks).map(x=>({...x,id:uid(),done:false})),reminder:normalizeReminder(s.reminder),updatedAt:s.updatedAt||s.createdAt,updatedBy:s.updatedBy||'series',seriesId:s.id,occurrenceDate:date});
   if(!isEvent(t)&&t.top&&priorityLimitReached(t))t.top=false;data.tasks.push(t);ids.add(id);count++;
  }
 }
 return count;
}
function ensureSeriesForView(){
 if(!data.series?.length)return 0;
 let count=materializeSeries(addDays(today(),-14),addDays(today(),90));
 if(view==='today')count+=materializeSeries(addDays(selectedDay,-1),selectedDay);
 if(view==='calendar'){const from=calendarMode==='week'?weekStart(selectedDay):weekStart(keyOf(monthCursor)),to=calendarMode==='week'?addDays(from,6):addDays(keyOf(new Date(monthCursor.getFullYear(),monthCursor.getMonth()+1,0)),7);count+=materializeSeries(addDays(from,-1),to);}
 return count;
}
function recurrenceSummary(s){const days=WEEKDAYS.filter(d=>s.weekdays.includes(d.day)).map(d=>d.short).join(', ');return `Jede Woche ${days}${s.time?` · ${s.time} Uhr`:''}`;}
function recurrenceEndLabel(s){if(s.stopAfter)return `Beendet ab ${longDate(addDays(s.stopAfter,1))}`;return s.endMode==='weeks'?`${s.weeks} ${s.weeks===1?'Woche':'Wochen'} · bis ${longDate(seriesLastDay(s))}`:s.endMode==='date'?`Bis ${longDate(s.endDate)}`:'Ohne Enddatum';}
function recurrenceForm(t,existing,defaults){
 const series=existing?.seriesId?data.series.find(s=>s.id===existing.seriesId):null;
 if(series)return `<div class="recurrence-instance-note">${icon('reset')}<div><strong>Ein Termin einer Wochenserie</strong><p>${esc(recurrenceSummary(series))}</p><p>Änderungen hier gelten nur für diesen Termin.</p></div><button type="button" class="text-btn" data-action="manage-series">Serien verwalten ${icon('right')}</button></div>`;
 const rule=defaults.seriesRule,weekly=!!defaults.repeat,weekday=t.planned?dateOf(t.planned).getDay():dateOf(today()).getDay();
 const typePicker=!existing&&!rule&&defaults.kind!=='event'?`<div class="form-field"><label for="repeat-kind">Eintragstyp</label><select id="repeat-kind" name="repeatKind"><option value="event">Kalendertermin</option><option value="task" ${defaults.repeat?'selected':''}>Aufgabe zum Abhaken</option></select></div>`:'';
 return `<section class="recurrence-form"><div class="form-field"><label for="repeat-mode">${icon('reset')}Wiederholung</label><select id="repeat-mode" name="repeatMode"><option value="none" ${!weekly?'selected':''} ${rule?'disabled':''}>Einmalig</option><option value="weekly" ${weekly?'selected':''}>Jede Woche</option></select></div><div id="repeat-options" ${weekly?'':'hidden'}>${typePicker}<fieldset class="repeat-weekdays"><legend>An welchen Tagen?</legend><div>${WEEKDAYS.map(d=>`<label><input type="checkbox" name="repeatDays" value="${d.day}" ${(rule?rule.weekdays.includes(d.day):d.day===weekday)?'checked':''}><span>${d.short}</span><span class="sr-only">${d.name}</span></label>`).join('')}</div></fieldset><div class="form-field"><label for="repeat-end">Wie lange?</label><select id="repeat-end" name="repeatEnd"><option value="never" ${!rule||rule.endMode==='never'?'selected':''}>Ohne Enddatum</option><option value="weeks" ${rule?.endMode==='weeks'?'selected':''}>Für eine Anzahl Wochen</option><option value="date" ${rule?.endMode==='date'?'selected':''}>Bis zu einem Datum</option></select></div><div class="form-field" id="repeat-weeks-field" hidden><label for="repeat-weeks">Anzahl Wochen</label><input type="number" id="repeat-weeks" name="repeatWeeks" value="${rule?.weeks||10}" min="1" max="520" inputmode="numeric"></div><div class="form-field" id="repeat-until-field" hidden><label for="repeat-until">Letzter möglicher Termin</label><input type="date" id="repeat-until" name="repeatUntil" value="${rule?.endDate||addDays(t.planned||today(),69)}" min="1900-01-01" max="2200-12-31"></div><p class="repeat-preview" id="repeat-preview" role="status"></p>${defaults.kind==='event'?'':'<p class="field-hint repeat-task-hint">Eine angegebene Deadline verschiebt sich mit jedem Vorkommen.</p><p class="field-hint repeat-event-hint">Ohne Startzeit wird der Termin ganztägig eingetragen.</p>'}</div></section>`;
}
function readRecurrence(form){
 const f=new FormData(form);if(f.get('repeatMode')!=='weekly')return null;
 const start=String(f.get('planned')||''),weekdays=[...new Set(f.getAll('repeatDays').map(Number))],endMode=String(f.get('repeatEnd')||'never'),weeks=Number(f.get('repeatWeeks')||10),endDate=String(f.get('repeatUntil')||'');
 if(!validDate(start))throw new Error('Wähle für die Wochenserie bitte ein Startdatum.');
 if(!weekdays.length||weekdays.some(d=>!Number.isInteger(d)||d<0||d>6))throw new Error('Wähle mindestens einen Wochentag.');
 if(!['never','weeks','date'].includes(endMode))throw new Error('Bitte wähle die Laufzeit.');
 if(endMode==='weeks'&&(!Number.isInteger(weeks)||weeks<1||weeks>520))throw new Error('Bitte wähle zwischen 1 und 520 Wochen.');
 if(endMode==='date'&&(!validDate(endDate)||endDate<start))throw new Error('Das Ende muss am oder nach dem Serienstart liegen.');
 const result={start,weekdays,endMode,weeks,endDate,excluded:[],stopAfter:''};
 if(endMode!=='never'&&!seriesDates(result,start,seriesLastDay(result)).length)throw new Error('In diesem Zeitraum liegt keiner der gewählten Wochentage.');
 return result;
}
function updateRecurrenceForm(){
 const mode=$('#repeat-mode');
 if(!mode)return;
 const weekly=mode.value==='weekly',form=$('#task-form');
 $('#repeat-options').hidden=!weekly;
 const type=$('#repeat-kind');
 if(type){
  const event=weekly&&type.value==='event',wasEvent=form.classList.contains('creates-event');
  form.classList.toggle('creates-event',event);
  $('#planned-label').textContent=event?'Serienstart':'Geplant am';
  $('#task-due').disabled=event;
  if(event&&!wasEvent) $('.task-more',form).open=true;
 }
 $('#repeat-weeks-field').hidden=$('#repeat-end').value!=='weeks';$('#repeat-until-field').hidden=$('#repeat-end').value!=='date';
 $('#repeat-weeks').required=weekly&&$('#repeat-end').value==='weeks';$('#repeat-until').required=weekly&&$('#repeat-end').value==='date';$('#repeat-weeks').disabled=!weekly||$('#repeat-end').value!=='weeks';$('#repeat-until').disabled=!weekly||$('#repeat-end').value!=='date';
 const preview=$('#repeat-preview');if(!weekly){preview.textContent='';return;}
 try{const rule=readRecurrence($('#task-form'));let text=recurrenceSummary(rule);if(rule.endMode==='weeks')text+=` · ${rule.weeks} Wochen · ${seriesDates(rule,rule.start,seriesLastDay(rule)).length} Vorkommen`;else if(rule.endMode==='date')text+=` · bis ${longDate(rule.endDate)}`;else text+=' · ohne Enddatum';preview.textContent=text;preview.classList.remove('invalid');}catch(error){preview.textContent=error.message;preview.classList.add('invalid');}
}
function addRecurringSeries(changes,rule,replaceId=''){
 if((data.series||[]).length>=200)throw new Error('Du kannst bis zu 200 Serien verwalten.');
 const dueOffset=changes.due?dayDifference(rule.start,changes.due):null;
 if(dueOffset!==null&&Math.abs(dueOffset)>3650)throw new Error('Die Deadline liegt zu weit vom Serienstart entfernt.');
 const series={id:uid(),...(isCalendarEvent(changes)?{kind:'event'}:{}),title:changes.title,notes:changes.notes,project:changes.project,time:changes.time,duration:changes.duration,priority:changes.priority??2,top:!!changes.top,subtasks:normalizeSubtasks(changes.subtasks),reminder:normalizeReminder(changes.reminder),dueOffset,createdAt:new Date().toISOString(),...rule};
 const original=replaceId?data.tasks.find(t=>t.id===replaceId):null;
 if(original)data.tasks=data.tasks.filter(t=>t.id!==replaceId);
 data.series??=[];data.series.push(series);
 const end=rule.endMode==='never'?addDays(rule.start,90):seriesLastDay(series);
 materializeSeries(rule.start,end,series.id);
 if(original&&original.status!=='todo'){const first=data.tasks.find(t=>t.seriesId===series.id&&t.occurrenceDate===original.planned);if(first){first.status=original.status;first.completedAt=original.completedAt;}}
 save();closeDialog(false);quickDrafts.delete(selectedDay);render();toast('Wochenserie angelegt.','Rückgängig',()=>{data.tasks=data.tasks.filter(t=>t.seriesId!==series.id);data.series=data.series.filter(s=>s.id!==series.id);if(original)data.tasks.push(original);save();render();toast('Serie zurückgenommen.');});
 return series;
}
function seriesView(){
 const cards=data.series.map(series=>{
  const event=isCalendarEvent(series),active=!series.stopAfter&&seriesLastDay(series)>=today();
  const id=esc(series.id);
  return `<section class="card series-card">
   <div class="series-card-icon">${icon(event?'calendar':'list')}</div>
   <div class="series-card-copy"><h2>${esc(series.title)}</h2><p>${event?'Kalendertermine':'Aufgaben'} · ${esc(recurrenceSummary(series))}</p><p>${esc(recurrenceEndLabel(series))}</p></div>
   <div class="series-actions">
    ${active?`<button class="btn btn-quiet" data-action="edit-series" data-id="${id}">Bearbeiten</button><button class="btn btn-secondary" data-action="stop-series" data-id="${id}">Serie beenden</button>`:'<span class="pill pill-soft">Beendet</span>'}
    ${!event?`<button class="text-btn convert-series" data-action="convert-series" data-id="${id}">Als Kalendertermine führen</button>`:''}
   </div></section>`;
 }).join('');
 return `${welcome('Wiederholungen','Wochenserien für Termine und Aufgaben.','DEIN ÜBERBLICK')}
 <div class="series-toolbar"><button class="btn btn-primary" data-action="add-series">${icon('plus')} Neue Terminserie</button><button class="btn btn-secondary" data-action="add-task-series">${icon('plus')} Neue Aufgabenserie</button></div>
 <div class="series-list">${cards||'<p class="agenda-empty">Du hast noch keine Wochenserien.</p>'}</div>`;
}
function convertSeriesDialog(id){
 const series=data.series.find(s=>s.id===id);
 if(!series||isCalendarEvent(series))return;
 showDialog(`${modalHead('Als Kalendertermine führen?',series.title)}
 <p class="settings-note">Offene Einträge dieser Serie erscheinen als Termine im Kalender. Verschobene Einträge, ausgelassene Tage und Erinnerungen werden übernommen. Abgehakte Aufgaben bleiben in deinem Aufgabenverlauf.</p>
 <div class="modal-actions"><button class="btn btn-secondary" data-action="close-dialog">Abbrechen</button><button class="btn btn-primary" data-action="confirm-convert-series" data-id="${esc(id)}">Als Termine führen</button></div>`);
}
function convertSeries(id){
 const series=data.series.find(s=>s.id===id);
 if(!series||isCalendarEvent(series)){closeDialog();return;}
 const previousFocus=data.focus.taskId;
 const archived=data.tasks.filter(entry=>entry.seriesId===id&&entry.status==='done'&&!entry.kind);
 for(const entry of archived)entry.kind='task';
 const before=new Set(data.tasks.map(entry=>entry.id));
 materializeSeries(series.start,addDays(today(),90),id);
 const added=new Set(data.tasks.filter(entry=>!before.has(entry.id)).map(entry=>entry.id));
 series.kind='event';
 if(isEvent(data.tasks.find(t=>t.id===previousFocus)))data.focus.taskId=null;
 closeDialog(false);
 save();
 render();
 toast('Serie als Kalendertermine geführt.','Rückgängig',()=>{
  const current=data.series.find(s=>s.id===id);
  if(!current)return;
  delete current.kind;
  // Historical occurrences generated only for the conversion should not become old to-dos on undo.
  data.tasks=data.tasks.filter(entry=>!added.has(entry.id)||entry.seriesOverride||entry.status==='done'||
    (entry.planned||entry.occurrenceDate)>=addDays(today(),-14));
  const archivedIds=new Set(archived.map(entry=>entry.id));
  for(const entry of data.tasks){
   if(entry.seriesId!==id)continue;
   if(entry.kind==='event'||archivedIds.has(entry.id))delete entry.kind;
  }
  if(!data.focus.taskId&&data.tasks.some(t=>t.id===previousFocus))data.focus.taskId=previousFocus;
  save();
  render();
  toast('Serie wieder als Aufgaben geführt.');
 });
}
function deleteSingleTask(id){
 const index=data.tasks.findIndex(t=>t.id===id);
 if(index<0)return;
 const entry=data.tasks[index],series=seriesOf(entry),event=isEvent(entry);
 const wasExcluded=series?.excluded.includes(entry.occurrenceDate),focused=data.focus.taskId===id;
 if(series&&!wasExcluded)series.excluded.push(entry.occurrenceDate);
 data.tasks.splice(index,1);
 if(focused)data.focus.taskId=null;
 save();
 closeDialog(false);
 render();
 toast(event?'Termin entfernt.':'Aufgabe entfernt.','Rückgängig',()=>{
  const current=seriesOf(entry);
  if(current&&!wasExcluded)current.excluded=current.excluded.filter(day=>day!==entry.occurrenceDate);
  if(!data.tasks.some(t=>t.id===id))data.tasks.splice(Math.min(index,data.tasks.length),0,entry);
  if(focused)data.focus.taskId=id;
  save();
  render();
  toast(event?'Termin wiederhergestellt.':'Aufgabe wiederhergestellt.');
 });
}
function recurringDeleteDialog(id){
 const entry=data.tasks.find(t=>t.id===id);
 if(!entry)return;
 const event=isEvent(entry);
 showDialog(`${modalHead('Was möchtest du entfernen?',entry.title)}<div class="series-delete-choices">
  <button class="series-choice" data-action="delete-occurrence" data-id="${esc(id)}"><strong>${event?'Nur diesen Termin':'Nur diese Aufgabe'}</strong><span>Die anderen Vorkommen bleiben bestehen.</span>${icon('right')}</button>
  <button class="series-choice" data-action="stop-series" data-id="${esc(entry.seriesId)}"><strong>Serie beenden</strong><span>Vergangene Einträge bleiben erhalten.</span>${icon('right')}</button>
 </div>`);
}
function stopSeriesDialog(id){
 const series=data.series.find(s=>s.id===id);
 if(!series)return;
 const event=isCalendarEvent(series);
 const text=event?'Künftige Termine werden entfernt. Vergangene Termine und abgehakte Aufgaben bleiben erhalten.':'Offene Aufgaben ab heute werden entfernt. Vergangene und erledigte Aufgaben bleiben erhalten.';
 showDialog(`${modalHead('Wochenserie beenden?',series.title)}<p class="settings-note">${text}</p><div class="modal-actions"><button class="btn btn-secondary" data-action="close-dialog">Abbrechen</button><button class="btn btn-danger" data-action="confirm-stop-series" data-id="${esc(id)}">Serie beenden</button></div>`);
}
function stopRecurringSeries(id){
 const series=data.series.find(s=>s.id===id);
 if(!series)return;
 const oldStop=series.stopAfter,oldFocus=data.focus.taskId;
 const removed=data.tasks.filter(t=>{
  if(t.seriesId!==id||t.status==='done')return false;
  const day=t.planned||t.occurrenceDate;
  return day>=today()&&(!isEvent(t)||!eventHasPassed(t,day));
 });
 const ids=new Set(removed.map(t=>t.id));
 series.stopAfter=addDays(today(),-1);
 data.tasks=data.tasks.filter(t=>!ids.has(t.id));
 if(ids.has(data.focus.taskId))data.focus.taskId=null;
 save();
 closeDialog(false);
 render();
 toast('Wochenserie beendet.','Rückgängig',()=>{
  const current=data.series.find(s=>s.id===id);
  if(!current)return;
  current.stopAfter=oldStop;
  const existing=new Set(data.tasks.map(t=>t.id));
  data.tasks.push(...removed.filter(t=>!existing.has(t.id)));
  if(removed.some(t=>t.id===oldFocus))data.focus.taskId=oldFocus;
  save();
  render();
  toast('Wochenserie wieder aktiv.');
 });
}
function localSetting(key){try{return localStorage.getItem(key)||'';}catch{return '';}}
function safeId(id){return typeof id==='string'&&/^[A-Za-z0-9_-]{1,100}$/.test(id)&&!['__proto__','prototype','constructor'].includes(id);}
function recordStamp(x){return {updatedAt:typeof x.updatedAt==='string'?x.updatedAt:x.createdAt||'1970-01-01T00:00:00.000Z',updatedBy:typeof x.updatedBy==='string'?x.updatedBy:'legacy'};}
function normalizeDeleted(raw){const out={};for(const name of ['tasks','projects','series','templates','sessions'])out[name]=Object.fromEntries(Object.entries(raw?.[name]||{}).filter(([id,s])=>safeId(id)&&s&&typeof s.at==='string').map(([id,s])=>[id,{at:s.at,by:String(s.by||'')}]));return out;}
function validateTemplates(raw,projects){if(!Array.isArray(raw)||raw.length>500)throw new Error('Die Vorlagen sind ungültig.');const ids=new Set();return raw.map(t=>{if(!t||!safeId(t.id)||ids.has(t.id)||typeof t.title!=='string'||!t.title.trim())throw new Error('Eine Vorlage ist ungültig.');ids.add(t.id);return {id:t.id,title:t.title.trim().slice(0,180),notes:String(t.notes||'').slice(0,4000),project:projects.has(t.project)?t.project:'',duration:normalizeDuration(t.duration),time:validTime(t.time)?t.time:'',priority:[1,2,3].includes(t.priority)?t.priority:2,dueOffset:Number.isInteger(t.dueOffset)?t.dueOffset:null,subtasks:normalizeSubtasks(t.subtasks),reminder:normalizeReminder(t.reminder),...recordStamp(t)};});}
function subtaskFormRow(s){return `<div class="subtask-form-row"><input type="hidden" name="subtaskId" value="${esc(s.id)}"><input type="checkbox" name="subtaskDone" value="${esc(s.id)}" ${s.done?'checked':''} aria-label="Unteraufgabe erledigt"><input name="subtaskTitle" data-subtask-title maxlength="180" value="${esc(s.title)}" placeholder="Nächster kleiner Schritt …" aria-label="Unteraufgabe"><button type="button" class="icon-btn" data-action="remove-subtask-row" aria-label="Unteraufgabe entfernen">${icon('close')}</button></div>`;}
function subtasksForm(subtasks=[]){return `<details class="task-subtasks-form" ${subtasks.length?'open':''}><summary>${icon('list')}Unteraufgaben <span>${subtasks.length?subtasks.length:'hinzufügen'}</span>${icon('down')}</summary><div id="subtask-rows">${subtasks.map(subtaskFormRow).join('')}</div><button type="button" class="text-btn" data-action="add-subtask-row">${icon('plus')}Unteraufgabe hinzufügen</button></details>`;}
function readSubtasks(form){const f=new FormData(form),ids=f.getAll('subtaskId'),done=new Set(f.getAll('subtaskDone'));return normalizeSubtasks(f.getAll('subtaskTitle').map((title,i)=>({id:ids[i]||uid(),title,done:done.has(ids[i])})));}
function subtaskList(t){if(!t.subtasks?.length)return '';const done=t.subtasks.filter(s=>s.done).length;return `<details class="task-subtasks" data-keep-open="subtasks-${esc(t.id)}"><summary>${icon('list')}${done} / ${t.subtasks.length} Schritte${icon('down')}</summary><div>${t.subtasks.map(s=>`<label><input type="checkbox" data-subtask-task="${esc(t.id)}" data-subtask-id="${esc(s.id)}" ${s.done?'checked':''}><span class="${s.done?'subtask-done':''}">${esc(s.title)}</span></label>`).join('')}</div></details>`;}
function quickMoveDialog(id){const t=data.tasks.find(t=>t.id===id);if(!t)return;showDialog(`${modalHead('Aufgabe verschieben',t.title)}<div class="quick-move-choices"><button class="btn btn-quiet" data-action="move-task-date" data-id="${esc(id)}" data-date="${today()}">Heute</button><button class="btn btn-primary" data-action="move-task-date" data-id="${esc(id)}" data-date="${addDays(today(),1)}">Morgen</button></div><form id="move-task-form" data-id="${esc(id)}"><div class="form-field"><label for="move-date">Anderen Tag wählen</label><input type="date" id="move-date" name="planned" value="${esc(t.planned||today())}" required min="1900-01-01" max="2200-12-31"></div><p class="field-hint">Startzeit und Deadline bleiben bestehen.</p><div class="modal-actions"><button type="button" class="btn btn-secondary" data-action="close-dialog">Abbrechen</button><button type="submit" class="btn btn-primary">Verschieben</button></div></form>`);}
function moveTaskDate(id,date){if(!validDate(date)){toast('Bitte wähle ein gültiges Datum.');return;}closeDialog(false);changeTask(id,{planned:date},`Für ${relativeDate(date)} eingeplant. Deadline bleibt bestehen.`);}
function templatesView(){return `${welcome('Vorlagen','Häufige Aufgaben samt Schritten wiederverwenden.','DEIN ÜBERBLICK')}<div class="series-toolbar"><button class="btn btn-primary" data-action="add-task">${icon('plus')}Aufgabe anlegen und als Vorlage speichern</button></div>${data.templates.length?`<div class="series-list">${data.templates.map(t=>`<section class="card series-card"><div class="series-card-icon">${icon('list')}</div><div class="series-card-copy"><h2>${esc(t.title)}</h2><p>${t.subtasks.length} Unteraufgaben${t.duration!=null?` · ${durationLabel(t.duration)}`:''}</p></div><button class="btn btn-primary" data-action="use-template" data-id="${esc(t.id)}">Verwenden</button><button class="icon-btn" data-action="delete-template" data-id="${esc(t.id)}" aria-label="Vorlage löschen">${icon('trash')}</button></section>`).join('')}</div>`:`<section class="card">${empty('Noch keine Vorlage.','In einer Aufgabe unten „Als Vorlage speichern“ wählen.',false)}</section>`}`;}
function templatePicker(){showDialog(`${modalHead('Aus Vorlage übernehmen','Neue Aufgabe, gleiche Vorbereitung.')}<div class="template-picker">${data.templates.map(t=>`<button class="series-choice" data-action="use-template" data-id="${esc(t.id)}"><strong>${esc(t.title)}</strong><span>${t.subtasks.length} Unteraufgaben</span>${icon('right')}</button>`).join('')}</div>`);}
function saveTemplateFromForm(){const form=$('#task-form');if(!form)return;const f=new FormData(form),title=String(f.get('title')||'').trim();if(!title){toast('Gib der Vorlage zuerst einen Titel.');$('#task-title').focus();return;}if(data.templates.length>=500){toast('Du kannst bis zu 500 Vorlagen speichern.');return;}const planned=String(f.get('planned')||''),due=String(f.get('due')||''),template={id:uid(),title,notes:String(f.get('notes')||''),project:String(f.get('project')||''),time:String(f.get('time')||''),duration:normalizeDuration(f.get('duration')),priority:Number(f.get('priority'))||2,dueOffset:validDate(planned)&&validDate(due)?Math.round((dateOf(due)-dateOf(planned))/86400000):null,subtasks:readSubtasks(form).map(s=>({...s,done:false})),reminder:readReminder(form),createdAt:new Date().toISOString()};data.templates.push(template);save();toast('Als Vorlage gespeichert. Deine Eingabe bleibt geöffnet.');}
function updateRecurringSeries(id,changes,rule){
 const series=data.series.find(s=>s.id===id);
 if(!series)return;
 const event=isCalendarEvent(series);
 const dueOffset=changes.due?dayDifference(rule.start,changes.due):null;
 if(dueOffset!==null&&Math.abs(dueOffset)>3650)throw new Error('Die Deadline liegt zu weit vom Serienstart entfernt.');
 const previous=structuredClone(series);
 materializeSeries(series.start,addDays(today(),-1),id);
 const eligible=t=>{
  if(t.seriesId!==id||t.status==='done'||t.seriesOverride)return false;
  const day=t.planned||t.occurrenceDate;
  return day>=today()&&(!event||!eventHasPassed(t,day));
 };
 const removed=data.tasks.filter(eligible),oldFocus=data.focus.taskId;
 data.tasks=data.tasks.filter(t=>!eligible(t));
 Object.assign(series,rule,{
  title:changes.title,notes:changes.notes,project:changes.project,time:changes.time,duration:changes.duration,
  priority:event?series.priority:changes.priority,top:event?series.top:changes.top,
  subtasks:event?series.subtasks:normalizeSubtasks(changes.subtasks).map(s=>({...s,done:false})),
  reminder:normalizeReminder(changes.reminder),dueOffset,excluded:previous.excluded,stopAfter:'',
  generationFrom:today(),updatedAt:new Date(Math.max(Date.now(),(Date.parse(previous.updatedAt||previous.createdAt)||0)+1)).toISOString(),updatedBy:DEVICE_ID,
 });
 const from=series.start>today()?series.start:today();
 const end=rule.endMode==='never'?addDays(from,90):seriesLastDay(series);
 materializeSeries(from,end,id);
 if(!data.tasks.some(t=>t.id===data.focus.taskId))data.focus.taskId=null;
 closeDialog(false);
 save();
 render();
 toast(event?'Künftige Serientermine aktualisiert.':'Künftige Serienaufgaben aktualisiert.','Rückgängig',()=>{
  const current=data.series.find(s=>s.id===id);
  if(!current)return;
  Object.assign(current,previous);
  data.tasks=data.tasks.filter(t=>!eligible(t));
  const retained=new Set(data.tasks.map(t=>t.id));
  data.tasks.push(...removed.filter(t=>!retained.has(t.id)));
  if(removed.some(t=>t.id===oldFocus))data.focus.taskId=oldFocus;
  save();
  render();
  toast('Serienänderung zurückgenommen.');
 });
}
function reminderForm(reminder,{isEvent=false,legacyDue=''}={}){
 const r=normalizeReminder(reminder);
 const options=[[0,'Zur gewählten Zeit'],[5,'5 Minuten vorher'],[10,'10 Minuten vorher'],[15,'15 Minuten vorher'],[30,'30 Minuten vorher'],[60,'1 Stunde vorher'],[120,'2 Stunden vorher'],[1440,'1 Tag vorher']];
 const hasAnchorChoice=!isEvent||Boolean(legacyDue&&r?.anchor==='due');
 return `<section class="reminder-form">
  <div class="form-field"><label for="reminder-minutes">${icon('clock')} Erinnerung</label><select id="reminder-minutes" name="reminderMinutes"><option value="">Keine Erinnerung</option>${options.map(([minutes,label])=>`<option value="${minutes}" ${r?.minutes===minutes?'selected':''}>${label}</option>`).join('')}</select></div>
  <div id="reminder-options" ${r?'':'hidden'}>
   ${hasAnchorChoice?`<div class="form-field"><label for="reminder-anchor">Bezug</label><select id="reminder-anchor" name="reminderAnchor"><option value="planned">${isEvent?'Termin':'Geplanter Arbeitstag'}</option><option value="due" ${r?.anchor==='due'?'selected':''}>Deadline</option></select></div>`:''}
   <div class="form-field" id="reminder-clock-field"><label for="reminder-clock" id="reminder-clock-label">Bezugszeit</label><input type="time" id="reminder-clock" name="reminderClock" value="${r?.clock||'09:00'}"></div>
   <p class="reminder-preview" id="reminder-preview" aria-live="polite"></p>
  </div></section>`;
}
function readReminder(form,forcePlanned=false){
 const fields=new FormData(form),value=fields.get('reminderMinutes');
 if(value===null||value==='')return null;
 const timeZone=form.dataset.reminderZone||Intl.DateTimeFormat().resolvedOptions().timeZone;
 return normalizeReminder({minutes:Number(value),anchor:forcePlanned?'planned':fields.get('reminderAnchor'),clock:fields.get('reminderClock')||'09:00',timeZone});
}
function updateReminderForm(){
 const form=$('#task-form'),options=$('#reminder-options');
 if(!form||!options)return;
 const creatingEvent=form.classList.contains('creates-event');
 const isEventForm=form.dataset.kind==='event'||creatingEvent;
 const reminder=readReminder(form,creatingEvent);
 options.hidden=!reminder;
 if(!reminder)return;
 let planned=$('#task-planned')?.value||'',due=$('#task-due')?.value||form.dataset.legacyDue||'';
 if($('#repeat-mode')?.value==='weekly'&&validDate(planned)){
  const originalStart=planned;
  try{
   const rule=readRecurrence(form);
   const first=seriesDates(rule,rule.start,addDays(rule.start,6))[0];
   if(first){
    planned=first;
    const offset=form.dataset.legacyOffset;
    if(offset)due=addDays(first,Number(offset));
    else if(validDate(due))due=addDays(first,dayDifference(originalStart,due));
   }
  }catch{}
 }
 const time=$('#event-all-day')?.checked?'':$('#task-time')?.value||'';
 const deadline=reminder.anchor==='due';
 const clockField=$('#reminder-clock-field');
 clockField.hidden=!deadline&&validTime(time);
 $('#reminder-clock-label').textContent=deadline?'Uhrzeit der Deadline':isEventForm?'Uhrzeit am Termintag':'Uhrzeit am geplanten Tag';
 const preview=$('#reminder-preview');
 if(!validDate(deadline?due:planned)){
  preview.textContent=deadline?'Wähle zuerst ein Datum für die Deadline.':'Wähle zuerst ein Datum.';
  return;
 }
 const timestamp=reminderTimestamp({planned,due,time,reminder});
 const label=new Intl.DateTimeFormat('de-DE',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',timeZone:reminder.timeZone}).format(timestamp);
 preview.textContent=`${$('#repeat-mode')?.value==='weekly'?'Erste Erinnerung':'Erinnerung'} am ${label} Uhr`;
}
function scheduleSync(){if(!cloudEnabled)return;clearTimeout(syncTimer);syncTimer=setTimeout(()=>syncNow().catch(()=>{}),1000);}
function cloudHeaders(){const headers={'content-type':'application/json'};const key=localSetting('daylight-sync-key');if(key)headers.authorization=`Bearer ${key}`;return headers;}
async function loadCloudConfig(){try{const response=await fetch('/api/config',{cache:'no-store'});if(!response.ok)throw new Error('Server nicht erreichbar');cloudConfig=await response.json();return cloudConfig;}catch{cloudConfig={available:false,scheduler:false};return cloudConfig;}}
function syncedSnapshotsEqual(a,b){
 if(!b || a.name!==b.name || a.demo!==b.demo || JSON.stringify(a.profileStamp)!==JSON.stringify(b.profileStamp))return false;
 return COLLECTIONS.every(name=>{
  const records=new Map(b[name].map(record=>[record.id,JSON.stringify(record)]));
  const deleted=Object.entries(a.deleted[name]),otherDeleted=b.deleted[name];
  return a[name].length===b[name].length && a[name].every(record=>records.get(record.id)===JSON.stringify(record)) &&
   deleted.length===Object.keys(otherDeleted).length && deleted.every(([id,stamp])=>stamp.at===otherDeleted[id]?.at&&stamp.by===otherDeleted[id]?.by);
 });
}
function updateSyncStatus(){
 const settings=$('#sync-status'),footer=$('#footer-sync-status');
 if(settings)settings.textContent=syncMessage;
 if(footer)footer.textContent=cloudEnabled?syncMessage:'Lokal gespeichert · Geräteabgleich in Einstellungen';
}
async function syncNow(){
 if(!cloudEnabled)return;
 if(syncBusy){syncAgain=true;return;}
 syncBusy=true;
 const headers=cloudHeaders();
 const sameAccount=()=>cloudEnabled&&cloudHeaders().authorization===headers.authorization;
 try{
  const config=cloudConfig?.available?cloudConfig:await loadCloudConfig();
  if(!config.available)throw new Error('Serverfunktionen sind auf dieser Veröffentlichung nicht aktiv.');
  for(let attempt=0;attempt<4;attempt++){
   if(!sameAccount())return;
   const response=await fetch('/api/state',{headers,cache:'no-store'});
   if(!sameAccount())return;
   if(!response.ok)throw new Error(response.status===401?'Bitte den Gerätecode prüfen.':'Verbindung zum Speicher fehlgeschlagen.');
   const remote=await response.json();
   if(!sameAccount())return;
   const before=validateBackup(data),remoteState=remote.state?validateBackup(remote.state):null;
   const merged=mergeFirstSync(before,remoteState);
   const proposed=validateBackup(merged);
   if(remote.state?.version!==SNAPSHOT_VERSION||!syncedSnapshotsEqual(proposed,remoteState)){
    const {focus,...shared}=proposed;
    const result=await fetch('/api/state',{method:'PUT',headers,body:JSON.stringify({state:shared,revision:remote.revision})});
    if(!sameAccount())return;
    if(result.status===409)continue;
    if(!result.ok)throw new Error('Speichern auf dem Server fehlgeschlagen.');
   }
   const current=validateBackup(data);
   const latest=validateBackup(mergeSnapshots(current,proposed));
   // First-sync example cleanup is a local decision, not a shared deletion.
   if(remoteState&&hasUntouchedExamples(before)){
    const examples=new Set(proposed.tasks.map(task=>task.id));
    latest.tasks=latest.tasks.filter(task=>!task.sample||task.updatedBy!=='legacy'||examples.has(task.id));
    latest.demo=latest.tasks.some(task=>task.sample);
   }
   syncMessage='Geräte sind abgeglichen';
   if(!syncedSnapshotsEqual(latest,current)||JSON.stringify(latest.focus)!==JSON.stringify(current.focus)){
    localStorage.setItem(STORE,JSON.stringify(latest));
    data=latest;
    previousSavedSnapshot=structuredClone(data);
    renderBackground();
   }
   updateSyncStatus();
   return;
  }
  throw new Error('Gleichzeitige Änderungen. Bitte erneut abgleichen.');
 }catch(error){
  if(sameAccount()){
   syncMessage=error.message;
   updateSyncStatus();
  }
  throw error;
 }finally{
  syncBusy=false;
  if(syncAgain){syncAgain=false;scheduleSync();}
 }
}
function cloudSettingsSection(){return `<section class="settings-section"><h3>Handy & iPad abgleichen</h3><p>Auf Geräten mit demselben Zugang werden Aufgaben, Serien und Vorlagen zusammengeführt. Die lokale Kopie bleibt auch offline nutzbar.</p><p id="sync-status">${esc(syncMessage)}</p><div class="row"><button class="btn btn-primary" data-action="enable-sync">${cloudEnabled?'Jetzt abgleichen':'Geräteabgleich aktivieren'}</button>${cloudEnabled?'<button class="btn btn-secondary" data-action="disable-sync">Auf diesem Gerät ausschalten</button>':''}</div><details class="pair-code"><summary>Gerätecode für Netlify</summary><p>Auf Netlify einmal einen Code erzeugen und auf dem zweiten Gerät denselben Code eintragen. Bewahre ihn wie ein Passwort auf.</p><input id="sync-key" type="password" autocomplete="off" placeholder="Gerätecode" value="${esc(localSetting('daylight-sync-key'))}"><div class="row"><button class="btn btn-secondary" data-action="new-sync-key">Code erzeugen</button><button class="btn btn-secondary" data-action="save-sync-key">Code übernehmen</button><button class="btn btn-secondary" data-action="copy-sync-key">Code kopieren</button></div></details></section><section class="settings-section"><h3>Push-Erinnerungen</h3><p>Nach dem Geräteabgleich Benachrichtigungen auf jedem gewünschten Gerät einmal aktivieren. Auf dem iPhone die App dafür vom Home-Bildschirm öffnen.</p><p id="push-status">${cloudConfig?.scheduler?'Serverversand eingerichtet.':cloudConfig?.available?'Der automatische Versand ist in dieser Vorschau noch nicht eingerichtet. Das Netlify-Projekt enthält den Zeitplan.':'Serverstatus wird beim Aktivieren geprüft.'}</p><div class="row"><button class="btn btn-secondary" data-action="enable-push">Benachrichtigungen aktivieren</button><button class="btn btn-secondary" data-action="test-push">Testnachricht</button><button class="btn btn-secondary" data-action="disable-push">Auf diesem Gerät deaktivieren</button></div></section>`;}
async function enableCloud(){const config=await loadCloudConfig();if(!config.available){toast('Bitte das vollständige Projekt mit Serverfunktionen veröffentlichen.');return;}if(config.auth==='device-key'&&!/^[A-Za-z0-9_-]{43}$/.test(localSetting('daylight-sync-key'))){toast('Auf Netlify zuerst einen Gerätecode erzeugen oder übernehmen.');return;}cloudEnabled=true;localStorage.setItem('daylight-sync-enabled','true');stampSnapshot(data,previousSavedSnapshot,DEVICE_ID);previousSavedSnapshot=structuredClone(data);try{await syncNow();toast('Geräteabgleich aktiviert.');}catch(error){toast(error.message);}if($('#sync-status'))$('#sync-status').textContent=syncMessage;}
function decodeBase64Url(value){const raw=atob(value.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(value.length/4)*4,'='));return Uint8Array.from(raw,c=>c.charCodeAt(0));}
async function enablePush(){const config=await loadCloudConfig();const status=$('#push-status');if(!cloudEnabled){toast('Bitte zuerst den Geräteabgleich aktivieren.');return;}if(!config.scheduler){if(status)status.textContent='Hier fehlt der automatische Serverzeitplan. Vollständiges Netlify-Projekt veröffentlichen; bis dahin sind Push-Erinnerungen nicht aktiv.';toast('Automatischer Serverzeitplan noch nicht aktiv.');return;}if(!('serviceWorker'in navigator)||!('PushManager'in window)||!('Notification'in window)){toast('Dieser Browser unterstützt Push hier nicht. Auf dem iPhone vom Home-Bildschirm öffnen.');return;}const permission=await Notification.requestPermission();if(permission!=='granted'){toast('Benachrichtigungen wurden nicht freigegeben.');return;}const registration=await navigator.serviceWorker.ready;let subscription=await registration.pushManager.getSubscription();if(!subscription)subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:decodeBase64Url(config.publicKey)});const res=await fetch('/api/subscriptions',{method:'POST',headers:cloudHeaders(),body:JSON.stringify({device:DEVICE_ID,subscription:subscription.toJSON()})});if(!res.ok)throw new Error('Push-Anmeldung konnte nicht gespeichert werden.');if(status)status.textContent='Benachrichtigungen auf diesem Gerät aktiviert.';toast('Push-Erinnerungen aktiviert.');}
async function disablePush(){if('serviceWorker'in navigator){const r=await navigator.serviceWorker.ready,sub=await r.pushManager.getSubscription();if(sub){await fetch('/api/subscriptions',{method:'DELETE',headers:cloudHeaders(),body:JSON.stringify({device:DEVICE_ID})});await sub.unsubscribe();}}toast('Benachrichtigungen auf diesem Gerät deaktiviert.');}
async function testPush(){if(!cloudEnabled){toast('Bitte zuerst Geräteabgleich und Benachrichtigungen aktivieren.');return;}const res=await fetch('/api/push-test',{method:'POST',headers:cloudHeaders(),body:JSON.stringify({device:DEVICE_ID})});const result=await res.json().catch(()=>({}));if(!res.ok)throw new Error(result.error||'Testnachricht nicht möglich.');toast('Testnachricht an den Push-Dienst übergeben.');}

document.addEventListener('click',event=>{const el=event.target.closest('[data-action]');if(!el)return;const a=el.dataset.action,id=el.dataset.id;switch(a){
 case 'nav':navigate(el.dataset.view);break;
 case 'menu':mobileMenu=!mobileMenu;render();break;
 case 'close-menu':mobileMenu=false;render();break;
 case 'project':activeProject=id;view='tasks';mobileMenu=false;render();window.scrollTo(0,0);break;
 case 'project-filter':activeProject=id;render();break;
 case 'add-task':{const defaults={};if(Object.hasOwn(el.dataset,'date'))defaults.planned=el.dataset.date;if(el.dataset.status)defaults.status=el.dataset.status;taskDialog(null,defaults);break;}
 case 'add-event':taskDialog(null,{kind:'event',planned:el.dataset.date||selectedDay});break;
 case 'edit-task':taskDialog(id);break;
 case 'quick-move':quickMoveDialog(id);break;
 case 'move-task-date':moveTaskDate(id,el.dataset.date);break;
 case 'add-subtask-row':{const rows=$('#subtask-rows');if(rows){rows.insertAdjacentHTML('beforeend',subtaskFormRow({id:uid(),title:'',done:false}));rows.querySelectorAll('[data-subtask-title]').item(rows.querySelectorAll('[data-subtask-title]').length-1)?.focus();}break;}
 case 'remove-subtask-row':el.closest('.subtask-form-row')?.remove();break;
 case 'pick-template':templatePicker();break;
 case 'use-template':taskDialog(null,{templateId:id});break;
 case 'save-template-from-form':saveTemplateFromForm();break;
 case 'delete-template':{const t=data.templates.find(t=>t.id===id);if(t){data.templates=data.templates.filter(t=>t.id!==id);save();render();toast('Vorlage entfernt.','Rückgängig',()=>{data.templates.push(t);save();render();});}break;}
 case 'edit-series':taskDialog(null,{seriesEditId:id});break;
 case 'enable-sync':enableCloud().catch(error=>toast(error.message));break;
 case 'disable-sync':cloudEnabled=false;localStorage.setItem('daylight-sync-enabled','false');syncMessage='Auf diesem Gerät gespeichert';settingsDialog();break;
 case 'new-sync-key':{const key=btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');$('#sync-key').value=key;localStorage.setItem('daylight-sync-key',key);toast('Neuer Gerätecode erzeugt. Kopiere ihn auf dein zweites Gerät.');break;}
 case 'save-sync-key':{const key=$('#sync-key')?.value.trim();if(!/^[A-Za-z0-9_-]{43}$/.test(key||'')){toast('Bitte den vollständigen Gerätecode eintragen.');break;}localStorage.setItem('daylight-sync-key',key);toast('Gerätecode übernommen. Jetzt Abgleich aktivieren.');break;}
 case 'copy-sync-key':navigator.clipboard.writeText($('#sync-key')?.value||localSetting('daylight-sync-key')).then(()=>toast('Gerätecode kopiert.')).catch(()=>toast('Code bitte im Feld markieren und kopieren.'));break;
 case 'enable-push':enablePush().catch(error=>toast(error.message));break;
 case 'disable-push':disablePush().catch(error=>toast(error.message));break;
 case 'test-push':testPush().catch(error=>toast(error.message));break;
 case 'add-series':taskDialog(null,{kind:'event',repeat:true,planned:selectedDay});break;
 case 'add-task-series':taskDialog(null,{repeat:true,planned:selectedDay});break;
 case 'convert-series':convertSeriesDialog(id);break;
 case 'confirm-convert-series':convertSeries(id);break;
 case 'manage-series':closeDialog(false);navigate('series');break;
 case 'stop-series':stopSeriesDialog(id);break;
 case 'confirm-stop-series':stopRecurringSeries(id);break;
 case 'delete-occurrence':deleteSingleTask(id);break;
 case 'choose-plan':{const input=$('#task-planned');if(input){input.value=el.dataset.choice==='today'?today():el.dataset.choice==='tomorrow'?addDays(today(),1):'';syncDateChips();updateReminderForm();}break;}
 case 'clear-deadline':{const input=$('#task-due');if(input){input.value='';syncDateChips();updateReminderForm();}break;}
 case 'plan-today':{const t=data.tasks.find(t=>t.id===id);if(t)changeTask(id,{planned:today(),time:''},'Für heute eingeplant. Deadline bleibt bestehen.');break;}
 case 'toggle-task':toggleTask(id,el);break;
 case 'star-task':toggleStar(id);break;
 case 'delete-task':{const t=data.tasks.find(t=>t.id===id);if(t?.seriesId)recurringDeleteDialog(id);else deleteSingleTask(id);break;}
 case 'task-filter':taskFilter=el.dataset.filter;render();break;
 case 'select-day':selectedDay=el.dataset.date;render();break;
 case 'day-prev':selectedDay=addDays(selectedDay,-1);render();break;
 case 'day-next':selectedDay=addDays(selectedDay,1);render();break;
 case 'week-prev':weekOffset--;selectedDay=addDays(weekStart(today()),weekOffset*7);render();break;
 case 'week-next':weekOffset++;selectedDay=addDays(weekStart(today()),weekOffset*7);render();break;
 case 'calendar-mode':calendarMode=el.dataset.mode;monthCursor=new Date(dateOf(selectedDay).getFullYear(),dateOf(selectedDay).getMonth(),1);render();break;
 case 'calendar-prev':case 'calendar-next':{const delta=a==='calendar-next'?1:-1;if(calendarMode==='week'){selectedDay=addDays(selectedDay,delta*7);monthCursor=new Date(dateOf(selectedDay).getFullYear(),dateOf(selectedDay).getMonth(),1);}else{monthCursor=new Date(monthCursor.getFullYear(),monthCursor.getMonth()+delta,1);selectedDay=keyOf(monthCursor);}render();break;}
 case 'calendar-today':selectedDay=today();monthCursor=new Date(dateOf(today()).getFullYear(),dateOf(today()).getMonth(),1);render();break;
 case 'calendar-day':selectedDay=el.dataset.date;render();if(matchMedia('(max-width: 1000px)').matches)$('#calendar-selection')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});break;
 case 'add-project':projectDialog();break;
 case 'edit-project':projectDialog(id);break;
 case 'search':searchDialog();break;
 case 'settings':
  if(mobileMenu){mobileMenu=false;render();}
  settingsDialog();break;
 case 'export':exportBackup();break;
 case 'export-calendar':exportCalendar();break;
 case 'import':$('#backup-file')?.click();break;
 case 'clear-demo':{const removed=data.tasks.filter(t=>t.sample);data.tasks=data.tasks.filter(t=>!t.sample);data.demo=false;if(removed.some(t=>t.id===data.focus.taskId))data.focus.taskId=null;save();closeDialog(false);render();toast('Platz für deinen eigenen Plan.','Rückgängig',()=>{data.tasks.push(...removed);data.demo=true;save();render();toast('Beispielaufgaben wiederhergestellt.');});break;}
 case 'focus-mode':setFocusDuration(Number(el.dataset.mode),el.dataset.kind);break;
 case 'focus-custom':focusDurationDialog();break;
 case 'focus-toggle':focusToggle();break;
 case 'focus-reset':focusReset();break;
 case 'focus-task':if(data.tasks.some(t=>t.id===id&&!isEvent(t))){data.focus.taskId=data.focus.taskId===id?null:id;save({sync:false});render();}break;
 case 'close-dialog':closeDialog();break;
 case 'backdrop':if(event.target===el)closeDialog();break;
 case 'toast-action':{const callback=toastAction;toastAction=null;$('#toast').classList.remove('visible');callback?.();break;}
 }});
document.addEventListener('submit',event=>{
 event.preventDefault();
 const form=event.target;
 if(form.id==='task-form'){saveTaskForm(form);return;}
 const fields=new FormData(form);
 switch(form.id){
  case 'move-task-form':moveTaskDate(form.dataset.id,String(fields.get('planned')||''));break;
  case 'quick-add':{
   const title=String(fields.get('title')||'').trim();
   if(!title)return;
   data.tasks.push(makeTask({title:title.slice(0,180),project:activeProject,planned:selectedDay}));
   quickDrafts.delete(selectedDay);
   $('#quick-title').value='';
   save();
   render({keepQuickInput:true});
   $('#quick-title').focus();
   toast('Aufgabe festgehalten.');
   break;
  }
  case 'project-form':saveProject(form);break;
  case 'focus-duration-form':{
   const minutes=Number(fields.get('minutes'));
   if(!validFocusMinutes(minutes))return;
   closeDialog(false);
   setFocusDuration(minutes,'focus',true);
   break;
  }
  case 'name-form':
   data.name=String(fields.get('name')||'').trim().slice(0,30);
   save();
   render();
   toast('Name gespeichert.');
   break;
 }
});
document.addEventListener('input',event=>{
 const el=event.target;
 if(el.id==='global-search')searchResults(el.value);
 if(el.id==='quick-title')quickDrafts.set(selectedDay,el.value);
 if(el.id==='task-planned'||el.id==='task-due')syncDateChips();
 if(el.id?.startsWith('repeat-'))updateRecurrenceForm();
 if(el.id==='task-time'||el.id==='event-end')updateEventForm();
 if(el.closest('.reminder-form')||el.id==='task-time'||el.id==='task-planned'||el.id==='task-due'||el.id?.startsWith('repeat-'))updateReminderForm();
});
document.addEventListener('change',event=>{
 const el=event.target;
 if(el.dataset.statusId)changeTask(el.dataset.statusId,{status:el.value},el.value==='done'?'Geschafft. Ein Schritt weiter.':'Status aktualisiert.');
 if(el.id==='task-sort'){taskSort=el.value;render();}
 if(el.id==='backup-file')importBackup(el.files[0]);
 if(el.id==='task-planned'||el.id==='task-due')syncDateChips();
 if(el.id?.startsWith('repeat-')||el.name==='repeatDays'){
  updateRecurrenceForm();
  updateReminderForm();
 }
 if(el.id==='event-all-day'||el.id==='task-time'||el.id==='event-end')updateEventForm();
 if(el.closest('.reminder-form')||el.id==='task-planned'||el.id==='task-due'||el.id==='task-time')updateReminderForm();
 if(el.name==='color'&&el.form?.id==='project-form')$('#project-color-name').textContent=projectColors.find(([value])=>value===el.value)?.[1]||'';
 if(el.dataset.subtaskTask){
  const task=data.tasks.find(t=>t.id===el.dataset.subtaskTask&&!isEvent(t));
  if(task)changeTask(task.id,{subtasks:task.subtasks.map(s=>s.id===el.dataset.subtaskId?{...s,done:el.checked}:s)},'Schritt aktualisiert.');
 }
});
document.addEventListener('keydown',event=>{if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();searchDialog();return;}if(event.key==='Escape'){closeDialog();if(mobileMenu){mobileMenu=false;render();}}if(event.key==='Tab'&&dialogRoot.children.length){const items=$$('button:not([disabled]), input:not([disabled]):not([type="hidden"]), textarea, select, summary, [tabindex="0"]',dialogRoot).filter(x=>x.offsetParent!==null);const first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}});
document.addEventListener('dragstart',event=>{const card=event.target.closest('.board-card');if(!card)return;draggedId=card.dataset.id;event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',draggedId);card.classList.add('dragging');});
document.addEventListener('dragover',event=>{const col=event.target.closest('.board-col');if(col&&draggedId){event.preventDefault();event.dataTransfer.dropEffect='move';$$('.board-col').forEach(c=>c.classList.toggle('drag-over',c===col));}});
document.addEventListener('drop',event=>{const col=event.target.closest('.board-col');if(!col||!draggedId)return;event.preventDefault();const id=draggedId;draggedId=null;changeTask(id,{status:col.dataset.status},col.dataset.status==='done'?'Geschafft. Ein Schritt weiter.':'Aufgabe verschoben.');});
document.addEventListener('dragend',()=>{draggedId=null;$$('.board-col').forEach(c=>c.classList.remove('drag-over'));$$('.board-card').forEach(c=>c.classList.remove('dragging'));});
window.addEventListener('storage',event=>{if(event.key!==STORE||!event.newValue)return;try{data=validateBackup(JSON.parse(event.newValue));previousSavedSnapshot=structuredClone(data);renderBackground();}catch{toast('Einträge konnten aus dem anderen Tab nicht geladen werden.');}});
document.addEventListener('focusout',()=>{
 if(pendingBackgroundRender)window.setTimeout(()=>{if(pendingBackgroundRender)renderBackground();},0);
});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){tick();if(view==='today')renderBackground();}});
setInterval(tick,1000);
render();
try{
 const stored=localStorage.getItem(STORE);
 if(!initialReadFailed&&(!stored||JSON.parse(stored).version<SNAPSHOT_VERSION))save({sync:false});
}catch{storageAvailable=false;render();}
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));

loadCloudConfig().then(()=>{if(cloudEnabled)syncNow().catch(()=>{});});
setInterval(()=>{if(cloudEnabled&&!document.hidden)syncNow().catch(()=>{});},20000);
if(typeof location!=='undefined'){const taskId=new URLSearchParams(location.search).get('task');if(taskId&&data.tasks.some(t=>t.id===taskId))taskDialog(taskId);}
