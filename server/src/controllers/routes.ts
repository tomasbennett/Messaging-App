import { Router, Request, Response, NextFunction } from "express";
import { router as conversationsRouter } from "./Conversations";
import { router as authRouter } from "./auth";
import { router as signInRouter } from "./sign-in";

export const apiRouter = Router();

apiRouter.use("/conversations", conversationsRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/sign-in", signInRouter);



apiRouter.use((req: Request, res: Response, next: NextFunction) => {
    return res.status(404).json({
        ok: false,
        status: 404,
        message: "The requested endpoint does not exist"
    });
});