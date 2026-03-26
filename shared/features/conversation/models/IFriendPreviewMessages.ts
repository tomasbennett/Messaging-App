import z from "zod";
import { BaseConversationSchema } from "./IBaseConversation";
import { ReceiveConversationFrontendSchema } from "./IFrontendConversation";
import { ReceiveMessageFrontendSchema } from "../../message/models/IFrontendMessages";



export const FriendPreviewMessagesSchema = 
    z.object({
        conversation: ReceiveConversationFrontendSchema.pick({
            conversationId: true,
            name: true,
            groupChatProfilePictureUrl: true,
        }).extend({
            participants: ReceiveConversationFrontendSchema.shape.participants.element.pick({
                profilePictureUrl: true,
            })
        }),
        latestMessage: ReceiveMessageFrontendSchema.pick({
            content: true,
            fileUrl: true,
            timestamp: true,
            isRead: true,
        }).optional(),
    });


export type IFriendPreviewMessages = z.infer<typeof FriendPreviewMessagesSchema>;