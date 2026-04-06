export const FriendRequestStatusValues = [
    "pending",
    "accepted",
    "no request sent yet",
] as const;


export type IFriendRequestStatus = typeof FriendRequestStatusValues[number];