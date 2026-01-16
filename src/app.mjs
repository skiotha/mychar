import { composeMiddleware } from "#middleware";
import { createRouter } from "#router";

/**
 * Creates the main app handler
 * @returns { Function } HTTP request handler
 */
export default function createApp() {
  const middleware = composeMiddleware();
  const router = createRouter();

  return async function app(req, res) {
    await middleware(req, res);
    await router(req, res);
  };
}
