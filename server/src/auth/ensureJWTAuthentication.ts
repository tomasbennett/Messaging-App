import { Request, Response, NextFunction } from "express";
import { ICustomErrorResponse } from "../../../shared/features/api/models/APIErrorResponse";
import { prisma } from "../db/prisma";
import jwt from "jsonwebtoken"
import { expiredAccessTokenStatus } from "../../../shared/features/auth/constants";



export async function ensureJWTAuthentication(req: Request, res: Response<ICustomErrorResponse>, next: NextFunction) {
    
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(expiredAccessTokenStatus).json({
            ok: false,
            status: expiredAccessTokenStatus,
            message: "Invalid authorization header when ensuring authentication!!!"
        })
    }

    const token = header.split(" ")[1];

    try {
        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "default_access_token_secret");

        if (!payload?.sub || typeof payload.sub !== "string") {
            return res.status(400).json({
                ok: false,
                status: 400,
                message: "Access token payload missing user id!!!"
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.sub }
        });

        if (!user) {
            return res.status(404).json({
                ok: false,
                status: 404,
                message: "User not found for access token!!!"
            });
        }

        req.user = user;

        return next();



    } catch (err) {

        if (err instanceof Error) {
            console.log("ENSURE AUTH HAS RUN!!!");
            const message = err.name === "TokenExpiredError" ? "Access token expired!!!" : err.name;
            return res.status(expiredAccessTokenStatus).json({
                ok: false,
                status: expiredAccessTokenStatus,
                message
            });
        }


        return res.status(500).json({
            ok: false,
            status: 500,
            message: "Internal server error!!!"
        });


    }



}