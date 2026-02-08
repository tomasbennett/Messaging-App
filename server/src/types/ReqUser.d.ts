import type { User as PrismaUser } from "@prisma/client";
import * as express from "express";

declare global {
    namespace Express {
        interface User extends PrismaUser {}
    }
}
