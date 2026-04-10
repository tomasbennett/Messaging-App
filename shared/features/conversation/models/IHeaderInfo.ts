import z from "zod";
import { ReceiveConversationFrontendSchema } from "./IFrontendConversation";




export const ConversationHeaderInfoSchema = ReceiveConversationFrontendSchema.pick({
    conversationId: true,
    name: true,
    groupChatProfilePicture: true,
    createdAt: true,
});


export type IConversationHeaderInfo = z.infer<typeof ConversationHeaderInfoSchema>;