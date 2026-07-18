const port = Number(process.argv[2] || 9230);
const setColor = process.argv[3];

async function main() {
  const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then(response => response.json());
  const target = targets.find(item => item.type === 'page');
  if (!target) throw new Error('Packaged renderer target not found');
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let id = 0;
  const pending = new Map();
  socket.onmessage = event => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const {resolve, reject} = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message)); else resolve(message.result);
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const commandId = ++id;
    pending.set(commandId, {resolve, reject});
    socket.send(JSON.stringify({id: commandId, method, params}));
  });
  await send('Runtime.enable');
  const expression = setColor === '--enable'
    ? 'window.codexPresence.update({enabled:true})'
    : setColor === '--disable'
      ? 'window.codexPresence.update({enabled:false})'
      : setColor === '--show-project'
        ? 'window.codexPresence.update({showProject:true})'
      : setColor === '--show-current-project'
        ? '(async()=>{const s=await window.codexPresence.state();return window.codexPresence.update({showProject:true,hiddenProjectIds:s.settings.hiddenProjectIds.filter(id=>id!==s.detection.projectId)})})()'
      : setColor
        ? `window.codexPresence.update({accentColor:${JSON.stringify(setColor)}})`
        : 'window.codexPresence.state()';
  const result = await send('Runtime.evaluate', {expression, awaitPromise: true, returnByValue: true});
  const state = result.result?.value;
  if (!state?.settings?.discordClientId || !state?.settings?.accentColor) throw new Error('Invalid packaged renderer state');
  process.stdout.write(`${JSON.stringify({title: target.title, applicationId: state.settings.discordClientId, accentColor: state.settings.accentColor, enabled: state.settings.enabled, connection: state.connection, backend: state.backend, presenceVisible: state.health?.presenceVisible,activeProfileId:state.settings.activeProfileId,customStatus:state.settings.customStatus,showProject:state.settings.showProject,privateProject:state.settings.privateProject,project:state.detection?.project,details:state.payload?.details,state:state.payload?.state})}\n`);
  socket.close();
}

main().catch(error => { console.error(error); process.exitCode = 1; });
