import z from "zod";
import { ReceiveUserFrontendSchema } from "../../user/models/IFrontendUser";
import { ReceiveMessageFrontendSchema } from "../../message/models/IFrontendMessages";
import { apiPOSTBaseRegex } from "../../api/constants";


export const BaseConversationSchema = z.object({
    conversationId: z.string().min(1, { message: "Conversation ID is required" }),
    name: z.string().min(1, { message: "Chat name must not be empty" }).regex(apiPOSTBaseRegex, { message: "Please stop trying to post malicious code!!!" }),
    participants: z.array(ReceiveUserFrontendSchema.pick({
        userId: true,
        username: true
    })),
    messages: z.array(ReceiveMessageFrontendSchema),
    isRead: z.boolean()
});


export type IBaseConversation = z.infer<typeof BaseConversationSchema>;