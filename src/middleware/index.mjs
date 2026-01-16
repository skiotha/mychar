class Middleware {
  constructor() {
    this.stack = [];
  }
}

export function createMiddleware() {
  return new Middleware();
}
