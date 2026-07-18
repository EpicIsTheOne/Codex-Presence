import {BrowserWindow,ipcMain} from 'electron';
import {ViewState} from '../shared/types';
import {createRuntimeDoctor,exportDiagnosticsBundle} from './diagnostics';

interface RuntimeControlDependencies {
  state():ViewState;
  window():BrowserWindow|null;
  privacyPanic():Promise<ViewState>;
}

export function registerRuntimeControlIpc(deps:RuntimeControlDependencies):void {
  ipcMain.handle('health:doctor',()=>createRuntimeDoctor(deps.state()));
  ipcMain.handle('diagnostics:export',()=>exportDiagnosticsBundle(deps.window(),deps.state()));
  ipcMain.handle('privacy:panic',()=>deps.privacyPanic());
}
