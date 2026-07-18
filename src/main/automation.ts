import {Activity,Detection,PresenceRule,Settings} from '../shared/types';

export interface EffectivePresence { settings:Settings; activity:Activity; hidden:boolean; matchedRuleIds:string[]; }

function inMinuteWindow(minute:number,start?:number,end?:number):boolean{
  if(start===undefined&&end===undefined)return true;
  const from=start??0,to=end??1439;
  return from<=to?minute>=from&&minute<=to:minute>=from||minute<=to;
}

export function ruleMatches(rule:PresenceRule,detection:Detection,now=new Date()):boolean{
  if(!rule.enabled)return false;
  const c=rule.condition;
  if(c.activities?.length&&!c.activities.includes(detection.activity))return false;
  if(c.projectIds?.length&&(!detection.projectId||!c.projectIds.includes(detection.projectId)))return false;
  if(c.daysOfWeek?.length&&!c.daysOfWeek.includes(now.getDay()))return false;
  return inMinuteWindow(now.getHours()*60+now.getMinutes(),c.startMinute,c.endMinute);
}

export function applyPresenceRules(settings:Settings,detection:Detection,now=new Date()):EffectivePresence{
  let effective=settings,activity=detection.activity,hidden=false;
  const matchedRuleIds:string[]=[];
  const template=detection.projectId?settings.projectStatusTemplates.find(item=>item.projectId===detection.projectId):undefined;
  if(template)effective={...effective,customStatus:template.status};
  for(const rule of settings.presenceRules){
    if(!ruleMatches(rule,{...detection,activity},now))continue;
    matchedRuleIds.push(rule.id);
    const a=rule.action;
    activity=a.activity??activity;
    hidden=hidden||a.hidePresence===true;
    effective={...effective,
      customStatus:a.customStatus??effective.customStatus,
      privateProject:a.privateProject??effective.privateProject,
      showProject:a.showProject??effective.showProject,
      showBranch:a.showBranch??effective.showBranch,
    };
  }
  return{settings:effective,activity,hidden,matchedRuleIds};
}
