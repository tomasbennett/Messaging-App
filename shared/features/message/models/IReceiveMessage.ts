import z from "zod";
import { DateFromStringSchema } from "../../util/models/IDateFromStringSchema";

export const ReceiveMessageSchema = z.object({
    content: z.string(),
    senderUsername: z.string(),
    timestamp: DateFromStringSchema
});



export type IReceiveMessage = z.infer<typeof ReceiveMessageSchema>;