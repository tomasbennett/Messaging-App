import z from "zod";
import { BaseFriendRequestSchema } from "./IFriendRequest";
import { APISuccessSchema } from "../../api/models/APISuccessResponse";


export const ReceiveFriendRequestFrontendSchema = BaseFriendRequestSchema;



export type IReceiveFriendRequestFrontend = z.infer<typeof ReceiveFriendRequestFrontendSchema>;


export const SendFriendRequestFrontendSchema = BaseFriendRequestSchema.pick({
    receiver: true,
    sender: true
});



export type ISendFriendRequestFrontend = z.infer<typeof SendFriendRequestFrontendSchema>;






export const ReceiveFriendRequestConfirmationFrontendSchema = APISuccessSchema.extend({
    receipientUserId: z.string().min(1, { message: "Recipient User ID is required" }),
});


export type IReceiveFriendRequestConfirmationFrontend = z.infer<typeof ReceiveFriendRequestConfirmationFrontendSchema>;