import {describe,expect,it} from 'vitest';
import {presenceTimedOut,shouldHidePresenceForIdle} from '../main/idle';

describe('idle presence visibility',()=>{
  it('hides immediately when the setting is enabled',()=>{
    expect(shouldHidePresenceForIdle('Idle',null,15,true,1_000)).toBe(true);
  });

  it('keeps presence during the timeout when immediate hiding is disabled',()=>{
    expect(shouldHidePresenceForIdle('Idle',1_000,15,false,60_000)).toBe(false);
  });

  it('still honors the configured timeout',()=>{
    expect(presenceTimedOut('Idle',1_000,15,901_000)).toBe(true);
    expect(shouldHidePresenceForIdle('Idle',1_000,15,false,901_000)).toBe(true);
  });

  it('never hides active work because of the idle setting',()=>{
    expect(shouldHidePresenceForIdle('Coding',1_000,15,true,901_000)).toBe(false);
  });
});
