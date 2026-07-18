const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const bridge = path.join(root, 'native/discord-presence-bridge/build-ninja/discord-presence-bridge.exe');
const sdkDll = path.join(root, 'vendor/discord-social-sdk/bin/discord_partner_sdk.dll');
const windowsNativeResources = fs.existsSync(bridge) && fs.existsSync(sdkDll) ? [
  {from: bridge, to: 'native/discord-presence-bridge.exe'},
  {from: sdkDll, to: 'native/discord_partner_sdk.dll'},
] : [];

module.exports = {
  appId: 'com.epicistheone.codexpresence',
  productName: 'Codex Presence',
  artifactName: 'Codex-Presence-${version}-${os}-${arch}.${ext}',
  asar: true,
  compression: 'maximum',
  directories: {output: 'release', buildResources: 'build'},
  files: ['dist/**/*', 'package.json'],
  extraMetadata: {desktopName: 'Codex Presence'},
  extraResources: [{from: 'src/renderer/assets/codex.png', to: 'codex.png'}],
  publish: {provider: 'github', owner: 'EpicIsTheOne', repo: 'Codex-Presence'},
  win: {
    target: [{target: 'nsis', arch: ['x64']}],
    icon: 'build/icon.png',
    extraResources: windowsNativeResources,
    legalTrademarks: 'Codex Presence is an independent community project.',
  },
  nsis: {
    oneClick: false,
    perMachine: false,
    allowElevation: true,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'Codex Presence',
    uninstallDisplayName: 'Codex Presence',
    runAfterFinish: true,
    deleteAppDataOnUninstall: false,
  },
  linux: {
    target: [{target: 'AppImage', arch: ['x64']}, {target: 'deb', arch: ['x64']}],
    icon: 'build/icon.png',
    category: 'Utility',
    synopsis: 'Discord Rich Presence for Codex',
    description: 'Privacy-first local Discord Rich Presence for Codex.',
    syncDesktopName: true,
  },
  deb: {priority: 'optional'},
  mac: {
    target: [{target: 'dmg', arch: ['x64', 'arm64']}, {target: 'zip', arch: ['x64', 'arm64']}],
    icon: 'build/icon.png',
    category: 'public.app-category.utilities',
    identity: null,
    hardenedRuntime: false,
  },
};
