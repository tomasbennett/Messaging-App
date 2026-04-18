import z from "zod";
import { NumberFromStringSchema } from "../../util/models/INumber";
import { apiPOSTBaseRegex } from "../../api/constants";
import { usernamePasswordRegex } from "../../auth/constants";
import { FriendRequestStatusValues } from "../../friendRequest/constants";
import { APISuccessSchema } from "../../api/models/APISuccessResponse";



export const SearchUsersQueryParams = z.object({
    limit: NumberFromStringSchema,
    search: usernamePasswordRegex
});



export type ISearchUsersQueryParams = z.infer<typeof SearchUsersQueryParams>;





export const SearchedUser = z.object({
    userId: z.string(),
    username: usernamePasswordRegex,
    userProfileImgUrl: z.string().optional(),
    friendStatus: FriendRequestStatusValues
});


export type ISearchedUser = z.infer<typeof SearchedUser>;






export const SearchedUsersAPISuccess = APISuccessSchema.extend({
    searchedUsers: z.array(SearchedUser)
});


export type ISearchedUserAPISuccess = z.infer<typeof SearchedUsersAPISuccess>;