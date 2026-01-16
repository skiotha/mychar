class Middleware {
  constructor() {
    this.stack = [];
  }
}

export function composeMiddleware() {
  return new Middleware();
}
