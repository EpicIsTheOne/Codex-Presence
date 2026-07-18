# Official Discord Social SDK files

Download the latest **Windows x64 standalone C++ Discord Social SDK** archive from the Social SDK section of the existing Discord application's Developer Portal. Do not use an npm package or an unofficial mirror.

Copy the archive contents into this directory so these paths exist:

- `include/discordpp.h` (and any adjacent C headers shipped by Discord)
- `lib/<the Windows x64 import library shipped by Discord>`
- `bin/<the Windows x64 Discord SDK DLL shipped by Discord>`

Keep the archive's version/readme file here as `VERSION.txt`; the build intentionally does not guess a version. Then configure and build with the commands in the repository README. The DLL must be copied beside `discord-presence-bridge.exe` for development and packaged beside it for production.
