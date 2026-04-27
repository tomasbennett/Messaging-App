import { Router, NextFunction, Request, Response } from "express";
import { ensureJWTAuthentication } from "../auth/ensureJWTAuthentication";
import { ICustomErrorResponse } from "../../../shared/features/api/models/APIErrorResponse";
import { prisma } from "../db/prisma";

import { io } from "../app";
import { ICustomSuccessMessage } from "../../../shared/features/api/models/APISuccessResponse";
import { SOCKET_INVITE_REQ_RECEIVE_EVENT, SOCKET_NEW_PARTICIPANT_INVITED, SOCKET_USER_ACCEPTED_CONVERSATION_INVITE, SOCKET_USER_DECLINED_CONVERSATION_INVITE, SOCKET_USER_LEFT_CONVERSATION } from "../../../shared/features/inviteReq/constants";
import { SOCKET_CONVERSATION_ROOM_PREFIX } from "../../../shared/features/conversation/constants";
import { IBaseSocketEmitData } from "../../../shared/features/sockets/models/IBaseSocketReqData";
import { connectedUsers } from "../sockets/UserSocketMapping";
import { IReceivingAnInvite } from "../../../shared/features/inviteReq/models/IReceivingAnInvite";
import { ILeavingConversation } from "../../../shared/features/inviteReq/models/ILeavingConversation";
import { IAcceptConversationInvite } from "../../../shared/features/inviteReq/models/IAcceptConversationInvite";
import { IDeclineConversationInvite } from "../../../shared/features/inviteReq/models/IDeclineConversationInvite";


export const router = Router();



router.post(
    "/:conversationId/add/:inviteeUserId",
    ensureJWTAuthentication,
    async (req: Request<{ conversationId: string, inviteeUserId: string }, {}, IBaseSocketEmitData>, res: Response<ICustomErrorResponse | ICustomSuccessMessage>, next: NextFunction) => {

        const { conversationId, inviteeUserId } = req.params;
        const { userSocketId } = req.body;
        const user = req.user!;

        if (
            (!conversationId || typeof conversationId !== "string") ||
            (!inviteeUserId || typeof inviteeUserId !== "string")
        ) {
            return res.status(400).json({
                ok: false,
                status: 400,
                message: "Conversation ID and Invitee User ID are required!!!"
            });
        }

        if (inviteeUserId === user.id) {
            return res.status(400).json({
                ok: false,
                status: 400,
                message: "You cannot invite yourself to a conversation!!!"
            });
        }

        const userSocketIds = connectedUsers.get(user.id);
        if (!userSocketIds || !userSocketIds.has(userSocketId)) {
            return res.status(401).json({
                ok: false,
                status: 401,
                message: "Unauthorized, your user socket ID did not match with your access token socket IDs!!!"
            });
        }

        try {

            const conversationParticipant = await prisma.conversationParticipant.findUnique({
                where: {
                    conversationId_userId: {
                        conversationId,
                        userId: user.id
                    },
                    hasLeft: false
                },
                select: {
                    id: true,
                    conversation: {
                        select: {
                            chatName: true
                        }
                    },
                    user: {
                        select: {
                            profileImg: {
                                select: {
                                    supabaseFileId: true
                                }
                            }
                        }
                    }
                }
            });

            if (!conversationParticipant) {
                return res.status(403).json({
                    ok: false,
                    status: 403,
                    message: "User is not a participant of the conversation or has left the conversation!!!"
                });
            }




            const inviteeUser = await prisma.user.findUnique({
                where: {
                    id: inviteeUserId
                },
                select: {
                    conversations: {
                        where: {
                            conversationId,
                            hasLeft: false
                        },
                        select: {
                            conversationId: true
                        }
                    },
                    receivedFriendRequests: {
                        where: {
                            receiverId: user.id,
                            status: "PENDING"
                        },
                        select: {
                            id: true
                        }
                    }
                }
            });

            if (!inviteeUser) {
                return res.status(404).json({
                    ok: false,
                    status: 404,
                    message: "Invitee user not found!!!"
                });
            }

            const doesInviteeExist = inviteeUser.conversations.some(c => c.conversationId === conversationId);

            if (doesInviteeExist) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    message: "Invitee is already a participant of the conversation!!!"
                });
            }

            const isAlreadyInvited = inviteeUser.receivedFriendRequests.length > 0;

            if (isAlreadyInvited) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    message: "Invitee has already received an invite for this conversation from a conversation participant!!!"
                });
            }

            const newInvite = await prisma.conversationJoinRequest.create({
                data: {
                    conversationId,
                    senderParticipantId: conversationParticipant.id,
                    receiverId: inviteeUserId,
                }
            });




            const inviteeSocketIds = connectedUsers.get(inviteeUserId);
            if (!inviteeSocketIds || inviteeSocketIds.size === 0) {
                return res.status(200).json({
                    ok: true,
                    status: 200,
                    message: "Invite sent successfully!!!"
                });
            }

            const conversationInvite: IReceivingAnInvite = {
                conversationId: conversationId,
                conversationName: conversationParticipant.conversation.chatName,
                inviterUserId: user.id,
                inviterUsername: user.username,
                inviterProfilePictureUrl: conversationParticipant.user.profileImg?.supabaseFileId || undefined
            }


            io.to([...inviteeSocketIds]).emit(SOCKET_INVITE_REQ_RECEIVE_EVENT, conversationInvite); //SEND AN INVITE TO THE USER AS A NOTIFICATION

            io.to(`${SOCKET_CONVERSATION_ROOM_PREFIX}:${conversationId}`).except(userSocketId).emit(SOCKET_NEW_PARTICIPANT_INVITED, conversationInvite); //IN CASE OTHER PARTICIPANTS OF THE CONVERSATION ARE ONLINE, SEND THE INVITE TO THEM AS WELL TO UPDATE THEIR UI IN REAL-TIME

            return res.status(200).json({
                ok: true,
                status: 200,
                message: "Invite sent successfully!!!"
            });



        } catch (error) {
            next(error);

        }

    });




