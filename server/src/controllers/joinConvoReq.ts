import { Router, NextFunction, Request, Response } from "express";
import { ensureJWTAuthentication } from "../auth/ensureJWTAuthentication";
import { ICustomErrorResponse } from "../../../shared/features/api/models/APIErrorResponse";
import { prisma } from "../db/prisma";

import { io } from "../app";
import { ICustomSuccessMessage } from "../../../shared/features/api/models/APISuccessResponse";
import { SOCKET_INVITE_REQ_RECEIVE_EVENT } from "../../../shared/features/inviteReq/constants";


export const router = Router();



router.post(
    "/:conversationId/add/:inviteeUserId",
    ensureJWTAuthentication,
    async (req: Request<{ conversationId: string, inviteeUserId: string }>, res: Response<ICustomErrorResponse | ICustomSuccessMessage>, next: NextFunction) => {

        const { conversationId, inviteeUserId } = req.params;
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


        try {

            const conversationParticipant = await prisma.conversationParticipant.findUnique({
                where: {
                    conversationId_userId: {
                        conversationId,
                        userId: user.id
                    },
                    hasLeft: false
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
                    senderParticipantId: user.id,
                    receiverId: inviteeUserId,
                }
            });


            const conversationInvite: = {

            }

            io.to(inviteeUserId).emit(SOCKET_INVITE_REQ_RECEIVE_EVENT, conversationInvite);

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
    async (req: Request<{ conversationId: string }>, res: Response<ICustomErrorResponse>, next: NextFunction) => {


        const { conversationId } = req.params;
        const user = req.user!;


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

            return res.sendStatus(204);



        } catch (error) {
            next(error);

        }
    });



router.post("/:conversationId/acceptInvite", ensureJWTAuthentication, async (req: Request<{ conversationId: string }>, res: Response<ICustomErrorResponse | ICustomSuccessMessage>, next: NextFunction) => {

    const { conversationId } = req.params;
    const user = req.user!;

    try {



    } catch (error: unknown) {

        next(error);


    }
});



router.post("/:conversationId/declineInvite", ensureJWTAuthentication, async (req: Request<{ conversationId: string }>, res: Response<ICustomErrorResponse | ICustomSuccessMessage>, next: NextFunction) => {

    const { conversationId } = req.params;
    const user = req.user!;

    try {



    } catch (error) {

        next(error);


    }

});