import type { IncomingMessage, ServerResponse } from "node:http";

type Request = IncomingMessage;
type Response = ServerResponse;
type Handler = (req: Request, res: Response) => Promise<void> | void;

export type { Request, Response, Handler };
