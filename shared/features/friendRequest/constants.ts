export const FriendRequestStatusValues = [
    "pending",
    "accepted",
    "rejected",
] as const;


export type IFriendRequestStatus = typeof FriendRequestStatusValues[number];