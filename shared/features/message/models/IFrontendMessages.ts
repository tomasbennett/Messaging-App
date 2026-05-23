import z from "zod";
import { DateFromStringSchema } from "../../util/models/IDateFromStringSchema";
import { BaseMessageSchema } from "./IBaseMessage";
import { MessageContentFileSchema, MessageContentURLSchema } from "./IMessageContent";
import { ConversationMessageSchema } from "./IConversationMessage";

export const ReceiveMessageFrontendSchema = ConversationMessageSchema
.extend({
    conversationName: z.string(),
})
.merge(MessageContentURLSchema)


export type IReceiveMessageFrontend = z.infer<typeof ReceiveMessageFrontendSchema>;


export const SendMessageFrontendSchema = BaseMessageSchema
.pick({
    conversationId: true,
    // sender: true,
})
.merge(MessageContentFileSchema)


export type ISendMessageFrontend = z.infer<typeof SendMessageFrontendSchema>;