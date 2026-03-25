import z from "zod";
import { DateFromStringSchema } from "../../util/models/IDateFromStringSchema";
import { SendMessageFrontendSchema } from "./IFrontendMessages";



export const ReceiveMessageBackendSchema = SendMessageFrontendSchema.extend({
    timestamp: DateFromStringSchema,
});


export type IReceiveMessageBackend = z.infer<typeof ReceiveMessageBackendSchema>;
