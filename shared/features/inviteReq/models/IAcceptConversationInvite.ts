import z from "zod";



export const AcceptConversationInviteSchema = z.object({
    conversationId: z.string().min(1, { message: "Conversation ID is required" }),
    userAcceptingId: z.string().min(1, { message: "User ID is required" }),
});


export type IAcceptConversationInvite = z.infer<typeof AcceptConversationInviteSchema>;