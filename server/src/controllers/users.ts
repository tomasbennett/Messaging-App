import { Router, NextFunction, Response, Request } from "express";
import { ensureJWTAuthentication } from "../auth/ensureJWTAuthentication";
import { ISearchUsersQueryParams, ISearchedUser, ISearchedUserAPISuccess, SearchUsersQueryParams } from "../../../shared/features/user/models/ISearchUsers";
import { ICustomErrorResponse } from "../../../shared/features/api/models/APIErrorResponse";
import { prisma } from "../db/prisma";
import { IFriendRequestStatus } from "../../../shared/features/friendRequest/constants";



export const router = Router();



router.get("/search", ensureJWTAuthentication, async (req: Request, res: Response<ICustomErrorResponse | ISearchedUserAPISuccess>, next: NextFunction) => {
    const user = req.user!;
    const queryParams = req.query;

    const queryResult = SearchUsersQueryParams.safeParse(queryParams);
    if (!queryResult.success) {
        return res.status(404).json({
            ok: false,
            status: 404,
            message: "Query parameters must specify a search username and a limit of how many users you would like returned!!!"
        })
    }

    const { limit, search } = queryResult.data as {
        limit: number,
        search: string
    };

    try {
        
        const usersSearched = await prisma.user.findMany({
            where: {
                username: {
                    contains: search,
                    mode: "insensitive"
                },
                NOT: {
                    id: user.id
                }
            },
            take: limit,
            select: {
                username: true,
                profileImg: {
                    select: {
                        supabaseFileId: true
                    }
                },
                id: true,
                sentFriendRequests: {
                    where: {
                        receiverId: user.id
                    },
                    select: {
                        isAccepted: true
                    }
                },
                receivedFriendRequests: {
                    where: {
                        senderId: user.id
                    },
                    select: {
                        isAccepted: true
                    }
                }
            },
        
        });



        const searchableUsersFriendReqs: ISearchedUser[] = usersSearched.map((searchedUser) => {
            const friendStatus: IFriendRequestStatus = ((): IFriendRequestStatus => {
                const sentFriendRequest = searchedUser.sentFriendRequests?.[0];
                const receivedFriendRequest = searchedUser.receivedFriendRequests?.[0];

                if (!sentFriendRequest && !receivedFriendRequest) {
                    return "no request sent yet";
                }

                if (sentFriendRequest?.isAccepted || receivedFriendRequest?.isAccepted) {
                    return "accepted";
                }

                if (sentFriendRequest) {
                    return "user sent you a friend request";
                }

                return "pending";


            })();

            return {
                userId: searchedUser.id,
                username: searchedUser.username,
                userProfileImgUrl: searchedUser.profileImg?.supabaseFileId,
                friendStatus
            }
        });


        const searchedUsersSuccess: ISearchedUserAPISuccess = {
            ok: true,
            status: 200,
            message: `Successfully sent back list of users under search parameter: ${search}`,
            searchedUsers: searchableUsersFriendReqs
        }

        return res.status(searchedUsersSuccess.status).json(searchedUsersSuccess);



        
    } catch (error) {
        next(error);
    }
});