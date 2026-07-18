import {Detection,PresencePayload,Settings} from '../shared/types';
import {sanitizeText} from '../shared/privacy';

export function buildPayload(s:Settings,d:Detection,startedAt:number):PresencePayload{
  const hidden=Boolean(d.projectId&&s.hiddenProjectIds.includes(d.projectId));
  const project=(s.privateProject||hidden)?'Private Project':(s.showProject&&d.project?sanitizeText(d.project):'Codex');
  const automatic=s.automaticStatusTemplate.replace(/\{(action|activity|project|model)\}/g,(_token,key:string)=>({action:d.activity==='Idle'?'Idle':'Working',activity:d.activity,project,model:d.model?sanitizeText(d.model,32):'Codex'}[key]??''));
  const details=s.customStatus?sanitizeText(s.customStatus):sanitizeText(automatic,128);
  const bits:string[]=[];
  if(s.customStatus&&!s.privateProject&&!hidden&&s.showProject&&d.project)bits.push(sanitizeText(d.project));
  if(s.showActivity)bits.push(d.activity);
  if(s.showBranch&&d.branch)bits.push(`Branch: ${sanitizeText(d.branch,32)}`);
  if(s.showModel&&d.model)bits.push(sanitizeText(d.model,32));
  return{details,state:bits.join(' · ')||undefined,startTimestamp:s.showElapsed?startedAt:undefined,
    largeImageKey:s.largeImageKey||undefined,largeImageText:s.largeImageText?sanitizeText(s.largeImageText,128):undefined,
    smallImageKey:s.smallImageKey||undefined,smallImageText:s.smallImageText?sanitizeText(s.smallImageText,128):undefined,instance:false};
}
