import { prisma } from "../db/prisma";
import { supabase } from "../supabase/client";
import { ICustomErrorResponse } from "../../../shared/features/api/models/APIErrorResponse";


export async function deleteSupaBaseFile(
    fileId: string | null
): Promise<ICustomErrorResponse | { ok: true }> {
    
    if (!fileId) {
        return {
            ok: false,
            status: 400,
            message: "File ID is null"
        };
    }

    try {


        const fileRecord = await prisma.files.delete({
            where: { id: fileId },
            select: { supabaseFileId: true }
        });

        if (!fileRecord) {
            return {
                ok: false,
                status: 404,
                message: "File not found"
            };
        }

        const { error } = await supabase
            .storage
            .from(process.env.SUPABASE_BUCKET_NAME!)
            .remove([fileRecord.supabaseFileId]);

        if (error) {
            return {
                ok: false,
                status: 500,
                message: error.message
            };
        }

        return { ok: true };

    } catch (error) {

        if (error instanceof Error) {
            return {
                ok: false,
                status: 500,
                message: error.message
            };
        }

        return {
            ok: false,
            status: 500,
            message: "Unknown error occurred whilst deleting file from Supabase!!!"
        }
    }

}