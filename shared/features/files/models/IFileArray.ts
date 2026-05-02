import z from "zod";
import { InlineOrDownloadableFileSchema } from "../discriminatedUnions/InlineVsDownloadableFiles";



export const FileArrayPropertiesSchema = z.object({
    fileId: z.string().min(1, { message: "File ID is required" }),
    fileDetails: InlineOrDownloadableFileSchema,
});


export type IFileArrayProperties = z.infer<typeof FileArrayPropertiesSchema>;