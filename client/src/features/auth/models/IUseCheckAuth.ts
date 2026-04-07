export type IAuthLevel = {
    userType: "none"
} | {
    userType: "user"
    userId: string,
    username: string
};

