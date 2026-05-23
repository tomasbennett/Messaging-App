import { IPendingInviteSentvsReceivedDisUnion } from "../../../../../shared/features/inviteReq/discriminatedUnions/IPendingInviteSentvsReceived";
import { usePendingInviteType } from "../hooks/usePendingInviteType";

export type IPendingInvitesContext = ReturnType<typeof usePendingInviteType>;