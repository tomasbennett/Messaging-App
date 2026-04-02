import { Router, Request, Response, NextFunction } from "express";
import { ensureJWTAuthentication } from "../auth/ensureJWTAuthentication";
import { ICustomErrorResponse } from "../../../shared/features/api/models/APIErrorResponse";
import { IFriendPreviewMessages, IReceiveFriendPreviewMessagesFrontend } from "../../../shared/features/conversation/models/IFriendPreviewMessages";
import { prisma } from "../db/prisma";
import { IGroupProfileUnion } from "../../../shared/features/conversation/discriminatedUnions/IGroupProfileUnion";
import { ILastMessageContentTypes } from "../../../shared/features/conversation/discriminatedUnions/ILastMessageContentTypes";



export const router = Router();


router.get("/preview", 
    ensureJWTAuthentication, 
    async (req: Request, res: Response<ICustomErrorResponse | IReceiveFriendPreviewMessagesFrontend>, next: NextFunction) => 
{
    const user = req.user!;

    
    
    try {
        const usersConversations = await prisma.conversationParticipant.findMany({
            where: {
                userId: user.id
            },
            select: {
                lastReadAt: true,
                conversation: {
                    select: {
                        id: true,
                        chatName: true,
                        participants: {
                            where: {
                                userId: {
                                    not: user.id
                                }
                            },
                            select: {
                                user: {
                                    select: {
                                        id: true,
                                        profileImg: {
        
                                            select: {
                                                supabaseFileId: true,
                                                
                                            }
                                        },
                                    }
                                }
                            }
                        },
                        groupChatImg: {
                            select: {
                                supabaseFileId: true,
                            }
                        },
                        messages: {
                            orderBy: {
                                createdAt: "desc"
                            },
                            take: 1,
                            select: {
                                content: true,
                                sender: true,
                                files: {
                                    select: {
                                        filesize: true,
                                    }
                                },
                                createdAt: true,
                            }
                        }
                    }
                }
            }
        });

        if (!usersConversations) {
            return res.status(404).json({
                ok: false,
                status: 404,
                message: "No conversations found for the user"
            });
        }

        const previewFriendConversations: IFriendPreviewMessages[] = usersConversations.map((conversation) => {
            const isMessageInConversation: boolean = conversation.conversation.messages.length >= 1;

            const isRead: boolean = isMessageInConversation ? conversation.lastReadAt >= conversation.conversation.messages[0]?.createdAt : true;
            const groupChatProfilePicture: IGroupProfileUnion = conversation.conversation.groupChatImg ? {
                type: "custom",
                groupChatProfileImgUrl: conversation.conversation.groupChatImg.supabaseFileId
            } : {
                type: "participants",
                participants: conversation.conversation.participants.map((participant) => ({
                    participantId: participant.user.id,
                    profileImgUrl: participant.user.profileImg?.supabaseFileId
                }))
            };




            const lastMessageContent: ILastMessageContentTypes | undefined = isMessageInConversation ? 
                conversation.conversation.messages[0]?.content ? {
                    messageType: "text",
                    textContent: conversation.conversation.messages[0].content,
                } : {
                    messageType: "file",
                    fileSize: conversation.conversation.messages[0].files[0].filesize,
                }
            : undefined;

            return {
                conversation: {
                    conversationId: conversation.conversation.id,
                    name: conversation.conversation.chatName,
                    groupChatProfilePicture: groupChatProfilePicture,
                    isRead: isRead
                },
                lastMessage: isMessageInConversation ? {
                    timestamp: conversation.conversation.messages[0].createdAt,
                    content: lastMessageContent
                } : undefined,
            };
        });

        return res.status(200).json({
            ok: true,
            status: 200,
            message: "Conversations endpoint is working!!!",
            friendPreviewsData: previewFriendConversations
        });


    } catch (error) {
        next(error);

    }
});