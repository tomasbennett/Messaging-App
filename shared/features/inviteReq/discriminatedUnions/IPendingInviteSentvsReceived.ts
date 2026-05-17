import z from "zod";
import { BaseUserSchema } from "../../user/models/IUser";
import { USER_PROFILE_IMG_FILE_KEY } from "../../auth/constants";
import { BaseConversationSchema } from "../../conversation/models/IBaseConversation";
import { IReceivingAnInvite, ReceivingAnInviteSchema } from "../models/IReceivingAnInvite";
import { SearchedUserNewConversation } from "../../user/models/ISearchUsers";
import { SentConversationInvite } from "../models/ISentConversationInvite";



export const PendingInviteTypes = {
    sent: "sentInvite",
    received: "receivedInvite"
} as const;


export type IPendingInviteTypes =
    typeof PendingInviteTypes[keyof typeof PendingInviteTypes];







export const PendingInviteSentvsReceivedDisUnion = z.discriminatedUnion("type", [
    z.object({
        type: z.literal(PendingInviteTypes.sent),

    }).merge(SentConversationInvite),

    z.object({
        type: z.literal(PendingInviteTypes.received),

    }).merge(ReceivingAnInviteSchema)
]);



export type IPendingInviteSentvsReceivedDisUnion = z.infer<typeof PendingInviteSentvsReceivedDisUnion>;