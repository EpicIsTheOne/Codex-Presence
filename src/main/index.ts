import {app,BrowserWindow,dialog,ipcMain,Tray} from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import {Activity,RuntimeEvent,RuntimeEventKind,RuntimeSession,SettingsPatch,TimelineQuery,ViewState} from '../shared/types';
import {getSettings,updateSettings} from './settings';
import {detect,discoverProjects} from './detector';
import {buildPayload} from './payload';
import {DiscordService} from './discord';
import {applyPresenceRules} from './automation';
import {TimelineStore} from './timeline';
import {codexIcon} from './app-icon';
import {createRuntimeDoctor,exportDiagnosticsBundle} from './diagnostics';
import {privacyPanicPatch} from './privacy-panic';
import {registerRuntimeControlIpc} from './runtime-controls';
import {createTrayMenu} from './tray-menu';

let win:BrowserWindow|null=null,tray:Tray|null=null,startedAt=Date.now(),idleSince:number|null=null;
let connection:ViewState['connection']='disabled',backend:ViewState['backend']='none',error:string|null=null,state:ViewState;
let quitting=false,timeline:TimelineStore|null=null;
let runtimeSession:RuntimeSession={id:null,startedAt,lastActiveAt:startedAt,active:false};
const recentEvents:RuntimeEvent[]=[];
let eventId=0,lastActivity:string|null=null,lastProjectId:string|null=null,lastPresenceVisible:boolean|null=null,lastRules='';

app.setName('Codex Presence');
if(process.platform==='win32')app.setAppUserModelId('com.epicistheone.codexpresence');
const hasSingleInstanceLock=app.requestSingleInstanceLock();
if(!hasSingleInstanceLock)app.quit();
else app.on('second-instance',()=>show());

function record(kind:RuntimeEventKind,message:string){
  const event=timeline?.add(kind,message)??{id:++eventId,at:Date.now(),kind,message};
  recentEvents.unshift(event);recentEvents.splice(50);
}

const discord=new DiscordService((s,e,b)=>{if(s!==connection)record('connection',`Discord ${s}`);connection=s;backend=b??backend;error=e??null;void refresh(false);});
export function presenceTimedOut(activity:string,idleStarted:number|null,timeoutMinutes:number,now=Date.now()):boolean{return activity==='Idle'&&idleStarted!==null&&now-idleStarted>=timeoutMinutes*60_000;}

async function refresh(sync=true){
  const settings=getSettings(),[rawDetection,projects]=await Promise.all([detect(settings),discoverProjects(settings)]);
  const automated=applyPresenceRules(settings,rawDetection),detection={...rawDetection,activity:automated.activity};
  const sessionId=detection.sessionId??detection.projectId??null,now=Date.now();
  if(sessionId!==runtimeSession.id){
    runtimeSession={id:sessionId,startedAt:detection.sessionStartedAt??now,lastActiveAt:detection.updatedAt,active:detection.activity!=='Idle'};
  }else{
    runtimeSession={...runtimeSession,lastActiveAt:Math.max(runtimeSession.lastActiveAt,detection.updatedAt),active:detection.activity!=='Idle'};
  }
  if(detection.activity==='Idle')idleSince??=now;else idleSince=null;
  const timedOut=presenceTimedOut(detection.activity,idleSince,settings.idleTimeoutMinutes),hidden=timedOut||automated.hidden;
  const payload=hidden?null:buildPayload(automated.settings,detection,runtimeSession.startedAt),visible=settings.enabled&&payload!==null;
  if(lastActivity!==null&&lastActivity!==detection.activity)record('activity',`Activity changed to ${detection.activity}`);
  if(lastProjectId!==null&&lastProjectId!==detection.projectId)record('project',detection.project?'Active project changed':'No active project');
  if(lastPresenceVisible!==null&&lastPresenceVisible!==visible)record('presence',visible?'Presence became visible':'Presence was hidden');
  const ruleKey=automated.matchedRuleIds.join(',');if(lastRules&&lastRules!==ruleKey)record('presence',ruleKey?'Presence automation changed':'Presence automations cleared');
  lastActivity=detection.activity;lastProjectId=detection.projectId;lastPresenceVisible=visible;lastRules=ruleKey;
  const effectiveConnection=settings.enabled?connection:'disabled',effectiveError=settings.enabled?error:null;
  const detectorAgeMs=Math.max(0,now-detection.updatedAt),status=!settings.enabled?'inactive':effectiveError||effectiveConnection==='error'?'degraded':'healthy';
  state={settings,detection,projects,connection:effectiveConnection,backend:settings.enabled?backend:'none',error:effectiveError,startedAt:runtimeSession.startedAt,payload,
    health:{status,detectorAgeMs,presenceVisible:visible,eventCount:recentEvents.length,lastTransitionAt:recentEvents[0]?.at??null},recentEvents:[...recentEvents],session:{...runtimeSession},matchedRuleIds:automated.matchedRuleIds};
  if(sync&&settings.enabled){if(hidden)void discord.clear();else void discord.update(payload!);}
  win?.webContents.send('state:changed',state);buildTray();return state;
}

