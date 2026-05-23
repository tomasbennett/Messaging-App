import { createContext, useContext, useEffect, useRef, useState } from "react";
import { IFriendPreviewMessages, ReceiveFriendPreviewMessagesFrontendSchema } from "../../../../../shared/features/conversation/models/IFriendPreviewMessages";
import { useError } from "../../error/contexts/ErrorContext";
import { IFriendMessagesContext } from "../models/IFriendMessagesContext";
import { notExpectedFormatError } from "../../../constants/errorConstants";
import { domain } from "../../../constants/EnvironmentAPI";
import { useLocation, useNavigate } from "react-router-dom";
import { SendToSignInErrorHandler } from "../../../services/SendToSignInErrorHandler";
import { APIErrorSchema } from "../../../../../shared/features/api/models/APIErrorResponse";
import { conversationPageRoute, errorPageRoute } from "../../../constants/routes";
import { useJWTFetch } from "../../../hooks/useJWTFetch";
import { useAuth } from "../../auth/contexts/AuthContext";
import { useSocket } from "../../../contexts/SocketHandlerContext";
import { IBaseSocketEmitData } from "../../../../../shared/features/sockets/models/IBaseSocketReqData";
import { SOCKET_MESSAGE_RECEIVE_EVENT } from "../../../../../shared/features/message/constants";
import { ReceiveMessageFrontendSchema } from "../../../../../shared/features/message/models/IFrontendMessages";
import { useInviteReqContext } from "../../inviteReq/contexts/InviteReqContext";


const FriendMessageContext = createContext<IFriendMessagesContext | null>(null);


