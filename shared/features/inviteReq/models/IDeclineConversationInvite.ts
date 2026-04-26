import z from "zod";



export const DeclineConversationInviteSchema = z.object({
    conversationId: z.string().min(1, { message: "Conversation ID is required" }),
    userDecliningId: z.string().min(1, { message: "User ID is required" }),
});

export type IDeclineConversationInvite = z.infer<typeof DeclineConversationInviteSchema>;