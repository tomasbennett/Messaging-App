import { Router, Request, Response, NextFunction } from "express";
import { router as conversationsRouter } from "./Conversations";

export const apiRouter = Router();

apiRouter.use("/conversations", conversationsRouter);