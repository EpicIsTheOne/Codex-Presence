import {describe,expect,it} from 'vitest';
import {privacyPanicPatch} from '../main/privacy-panic';

describe('privacy panic',()=>{
  it('disables presence and clears identifying overrides',()=>{
    expect(privacyPanicPatch()).toMatchObject({enabled:false,showProject:false,privateProject:true,showBranch:false,showModel:false,customStatus:'',manualProject:'',manualActivity:null,activeProfileId:null});
  });
});
