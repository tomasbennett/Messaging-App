import { Prisma, User } from "@prisma/client";
import { NextFunction, Router } from "express";
import { Request, Response } from "express";
import passport from "passport";
import { prisma } from "../db/prisma";

import bcrypt from "bcrypt";

import { ensureAuthentication, ensureNotAuthenticated } from "../passport/ensureAuthentication";
import { ICustomSuccessMessage } from "../../../shared/features/api/models/APISuccessResponse";
import { ISignInError, usernamePasswordSchema } from "../../../shared/features/auth/models/ILoginSchema";



export const router = Router();


router.post("/login", ensureNotAuthenticated, (req: Request, res: Response<ISignInError | { message: string, user: User }>, next: NextFunction) => {
    passport.authenticate("local", (err: Error, user: User | false, info: ISignInError | undefined) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({
                message: info ? info.message : "Authentication failed",
                inputType: info ? info.inputType : "root"
            });

        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }

            return res.status(200).json({ message: "Authentication successful", user });
        });
    })(req, res, next);

});


router.post("/register", ensureNotAuthenticated, async (req: Request<{}, {}, { username: string, password: string }>, res: Response<ISignInError | { message: string, user: User }>, next: NextFunction) => {
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
        const hashedPassword: string = await bcrypt.hash(password, process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS) : 10);

        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                rootFolder: {
                    create: {
                        name: "root",
                        createdAt: new Date()
                    }
                }
            }
        });

        req.logIn(newUser, (err) => {
            if (err) {
                return next(err);
            }

            return res.status(201).json({ message: "User registered successfully", user: newUser });
        });


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



router.post("/logout", ensureAuthentication, (req: Request, res: Response<ICustomSuccessMessage>, next: NextFunction) => {

    req.logOut(err => {
        if (err) return next(err);

        req.session.destroy((err) => {
            if (err) return next(err);


            res.clearCookie("session-id");
            return res.status(200).json({
                ok: true,
                status: 200,
                message: "Successfully logged out!!!"
            });

        });


    });
});















router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);

    res.status(500).json({ message: "Internal server error", error: err });

});