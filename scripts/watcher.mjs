import { fork } from "node:child_process";
import { join } from "node:path";
import { PATHS } from "#paths";

const SERVER_PATH = join(PATHS.PROJECT_ROOT, "src", "server.mjs");

console.log(`[${new Date().toISOString()}] Starting application watcher...`);

function startApp() {
  const child = fork(SERVER_PATH);

  child.on("exit", (code, signal) => {
    console.error(
      `[${new Date().toISOString()}] App crashed! Code: ${code}, Signal: ${signal}`,
    );
    console.log(`[${new Date().toISOString()}] Restarting in 2 seconds...`);

    setTimeout(startApp, 2000);
  });
}

startApp();
