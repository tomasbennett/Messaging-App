export const minUsernamePasswordLength: number = 1;
export const maxUsernamePasswordLength: number = 30;

export const usernamePasswordRegex: RegExp = /^[a-zA-Z0-9_!]+$/;


export const expiredAccessTokenStatus: number = 401;

export const invalidRefreshTokenStatus: number = 401;


export const SOCKET_INVALID_ACCESS_TOKEN_MESSAGE: string = "ACCESS_TOKEN_EXPIRED";


export const USER_PROFILE_IMG_FILE_KEY = "profileImgId" as const;