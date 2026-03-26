import z from "zod";
import { ReceiveUserFrontendSchema } from "../../user/models/IFrontendUser";
import { ReceiveMessageFrontendSchema } from "../../message/models/IFrontendMessages";


export const BaseConversationSchema = z.object({
    conversationId: z.string().min(1, { message: "Conversation ID is required" }),
    name: z.string().nullable(),
    participants: z.array(ReceiveUserFrontendSchema.pick({
        userId: true,
        username: true,
        profilePictureUrl: true,
    })),
    messages: z.array(ReceiveMessageFrontendSchema.pick({
        messageId: true,
        senderId: true,
        conversationId: true,
        content: true,
        createdAt: true,
    })),
});


export type IBaseConversation = z.infer<typeof BaseConversationSchema>;