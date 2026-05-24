import { Router, Request, Response, NextFunction } from "express";
import { ensureJWTAuthentication } from "../auth/ensureJWTAuthentication";
import { ICustomErrorResponse } from "../../../shared/features/api/models/APIErrorResponse";
import { IFriendPreviewMessages, IReceiveFriendPreviewMessagesFrontend } from "../../../shared/features/conversation/models/IFriendPreviewMessages";
import { prisma } from "../db/prisma";
import { IGroupProfileUnion } from "../../../shared/features/conversation/discriminatedUnions/IGroupProfileUnion";
import { ILastMessageContentTypes } from "../../../shared/features/conversation/discriminatedUnions/ILastMessageContentTypes";
import { IConversationMessage, IReceiveConversationMessagesFrontend } from "../../../shared/features/message/models/IConversationMessage";
import { IConversationHeaderInfo } from "../../../shared/features/conversation/models/IHeaderInfo";
import { IFileArrayProperties } from "../../../shared/features/files/models/IFileArray";
import { CONVERSATION_CUSTOM_IMAGE_FILE_KEY, SOCKET_CONVERSATION_ROOM_PREFIX } from "../../../shared/features/conversation/constants";
import { IBaseSocketEmitData, BaseSocketEmitData } from "../../../shared/features/sockets/models/IBaseSocketReqData";
import { io } from "../app";
import { connectedUsers } from "../sockets/UserSocketMapping";
import { ICustomSuccessMessage } from "../../../shared/features/api/models/APISuccessResponse";
import { CreateNewConversationSchema, ICreateNewConversation } from "../../../shared/features/conversation/models/ICreateNewConversation";
import upload from "../supabase/multer";
import { supabase } from "../supabase/client";
import { IReceivingAnInvite } from "../../../shared/features/inviteReq/models/IReceivingAnInvite";
import { SOCKET_INVITE_REQ_RECEIVE_EVENT } from "../../../shared/features/inviteReq/constants";
import { ISignedSupabaseUrl } from "../../../shared/features/files/models/ISignedSupabaseUrl";
import { Prisma } from "@prisma/client";
import { GenerateSupabasePublicURL } from "../services/SupabaseGeneratePublicURL";
import { allowedImgTypes } from "../../../shared/features/files/constants";
import { IInlineOrDownloadableFile } from "../../../shared/features/files/discriminatedUnions/InlineVsDownloadableFiles";

export const router = Router();


