export type ISidebarFriendsUserDetails = {
    userId: string;
    userProfilePictureUrl: string | undefined;
    username: string;
    lastMessage: string | undefined;
    lastMessageTimestamp: Date | undefined;
}