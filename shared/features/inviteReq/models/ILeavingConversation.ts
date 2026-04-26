import z from "zod";


export const LeavingConversationSchema = z.object({
    conversationId: z.string().min(1, { message: "Conversation ID is required" }),
    userLeavingId: z.string().min(1, { message: "User ID is required" }),
});



export type ILeavingConversation = z.infer<typeof LeavingConversationSchema>;