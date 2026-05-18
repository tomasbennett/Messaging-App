import z from "zod";
import { allowedAllFileTypes as allowedTypes, maxFileSizeInBytes } from "../../files/constants";
import { FileArrayPropertiesSchema, IFileArrayProperties } from "../../files/models/IFileArray";
import { FILES_KEY_NAME } from "../constants";



export const MessageContentURLSchema = z.object({
    content: z.string().optional(),
    files: z.array(FileArrayPropertiesSchema).optional(),
}).superRefine((data, ctx) => {
    const hasContent = !!data.content && data.content.trim() !== "";
    const hasFileUrls = !!data.files && Array.isArray(data.files) && data.files.length > 0;

    if (hasContent) {
        return;
    }

    if (!hasFileUrls) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Either content or fileUrl must be provided",
            path: ["content"],
        });
        return;
    }

    const files = data.files as IFileArrayProperties[];

    for (let i = 0; i < files.length; i++) {
        const fileId = files[i].fileId;

        if (fileId.length < 1) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "File ID is required for each file URL",
                path: ["content"],
            });
            return;
        }
    }

});


export type IMessageContentURL = z.infer<typeof MessageContentURLSchema>;



export const MessageContentFileSchema = z.object({
    content: z.string().optional(),
    [FILES_KEY_NAME]: z.custom<FileList | undefined>(),
}).superRefine((data, ctx) => {
    const hasContent = !!data.content && data.content.trim() !== "";
    const hasFiles = !!data[FILES_KEY_NAME] && data[FILES_KEY_NAME] instanceof FileList && data[FILES_KEY_NAME].length > 0;

    if (!hasContent && !hasFiles) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Either content or file must be provided in a message",
            path: ["content"],
        });
        return;
    }

    if (hasContent && !hasFiles) {
        return;
    }

    const files = data[FILES_KEY_NAME] as FileList;

    for (let i = 0; i < files.length; i++) {
        const file = files.item(i)!;

        if (file.size > maxFileSizeInBytes) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `File size must be less than ${maxFileSizeInBytes / 1024 / 1024
                    } MB`,
            });
            return;
        }

        if (!allowedTypes.includes(file.type)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "File type is not allowed.",
            });
            return;
        }
    }



});


export type IMessageContentFile = z.infer<typeof MessageContentFileSchema>;