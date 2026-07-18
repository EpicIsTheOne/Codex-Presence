import {describe,expect,it} from 'vitest';
import {buildPayload} from '../main/payload';
import {defaults} from '../main/settings';

const detection={project:'Codex Activity',projectId:'0123456789abcdef',branch:null,activity:'Coding' as const,model:'OpenAI',source:'test',updatedAt:0};

describe('automatic status format',()=>{
  it('expands safe activity and project tokens',()=>{
    const payload=buildPayload({...defaults,privateProject:false,showProject:true,automaticStatusTemplate:'{activity} on {project}'},detection,100);
    expect(payload.details).toBe('Coding on Codex Activity');
  });

  it('keeps idle wording accurate with the action token',()=>{
    const payload=buildPayload(defaults,{...detection,activity:'Idle'},100);
    expect(payload.details).toBe('Idle in Private Project');
  });

  it('shows the project beside a custom status when project sharing is enabled',()=>{
    const payload=buildPayload({...defaults,privateProject:false,showProject:true,customStatus:'Deep focus'},detection,100);
    expect(payload.details).toBe('Deep focus');
    expect(payload.state).toContain('Codex Activity');
  });

  it('never shows a hidden project beside a custom status',()=>{
    const payload=buildPayload({...defaults,privateProject:false,showProject:true,customStatus:'Deep focus',hiddenProjectIds:[detection.projectId]},detection,100);
    expect(payload.state).not.toContain('Codex Activity');
  });
});
