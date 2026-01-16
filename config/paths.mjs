import { readFileSync } from "node:fs";
import { join } from "node:path";

const isProduction = process.env.NODE_ENV === "production";

const PROJECT_ROOT = isProduction ? process.env.SERVER_PATH : process.cwd();

export const PATHS = {
  PROJECT_ROOT,
  SSL: {
    key: isProduction && join(PROJECT_ROOT, process.env.SSL_KEY),
    cert: isProduction && join(PROJECT_ROOT, process.env.SSL_CERT),
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
