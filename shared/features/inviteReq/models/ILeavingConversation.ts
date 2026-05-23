import z from "zod";
import { BaseUserSchema } from "../../user/models/IUser";


export const LeavingConversationSchema = z.object({
    conversationId: z.string().min(1, { message: "Conversation ID is required" }),
    conversationName: z.string().min(1, { message: "Conversation name is required" }),
    userLeavingId: z.string().min(1, { message: "User ID is required" }),
    userLeavingName: BaseUserSchema.shape.username,
    userLeavingProfilePictureUrl: z.string().optional(),

});



export type ILeavingConversation = z.infer<typeof LeavingConversationSchema>;