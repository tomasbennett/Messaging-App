import { User } from "@prisma/client";
import { Response } from "express";

import crypto from "crypto";
import { environment } from "../../../shared/constants";
import { prisma } from "../db/prisma";
import { ISignInError } from "../../../shared/features/auth/models/ILoginSchema";
import { IAccessTokenResponse } from "../../../shared/features/auth/models/IAccessTokenResponse";
import { CreateAccessToken } from "./CreateAccessToken";
import { refreshTokenCookieKey } from "../constants/constants";
import { ILoginRegisterSuccessUserInfoSchema } from "../../../shared/features/auth/models/ILoginSuccessUserInfo";

export async function issueSignedInResponse(user: User, res: Response<ISignInError | ILoginRegisterSuccessUserInfoSchema>) {
    try {
        const accessToken = CreateAccessToken(user);
    
        const refreshToken = crypto.randomBytes(64).toString('hex');
        const refreshTokenHash = crypto
            .createHash("sha256")
            .update(refreshToken)
            .digest("hex");
    
    
    
        const expiry: number = 7 * 24 * 60 * 60 * 1000;
    
        await prisma.refreshToken.create({
            data: {
                token: refreshTokenHash,
                userId: user.id,
                // expiresAt: new Date(Date.now() + expiry)
            }
        });
    
        return res
            .cookie(refreshTokenCookieKey, refreshToken, {
                httpOnly: true,
                secure: environment === "PROD",
                sameSite: environment === "PROD" ? "none" : "lax",
                // maxAge: expiry
            })
            .status(200)
            .json({
                message: "Login successful",
                ok: true,
                status: 200,
                accessToken,
                userId: user.id,
                username: user.username
            });


    } catch (error: unknown) {
        console.error("Error issuing signed-in response:", error);
        if (error instanceof Error) {
            return res.status(500).json({
                message: error.message,
                inputType: "root"
            });
        }

        return res.status(500).json({
            message: "Internal server error creating refresh token",
            inputType: "root"
        });
    }
}