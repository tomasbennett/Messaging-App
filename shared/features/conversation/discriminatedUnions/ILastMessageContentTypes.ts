import z from "zod";



export const LastMessageContentTypesSchema = z.discriminatedUnion("messageType", [
    z.object({
        messageType: z.literal("text"),
        textContent: z.string(),
    }),
    z.object({
        messageType: z.literal("file"),
        fileSize: z.number(),
    }),
]);


export type ILastMessageContentTypes = z.infer<typeof LastMessageContentTypesSchema>;