router.delete(
    "/:conversationId/leave",
    ensureJWTAuthentication,
    async (req: Request<{ conversationId: string }, {}, IBaseSocketEmitData>, res: Response<ICustomErrorResponse>, next: NextFunction) => {


        const { conversationId } = req.params;
        const { userSocketId } = req.body;
        const user = req.user!;

        const userSocketIds = connectedUsers.get(user.id);
        if (!userSocketIds || !userSocketIds.has(userSocketId)) {
            return res.status(401).json({
                ok: false,
                status: 401,
                message: "Unauthorized, your user socket ID did not match with your access token socket IDs!!!"
            });
        }

        const sockets = [...userSocketIds]
            .map(id => io.sockets.sockets.get(id))
            .filter(Boolean);

        if (!sockets || sockets.length === 0) {
            return res.status(401).json({
                ok: false,
                status: 401,
                message: "Unauthorized, no active socket connection found for the provided user socket ID!!!"
            });
        }

        try {

            const removeFromConversation = await prisma.conversationParticipant.updateMany({
                where: {
                    userId: user.id,
                    conversationId: conversationId,
                    hasLeft: false
                },
                data: {
                    hasLeft: true
                }
            });

            if (removeFromConversation.count === 0) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    message: "Conversation ID not applicable for this user!!!"
                });
            }

            const leaveConversationData: ILeavingConversation = {
                conversationId,
                userLeavingId: user.id
            };

            sockets.forEach((socket) => {
                socket?.leave(`${SOCKET_CONVERSATION_ROOM_PREFIX}:${conversationId}`); //MAKE THE USER LEAVE THE CONVERSATION ROOM SO THEY STOP RECEIVING REAL-TIME UPDATES FOR THAT CONVERSATION
            });

            const remainingParticipants = await prisma.conversationParticipant.findMany({
                where: {
                    conversationId,
                    hasLeft: false
                },
                select: {
                    userId: true
                }
            });

            if (!remainingParticipants || remainingParticipants.length === 0) {
                
                await prisma.conversation.delete({
                    where: {
                        id: conversationId
                    }
                });

            } else {
                
                io.to(`${SOCKET_CONVERSATION_ROOM_PREFIX}:${conversationId}`).emit(SOCKET_USER_LEFT_CONVERSATION, leaveConversationData); //NOTIFY OTHER PARTICIPANTS IN REAL-TIME TO UPDATE THEIR UI

            }

            return res.sendStatus(204);



        } catch (error) {
            next(error);

        }
    });



