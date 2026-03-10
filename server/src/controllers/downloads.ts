import { NextFunction, Request, Response, Router } from "express";
import { ensureJWTAuthentication } from "../auth/ensureJWTAuthentication";
import { prisma } from "../db/prisma";

import { fetchSupaBaseFile } from "../services/FetchSupaBaseFile";
import { APIErrorSchema, ICustomErrorResponse } from "../../../shared/features/api/models/APIErrorResponse";

export const router = Router();



//NEED TO HAVE SOME AUTHENTICATION NECESSARY SPECIFYING WHAT SORT OF USER CAN ACCESS THE FILES, MAYBE ONLY THE USER WHO UPLOADED THE FILE CAN ACCESS IT OR SOMETHING LIKE THAT
router.get("/inline-file/:fileId", async (req: Request<{ fileId: string }>, res: Response, next: NextFunction) => {
    try {
        const { fileId } = req.params;
    
        const file = await prisma.file.findUnique({
            where: {
                id: fileId
            }
        });
    

        if (!file) {
            return res.status(404).send("Blog not found!!!");
        }
    
        const supabaseFile = await fetchSupaBaseFile(file.supabaseFileId);
    
        if (!supabaseFile.ok) {
            return res.status(404).send("File not found in storage: " + supabaseFile.message);
        }
        
    
        const arrayBuffer = await (supabaseFile.blob as Blob).arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
    
    
        const fileBuffer = buffer;
        res.setHeader("Content-Type", (supabaseFile.blob as Blob).type);
        res.setHeader("Content-Length", buffer.length.toString());
        res.setHeader("Content-Disposition", `inline; filename="${file.filename}"`);
        res.send(fileBuffer);
        
    } catch (error) {
        next(error);
        
    }
});
