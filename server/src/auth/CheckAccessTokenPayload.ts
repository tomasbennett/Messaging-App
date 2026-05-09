import { User } from "@prisma/client";
import jwt from "jsonwebtoken";
import { ICustomErrorResponse } from "../../../shared/features/api/models/APIErrorResponse";
import { SOCKET_INVALID_ACCESS_TOKEN_MESSAGE, expiredAccessTokenStatus } from "../../../shared/features/auth/constants";
import { prisma } from "../db/prisma";




export async function CheckAccessTokenPayload(header: string | undefined): Promise<{ ok: true, user: User } | ICustomErrorResponse> {

    
    if (!header || !header.startsWith("Bearer ")) {
        return {
            ok: false,
            status: expiredAccessTokenStatus,
            message: SOCKET_INVALID_ACCESS_TOKEN_MESSAGE
        }
    }

    const token = header.split(" ")[1];

    try {
        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "default_access_token_secret");

        if (!payload?.sub || typeof payload.sub !== "string") {
            return {
                ok: false,
                status: 400,
                message: "Access token payload missing user id!!!"
            };
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.sub }
        });

        if (!user) {
            return {
                ok: false,
                status: 404,
                message: "User not found for access token!!!"
            };
        }

        return {
            ok: true,
            user
        }

    } catch (err) {
        console.log("CHECK ACCESS TOKEN PAYLOAD HAS RUN!!!");
        
        if (!(err instanceof Error)) {
            return {
                ok: false,
                status: 500,
                message: "An unknown error occurred while verifying access token!!!"
            };
        }

        if (err.name === "JsonWebTokenError") {
            return {
                ok: false,
                status: expiredAccessTokenStatus,
                message: SOCKET_INVALID_ACCESS_TOKEN_MESSAGE
            };
        }

        if (err.name === "TokenExpiredError") {
            return {
                ok: false,
                status: expiredAccessTokenStatus,
                message: SOCKET_INVALID_ACCESS_TOKEN_MESSAGE
            };
        }

        return {
            ok: false,
            status: 500,
            message: "An unexpected error occurred while verifying access token!!!"
        };

    }
}   