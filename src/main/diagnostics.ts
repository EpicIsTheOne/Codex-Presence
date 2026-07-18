import {app,BrowserWindow,dialog} from 'electron';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {DiagnosticsExportResult,DoctorCheck,RuntimeDoctorReport,ViewState} from '../shared/types';
import {socialBridgePath} from './discord';

export function createRuntimeDoctor(state:ViewState):RuntimeDoctorReport {
  const bridgeAvailable=fs.existsSync(socialBridgePath());
  const loginMatches=app.getLoginItemSettings().openAtLogin===state.settings.launchAtStartup;
  const detectorAge=state.health.detectorAgeMs;
  const checks:DoctorCheck[]=[
    {id:'presence',label:'Presence connection',status:!state.settings.enabled?'warn':state.connection==='connected'?'pass':state.connection==='error'?'fail':'warn',message:!state.settings.enabled?'Presence is disabled.':state.connection==='connected'?`Connected with ${state.backend}.`:state.connection==='error'?'Discord reported a connection error.':`Discord is ${state.connection}.`},
    {id:'detector',label:'Activity detector',status:detectorAge<=30_000?'pass':detectorAge<=90_000?'warn':'fail',message:detectorAge<=30_000?'Activity data is fresh.':detectorAge<=90_000?'Activity data is getting stale.':'Activity data is stale.'},
    {id:'bridge',label:'Discord Social SDK',status:bridgeAvailable?'pass':'warn',message:bridgeAvailable?'Native Social SDK bridge is available.':'Native bridge is unavailable; legacy RPC may be used.'},
    {id:'startup',label:'Launch at startup',status:loginMatches?'pass':'fail',message:loginMatches?'Windows startup state matches the setting.':'Windows startup state does not match the setting.'},
    {id:'privacy',label:'Privacy posture',status:state.settings.privateProject&&!state.settings.showBranch&&!state.settings.showModel?'pass':'warn',message:state.settings.privateProject&&!state.settings.showBranch&&!state.settings.showModel?'Project details are protected by default.':'Some optional project details may be shared.'},
  ];
  const overall=checks.some(c=>c.status==='fail')?'error':checks.some(c=>c.status==='warn')?'warning':'healthy';
  return {generatedAt:Date.now(),overall,checks};
}

export function buildDiagnosticsSnapshot(state:ViewState,doctor:RuntimeDoctorReport){
  return {
    schemaVersion:1,
    generatedAt:new Date().toISOString(),
    application:{name:'Codex Presence',version:app.getVersion(),packaged:app.isPackaged},
    runtime:{platform:process.platform,architecture:process.arch,osRelease:os.release(),electron:process.versions.electron,node:process.versions.node},
    presence:{enabled:state.settings.enabled,connection:state.connection,backend:state.backend,visible:state.health.presenceVisible,hasError:Boolean(state.error)},
    detector:{activity:state.detection.activity,ageMs:state.health.detectorAgeMs,hasProject:Boolean(state.detection.project),hasBranch:Boolean(state.detection.branch),hasModel:Boolean(state.detection.model)},
    settings:{showProject:state.settings.showProject,privateProject:state.settings.privateProject,hiddenProjectCount:state.settings.hiddenProjectIds.length,showBranch:state.settings.showBranch,showModel:state.settings.showModel,showActivity:state.settings.showActivity,showElapsed:state.settings.showElapsed,autoDetect:state.settings.autoDetect,launchAtStartup:state.settings.launchAtStartup,idleTimeoutMinutes:state.settings.idleTimeoutMinutes,hideWhenIdle:state.settings.hideWhenIdle,manualActivity:state.settings.manualActivity,hasCustomStatus:Boolean(state.settings.customStatus),hasManualProject:Boolean(state.settings.manualProject),profileCount:state.settings.profiles.length,activeProfile:Boolean(state.settings.activeProfileId)},
    health:doctor,
    events:state.recentEvents.slice(0,50).map(event=>({at:new Date(event.at).toISOString(),kind:event.kind})),
    privacyNotice:'Project names, project IDs, branches, models, paths, Discord client IDs, custom text, and secrets are intentionally omitted.',
  };
}

export async function exportDiagnosticsBundle(parent:BrowserWindow|null,state:ViewState):Promise<DiagnosticsExportResult>{
  const stamp=new Date().toISOString().replace(/[:.]/g,'-');
  const options={title:'Export sanitized diagnostics',defaultPath:path.join(app.getPath('downloads'),`codex-presence-diagnostics-${stamp}.json`),filters:[{name:'JSON diagnostics',extensions:['json']}]};
  const result=parent?await dialog.showSaveDialog(parent,options):await dialog.showSaveDialog(options);
  if(result.canceled||!result.filePath)return {success:false,canceled:true,message:'Diagnostics export canceled.'};
  try{
    const snapshot=buildDiagnosticsSnapshot(state,createRuntimeDoctor(state));
    fs.writeFileSync(result.filePath,JSON.stringify(snapshot,null,2),{encoding:'utf8',mode:0o600});
    return {success:true,canceled:false,message:'Sanitized diagnostics exported.'};
  }catch{
    return {success:false,canceled:false,message:'Could not export diagnostics.'};
  }
}
