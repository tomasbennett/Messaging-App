import { Router, Request, Response, NextFunction } from "express";
import { ensureJWTAuthentication } from "../auth/ensureJWTAuthentication";
import upload from "../supabase/multer";
import { prisma } from "../db/prisma";
import { FILES_KEY_NAME, SOCKET_MESSAGE_RECEIVE_EVENT } from "../../../shared/features/message/constants";
import { IMessageSendSocketData, IMessageSuccessUploadSocketData, MessageSendSocketSchema } from "../../../shared/features/sockets/models/IMessageSocket";
import { ICustomErrorResponse } from "../../../shared/features/api/models/APIErrorResponse";
import { ICustomSuccessMessage } from "../../../shared/features/api/models/APISuccessResponse";
import { io } from "../app";
import { supabase } from "../supabase/client";
import { SOCKET_CONVERSATION_ROOM_PREFIX } from "../../../shared/features/conversation/constants";
import { IReceiveMessageFrontend } from "../../../shared/features/message/models/IFrontendMessages";


export const router = Router();



router.post("/", ensureJWTAuthentication, upload.array(FILES_KEY_NAME),
    async (req: Request<{}, {}, Omit<IMessageSendSocketData, typeof FILES_KEY_NAME>>, res: Response<ICustomErrorResponse | IMessageSuccessUploadSocketData>, next: NextFunction) => {

        const reqBodyResults = MessageSendSocketSchema.omit({ [FILES_KEY_NAME]: true }).safeParse(req.body);
        if (!reqBodyResults.success) {
            return res.status(400).json({
                ok: false,
                message: `Invalid request body: ${reqBodyResults.error.message}`,
                status: 400
            });
        }

        const { content, conversationId, sender, userSocketId } = reqBodyResults.data;
        const user = req.user!;
        const files = req.files as Express.Multer.File[] | undefined;

        try {

            const conversationParticipant = await prisma.conversationParticipant.findUnique({
                where: {
                    conversationId_userId: {
                        conversationId: conversationId,
                        userId: user.id
                    },
                    hasLeft: false
                }
            });

            if (!conversationParticipant) {
                return res.status(403).json({
                    ok: false,
                    message: "User is not a participant of the conversation or has left the conversation!!!",
                    status: 403
                });
            }

            const createdAt = new Date();

            const newMessage = await prisma.message.create({
                data: {
                    content,
                    conversationId,
                    createdAt,
                    senderId: sender.userId,
                }
            });



            const uploadedFiles = await Promise.all(
                (files || []).map(async (file) => {
                    const { originalname, mimetype, size, buffer } = file;

                    const fileExt = originalname.split(".").pop();
                    const storagePath = `${crypto.randomUUID()}.${fileExt}`;

                    const { error } = await supabase.storage
                        .from(process.env.SUPABASE_BUCKET_NAME || "uploads")
                        .upload(storagePath, buffer, {
                            contentType: mimetype,
                            upsert: false
                        });

                    if (error) throw error;

                    const prismaFile = await prisma.file.create({
                        data: {
                            filename: originalname,
                            filesize: size,
                            filetype: mimetype,
                            supabaseFileId: storagePath,
                            messageId: newMessage.id
                        }
                    });

                    return { fileId: prismaFile.id, fileUrl: storagePath };

                })
            );

            const receiveMessageData: IReceiveMessageFrontend = {
                messageId: newMessage.id,
                content: newMessage?.content ?? undefined,
                conversationId: conversationId,
                sender: {
                    userId: sender.userId,
                    username: sender.username
                },
                timestamp: createdAt,
                files: uploadedFiles?.map(file => ({
                    fileId: file.fileId,
                    fileUrl: file.fileUrl
                })) ?? undefined
            }

            io.to(`${SOCKET_CONVERSATION_ROOM_PREFIX}:${conversationId}`).except(userSocketId).emit(`${SOCKET_MESSAGE_RECEIVE_EVENT}`, receiveMessageData);



            return res.status(201).json({
                ok: true,
                message: "Message sent successfully!!!",
                status: 201,
                messageId: newMessage.id
            });





        } catch (error) {
            next(error);
        }
    });