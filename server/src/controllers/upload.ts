import { NextFunction, Request, Response, Router } from "express";
import { ensureJWTAuthentication } from "../auth/ensureJWTAuthentication";
import upload from "../supabase/multer";
import { supabase } from "../supabase/client";
import { prisma } from "../db/prisma";




export const router = Router();


//NEEDS FIXING FOR MULTIPLE FILES PER SINGLE MESSAGE UPLOAD, MAYBE WE NEED TO HAVE DIFFERENT ROUTERS FOR MESSAGES AND FOR PROFILE IMG UPLOADS
router.post("/file/upload", ensureJWTAuthentication, upload.single("file"), async (req: Request<{}, {}, { currentFolderId: string | undefined }>, res: Response, next: NextFunction) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                ok: false,
                status: 400,
                message: "No file uploaded"
            });
        }



        const { originalname, mimetype, size, buffer } = file;
        const currentFolderId = req.body.currentFolderId;

        if (!currentFolderId) {
            return res.status(400).json({
                ok: false,
                status: 400,
                message: "No folder ID provided!!!"
            });
        }






        const fileExt = originalname.split(".").pop();
        const storagePath = `${currentFolderId}/${crypto.randomUUID()}.${fileExt}`;

        const { error } = await supabase.storage
            .from(process.env.SUPABASE_STORAGE_BUCKET_NAME || "uploads")
            .upload(storagePath, buffer, {
                contentType: mimetype,
                upsert: false
            });

        if (error) throw error;




        const newFilePrisma = await prisma.file.create({
            data: {
                filename: originalname,
                filesize: size,
                filetype: mimetype,
                parentFolderId: currentFolderId,
                uploadedAt: new Date(),
                supabaseFileId: storagePath,
            }
        });










        return res.status(201).json({
            ok: true,
            status: 201,
            file: {
                id: newFilePrisma.id,
                name: newFilePrisma.filename,
                size: newFilePrisma.filesize,
                fileType: newFilePrisma.filetype,
                parentFolderId: newFilePrisma.parentFolderId,
                createdAt: newFilePrisma.uploadedAt,
            },
            message: "File uploaded successfully"
        });




    } catch (error) {
        next(error);

    }

});

router.patch("/me/user/profile", ensureJWTAuthentication, upload.single("profileImage"), async (req: Request, res: Response, next: NextFunction) => {
    
});