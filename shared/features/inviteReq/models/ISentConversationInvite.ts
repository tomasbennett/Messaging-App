import z from "zod";
import { SearchedUserNewConversation } from "../../user/models/ISearchUsers";
import { BaseConversationSchema } from "../../conversation/models/IBaseConversation";



export const SentConversationInvite = SearchedUserNewConversation.extend({
    conversationId: BaseConversationSchema.shape.conversationId,
    conversationName: BaseConversationSchema.shape.name
});



export type ISentConversationInvite = z.infer<typeof SentConversationInvite>;