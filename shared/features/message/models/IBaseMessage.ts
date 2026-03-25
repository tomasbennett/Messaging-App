import z from "zod";
import { DateFromStringSchema } from "../../util/models/IDateFromStringSchema";


export const BaseMessageSchema = z.object({
    messageId: z.string(),
    senderId: z.string(),
    conversationId: z.string()
});


export type IBaseMessage = z.infer<typeof BaseMessageSchema>;