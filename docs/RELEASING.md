# Release process

## Preconditions

- Update `package.json` version using semantic versioning.
- Confirm the built-in Discord Application ID and uploaded Discord artwork.
- Confirm no `.env`, settings file, SDK archive, credentials, local session data, or native build directory is tracked.
- Run desktop lint, type checks, tests, and the production build.
- For the maintainer Windows build, rebuild the native bridge against the locally downloaded official Discord Social SDK.

## Windows

Run `npm run package:win`, then `npm run release:verify`. Validate the assisted NSIS installer in a disposable Windows user or VM:

1. Install with and without the Desktop shortcut selected.
2. Launch from the Start Menu and confirm no terminal window appears.
3. Confirm the orange Codex Presence icon in the window and tray.
4. Start presence with Discord desktop running and verify activity changes.
5. Change a harmless setting, quit, reopen, and verify persistence.
6. Enable launch at startup, sign out/in, and confirm it starts hidden in the tray.
7. Install the same or newer version over the existing installation and confirm settings persist.
8. Uninstall, confirm shortcuts and the uninstall entry are removed, then reinstall.

The installer is unsigned until a Windows code-signing certificate is configured.

## Linux

Build AppImage and Debian packages on Ubuntu 22.04 using `npm run package:linux`. Validate on a native Linux desktop before marking support:

- AppImage executable permissions and launch.
- Debian install, application menu entry, and uninstall.
- Discord desktop IPC presence through the legacy transport.
- Tray visibility on GNOME with AppIndicator and at least one KDE environment.
- XDG autostart entry and hidden startup.

## macOS

Build Intel and Apple Silicon DMG/ZIP artifacts on a macOS runner using `npm run package:mac`. These builds are unsigned and not notarized. Validate launch, tray, Discord IPC presence, settings persistence, and login-item behavior on both architectures before marking support.

## Publish

1. Push the release commit to `main`.
2. Tag it as `v<version>` and push the tag.
3. Wait for all jobs in `Build release` to finish.
4. Download the release assets and verify `SHA256SUMS.txt`.
5. Update any separately maintained website download manifest only for artifacts that were produced and tested.
