import z, { file } from "zod";
import { maxFileSizeInBytes } from "../constants";
import { NumberFromStringMinMaxLimitSchemaFunc } from "../../util/models/INumber";




export const InlineOrDownloadableFileSchema = z.discriminatedUnion("fileType", [
    z.object({
        fileType: z.literal("inline"),
        signedUrl: z.string(),
        fileSizeInBytes: NumberFromStringMinMaxLimitSchemaFunc(0, maxFileSizeInBytes),
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


// export const InlineOrDownloadableFileWFileSizeSchema = z.discriminatedUnion("fileType", [
//     z.object({
//         fileType: z.literal("inline"),
//         signedUrl: z.string(),
//         fileSizeInBytes: NumberFromStringMinMaxLimitSchemaFunc(0, maxFileSizeInBytes),
//     }),
//     z.object({
//         fileType: z.literal("downloadable"),
//         supabaseId: z.string(),
//         filename: z.string(),
//         mimetype: z.string(),
//         fileSizeInBytes: NumberFromStringMinMaxLimitSchemaFunc(0, maxFileSizeInBytes),
//     })
// ]);

// export type IInlineOrDownloadableFileWFileSize = z.infer<typeof InlineOrDownloadableFileWFileSizeSchema>;