import z from "zod";
import { DateFromStringSchema } from "../../util/models/IDateFromStringSchema";

export const SendMessageSchema = z.object({
    content: z.string().min(1, "Message content cannot be empty"),
    senderUsername: z.string().min(1, "Sender ID is required"),
    timestamp: DateFromStringSchema,
});




export type ISendMessage = z.infer<typeof SendMessageSchema>;