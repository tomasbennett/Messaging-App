import { Router, NextFunction, Response, Request } from "express";
import { ensureJWTAuthentication } from "../auth/ensureJWTAuthentication";
import { ISearchUsersQueryParams, ISearchedUser, ISearchedUserAPISuccess, SearchUsersQueryParams } from "../../../shared/features/user/models/ISearchUsers";
import { ICustomErrorResponse } from "../../../shared/features/api/models/APIErrorResponse";
import { prisma } from "../db/prisma";
import { IFriendRequestStatus } from "../../../shared/features/inviteReq/constants";
import { ICustomSuccessMessage } from "../../../shared/features/api/models/APISuccessResponse";



export const router = Router();



router.get("/:conversationId/search", ensureJWTAuthentication, async (req: Request<{ conversationId: string }>, res: Response<ICustomErrorResponse | ISearchedUserAPISuccess>, next: NextFunction) => {
    const user = req.user!;
    const { conversationId } = req.params;
    const queryParams = req.query;

    const queryResult = SearchUsersQueryParams.safeParse(queryParams);
    if (!queryResult.success) {
        return res.status(404).json({
            ok: false,
            status: 404,
            message: "Query parameters must specify a search username and a limit of how many users you would like returned!!!"
        })
    }

    const { limit, search: searchRegex } = queryResult.data;
    const search = searchRegex as string;


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
                id: true,
                username: true,
                profileImg: {
                    select: {
                        supabaseFileId: true
                    }
                },
            },
        });

        const invitesForConversation = await prisma.conversationJoinRequest.findMany({
            where: {
                conversationId,
                receiverId: {
                    in: usersSearched.map((user) => user.id)
                }
            },
            take: 1,
            orderBy: {
                sentAt: "desc"
            },
            select: {
                id: true,
                senderParticipantId: true,
                receiverId: true,
                status: true,
            }
        });


        



        const searchableUsersFriendReqs: ISearchedUser[] = usersSearched.map((searchedUser) => {
            const friendStatus: IFriendRequestStatus = ((): IFriendRequestStatus => {
                const inviteStatus = invitesForConversation.find((invite) => invite.receiverId === searchedUser.id)?.status;

                if (!inviteStatus || inviteStatus === "REJECTED") {
                    return "no request sent yet";
                }

                if (inviteStatus === "ACCEPTED") {
                    return "accepted";
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





router.get("/me/profile", ensureJWTAuthentication, async (req: Request, res: Response<ICustomErrorResponse | ICustomSuccessMessage>, next: NextFunction) => {

});


router.post("/me/profile", ensureJWTAuthentication, async (req: Request, res: Response<ICustomErrorResponse | ICustomSuccessMessage>, next: NextFunction) => {
    const user = req.user!;
    // Update user profile here


    try {








        
    } catch (error) {
        next(error);
        
    }

});


// router.post("/me/password/update", ensureJWTAuthentication, async (req: Request, res: Response<ICustomErrorResponse | ICustomSuccessMessage>, next: NextFunction) => {
//     const user = req.user!;
//     // Update user password here

// });