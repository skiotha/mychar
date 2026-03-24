import {
  ChildProcess,
  fork,
  spawn,
  type ChildProcessByStdio,
} from "node:child_process";
import { join } from "node:path";
import { connect } from "node:net";
import type { Readable } from "node:stream";
import { PATHS } from "#paths";
import config from "#config";

const MONGO_TIMEOUT_MS = 10_000 as const;

const SERVER_PATH = join(PATHS.PROJECT_ROOT, "src", "server.mts");

console.log(`[${new Date().toISOString()}] Starting application watcher...`);

let mongod: ChildProcessByStdio<null, Readable, Readable> | null = null;

function startMongo(): Promise<void> {
  const { port, host, dbPath } = config.dbParams;

  if (!dbPath) {
    console.error("MONGO_DB_PATH is not set. Skipping MongoDB startup.");
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    mongod = spawn(
      "mongod",
      ["--dbpath", dbPath, "--port", String(port), "--bind_ip", host],
      { stdio: ["ignore", "pipe", "pipe"] },
    );

    mongod.stderr.on("data", (data: Buffer) => {
      const msg = data.toString();
      if (msg.includes("ERROR")) console.error(`[mongod] ${msg.trim()}`);
    });

    mongod.stdout.on("data", (data: Buffer) => {
      const msg = data.toString().trim();
      if (msg.includes("ERROR")) {
        console.error(`[mongod] ${msg}`);
      } else if (msg.includes("WARNING")) {
        console.warn(`[mongod] ${msg}`);
      }
    });

    mongod.on("error", (err: Error) => {
      reject(err);
    });

    mongod.on("exit", (code: number | null, signal: NodeJS.Signals | null) => {
      if (code !== null && code !== 0) {
        console.error(
          `[${new Date().toISOString()}] MongoDB exited with code ${code}`,
        );
      }
    });

    waitForMongo(host, port)
      .then(() => {
        console.log(
          `[${new Date().toISOString()}] MongoDB ready on port ${port}`,
        );
        resolve();
      })
      .catch(reject);
  });
}

function startApp(): void {
  const child: ChildProcess = fork(SERVER_PATH);

  child.on("exit", (code, signal) => {
    if (code === 0) {
      console.log(`[${new Date().toISOString()}] App stopped.`);
      return;
    }

    console.error(
      `[${new Date().toISOString()}] App crashed! Code: ${code}, Signal: ${signal}`,
    );
    console.log(`[${new Date().toISOString()}] Restarting in 2 seconds...`);

    setTimeout(startApp, 2000);
  });
}

function shutdown(): void {
  const proc = mongod;

  if (!proc) {
    console.log(
      `[${new Date().toISOString()}] No MongoDB process to stop. Exiting...`,
    );
    process.exit(0);
  }

  console.log(`[${new Date().toISOString()}] Stopping MongoDB...`);
  proc.kill("SIGTERM");

  proc.on("exit", () => {
    console.log(`[${new Date().toISOString()}] MongoDB stopped.`);
    process.exit(0);
  });

  setTimeout(() => {
    console.error("MongoDB shutdown timed out. Forcing exit.");
    process.exit(1);
  }, MONGO_TIMEOUT_MS);
}

function waitForMongo(
  host: string,
  port: number,
  timeout = MONGO_TIMEOUT_MS,
): Promise<void> {
  const start = Date.now();

  return new Promise<void>((resolve, reject) => {
    function attempt() {
      const socket = connect(port, host);
      socket.on("connect", () => {
        socket.destroy();
        resolve();
      });

      socket.on("error", () => {
        socket.destroy();
        if (Date.now() - start < timeout) {
          setTimeout(attempt, 300);
        } else {
          reject(new Error(`MongoDB not ready after ${timeout}ms.`));
        }
      });
    }

    attempt();
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

startMongo().then(startApp);