function show(){win?.show();win?.focus();}
function setActivity(a:Activity|null){updateSettings({manualActivity:a});void refresh();}
function setProfile(profileId:string|null){
  const current=getSettings(),profile=current.profiles.find(item=>item.id===profileId);
  updateSettings(profile?{activeProfileId:profile.id,customStatus:profile.customStatus,manualActivity:profile.manualActivity,privateProject:profile.privateProject,showProject:profile.showProject,showBranch:profile.showBranch}:{activeProfileId:null});void refresh();
}
function linuxAutostartPath(){return path.join(app.getPath('appData'),'autostart','codex-presence.desktop');}
function applyStartupSetting(enabled:boolean){
  if(process.platform!=='linux'){app.setLoginItemSettings({openAtLogin:enabled});return;}
  const file=linuxAutostartPath();
  if(!enabled){try{fs.rmSync(file,{force:true});}catch{}return;}
  const executable=(process.env.APPIMAGE||process.execPath).replaceAll('"','\\"');
  fs.mkdirSync(path.dirname(file),{recursive:true});
  fs.writeFileSync(file,`[Desktop Entry]\nType=Application\nName=Codex Presence\nExec="${executable}" --hidden\nTerminal=false\nX-GNOME-Autostart-enabled=true\n`,'utf8');
}
function shouldStartHidden(){
  if(process.argv.includes('--hidden'))return true;
  if(process.platform==='linux')return false;
  try{return app.getLoginItemSettings().wasOpenedAtLogin;}catch{return false;}
}
function resetTimer(){startedAt=Date.now();runtimeSession={...runtimeSession,startedAt};return refresh();}
function buildTray(){if(!tray||!state)return;tray.setContextMenu(createTrayMenu(getSettings(),state,{toggle:()=>void toggle(),setActivity,setProfile,resetTimer:()=>void resetTimer(),show,runDoctor:()=>void showDoctor(),exportDiagnostics:()=>void exportDiagnosticsBundle(win,state),privacyPanic:()=>void confirmPrivacyPanic(),quit:()=>{quitting=true;app.quit();}}));}
async function toggle(){const s=updateSettings({enabled:!getSettings().enabled});if(s.enabled)void discord.connect(s.discordClientId,()=>state.payload??buildPayload(s,state.detection,runtimeSession.startedAt));else{discord.stop();backend='none';}return refresh();}
async function privacyPanic(){
  updateSettings(privacyPanicPatch());discord.stop();backend='none';connection='disabled';error=null;record('presence','Privacy panic activated');return refresh();
}
async function confirmPrivacyPanic(){
  const options={type:'warning' as const,title:'Privacy Panic',message:'Hide Discord presence and clear identifying overrides?',detail:'This disables presence, project and branch sharing, model sharing, custom status, manual project, and the active profile.',buttons:['Activate Privacy Panic','Cancel'],defaultId:1,cancelId:1,noLink:true};
  const parent=win;const result=parent?await dialog.showMessageBox(parent,options):await dialog.showMessageBox(options);
  if(result.response===0)await privacyPanic();
}
async function showDoctor(){
  const report=createRuntimeDoctor(state),symbols={pass:'PASS',warn:'WARN',fail:'FAIL'} as const;
  const options={type:report.overall==='error'?'error' as const:report.overall==='warning'?'warning' as const:'info' as const,title:'Codex Presence Health Doctor',message:report.overall==='healthy'?'Everything looks healthy.':'The doctor found items worth checking.',detail:report.checks.map(check=>`[${symbols[check.status]}] ${check.label}: ${check.message}`).join('\n'),buttons:['OK'],noLink:true};
  const parent=win;if(parent)await dialog.showMessageBox(parent,options);else await dialog.showMessageBox(options);
}

app.whenReady().then(async()=>{
  if(!hasSingleInstanceLock)return;
  timeline=new TimelineStore(path.join(app.getPath('userData'),'activity-timeline.json'));
  recentEvents.push(...timeline.load().slice(0,50));eventId=recentEvents.reduce((max,event)=>Math.max(max,event.id),0);
  const initialSettings=getSettings();applyStartupSetting(initialSettings.launchAtStartup);
  win=new BrowserWindow({width:940,height:700,minWidth:760,minHeight:600,show:false,backgroundColor:'#0c0d12',icon:codexIcon(256,initialSettings.systemIconBackground),webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
  if(!shouldStartHidden())win.once('ready-to-show',()=>win?.show());
  await win.loadFile(path.join(__dirname,'../renderer/index.html'));win.on('close',e=>{if(!quitting){e.preventDefault();win?.hide();}});
  tray=new Tray(codexIcon(16,initialSettings.systemIconBackground));tray.setToolTip('Codex Presence');tray.on('double-click',show);await refresh(false);
  const s=getSettings();if(s.enabled)void discord.connect(s.discordClientId,()=>state.payload??buildPayload(s,state.detection,runtimeSession.startedAt));
  setInterval(()=>void refresh(),15_000).unref();
});

ipcMain.handle('state',()=>refresh(false));
ipcMain.handle('settings:update',async(_e,p:SettingsPatch)=>{const before=getSettings();const after=updateSettings(p);if(before.launchAtStartup!==after.launchAtStartup)applyStartupSetting(after.launchAtStartup);if(before.systemIconBackground!==after.systemIconBackground){win?.setIcon(codexIcon(256,after.systemIconBackground));tray?.setImage(codexIcon(16,after.systemIconBackground));}if(before.enabled!==after.enabled||before.discordClientId!==after.discordClientId){discord.stop();if(after.enabled)void discord.connect(after.discordClientId,()=>state.payload??buildPayload(after,state.detection,runtimeSession.startedAt));}return refresh();});
ipcMain.handle('presence:toggle',toggle);
ipcMain.handle('timer:reset',resetTimer);
ipcMain.handle('timeline:list',(_e,query:TimelineQuery={})=>timeline?.list(query)??recentEvents.slice(0,query.limit??50));
ipcMain.handle('timeline:clear',()=>{timeline?.clear();recentEvents.length=0;return refresh(false).then(()=>undefined);});
registerRuntimeControlIpc({state:()=>state,window:()=>win,privacyPanic});
app.on('before-quit',()=>{quitting=true;discord.stop();});
