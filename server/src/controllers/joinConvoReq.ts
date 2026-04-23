import { Router, NextFunction, Request, Response } from "express";
import { ensureJWTAuthentication } from "../auth/ensureJWTAuthentication";
import { ICustomErrorResponse } from "../../../shared/features/api/models/APIErrorResponse";
import { prisma } from "../db/prisma";


export const router = Router();

router.post(
    "/add/:conversationId", 
    ensureJWTAuthentication, 
    async (req: Request<{ conversationId: string }, {}, { inviteeUserId: string }>, res: Response<ICustomErrorResponse>, next: NextFunction) => {
        const { conversationId } = req.params;
        const { inviteeUserId } = req.body;
        const user = req.user!;


        try {







            
        } catch (error) {
            next(error);

        }

    });

router.delete(
    "/:conversationId",
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