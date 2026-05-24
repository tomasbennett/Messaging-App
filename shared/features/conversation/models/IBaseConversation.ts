import z from "zod";

import { apiPOSTBaseRegex } from "../../api/constants";
import { BaseUserSchema } from "../../user/models/IUser";
import { MessageContentURLSchema } from "../../message/models/IMessageContent";
import { usernamePasswordSchema } from "../../auth/models/ILoginSchema";
import { DateFromStringSchema } from "../../util/models/IDateFromStringSchema";


export const BaseConversationSchema = z.object({
    conversationId: z.string().min(1, { message: "Conversation ID is required" }),
    name: z.string().min(1, { message: "Chat name must not be empty" }).regex(apiPOSTBaseRegex, { message: "Please stop trying to post malicious code!!!" }),
    participants: z.array(z.object({
        userId: z.string().min(1, { message: "User ID is required" }),
        username: BaseUserSchema.shape.username,
    })),
    messages: z.array(z.object({
        conversationName: z.string().min(1, { message: "Conversation name is required" }),
        messageId: z.string().min(1, { message: "Message ID is required" }),
        senderId: z.string().min(1, { message: "Sender ID is required" }),
        conversationId: z.string().min(1, { message: "Conversation ID is required" }),
        // conversationName: z.string(),
        timestamp: DateFromStringSchema,
        // conversationGroupType: ConversationGroupSingleUnionSchema,
        senderName: usernamePasswordSchema,
        senderProfileImgUrl: z.string().optional(),
    })
        .merge(MessageContentURLSchema)),
    isRead: z.boolean()
});


export type IBaseConversation = z.infer<typeof BaseConversationSchema>;