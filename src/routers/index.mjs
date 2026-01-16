class Router {
  constructor() {
    this.routes = [];
  }

  add(method, path, handler) {
    this.routes.push({ method, path, handler });
  }

  async handle(req, res) {
    for (const route of this.routes) {
      if (route.method === req.method && this.matchPath(route.path, req.url)) {
        await route.handler(req, res);
        return;
      }
    }

    res.statusCode = 404;
    res.end("Not Found");
  }

  matchPath(routePath, url) {
    return routePath === url.split("?")[0];
  }
}

export function createRouter() {
  const router = new Router();

  // @TODO: mount routes

  return router;
}
