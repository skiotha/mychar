import { readFileSync } from "node:fs";
import { join } from "node:path";

const isProduction = process.env.NODE_ENV === "production";

const PROJECT_ROOT =
  isProduction && process.env.SERVER_PATH
    ? process.env.SERVER_PATH
    : process.cwd();

const SSL_KEY_PATH =
  isProduction && process.env.SSL_KEY
    ? join(PROJECT_ROOT, process.env.SSL_KEY)
    : undefined;

const SSL_CERT_PATH =
  isProduction && process.env.SSL_CERT
    ? join(PROJECT_ROOT, process.env.SSL_CERT)
    : undefined;

export const PATHS = {
  PROJECT_ROOT,
  SSL: {
    key: SSL_KEY_PATH,
    cert: SSL_CERT_PATH,
  },
  PUBLIC: join(PROJECT_ROOT, "public"),
} satisfies Paths;

export const SSL = (() => {
  if (!PATHS.SSL.key || !PATHS.SSL.cert) {
    console.error("SSL certificates not found, using HTTP only");
    return null;
  }

  try {
    return {
      key: readFileSync(PATHS.SSL.key),
      cert: readFileSync(PATHS.SSL.cert),
    } satisfies SSLConfig;
  } catch {
    console.error("SSL certificates not found, using HTTP only");
    return null;
  }
})();

interface Paths {
  PROJECT_ROOT: string;
  SSL: {
    key?: string;
    cert?: string;
  };
  PUBLIC: string;
}

interface SSLConfig {
  key: Buffer;
  cert: Buffer;
}
