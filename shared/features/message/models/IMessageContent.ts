import z from "zod";
import { allowedTypes, maxFileSizeInBytes } from "../../files/constants";




export const MessageContentURLSchema = z.object({
    content: z.string().optional(),
    files: z.array(z.object({
        fileUrl: z.string(),
        fileId: z.string(),
    })).optional(),
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

    const files = data.files as { fileUrl: string; fileId: string }[];

    for (let i = 0; i < files.length; i++) {
        const fileUrl = files[i].fileUrl;

        if (fileUrl.length < 1) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "File URL cannot be empty. At least one of the file URLs provided is empty.",
                path: ["content"],
            });
            return;
        }
    }

});


export type IMessageContentURL = z.infer<typeof MessageContentURLSchema>;



export const MessageContentFileSchema = z.object({
    content: z.string().optional(),
    files: z.custom<FileList | undefined>(),
}).superRefine((data, ctx) => {
    const hasContent = !!data.content && data.content.trim() !== "";
    const hasFiles = !!data.files && data.files instanceof FileList && data.files.length > 0;

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

    const files = data.files as FileList;

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