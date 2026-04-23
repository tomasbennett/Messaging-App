import { Request, Response, NextFunction } from "express";
import { ICustomErrorResponse } from "../../../shared/features/api/models/APIErrorResponse";
import { prisma } from "../db/prisma";
import jwt from "jsonwebtoken"
import { expiredAccessTokenStatus } from "../../../shared/features/auth/constants";
import { CheckAccessTokenPayload } from "./CheckAccessTokenPayload";



export async function ensureJWTAuthentication(req: Request, res: Response<ICustomErrorResponse>, next: NextFunction) {

    const header = req.headers.authorization;

    const userResult = await CheckAccessTokenPayload(header);

    if (!userResult.ok) {
        return res.status(userResult.status).json({
            ok: false,
            status: userResult.status,
            message: userResult.message
        });
    }

    req.user = userResult.user;

    return next();




}