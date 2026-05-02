import z from "zod";
import { maxFileSizeInBytes } from "../constants";
import { NumberFromStringMinMaxLimitSchemaFunc } from "../../util/models/INumber";




export const InlineOrDownloadableFileSchema = z.discriminatedUnion("fileType", [
    z.object({
        fileType: z.literal("inline"),
        signedUrl: z.string(),
    }),
    z.object({
        fileType: z.literal("downloadable"),
        supabaseId: z.string(),
        filename: z.string(),
        mimetype: z.string(),
        fileSizeInBytes: NumberFromStringMinMaxLimitSchemaFunc(0, maxFileSizeInBytes),
    })
]);


export type IInlineOrDownloadableFile = z.infer<typeof InlineOrDownloadableFileSchema>;