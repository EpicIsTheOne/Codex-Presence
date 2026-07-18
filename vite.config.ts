import { defineConfig } from 'vite';
export default defineConfig({
  root:'src/renderer',
  base:'./',
  define:{__ENABLE_DISCORD_ASSETS__:JSON.stringify(process.env.CODEX_ENABLE_ASSETS==='1')},
  build:{outDir:'../../dist/renderer',emptyOutDir:true},
  test:{include:['src/tests/**/*.test.ts']},
});
