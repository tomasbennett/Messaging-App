import { IUserFriendStatusRelationship } from "../../../../../shared/features/friendRequest/models/IUserFriendStatusRelationship";

export type ISidebarFriendsUserDetails = {
    conversationId: string;
    conversationProfilePictureUrl: string | undefined;
    conversationName: string;
    lastMessage: string | undefined;
    lastMessageTimestamp: Date | undefined;
}


export type IPropsSearchForFriendsUserDetails = IUserFriendStatusRelationship & {
    updateFriendStatus(friendId: string, status: IUserFriendStatusRelationship["friendStatus"]): void;
}