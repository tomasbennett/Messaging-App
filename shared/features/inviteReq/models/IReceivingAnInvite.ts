import z from "zod";
import { BaseConversationSchema } from "../../conversation/models/IBaseConversation";




export const ReceivingAnInviteSchema = z.object({
    conversationId: z.string(),
    conversationName: BaseConversationSchema.shape.name,
    inviterUserId: z.string(),
    inviterUsername: z.string(),
    inviterProfilePictureUrl: z.string().optional(),
});


export type IReceivingAnInvite = z.infer<typeof ReceivingAnInviteSchema>;