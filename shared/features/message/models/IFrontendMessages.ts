import z from "zod";
import { DateFromStringSchema } from "../../util/models/IDateFromStringSchema";
import { BaseMessageSchema } from "./IBaseMessage";
import { allowedTypes, maxFileSizeInBytes } from "../../files/constants";
import { MessageContentFileSchema, MessageContentURLSchema } from "./IMessageContent";

export const ReceiveMessageFrontendSchema = BaseMessageSchema.extend({
    timestamp: DateFromStringSchema,
})
.merge(MessageContentURLSchema)


export type IReceiveMessageFrontend = z.infer<typeof ReceiveMessageFrontendSchema>;


export const SendMessageFrontendSchema = BaseMessageSchema
.pick({
    conversationId: true,
    sender: true,
})
.merge(MessageContentFileSchema)


export type ISendMessageFrontend = z.infer<typeof SendMessageFrontendSchema>;