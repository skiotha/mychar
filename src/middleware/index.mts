import type { Request, Response } from "#http";

class Middleware {
  stack: MiddlewareFn[];

  constructor() {
    this.stack = [];
  }

  async handle(
    req: Request,
    res: Response,
    final: () => Promise<void>,
  ): Promise<void> {
    let index = 0;
    const stack = this.stack;

    async function next(): Promise<void> {
      if (index < stack.length) {
        const fn = stack[index++]!;
        await fn(req, res, next);
      } else {
        await final();
      }
    }

    await next();
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
