import { NextFunction, Request, Response, Router } from "express";
import { ensureAuthentication } from "../passport/ensureAuthentication";
import { prisma } from "../db/prisma";

import { fetchSupaBaseFile } from "../services/FetchSupaBaseFile";
import { APIErrorSchema, ICustomErrorResponse } from "../../../shared/features/api/models/APIErrorResponse";

export const router = Router();




router.get("/public/:sharedNodeFileId", ensureAuthentication, async (req: Request<{ sharedNodeFileId: string }>, res: Response, next: NextFunction) => {
    const { sharedNodeFileId } = req.params;

    const sharedNode = await prisma.sharedNode.findUnique({
        where: {
            id: sharedNodeFileId,
            fileId: {
                not: null
            }
        },
        include: {
            file: true
        }
    });

    if (!sharedNode) {
        return res.status(404).json({
            message: "Shared file not found!!!",
            ok: false,
            status: 404
        });
    }

    const file = await fetchSupaBaseFile(sharedNode.file!.supabaseFileId);

    const errorResult = APIErrorSchema.safeParse(file);
    if (errorResult.success) {

        const apiError = file as ICustomErrorResponse;
        return res.status(apiError.status).json(apiError);
    }


    const blobFile = file as Blob;
    const arrayBuffer = await blobFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", blobFile.type);
    res.setHeader("Content-Length", blobFile.size.toString());
    res.setHeader("Content-Disposition", `attachment; filename="${sharedNode.file!.filename}"`);

    res.send(buffer);


});



router.get("/private/:fileId", ensureAuthentication, async (req: Request<{ fileId: string }>, res: Response, next: NextFunction) => {
    const { fileId } = req.params;


    const file = await prisma.files.findUnique({
        where: {
            id: fileId,
        },
        include: {
            parentFolder: {
                include: {
                    owner: true
                }
            }
        }
    });



    if (!file) return res.status(404).send("File not found!");


    const supabaseFile = await fetchSupaBaseFile(file.supabaseFileId);

    const errorResultFile = APIErrorSchema.safeParse(supabaseFile);
    if (errorResultFile.success) {
        return res.status(404).send("File not found in storage!");
    }



    const blobFile = supabaseFile as Blob;
    const arrayBuffer = await blobFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", blobFile.type || "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${file.filename}"`);

    res.send(buffer);

});



router.get("/inline-file/:shareNodeId", ensureAuthentication, async (req: Request<{ shareNodeId: string }>, res: Response, next: NextFunction) => {
    try {
        const { shareNodeId } = req.params;
    
        const sharedNode = await prisma.sharedNode.findUnique({
            where: {
                id: shareNodeId,
                fileId: {
                    not: null
                }
            },
            include: {
                file: true,
            }
        });
    

        if (!sharedNode) {
            return res.status(404).send("Shared node not found!!!");
        }
    

        const file = sharedNode.file;
    
        const supabaseFile = await fetchSupaBaseFile(file!.supabaseFileId);
    

        const errorResultFile = APIErrorSchema.safeParse(supabaseFile);
        if (errorResultFile.success) {
            return res.status(404).send("File not found in storage: " + errorResultFile.data.message);
        }
        
    
        const arrayBuffer = await (supabaseFile as Blob).arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
    
    
        const fileBuffer = buffer;
        res.setHeader("Content-Type", (supabaseFile as Blob).type);
        res.setHeader("Content-Length", buffer.length.toString());
        res.setHeader("Content-Disposition", `inline; filename="${file!.filename}"`);
        res.send(fileBuffer);
        
    } catch (error) {
        next(error);
        
    }
});