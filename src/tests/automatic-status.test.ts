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
});
