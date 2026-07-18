import {Menu} from 'electron';
import {activities,Activity,Settings,ViewState} from '../shared/types';

interface TrayMenuActions {
  toggle():void;
  setActivity(activity:Activity|null):void;
  setProfile(profileId:string|null):void;
  resetTimer():void;
  show():void;
  runDoctor():void;
  exportDiagnostics():void;
  privacyPanic():void;
  quit():void;
}

export function createTrayMenu(settings:Settings,state:ViewState,actions:TrayMenuActions):Menu {
  const status=state.health.status==='healthy'?'Healthy':state.health.status==='degraded'?'Needs attention':'Inactive';
  return Menu.buildFromTemplate([
    {label:`Status: ${status}`,enabled:false},
    {label:settings.enabled?'Disable Presence':'Enable Presence',click:actions.toggle},
    {label:'Activity',submenu:[
      {label:'Automatic',type:'radio',checked:!settings.manualActivity,click:()=>actions.setActivity(null)},
      ...activities.map(activity=>({label:activity,type:'radio' as const,checked:settings.manualActivity===activity,click:()=>actions.setActivity(activity)})),
    ]},
    {label:'Profile',submenu:[
      {label:'No profile',type:'radio',checked:!settings.activeProfileId,click:()=>actions.setProfile(null)},
      ...settings.profiles.map(profile=>({label:profile.name,type:'radio' as const,checked:settings.activeProfileId===profile.id,click:()=>actions.setProfile(profile.id)})),
    ]},
    {label:'Reset Timer',click:actions.resetTimer},
    {type:'separator'},
    {label:'Run Health Doctor',click:actions.runDoctor},
    {label:'Export Sanitized Diagnostics…',click:actions.exportDiagnostics},
    {label:'Privacy Panic…',click:actions.privacyPanic},
    {type:'separator'},
    {label:'Open Codex Presence',click:actions.show},
    {label:'Quit',click:actions.quit},
  ]);
}
