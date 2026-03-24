import type { Request, Response } from "#http";

class Middleware {
  stack: MiddlewareFn[];

  constructor() {
    this.stack = [];
  }
}

export function composeMiddleware(): Middleware {
  return new Middleware();
}

type MiddlewareFn = (
  req: Request,
  res: Response,
  next: () => Promise<void>,
) => Promise<void> | void;
