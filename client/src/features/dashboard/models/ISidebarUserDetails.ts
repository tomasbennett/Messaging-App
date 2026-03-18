export type ISidebarFriendsUserDetails = {
    userId: string;
    userProfilePictureUrl: string | undefined;
    username: string;
    lastMessage: string | undefined;
    lastMessageTimestamp: Date | undefined;
}


export type ISearchForFriendsUserDetails = {
    userId: string;
    userProfilePictureUrl: string | undefined;
    username: string;
    isPendingFriendRequest: boolean;
}