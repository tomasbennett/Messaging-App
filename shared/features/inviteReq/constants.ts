export const FriendRequestStatusValues = [
    "pending",
    "accepted",
    "no request sent yet",
    "user sent you a friend request"
] as const;


export type IFriendRequestStatus = typeof FriendRequestStatusValues[number];



export const SOCKET_INVITE_REQ_RECEIVE_EVENT: string = "inviteReqReceive";


export const SOCKET_NEW_PARTICIPANT_INVITED: string = "inviteReqNewUser";
export const SOCKET_USER_LEFT_CONVERSATION: string = "userLeftConversation";
export const SOCKET_USER_ACCEPTED_CONVERSATION_INVITE: string = "userAcceptedConversationInvite";
export const SOCKET_USER_DECLINED_CONVERSATION_INVITE: string = "userDeclinedConversationInvite";