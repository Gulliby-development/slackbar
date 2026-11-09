// Loads src/cli.ts through Vite's server-side module runner (vite.config.ts registers @vitejs/plugin-vue for the .vue files) and runs it.
import { readFileSync } from "node:fs";
import { createServer, createServerModuleRunner } from "vite";

const server = await createServer({
  logLevel: "silent",
  appType: "custom",
  server: { middlewareMode: true, hmr: false, watch: null },
  optimizeDeps: { noDiscovery: true },
});
const runner = createServerModuleRunner(server.environments.ssr, undefined, { hmr: false });
try {
  const { run } = await runner.import("/src/cli.ts");
  const stdin = process.argv.includes("-") ? readFileSync(0) : Buffer.alloc(0);
  process.exitCode = await run(process.argv.slice(2), stdin, process.stdout, process.stderr);
} finally {
  await runner.close();
  await server.close();
}
