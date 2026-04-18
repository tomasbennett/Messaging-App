export const FriendRequestStatusValues = [
    "pending",
    "accepted",
    "no request sent yet",
    "user sent you a friend request"
] as const;


export type IFriendRequestStatus = typeof FriendRequestStatusValues[number];