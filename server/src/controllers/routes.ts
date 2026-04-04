import { Router, Request, Response, NextFunction } from "express";
import { router as conversationsRouter } from "./Conversations";
import { router as authRouter } from "./auth";

export const apiRouter = Router();

apiRouter.use("/conversations", conversationsRouter);
apiRouter.use("/auth", authRouter);