import z from "zod";
import { BaseConversationSchema } from "./IBaseConversation";
import { DateFromStringSchema } from "../../util/models/IDateFromStringSchema";
import { CreateConversationFrontendSchema } from "./IFrontendConversation";



export const ReceiveConversationBackendSchema = CreateConversationFrontendSchema.extend({
    createdAt: DateFromStringSchema
});