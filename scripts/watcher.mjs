import { fork, spawn } from "node:child_process";
import { join } from "node:path";
import { connect } from "node:net";
import { PATHS } from "#paths";
import config from "#config";

const SERVER_PATH = join(PATHS.PROJECT_ROOT, "src", "server.mjs");

console.log(`[${new Date().toISOString()}] Starting application watcher...`);

let mongod = null;

function startMongo() {
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

    mongod.stderr.on("data", (data) => {
      const msg = data.toString();
      if (msg.includes("ERROR")) console.error(`[mongod] ${msg.trim()}`);
    });

    mongod.stdout.on("data", (data) => {
      const msg = data.toString().trim();
      if (msg.includes("ERROR")) {
        console.error(`[mongod] ${msg}`);
      } else if (msg.includes("WARNING")) {
        console.warn(`[mongod] ${msg}`);
      }
    });

    mongod.on("error", (err) => {
      reject(err);
    });

    mongod.on("exit", (code) => {
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

function shutdown() {
  if (mongod) {
    console.log(`[${new Date().toISOString()}] Stopping MongoDB...`);
    mongod.kill("SIGTERM");

    mongod.on("exit", () => {
      console.log(`[${new Date().toISOString()}] MongoDB stopped.`);
      process.exit(0);
    });

    setTimeout(() => {
      console.error("MongoDB shutdown timed out. Forcing exit.");
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
}

function waitForMongo(host, port, timeout = 10000) {
  const start = Date.now();

  return new Promise((resolve, reject) => {
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
