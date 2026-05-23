import z from "zod";
import { DateFromStringSchema } from "../../util/models/IDateFromStringSchema";
import { MessageContentURLSchema } from "./IMessageContent";
import { APISuccessSchema } from "../../api/models/APISuccessResponse";
import { ConversationGroupSingleUnionSchema } from "../../conversation/discriminatedUnions/IGroupSingleUnion";
import { ConversationHeaderInfoSchema } from "../../conversation/models/IHeaderInfo";
import { usernamePasswordSchema } from "../../auth/models/ILoginSchema";




export const ConversationMessageSchema = z.object({
    messageId: z.string().min(1, { message: "Message ID is required" }),
    senderId: z.string().min(1, { message: "Sender ID is required" }),
    conversationId: z.string().min(1, { message: "Conversation ID is required" }),
    // conversationName: z.string(),
    timestamp: DateFromStringSchema,
    // conversationGroupType: ConversationGroupSingleUnionSchema,
    senderName: usernamePasswordSchema,
    senderProfileImgUrl: z.string().optional(),
}).merge(MessageContentURLSchema);


export type IConversationMessage = z.infer<typeof ConversationMessageSchema>;


export const ReceiveConversationMessagesAndHeaderInfoFrontendSchema = APISuccessSchema.extend({
    messages: z.array(ConversationMessageSchema),
    headerInfo: ConversationHeaderInfoSchema,
    conversationGroupType: ConversationGroupSingleUnionSchema
});




export type IReceiveConversationMessagesFrontend = z.infer<typeof ReceiveConversationMessagesAndHeaderInfoFrontendSchema>;