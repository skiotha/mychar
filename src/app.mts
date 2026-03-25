import { composeMiddleware } from "#middleware";
import { createRouter } from "#router";
import type { Request, Response } from "#http";

export default function createApp() {
  const middleware = composeMiddleware();
  const router = createRouter();

  return async function app(req: Request, res: Response): Promise<void> {
    await middleware.handle(req, res, async () => {
      await router.handle(req, res);
    });
  };
}
