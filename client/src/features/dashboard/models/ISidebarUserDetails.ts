import { IUserFriendStatusRelationship } from "../../../../../shared/features/inviteReq/models/IUserFriendStatusRelationship";

export type ISidebarFriendsUserDetails = {
    conversationId: string;
    conversationProfilePictureUrl: string | undefined;
    conversationName: string;
    lastMessage: string | undefined;
    lastMessageTimestamp: Date | undefined;
}


export type IPropsSearchForFriendsUserDetails = IUserFriendStatusRelationship & {
    updateFriendStatus(status: IUserFriendStatusRelationship["friendStatus"]): void;
}