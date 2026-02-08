import z from "zod";
import { allowedTypes, maxFileSizeInBytes } from "../constants";




export const NewFileRequestSchema = z.object({
    file: z.instanceof(FileList)
        .refine((fileList) => fileList.length === 1, {
            message: "Exactly one file must be uploaded.",
        })
        .refine((fileList) => fileList[0].size <= maxFileSizeInBytes, {
            message: `File size must be less than ${maxFileSizeInBytes / 1024 / 1024} MB`,
        })
        .refine((fileList) => allowedTypes.includes(fileList[0].type), {
            message: "File type is not allowed.",
        }),
});



export type INewFileRequest = z.infer<typeof NewFileRequestSchema>;





export const NewFileRequestBackendSchema = NewFileRequestSchema.extend({
    parentFolderId: z.string(),
});


export type INewFileRequestBackend = z.infer<typeof NewFileRequestBackendSchema>;





