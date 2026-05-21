import type { User as PrismaUser } from "@prisma/client";
import { Prisma } from "@prisma/client";
import * as express from "express";


export type AuthUser = Prisma.UserGetPayload<{
    include: {
        profileImg: {
            select: {
                supabaseFileId: true;
            };
        };
    };
}>;

declare global {
    namespace Express {
        interface User extends AuthUser {}
    }
}
