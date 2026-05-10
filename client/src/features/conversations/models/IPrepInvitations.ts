import { ISearchedUserNewConversation } from "../../../../../shared/features/user/models/ISearchUsers";

export type IPrepInvitations = ISearchedUserNewConversation & {
    prepstatus: "invite_prepped" | "no_invite_prepped"
}