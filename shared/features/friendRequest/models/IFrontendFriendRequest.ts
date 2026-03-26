import z from "zod";
import { BaseFriendRequestSchema } from "./IFriendRequest";


export const ReceiveFriendRequestFrontendSchema = BaseFriendRequestSchema;



export type IReceiveFriendRequestFrontend = z.infer<typeof ReceiveFriendRequestFrontendSchema>;


export const SendFriendRequestFrontendSchema = BaseFriendRequestSchema.pick({
    receiver: true,
    sender: true
});



export type ISendFriendRequestFrontend = z.infer<typeof SendFriendRequestFrontendSchema>;