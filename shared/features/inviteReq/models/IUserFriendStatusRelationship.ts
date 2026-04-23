import z from "zod";
import { FriendRequestStatusValues } from "../constants";
import { APISuccessSchema } from "../../api/models/APISuccessResponse";



export const BaseUserFriendStatusSchema = z.object({
    otherUserId: z.string().min(1, { message: "User ID is required" }),
    friendStatus: z.enum(FriendRequestStatusValues),
    otherUserUsername: z.string().min(1, { message: "Username is required" }),
    otherUserProfilePictureUrl: z.string().optional()
});


export type IUserFriendStatusRelationship = z.infer<typeof BaseUserFriendStatusSchema>;


export const ReceiveUserFriendStatusRelationshipSchema = APISuccessSchema.extend({
    userFriendStatusRelationships: z.array(BaseUserFriendStatusSchema)
});


export type IReceiveUserFriendStatusRelationship = z.infer<typeof ReceiveUserFriendStatusRelationshipSchema>;