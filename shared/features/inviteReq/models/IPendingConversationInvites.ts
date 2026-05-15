import z from "zod";
import { APISuccessSchema } from "../../api/models/APISuccessResponse";
import { PendingInviteSentvsReceivedDisUnion } from "../discriminatedUnions/IPendingInviteSentvsReceived";



export const PendingConversationInvitesAPISuccess = APISuccessSchema.extend({
    pendingInvites: z.array(PendingInviteSentvsReceivedDisUnion)
});


export type IPendingConversationInvitesAPISuccess = z.infer<typeof PendingConversationInvitesAPISuccess>;