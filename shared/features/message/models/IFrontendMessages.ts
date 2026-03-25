import z from "zod";
import { DateFromStringSchema } from "../../util/models/IDateFromStringSchema";
import { BaseMessageSchema } from "./IBaseMessage";
import { allowedTypes, maxFileSizeInBytes } from "../../files/constants";

export const ReceiveMessageFrontendSchema = BaseMessageSchema.extend({
    timestamp: DateFromStringSchema,
    content: z.string().optional(),
    fileUrl: z.string().optional(),
}).superRefine((data, ctx) => {
    const hasContent = !!data.content && data.content.trim() !== "";
    const hasFileUrl = !!data.fileUrl && data.fileUrl.trim() !== "";

    if (!hasContent && !hasFileUrl) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Either content or fileUrl must be provided",
            path: ["content"],
        });
        return;
    }

});


export type IReceiveMessageFrontend = z.infer<typeof ReceiveMessageFrontendSchema>;


export const SendMessageFrontendSchema = BaseMessageSchema.extend({
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


export type ISendMessageFrontend = z.infer<typeof SendMessageFrontendSchema>;