import { Prisma, User } from "@prisma/client";
import { NextFunction, Router } from "express";
import { Request, Response } from "express";
import passport from "passport";
import { prisma } from "../db/prisma";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import crypto from "crypto";

import { ensureJWTAuthentication } from "../auth/ensureJWTAuthentication";
import { ICustomSuccessMessage } from "../../../shared/features/api/models/APISuccessResponse";
import { ILoginForm, ISignInError, usernamePasswordSchema } from "../../../shared/features/auth/models/ILoginSchema";
import { environment } from "../../../shared/constants";
import { IAccessTokenResponse } from "../../../shared/features/auth/models/IAccessTokenResponse";
import { issueSignedInResponse } from "../services/IssueSignedInResponse";
import { ICustomErrorResponse } from "../../../shared/features/api/models/APIErrorResponse";
import { refreshTokenCookieKey } from "../constants/constants";



export const router = Router();


router.post("/login", async (req: Request<{}, {}, ILoginForm>, res: Response<ISignInError | IAccessTokenResponse>, next: NextFunction) => {
    const { username, password } = req.body;

    const usernameResult = usernamePasswordSchema.safeParse(username);
    if (!usernameResult.success) {
        return res.status(400).json({
            message: usernameResult.error.issues[0].message,
            inputType: "username"
        });

    }

    const passwordResult = usernamePasswordSchema.safeParse(password);
    if (!passwordResult.success) {
        return res.status(400).json({
            message: passwordResult.error.issues[0].message,
            inputType: "password"
        });
    }


    try {
        const user: User | null = await prisma.user.findUnique({
            where: {
                username
            }
        });

        if (!user) {
            const errorResponse: ISignInError = {
                message: "Invalid username!!!",
                inputType: "username"
            };
            return res.status(400).json(errorResponse);
        }

        const isPasswordValid: boolean = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            const errorResponse: ISignInError = {
                message: "Invalid password!!!",
                inputType: "password"
            };
            return res.status(400).json(errorResponse);
        }
        
        return await issueSignedInResponse(user, res);




    } catch (error) {
        return next(error);
    }

});


router.post("/register", async (req: Request<{}, {}, ILoginForm>, res: Response<ISignInError | IAccessTokenResponse>, next: NextFunction) => {
    const { username, password } = req.body;

    const usernameResult = usernamePasswordSchema.safeParse(username);
    if (!usernameResult.success) {
        return res.status(400).json({
            message: usernameResult.error.issues[0].message,
            inputType: "username"
        });

    }

    const passwordResult = usernamePasswordSchema.safeParse(password);
    if (!passwordResult.success) {
        return res.status(400).json({
            message: passwordResult.error.issues[0].message,
            inputType: "password"
        });
    }

    try {

        const hashedPassword = await bcrypt.hash(password, process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS) : 10);

        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword
            }
        });

        await issueSignedInResponse(user, res);

        

    } catch (error: unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                return res.status(400).json({
                    message: "Username already exists",
                    inputType: "username"
                });

            }

        }

        return next(error);

    }
});


router.delete("/logout", ensureJWTAuthentication, async (req: Request, res: Response<ICustomErrorResponse | ICustomSuccessMessage>, next: NextFunction) => {
    const refreshToken: string | undefined = req.cookies?.refreshToken;

    if (!refreshToken) {
        return res.status(400).json({
            message: "No refresh token provided!!!",
            ok: false,
            status: 400
        });
    }

    try {

        const tokenHash = crypto
            .createHash("sha256")
            .update(refreshToken)
            .digest("hex");

        const deletedRefreshToken = await prisma.refreshToken.delete({
            where: {
                token: tokenHash
            }
        });

        res.clearCookie(refreshTokenCookieKey, {
            httpOnly: true,
            secure: environment === "PROD",
            sameSite: environment === "PROD" ? "none" : "lax"
        });

        return res.sendStatus(204);

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return res.status(400).json({
                    message: "Refresh token not found for deletion!!!",
                    ok: false,
                    status: 400
                });

            }

        }


        return next(error);

    }




});
