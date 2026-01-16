import { readFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT_ROOT =
  process.env.NODE_ENV === "production"
    ? process.env.SERVER_PATH
    : join(process.cwd(), "src/server.mjs");

export const PATHS = {
  PROJECT_ROOT,
  SSL: {
    key: join(PROJECT_ROOT, process.env.SSL_KEY),
    cert: join(PROJECT_ROOT, process.env.SSL_CERT),
  },
  PUBLIC: join(PROJECT_ROOT, "public"),
};

export const SSL = (() => {
  try {
    return {
      key: readFileSync(PATHS.SSL.key),
      cert: readFileSync(PATHS.SSL.cert),
    };
  } catch {
    console.error("SSL certificates not found, using HTTP only");
    return null;
  }
})();
