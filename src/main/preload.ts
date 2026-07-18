import {contextBridge,ipcRenderer} from 'electron';
import {DiagnosticsExportResult,RuntimeDoctorReport,RuntimeEvent,SettingsPatch,TimelineQuery,ViewState} from '../shared/types';

contextBridge.exposeInMainWorld('codexPresence',{
  state:():Promise<ViewState>=>ipcRenderer.invoke('state'),
  update:(p:SettingsPatch):Promise<ViewState>=>ipcRenderer.invoke('settings:update',p),
  toggle:():Promise<ViewState>=>ipcRenderer.invoke('presence:toggle'),
  reset:():Promise<ViewState>=>ipcRenderer.invoke('timer:reset'),
  timeline:(query:TimelineQuery={}):Promise<RuntimeEvent[]>=>ipcRenderer.invoke('timeline:list',query),
  timelineClear:():Promise<void>=>ipcRenderer.invoke('timeline:clear'),
  doctor:():Promise<RuntimeDoctorReport>=>ipcRenderer.invoke('health:doctor'),
  exportDiagnostics:():Promise<DiagnosticsExportResult>=>ipcRenderer.invoke('diagnostics:export'),
  privacyPanic:():Promise<ViewState>=>ipcRenderer.invoke('privacy:panic'),
  onState:(cb:(s:ViewState)=>void)=>{const fn=(_:unknown,s:ViewState)=>cb(s);ipcRenderer.on('state:changed',fn);return()=>ipcRenderer.removeListener('state:changed',fn);},
});
