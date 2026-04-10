import { NextFunction, Request, Response, Router } from "express";
import { ICustomErrorResponse } from "../../../shared/features/api/models/APIErrorResponse";
import { ICustomSuccessMessage } from "../../../shared/features/api/models/APISuccessResponse";

import crypto from "crypto"
import { prisma } from "../db/prisma";
import { IAccessTokenResponse } from "../../../shared/features/auth/models/IAccessTokenResponse";
import { CreateAccessToken } from "../auth/CreateAccessToken";
import { invalidRefreshTokenStatus } from "../../../shared/features/auth/constants";
import { ensureJWTAuthentication } from "../auth/ensureJWTAuthentication";

export const router = Router();

router.get("/checkAuthLevel", ensureJWTAuthentication, (req: Request, res: Response<ICustomErrorResponse | ICustomSuccessMessage>, next: NextFunction) => {
    if (req.user) {
        return res.status(200).json({
            ok: true,
            status: 200,
            message: "User is authenticated with access token"
        });
    }

    //DONT REMEMBER WHY THIS IS HERE BUT I THINK IT IS IN CASE THE MIDDLEWARE DOESNT THROW AN ERROR BUT ALSO DOESNT AUTHENTICATE THE USER FOR SOME REASON
    return res.status(401).json({
        ok: false,
        status: 401,
        message: "User is not authenticated with their access token"
    });

});


router.get("/grantNewAccessToken", async (req: Request, res: Response<ICustomErrorResponse | IAccessTokenResponse>, next: NextFunction) => {
    const refreshToken: string | undefined = req.cookies?.refreshToken;

    if (!refreshToken) {
        return res.status(invalidRefreshTokenStatus).json({
            message: "No refresh token provided!!!",
            ok: false,
            status: invalidRefreshTokenStatus
        });
    }

    try {

        const tokenHash = crypto
            .createHash("sha256")
            .update(refreshToken)
            .digest("hex");

        const dbRefreshToken = await prisma.refreshToken.findUnique({
            where: {
                token: tokenHash
            },
            include: {
                user: true
            }
        });


        if (!dbRefreshToken) {
            return res.status(invalidRefreshTokenStatus).json({
                message: "Refresh token not found in database!!!",
                ok: false,
                status: invalidRefreshTokenStatus
            });
        }

        // if (dbRefreshToken.expiresAt.getTime() < Date.now()) {
        //     const delRefreshToken = await prisma.refreshToken.delete({
        //         where: {
        //             id: dbRefreshToken.id
        //         }
        //     });

            

        //     return res.status(invalidRefreshTokenStatus).json({
        //         ok: false,
        //         status: invalidRefreshTokenStatus,
        //         message: "Refresh token expired!!!"
        //     });
        // }



        const accessToken = CreateAccessToken(dbRefreshToken.user);

        return res.status(200).json({
            ok: true,
            status: 200,
            message: "New access token created from refresh token!!!",
            accessToken
        });




    } catch (error) {
        return next(error);

    }
});
