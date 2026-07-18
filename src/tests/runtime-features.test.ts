import {describe,expect,it} from 'vitest';
import {applyPresenceRules,ruleMatches} from '../main/automation';
import {defaults} from '../main/settings';
import {Detection,PresenceRule} from '../shared/types';

const detection:Detection={project:'Codex Activity',projectId:'0123456789abcdef',branch:'main',activity:'Coding',model:null,source:'test',updatedAt:100,sessionId:'session',sessionStartedAt:50};
const rule:PresenceRule={id:'focus-hours',name:'Focus hours',enabled:true,condition:{activities:['Coding'],projectIds:[detection.projectId!],daysOfWeek:[1],startMinute:540,endMinute:1020},action:{customStatus:'Deep focus',showProject:false}};

describe('presence automations',()=>{
  it('matches activity, project, day, and time',()=>expect(ruleMatches(rule,detection,new Date(2026,6,13,12,0))).toBe(true));
  it('supports time windows that cross midnight',()=>expect(ruleMatches({...rule,condition:{startMinute:1320,endMinute:120}},detection,new Date(2026,6,13,1,0))).toBe(true));
  it('applies a project template before ordered rule actions',()=>{
    const result=applyPresenceRules({...defaults,projectStatusTemplates:[{projectId:detection.projectId!,status:'Project status'}],presenceRules:[rule]},detection,new Date(2026,6,13,12,0));
    expect(result.settings.customStatus).toBe('Deep focus');expect(result.matchedRuleIds).toEqual(['focus-hours']);expect(result.hidden).toBe(false);
  });
});
