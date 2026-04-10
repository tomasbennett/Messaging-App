import z from "zod";



export const FileArrayPropertiesSchema = z.object({
    fileId: z.string().min(1, { message: "File ID is required" }),
    fileUrl: z.string().min(1, { message: "File URL is required" }),
});


export type IFileArrayProperties = z.infer<typeof FileArrayPropertiesSchema>;