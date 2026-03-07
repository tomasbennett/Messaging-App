import z from "zod";
import { DateFromStringSchema } from "../../util/models/IDateFromStringSchema";



export const SendMessageFrontendSchema = z.object({
    content: z.string().min(1, "Message content cannot be empty"),
});



export const SendMessageBackendSchema = SendMessageFrontendSchema.extend({
    timestamp: DateFromStringSchema,
});



export type ISendMessageFrontend = z.infer<typeof SendMessageFrontendSchema>;


export type ISendMessageBackend = z.infer<typeof SendMessageBackendSchema>;