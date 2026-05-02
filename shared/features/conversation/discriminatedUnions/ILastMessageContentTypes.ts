import z from "zod";
import { NumberFromStringMinMaxLimitSchemaFunc } from "../../util/models/INumber";
import { maxFileSizeInBytes } from "../../files/constants";



export const LastMessageContentTypesSchema = z.discriminatedUnion("messageType", [
    z.object({
        messageType: z.literal("text"),
        textContent: z.string(),
    }),
    z.object({
        messageType: z.literal("file"),
        fileSize: NumberFromStringMinMaxLimitSchemaFunc(0, maxFileSizeInBytes),
    }),
]);


export type ILastMessageContentTypes = z.infer<typeof LastMessageContentTypesSchema>;