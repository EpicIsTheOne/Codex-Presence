const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const releaseDir = path.join(root, 'release');
if (!fs.existsSync(releaseDir)) throw new Error('release directory does not exist');

const files = fs.readdirSync(releaseDir, {withFileTypes: true})
  .filter(entry => entry.isFile() && /\.(exe|AppImage|deb|dmg|zip)$/.test(entry.name))
  .map(entry => entry.name)
  .sort();
if (!files.length) throw new Error('No release artifacts found');

const lines = files.map(name => {
  const file = path.join(releaseDir, name);
  const data = fs.readFileSync(file);
  if (data.length < 1024 * 1024) throw new Error(`${name} is unexpectedly small`);
  return `${crypto.createHash('sha256').update(data).digest('hex')}  ${name}`;
});
fs.writeFileSync(path.join(releaseDir, 'SHA256SUMS.txt'), `${lines.join('\n')}\n`);
process.stdout.write(`${lines.join('\n')}\n`);