router.post("/:conversationId/acceptInvite", ensureJWTAuthentication, async (req: Request<{ conversationId: string }, {}, IBaseSocketEmitData>, res: Response<ICustomErrorResponse | ICustomSuccessMessage>, next: NextFunction) => {

    const { conversationId } = req.params;
    const { userSocketId } = req.body;
    const user = req.user!;

    const userSocketIds = connectedUsers.get(user.id);
    if (!userSocketIds || !userSocketIds.has(userSocketId)) {
        return res.status(401).json({
            ok: false,
            status: 401,
            message: "Unauthorized, your user socket ID did not match with your access token socket IDs!!!"
        });
    }

    const sockets = [...userSocketIds]
        .map(id => io.sockets.sockets.get(id))
        .filter(Boolean);

    if (!sockets || sockets.length === 0) {
        return res.status(401).json({
            ok: false,
            status: 401,
            message: "Unauthorized, no active socket connection found for the provided user socket ID!!!"
        });
    }



    try {

        const joinRequest = await prisma.conversationJoinRequest.findFirst({
            where: {
                conversationId,
                receiverId: user.id,
                status: "PENDING"
            }
        });

        if (!joinRequest) {
            return res.status(404).json({
                ok: false,
                status: 404,
                message: "No pending invite request found for this conversation and user!!!"
            });
        }

        await prisma.$transaction([
            prisma.conversationJoinRequest.update({
                where: { id: joinRequest.id },
                data: { status: "ACCEPTED" }
            }),
            prisma.conversationParticipant.upsert({
                where: {
                    conversationId_userId: {
                        conversationId,
                        userId: user.id
                    }
                },
                update: {
                    hasLeft: false
                },
                create: {
                    conversationId,
                    userId: user.id,
                    hasLeft: false
                }
            })
        ]);

        sockets.forEach((socket) => {
            socket?.join(`${SOCKET_CONVERSATION_ROOM_PREFIX}:${conversationId}`); //MAKE THE USER JOIN THE CONVERSATION ROOM TO START RECEIVING REAL-TIME UPDATES FOR THAT CONVERSATION
        });

        const acceptedInviteData: IAcceptConversationInvite = {
            conversationId,
            userAcceptingId: user.id
        };

        io.to(`${SOCKET_CONVERSATION_ROOM_PREFIX}:${conversationId}`).emit(SOCKET_USER_ACCEPTED_CONVERSATION_INVITE, acceptedInviteData); //NOTIFY OTHER PARTICIPANTS IN REAL-TIME TO UPDATE THEIR UI WITH THE NEW PARTICIPANT

        return res.status(200).json({
            ok: true,
            status: 200,
            message: "Invite accepted and joined the conversation successfully!!!"
        });

    } catch (error: unknown) {

        next(error);


    }
});



router.post("/:conversationId/declineInvite", ensureJWTAuthentication, async (req: Request<{ conversationId: string }, {}, IBaseSocketEmitData>, res: Response<ICustomErrorResponse | ICustomSuccessMessage>, next: NextFunction) => {

    const { conversationId } = req.params;
    const { userSocketId } = req.body;
    const user = req.user!;

    const userSocketIds = connectedUsers.get(user.id);
    if (!userSocketIds || !userSocketIds.has(userSocketId)) {
        return res.status(401).json({
            ok: false,
            status: 401,
            message: "Unauthorized, your user socket ID did not match with your access token socket IDs!!!"
        });
    }

    try {

        const joinRequest = await prisma.conversationJoinRequest.findFirst({
            where: {
                conversationId,
                receiverId: user.id,
                status: "PENDING"
            }
        });

        if (!joinRequest) {
            return res.status(404).json({
                ok: false,
                status: 404,
                message: "No pending invite request found for this conversation and user!!!"
            });
        }

        await prisma.conversationJoinRequest.update({
            where: { id: joinRequest.id },
            data: { status: "REJECTED" }
        });

        const declineInviteData: IDeclineConversationInvite = {
            conversationId,
            userDecliningId: user.id
        };

        io.to(`${SOCKET_CONVERSATION_ROOM_PREFIX}:${conversationId}`).emit(SOCKET_USER_DECLINED_CONVERSATION_INVITE, declineInviteData); //NOTIFY OTHER PARTICIPANTS IN REAL-TIME TO UPDATE THEIR UI IN CASE THEY WANT TO SHOW DECLINED INVITES DIFFERENTLY THAN ACCEPTED ONES

        return res.status(200).json({
            ok: true,
            status: 200,
            message: "Invite declined successfully!!!"
        });



    } catch (error) {

        next(error);


    }

});