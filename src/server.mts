import https from "node:https";
import http from "node:http";
import createApp from "#app";
import config from "#config";
import { SSL } from "#paths";
import { connect, disconnect } from "./models/db.mts";

const app = createApp();
const isProduction = process.env.NODE_ENV === "production";

const server: https.Server | http.Server =
  isProduction && SSL ? https.createServer(SSL, app) : http.createServer(app);

const { host = "localhost", port = isProduction ? 443 : 3500 } =
  config.serverParams;

connect()
  .then(() => {
    server.listen(port, host, () => {
      console.log(
        `Server listening on ${isProduction ? "https" : "http"}://${host}:${port}`,
      );
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });

function handleShutdown(signal: NodeJS.Signals | string): void {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  server.close((err) => {
    if (err) {
      console.error("Error during server close:", err);
      process.exit(1);
    }

    console.log("Server closed.");
    disconnect().then(() => {
      console.log("Database disconnected. Exiting process.");
      process.exit(0);
    });
  });

  setTimeout(() => {
    console.error("Forcing shutdown after timeout");
    process.exit(1);
  }, 10000);
}

// signal handlers
process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));

// error handlers
process.on("uncaughtException", (error, origin) => {
  console.error("FATAL - Uncaught Exception:", error);
  console.error("Exception origin:", origin);

  handleShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error(
    "FATAL - Unhandled Promise Rejection at:",
    promise,
    "reason:",
    reason,
  );
  handleShutdown("unhandledRejection");
});
