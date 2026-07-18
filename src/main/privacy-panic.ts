import {SettingsPatch} from '../shared/types';

/** Maximum-privacy state used by both the renderer button and tray command. */
export function privacyPanicPatch():SettingsPatch {
  return {
    enabled:false,
    showProject:false,
    privateProject:true,
    showBranch:false,
    showModel:false,
    customStatus:'',
    manualProject:'',
    manualActivity:null,
    activeProfileId:null,
  };
}
