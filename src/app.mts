import { composeMiddleware } from "#middleware";
import { createRouter } from "#router";
import type { Request, Response } from "#http";

export default function createApp() {
  const middleware = composeMiddleware();
  const router = createRouter();

  return async function app(req: Request, res: Response): Promise<void> {
    // TODO: integrate middleware and router
    // await middleware.handle(req, res);
    // await router.handle(req, res);
  };
}
