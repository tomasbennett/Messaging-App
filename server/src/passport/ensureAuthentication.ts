import { NextFunction, Request, Response } from "express";
import { ICustomErrorResponse } from "../../../shared/features/api/models/APIErrorResponse";
import { ISignInError } from "../../../shared/features/auth/models/ILoginSchema";


export function ensureAuthentication(req: Request, res: Response<ICustomErrorResponse>, next: NextFunction) {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return next();

    } else {
        return res.status(401).json({
            ok: false,
            status: 401,
            message: "Authentication required, unauthorized user"
        });

    }
}


export function ensureNotAuthenticated(req: Request, res: Response<ISignInError>, next: NextFunction) {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return res.status(400).json({ 
            message: "You are already authenticated", inputType: "root" 
        });

    } else {
        return next();

    }
}