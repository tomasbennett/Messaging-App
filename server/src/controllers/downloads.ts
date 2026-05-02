import { Router, NextFunction, Request, Response } from "express";
import { ensureJWTAuthentication } from "../auth/ensureJWTAuthentication";
import { fetchSupaBaseFile } from "../services/FetchSupaBaseFile";
import { ICustomErrorResponse } from "../../../shared/features/api/models/APIErrorResponse";
import { prisma } from "../db/prisma";


export const router = Router();

// WE DO USE THIS AS WHAT IF A USER WANTS TO DOWNLOAD A PDF FILE OR SOMETHING THAT ISN'T ACCESSED IMMEDIATELY LIKE AN IMG
//THE SIGNED URL MIGHT EXPIRE BEFORE THE USER WANTS TO DOWNLOAD THE FILE BUT THIS WAY WE CAN ALWAYS CHECK IF THE FILE EXISTS IN OUR DB AND THEN FETCH A NEW SIGNED URL FROM SUPABASE TO DOWNLOAD THE FILE



router.get("/:supabaseId/inline", ensureJWTAuthentication, async (req: Request<{ supabaseId: string }>, res: Response<ICustomErrorResponse | Buffer>, next: NextFunction) => {
    const { supabaseId } = req.params;
    const user = req.user!;

    try {

        //CHECK IF THE USER CAN ACCESS HERE, NEEDS TO HAPPEN EVERYWHERE ELSE NOT THIS EXACT ROUTER


        const file = await prisma.file.findUnique({
            where: {
                supabaseFileId: supabaseId
            }
        });

        if (!file) {
            return res.status(404).json({
                ok: false,
                message: "File not found in prisma db!!!",
                status: 404
            });
        }

        const supabaseFileRes = await fetchSupaBaseFile(supabaseId);
        if (!supabaseFileRes.ok) {
            return res.status(supabaseFileRes.status).json(supabaseFileRes);
        }



        const arrayBuffer = await (supabaseFileRes.blob as Blob).arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);


        const fileBuffer = buffer;
        res.setHeader("Content-Type", (supabaseFileRes.blob as Blob).type);
        res.setHeader("Content-Length", buffer.length.toString());
        res.setHeader("Content-Disposition", `inline; filename="${file.filename}"`);
        res.send(fileBuffer);


    } catch (error) {
        next(error);

    }

});