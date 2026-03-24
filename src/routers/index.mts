import type { Request, Response, Handler } from "#http";

class Router {
  private routes: Route[];

  constructor() {
    this.routes = [];
  }

  add(method: RouteMethod, path: string, handler: Handler): void {
    this.routes.push({ method, path, handler });
  }

  async handle(req: Request, res: Response): Promise<void> {
    const requestMethod = req.method?.toUpperCase() as RouteMethod;

    for (const route of this.routes) {
      if (
        route.method === requestMethod &&
        this.matchPath(route.path, req.url ?? "/")
      ) {
        await route.handler(req, res);
        return;
      }
    }

    res.statusCode = 404;
    res.end("Not Found");
  }

  matchPath(routePath: string, url: string): boolean {
    return routePath === url.split("?")[0];
  }
}

export function createRouter(): Router {
  const router = new Router();

  // @TODO: mount routes

  return router;
}

type RouteMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "OPTIONS"
  | "HEAD";

type Route = {
  method: RouteMethod;
  path: string;
  handler: Handler;
};
