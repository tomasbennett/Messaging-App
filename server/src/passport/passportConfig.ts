import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { prisma } from "../db/prisma";
import { User } from "@prisma/client";
import bcrypt from "bcrypt";
import { usernamePasswordSchema, ISignInError } from "../../../shared/features/auth/models/ILoginSchema";


passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        if (user) {
            done(null, user);

        } else {
            done(null, false);
            
        }

    } catch (err) {
        return done(err);

    }

});


passport.serializeUser((user: any, done) => {
    done(null, (user as User).id);

});



passport.use('local', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
}, async (username, password, done) => {
    
    const userNameResult = usernamePasswordSchema.safeParse(username);
    if (!userNameResult.success) {
        const signInError: ISignInError = {
            message: userNameResult.error.issues[0].message,
            inputType: "username"
        }
        return done(null, false, signInError);
    }

    const passwordResult = usernamePasswordSchema.safeParse(password);
    if (!passwordResult.success) {
        const signInError: ISignInError = {
            message: passwordResult.error.issues[0].message,
            inputType: "password"
        }
        return done(null, false, signInError);

    }

    try {
        const user = await prisma.user.findUnique({ where: { username }  });
        if (!user) {
            const signInError: ISignInError = {
                message: 'Username not found in our databse!!!',
                inputType: "username"
            }
            return done(null, false, signInError);
        
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            const signInError: ISignInError = {
                message: 'Incorrect password!!!',
                inputType: "password"
            }
            return done(null, false, signInError);
        
        }

        return done(null, user);

    } catch (err: unknown) {
        return done(err, false);

    }

}));