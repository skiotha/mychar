import https from "node:https";
import http from "node:http";
import createApp from "#app";
import { serverParams } from "#config";
import { SSL } from "#paths";

const app = createApp();
const isProduction = process.env.NODE_ENV === "production";

const server =
  isProduction && SSL ? https.createServer(SSL, app) : http.createServer(app);

const { host = "localhost", port = isProduction ? 443 : 3500 } = serverParams;

server.listen(port, host, () => {
  console.log(
    `Server listening on ${isProduction ? "https" : "http"}://${host}:${port}`,
  );
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

function handleShutdown(signal) {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  server.close((err) => {
    if (err) {
      console.error("Error during server close:", err);
      process.exit(1);
    }

    console.log("Server closed. Exiting process.");
    // @TODO: db disconnect
    process.exit(0);
  });

  setTimeout(() => {
    console.error("Forcing shutdown after timeout");
    process.exit(1);
  }, 10000);
}

// signal handlers
process.on("SIGTERM", handleShutdown);
process.on("SIGINT", handleShutdown);

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
