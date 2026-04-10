import z from "zod";
import { DateFromStringSchema } from "../../util/models/IDateFromStringSchema";
import { MessageContentURLSchema } from "./IMessageContent";
import { APISuccessSchema } from "../../api/models/APISuccessResponse";
import { ConversationGroupSingleUnionSchema } from "../discriminatedUnion/IGroupSingleUnion";




export const ConversationMessageSchema = z.object({
    messageId: z.string().min(1, { message: "Message ID is required" }),
    senderId: z.string().min(1, { message: "Sender ID is required" }),
    conversationId: z.string().min(1, { message: "Conversation ID is required" }),  
    timestamp: DateFromStringSchema,
    conversationGroupType: ConversationGroupSingleUnionSchema,
}).merge(MessageContentURLSchema);


export type IConversationMessage = z.infer<typeof ConversationMessageSchema>;


export const ReceiveConversationMessagesFrontendSchema = APISuccessSchema.extend({
    messages: z.array(ConversationMessageSchema)
});



export type IReceiveConversationMessagesFrontend = z.infer<typeof ReceiveConversationMessagesFrontendSchema>;