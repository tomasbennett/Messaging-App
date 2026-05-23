import z from "zod";
import { BaseUserSchema } from "../../user/models/IUser";
import { USER_PROFILE_IMG_FILE_KEY } from "../../auth/constants";



export const AcceptConversationInviteSchema = z.object({
    conversationId: z.string().min(1, { message: "Conversation ID is required" }),
    conversationName: z.string().min(1, { message: "Conversation name is required" }),
    userAcceptingId: z.string().min(1, { message: "User ID is required" }),
    userAcceptingName: BaseUserSchema.shape.username,
    userAcceptingProfilePictureUrl: z.string().optional(),
    
});


export type IAcceptConversationInvite = z.infer<typeof AcceptConversationInviteSchema>;