router.post("/my_conversations", ensureJWTAuthentication, async (req: Request<{}, {}, IBaseSocketEmitData>, res: Response<ICustomErrorResponse | IReceiveFriendPreviewMessagesFrontend>, next: NextFunction) => {
    const user = req.user!;

    const userSocketIdResult = BaseSocketEmitData.safeParse(req.body);
    if (!userSocketIdResult.success) {
        return res.status(400).json({
            ok: false,
            status: 400,
            message: `Invalid request body: ${userSocketIdResult.error.message}`
        });
    }

    const { userSocketId } = userSocketIdResult.data;

    const socket = io.sockets.sockets.get(userSocketId);

    if (!socket) {
        return res.status(400).json({
            ok: false,
            status: 400,
            message: "Invalid user socket ID!!!"
        });
    }




    try {
        const usersConversations = await prisma.conversationParticipant.findMany({
            where: {
                userId: user.id,
                hasLeft: false
            },
            select: {
                lastReadAt: true,
                conversation: {
                    select: {
                        id: true,
                        chatName: true,
                        participants: {
                            select: {
                                user: {
                                    select: {
                                        id: true,
                                        username: true,
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






        const previewFriendConversations: IFriendPreviewMessages[] =
            await Promise.all(usersConversations.map(async (conversation) => {

                socket.join(`${SOCKET_CONVERSATION_ROOM_PREFIX}:${conversation.conversation.id}`);


                const isMessageInConversation: boolean = conversation.conversation.messages.length >= 1;

                const isRead: boolean = isMessageInConversation ? conversation.lastReadAt >= conversation.conversation.messages[0]?.createdAt : true;



                let groupChatProfilePicture: IGroupProfileUnion;

                if (conversation.conversation.groupChatImg) {

                    const supabasePublicUrlRes = await GenerateSupabasePublicURL([conversation.conversation.groupChatImg.supabaseFileId])

                    if (!supabasePublicUrlRes.ok) {
                        throw new Error(supabasePublicUrlRes.error);
                    }

                    groupChatProfilePicture = {
                        type: "custom",
                        groupChatProfileImgUrl: supabasePublicUrlRes.supabasePublicURLs[0]
                    }
                }
                else {

                    const participants = conversation.conversation.participants;

                    const validImageUrls: string[] = participants
                        .filter(p => p.user.profileImg?.supabaseFileId)
                        .map(p => p.user.profileImg!.supabaseFileId!)


                    const generatedPublicUrls = await GenerateSupabasePublicURL(validImageUrls);

                    if (!generatedPublicUrls.ok) {
                        throw new Error(generatedPublicUrls.error);
                    }


                    let indx: number = 0;


                    groupChatProfilePicture = {
                        type: "participants",
                        participants: participants.map((participant) => {
                            if (participant.user.profileImg?.supabaseFileId) {

                                return {
                                    participantId: participant.user.id,
                                    profileImgUrl: generatedPublicUrls.supabasePublicURLs[indx++]
                                }
                            }

                            return {
                                participantId: participant.user.id
                            }
                        })
                    }
                }


                const lastMessageContent: ILastMessageContentTypes | undefined = isMessageInConversation ?
                    conversation.conversation.messages[0]?.content ? {
                        messageType: "text",
                        textContent: conversation.conversation.messages[0].content,
                    } : {
                        messageType: "file",
                        fileSize: conversation.conversation.messages[0].files[0].filesize,
                    }
                    : undefined;

                const participants = conversation.conversation.participants;

                const validImageUrls: string[] = participants
                    .filter(p => p.user.profileImg?.supabaseFileId)
                    .map(p => p.user.profileImg!.supabaseFileId!)


                const generatedPublicUrls = await GenerateSupabasePublicURL(validImageUrls);

                if (!generatedPublicUrls.ok) {
                    throw new Error(generatedPublicUrls.error);
                }


                let indx: number = 0;

                const latestMessage = lastMessageContent ? {
                    timestamp: conversation.conversation.messages[0].createdAt,
                    content: lastMessageContent
                } : undefined;

                return {
                    conversation: {
                        conversationId: conversation.conversation.id,
                        name: conversation.conversation.chatName,
                        groupChatProfilePicture,
                        isRead: isRead,
                        conversationGroupType: participants.length > 2 ? "group" : "one_to_one",
                        participants: participants.map((participant) => {
                            if (participant.user.profileImg?.supabaseFileId) {

                                return {
                                    participantId: participant.user.id,
                                    participantUsername: participant.user.username,
                                    participantProfilePictureUrl: generatedPublicUrls.supabasePublicURLs[indx++]
                                }
                            }

                            return {
                                participantId: participant.user.id,
                                participantUsername: participant.user.username,
                                participantProfilePictureUrl: undefined
                            }
                        })
                    },
                    latestMessage
                };
            }));


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


router.post("/:conversationId/mark_as_read", ensureJWTAuthentication, async (req: Request<{ conversationId: string }>, res: Response<ICustomErrorResponse | ICustomSuccessMessage>, next: NextFunction) => {
    const { conversationId } = req.params;
    const user = req.user!;

    try {
        const participantRecord = await prisma.conversationParticipant.findUnique({
            where: {
                conversationId_userId: {
                    conversationId,
                    userId: user.id
                }
            }
        });

        if (!participantRecord) {
            return res.status(404).json({
                ok: false,
                status: 404,
                message: "Conversation not found or user is not a participant!!!"
            });
        }

        await prisma.conversationParticipant.update({
            where: {
                id: participantRecord.id
            },
            data: {
                lastReadAt: new Date()
            }
        });

        return res.status(200).json({
            ok: true,
            status: 200,
            message: "Conversation marked as read successfully!!!"
        });

    } catch (error) {
        next(error);

    }
});














router.get("/:conversationId", ensureJWTAuthentication, async (req: Request<{ conversationId: string }>, res: Response<ICustomErrorResponse | IReceiveConversationMessagesFrontend>, next: NextFunction) => {

    const { conversationId } = req.params;
    const user = req.user!;

    try {

        const conversation = await prisma.conversation.findUnique({
            where: {
                id: conversationId,
            },
            select: {
                participants: {
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
                        },
                        hasLeft: true
                    }
                },
                messages: {
                    orderBy: {
                        createdAt: "asc"
                    },
                    select: {
                        id: true,
                        createdAt: true,
                        content: true,
                        sender: {
                            select: {
                                user: {
                                    select: {
                                        id: true,
                                        username: true,
                                        profileImg: {
                                            select: {
                                                supabaseFileId: true,
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        files: true
                    }
                },
                groupChatImg: true,
                chatName: true,
            }
        });

        if (!conversation) {
            return res.status(404).json({
                ok: false,
                status: 404,
                message: "Conversation not found or user is not a participant"
            });
        }

        const isUserParticipant: boolean = conversation.participants.some((participant) => (participant.user.id === user.id && !participant.hasLeft));

        if (!isUserParticipant) {
            return res.status(403).json({
                ok: false,
                status: 403,
                message: "You do not have permission to view this conversation!!!"
            });
        }


        const isGroupChat: boolean = conversation.participants.length > 2;



        const receivableMessages: IConversationMessage[] = await Promise.all(
            conversation.messages.map(async (message) => {

                const files = await Promise.all(
                    message.files.map(async (file) => {
                        let fileDetails: IInlineOrDownloadableFile;

                        const generatedSignedUrl = await GenerateSupabasePublicURL([file.supabaseFileId]);

                        if (!generatedSignedUrl.ok) {
                            throw new Error(
                                "Failed to generate signed URL for file with ID: " + file.id
                            );
                        }

                        if (allowedImgTypes.includes(file.filetype)) {



                            fileDetails = {
                                fileType: "inline",
                                signedUrl: generatedSignedUrl.supabasePublicURLs[0],
                                fileSizeInBytes: file.filesize
                            };

                        } else {
                            fileDetails = {
                                fileType: "downloadable",
                                supabaseId: generatedSignedUrl.supabasePublicURLs[0],
                                filename: file.filename,
                                mimetype: file.filetype,
                                fileSizeInBytes: file.filesize
                            };
                        }

                        return {
                            fileId: file.id,
                            fileDetails
                        };

                    }));


                return {
                    messageId: message.id,
                    senderId: message.sender.user.id,
                    conversationId: conversationId,
                    timestamp: message.createdAt,
                    content: message?.content ?? undefined,
                    files: files,
                    senderName: message.sender.user.username,
                    senderProfileImgUrl: message.sender.user.profileImg?.supabaseFileId
                    // conversationGroupType: isGroupChat ? {
                    //     type: "group",
                    //     senderName: message.sender.user.username,
                    //     senderProfileImgUrl: message.sender.user.profileImg?.supabaseFileId
                    // } : {
                    //     type: "single"
                    // }
                }
            })
        )



        const isCustomGroupChatProfileImg: boolean = conversation.groupChatImg !== null;



        let headerInfo: IConversationHeaderInfo;

        if (isCustomGroupChatProfileImg) {
            const generatedCustomGroupChatImgUrlRes = await GenerateSupabasePublicURL([conversation.groupChatImg!.supabaseFileId]);

            if (!generatedCustomGroupChatImgUrlRes.ok) {
                return res.status(500).json({
                    ok: false,
                    status: 500,
                    message: generatedCustomGroupChatImgUrlRes.error
                });
            }

            headerInfo = {
                conversationId,
                name: conversation.chatName,
                groupChatProfilePicture: {
                    type: "custom",
                    groupChatProfileImgUrl: generatedCustomGroupChatImgUrlRes.supabasePublicURLs[0]
                }
            }

        } else {
            const validParticipantsProfileImgIds: string[] = conversation.participants
                .filter(p => p.user.profileImg?.supabaseFileId)
                .map(p => p.user.profileImg!.supabaseFileId!);

            const generatedPublicUrlRes = await GenerateSupabasePublicURL(validParticipantsProfileImgIds);

            if (!generatedPublicUrlRes.ok) {
                return res.status(500).json({
                    ok: false,
                    status: 500,
                    message: generatedPublicUrlRes.error
                });
            }

            let indx: number = 0;

            headerInfo = {
                conversationId,
                name: conversation.chatName,
                groupChatProfilePicture: {
                    type: "participants",
                    participants: conversation.participants.map(p => {
                        if (p.user.profileImg?.supabaseFileId) {
                            return {
                                participantId: p.user.id,
                                profileImgUrl: generatedPublicUrlRes.supabasePublicURLs[indx++]
                            }
                        }

                        return {
                            participantId: p.user.id,
                            profileImgUrl: undefined
                        }
                    })
                }
            }


        }



        return res.status(200).json({
            ok: true,
            status: 200,
            message: "Conversation fetched successfully",
            headerInfo,
            messages: receivableMessages,
            conversationGroupType: isGroupChat ? "group" : "one_to_one"
        });

    } catch (error: unknown) {
        next(error);

    }
});


//BECAUSE YOU MIGHT NEED THE PUBLIC GENERATED URL FOR NON IMAGES LONG AFTER YOU REQUEST THE FILE INFORMATION LIKE FOR DOWNLOAD!!!

router.get("/:conversationId/download/:fileId", ensureJWTAuthentication, async (req: Request<{ conversationId: string, fileId: string }>, res: Response<ICustomErrorResponse | ISignedSupabaseUrl>, next: NextFunction) => {
    //CHECK USING THE SAME LOGIC THAT USER IS APPLICABLE TO DOWNLOAD AND THEN SIGN OFF ON A URL FOR NOW  
    const { conversationId, fileId } = req.params;
    const user = req.user!;

    try {
        const conversation = await prisma.conversation.findUnique({
            where: {
                id: conversationId
            },
            select: {
                participants: {
                    where: {
                        userId: user.id,
                        hasLeft: false
                    }
                },
                messages: {
                    where: {
                        files: {
                            some: {
                                id: fileId
                            }
                        }
                    },
                    select: {
                        files: true
                    }
                }
            }
        });

        if (!conversation || conversation.participants.length === 0 || conversation.messages.length === 0) {
            return res.status(404).json({
                ok: false,
                status: 404,
                message: "Conversation not found, user is not a participant or file not found in any messages!!!"
            });
        }

        const file = conversation.messages[0].files.find((file) => file.id === fileId)!;

        const generatedPublicUrl = await GenerateSupabasePublicURL([file.supabaseFileId]);

        if (!generatedPublicUrl.ok) {
            return res.status(500).json({
                ok: false,
                status: 500,
                message: generatedPublicUrl.error
            });
        }

        return res.status(200).json({
            ok: true,
            status: 200,
            message: "File download URL generated successfully!!!",
            signedUrl: generatedPublicUrl.supabasePublicURLs[0]
        });



    } catch (error: unknown) {
        next(error);

    }

});





router.post("/new", ensureJWTAuthentication, upload.single(CONVERSATION_CUSTOM_IMAGE_FILE_KEY), async (req: Request<{}, {}, Omit<ICreateNewConversation, typeof CONVERSATION_CUSTOM_IMAGE_FILE_KEY>>, res: Response<ICustomErrorResponse | ICustomSuccessMessage>, next: NextFunction) => {
    const user = req.user!;

    const participantIds: string[] = Array.isArray(req.body.participantIds)
        ? req.body.participantIds
        : req.body.participantIds
            ? [req.body.participantIds]
            : [];

    const normalizeBody = {
        ...req.body,
        participantIds
    }


    const createNewConversationDataResult = CreateNewConversationSchema.omit({ [CONVERSATION_CUSTOM_IMAGE_FILE_KEY]: true }).safeParse(normalizeBody);
    if (!createNewConversationDataResult.success) {
        return res.status(400).json({
            ok: false,
            status: 400,
            message: `Invalid request body: ${createNewConversationDataResult.error.message}`
        });
    }


    const { name } = createNewConversationDataResult.data;
    const customImageFile = req.file as Express.Multer.File | undefined;

    try {

        let groupChatImgId: string | undefined = undefined;

        if (customImageFile) {

            const { originalname, mimetype, size, buffer } = customImageFile;

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
                }
            });

            groupChatImgId = prismaFile.id;

        }





        const result = await prisma.$transaction(
            async (tx) => {

                const newConversation =
                    await tx.conversation.create({
                        data: {
                            chatName: name,
                            participants: {
                                create: {
                                    userId: user.id,
                                    hasLeft: false
                                }
                            },
                            groupChatImgId: groupChatImgId
                        },
                        select: {
                            id: true,
                            chatName: true,
                            participants: true
                        }
                    });

                const creatorParticipant =
                    newConversation.participants.find(
                        p => p.userId === user.id
                    )!;

                await tx.conversationJoinRequest.createMany({
                    data: participantIds.map(
                        receiverId => ({
                            receiverId,
                            conversationId:
                                newConversation.id,
                            senderParticipantId:
                                creatorParticipant.id,
                        })
                    )
                });

                return newConversation;
            }
        );

        const inviteeSocketIds = new Set<string>();

        participantIds.forEach(participantId => {
            const userSockets =
                connectedUsers.get(participantId);

            if (!userSockets) return;

            userSockets.forEach(socketId => {
                inviteeSocketIds.add(socketId);
            });
        });

        if (!inviteeSocketIds || inviteeSocketIds.size === 0) {
            return res.status(201).json({
                ok: true,
                status: 201,
                message: "Conversation created successfully",
            });
        }

        const userImg = await prisma.user.findUnique({
            where: {
                id: user.id
            },
            select: {
                profileImg: {
                    select: {
                        supabaseFileId: true
                    }
                },
            }
        });

        const conversationInvite: IReceivingAnInvite = {
            conversationId: result.id,
            conversationName: result.chatName,
            inviterUserId: user.id,
            inviterUsername: user.username,
            inviterProfilePictureUrl: userImg?.profileImg?.supabaseFileId
        }


        io.to([...inviteeSocketIds]).emit(SOCKET_INVITE_REQ_RECEIVE_EVENT, conversationInvite);


        return res.status(201).json({
            ok: true,
            status: 201,
            message: "Conversation created successfully",
        });



    } catch (error) {
        next(error);

    }
});