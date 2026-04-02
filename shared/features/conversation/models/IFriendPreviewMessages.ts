import z from "zod";
import { BaseConversationSchema } from "./IBaseConversation";
import { ReceiveConversationFrontendSchema } from "./IFrontendConversation";
import { ReceiveMessageFrontendSchema } from "../../message/models/IFrontendMessages";
import { APISuccessSchema } from "../../api/models/APISuccessResponse";
import { GroupProfileUnionSchema } from "../discriminatedUnions/IGroupProfileUnion";
import { LastMessageContentTypesSchema } from "../discriminatedUnions/ILastMessageContentTypes";



export const FriendPreviewMessagesSchema = 
    z.object({
        conversation: ReceiveConversationFrontendSchema.pick({
            conversationId: true,
            name: true,
            groupChatProfilePicture: true,
            isRead: true,
        }),
        latestMessage: ReceiveMessageFrontendSchema.pick({
            timestamp: true,
            isRead: true,
        })
        .extend({
            content: LastMessageContentTypesSchema
        })
        .optional(),
    });


export type IFriendPreviewMessages = z.infer<typeof FriendPreviewMessagesSchema>;



export const ReceiveFriendPreviewMessagesFrontendSchema = APISuccessSchema.extend({
    friendPreviewsData: z.array(FriendPreviewMessagesSchema)
});



export type IReceiveFriendPreviewMessagesFrontend = z.infer<typeof ReceiveFriendPreviewMessagesFrontendSchema>;