export function FriendMessageProvider({ children }: { children: React.ReactNode }) {

    const [friendMessages, setFriendMessages] = useState<IFriendPreviewMessages[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const errorCtx = useError();

    const abortController = useRef<AbortController | null>(null);

    const nav = useNavigate();

    const { jwtFetchHandler } = useJWTFetch();
    const { setAuthLevel } = useAuth();

    const socket = useSocket();
    if (!socket.id) {
        setAuthLevel({ userType: "none" });
        errorCtx?.throwError({
            message: "Socket connection not established. Please sign in again.",
            status: 401,
            ok: false
        });
        return;

    }

    const reqSocketBody: IBaseSocketEmitData = {
        userSocketId: socket.id,
    }

    useEffect(() => {
        abortController.current?.abort();
        const controller = new AbortController();
        abortController.current = controller;

        async function fetchFriendMessages() {

            if (!errorCtx) {
                console.error("Error context is not available in MessageProvider!!!");
                return;
            }



            try {

                const response = await jwtFetchHandler(`${domain}/api/conversations/my_conversations`, {
                    method: "POST",
                    signal: controller.signal,
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(reqSocketBody)
                });

                if (controller !== abortController.current) return;

                if (response.returnType === "loginError") {
                    errorCtx.throwError(response.error);
                    setAuthLevel({ userType: "none" });
                    return;
                }

                if (response.returnType === "fetchError") {
                    errorCtx.throwError(response.error);
                    nav(errorPageRoute, {
                        state: { error: response.error }
                    });
                    return;
                }

                const friendsRes = response.data;
                const friendsMessagesJSON = await friendsRes.json();




                const friendsMessagesResult = ReceiveFriendPreviewMessagesFrontendSchema.safeParse(friendsMessagesJSON);
                if (friendsMessagesResult.success) {
                    setFriendMessages(friendsMessagesResult.data.friendPreviewsData);
                    // setFriendMessages([
                    //     {
                    //         conversation: {
                    //             conversationId: "1",
                    //             name: "Callummmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm",
                    //             isRead: true,
                    //             groupChatProfilePicture: {
                    //                 type: "participants",
                    //                 participants: [
                    //                     {
                    //                         participantId: "1",
                    //                     }
                    //                 ]
                    //             }
                    //         },
                    //         latestMessage: {
                    //             timestamp: new Date(),
                    //             content: {
                    //                 messageType: "text",
                    //                 textContent: "This was the previous message man I wish I could do Lorem ipsum dolor sit amet consectetur adipisicing elit. Enim, illum magnam rerum excepturi nobis repellendus quia? Dolore consectetur commodi est doloremque aliquam, sequi recusandae quidem dicta cumque ipsa voluptatem. Atque iusto ut minus fuga eaque aperiam maxime, sapiente dignissimos labore soluta odit perspiciatis dicta delectus ipsa corporis mollitia voluptatum nobis."
                    //             }
                    //         }
                    //     },
                    //     {
                    //         conversation: {
                    //             conversationId: "2",
                    //             name: "Tirefd",
                    //             isRead: false,
                    //             groupChatProfilePicture: {
                    //                 type: "participants",
                    //                 participants: [
                    //                     {
                    //                         participantId: "1",
                    //                     },
                    //                     {
                    //                         participantId: "2",
                    //                     },
                    //                     {
                    //                         participantId: "3",
                    //                     },
                    //                     {
                    //                         participantId: "4",
                    //                     }
                    //                 ]
                    //             }
                    //         },
                    //         latestMessage: {
                    //             timestamp: new Date(),
                    //             content: {
                    //                 messageType: "file",
                    //                 fileSize: 13000000
                    //             }
                    //         }
                    //     }
                    // ])

                    return;
                }

                const errorResult = APIErrorSchema.safeParse(friendsMessagesJSON);
                if (errorResult.success) {
                    errorCtx.throwError(errorResult.data);
                    nav(errorPageRoute, {
                        state: { error: errorResult.data }
                    });
                    return;
                }

                console.error("Unexpected response format for friend messages:", friendsMessagesJSON);
                errorCtx.throwError(notExpectedFormatError);
                nav(errorPageRoute, {
                    state: { error: notExpectedFormatError }
                });
                return;


            } catch (err: unknown) {
                if (controller !== abortController.current) return;

                console.error("Error fetching friend messages:", err);

                SendToSignInErrorHandler(err, nav);
                return;

            } finally {
                if (controller !== abortController.current) return;

                setIsLoading(false);
            }

        }

        fetchFriendMessages();


        return () => {
            abortController.current = null;
            controller.abort();
        }

    }, []);



    const { showInvitePopup } = useInviteReqContext();
    const location = useLocation();




    useEffect(() => {
        if (!socket) return;

        

        socket.on(SOCKET_MESSAGE_RECEIVE_EVENT, (data: unknown) => {
            
            const parsedDataResult = ReceiveMessageFrontendSchema.safeParse(data);
            if (parsedDataResult.success) {
                const receivedMessage = parsedDataResult.data;

                const isOnConversationPage = location.pathname === `${conversationPageRoute}/${receivedMessage.conversationId}`;

                setFriendMessages(prev => {
                    return prev.map(friendMessageConversation => {
                        if (friendMessageConversation.conversation.conversationId === receivedMessage.conversationId) {
                            const isContentMessage = !!receivedMessage?.content;

                            return {
                                conversation: {
                                    ...friendMessageConversation.conversation,
                                    isRead: isOnConversationPage
                                },
                                latestMessage: {
                                    content: isContentMessage ? {
                                        messageType: "text",
                                        textContent: receivedMessage.content!
                                    } : {
                                        messageType: "file",
                                        fileSize: receivedMessage.files![0].fileDetails.fileSizeInBytes
                                    },
                                    timestamp: receivedMessage.timestamp
                                }
                            }
                        }

                        return friendMessageConversation;
                    });
                });

                if (!isOnConversationPage) {
                    showInvitePopup({
                        conversationId: receivedMessage.conversationId,
                        conversationName: receivedMessage.conversationName,
                        inviterUserId: receivedMessage.senderId,
                        inviterUsername: receivedMessage.senderName,
                        inviterProfilePictureUrl: receivedMessage.senderProfileImgUrl,
                        bcg: "blue",
                        message: `New message from ${receivedMessage.senderName} in ${receivedMessage.conversationName}.`,
                        onClick: () => {
                            nav(`${conversationPageRoute}/${receivedMessage.conversationId}`, { replace: true });
                        }
                    });
                }

                return;

            }
            
            const errorResult = APIErrorSchema.safeParse(data);
            if (errorResult.success) {
                errorCtx?.throwError(errorResult.data);
                return;
            }

            errorCtx?.throwError(notExpectedFormatError);
            return;


        });

        return () => {
            socket.off(SOCKET_MESSAGE_RECEIVE_EVENT);
        }

    }, [socket])





    const ctx: IFriendMessagesContext = {
        friendMessages,
        setFriendMessages,
        isLoading,
    }


    return (
        <FriendMessageContext.Provider value={ctx}>
            {
                children
            }
        </FriendMessageContext.Provider>
    );
}



export function useFriendMessageContext() {
    const context = useContext(FriendMessageContext);

    if (!context) {
        throw new Error("useFriendMessageContext must be used within FriendMessageProvider");
    }

    return context;
}