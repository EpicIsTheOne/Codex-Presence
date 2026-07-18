const fs = require('node:fs');
const path = require('node:path');
const {app} = require('electron');

const root = path.resolve(__dirname, '../..');
app.setAppPath(root);
app.whenReady().then(() => {
  const {codexIcon} = require(path.join(root, 'dist/main/app-icon.js'));
  const releaseMode = process.env.CODEX_RELEASE_ICON === '1';
  const size = releaseMode ? 1024 : 256;
  const output = releaseMode ? path.join(root, 'build', 'icon.png') : path.join(app.getPath('temp'), 'codex-presence-icon-smoke.png');
  const icon = codexIcon(size, '#f97316');
  if (icon.isEmpty() || icon.getSize().width !== size || icon.getSize().height !== size) {
    throw new Error(`Invalid icon: ${JSON.stringify(icon.getSize())}`);
  }
  fs.mkdirSync(path.dirname(output), {recursive: true});
  fs.writeFileSync(output, icon.toPNG());
  process.stdout.write(`${output}\n`);
  app.quit();
});
