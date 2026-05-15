import z from "zod";
import { BaseUserSchema } from "../../user/models/IUser";
import { USER_PROFILE_IMG_FILE_KEY } from "../../auth/constants";
import { BaseConversationSchema } from "../../conversation/models/IBaseConversation";
import { ReceivingAnInviteSchema } from "../models/IReceivingAnInvite";
import { SearchedUserNewConversation } from "../../user/models/ISearchUsers";


export const PendingInviteSentvsReceivedDisUnion = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("sentInvite"),

    }).merge(SearchedUserNewConversation),
    
    z.object({
        type: z.literal("receivedInvite"),
        
    }).merge(ReceivingAnInviteSchema)
]);



export type IPendingInviteSentvsReceivedDisUnion = z.infer<typeof PendingInviteSentvsReceivedDisUnion>;