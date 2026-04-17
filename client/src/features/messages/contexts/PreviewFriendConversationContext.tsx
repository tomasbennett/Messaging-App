import { createContext, useContext, useEffect, useRef, useState } from "react";
import { IFriendPreviewMessages, ReceiveFriendPreviewMessagesFrontendSchema } from "../../../../../shared/features/conversation/models/IFriendPreviewMessages";
import { useError } from "../../error/contexts/ErrorContext";
import { IFriendMessagesContext } from "../models/IFriendMessagesContext";
import { notExpectedFormatError } from "../../../constants/errorConstants";
import { domain } from "../../../constants/EnvironmentAPI";
import { useNavigate } from "react-router-dom";
import { SendToSignInErrorHandler } from "../../../services/SendToSignInErrorHandler";
import { APIErrorSchema } from "../../../../../shared/features/api/models/APIErrorResponse";
import { errorPageRoute } from "../../../constants/routes";
import { useJWTFetch } from "../../../hooks/useNewAccessToken";
import { useAuth } from "../../auth/contexts/AuthContext";


const FriendMessageContext = createContext<IFriendMessagesContext | null>(null);


export function FriendMessageProvider({ children }: { children: React.ReactNode }) {

    const [friendMessages, setFriendMessages] = useState<IFriendPreviewMessages[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const errorCtx = useError();

    const abortController = useRef<AbortController | null>(null);

    const nav = useNavigate();

    const { jwtFetchHandler } = useJWTFetch();
    const { setAuthLevel } = useAuth();

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

                const response = await jwtFetchHandler(`${domain}/api/conversations/preview`, {
                    method: "GET",
                    signal: controller.signal
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
                    // setFriendMessages(friendsMessagesResult.data.friendPreviewsData);
                    setFriendMessages([
                        {
                            conversation: {
                                conversationId: "1",
                                name: "Callummmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm",
                                isRead: true,
                                groupChatProfilePicture: {
                                    type: "participants",
                                    participants: [
                                        {
                                            participantId: "1",
                                        }
                                    ]
                                }
                            },
                            latestMessage: {
                                timestamp: new Date(),
                                content: {
                                    messageType: "text",
                                    textContent: "This was the previous message man I wish I could do Lorem ipsum dolor sit amet consectetur adipisicing elit. Enim, illum magnam rerum excepturi nobis repellendus quia? Dolore consectetur commodi est doloremque aliquam, sequi recusandae quidem dicta cumque ipsa voluptatem. Atque iusto ut minus fuga eaque aperiam maxime, sapiente dignissimos labore soluta odit perspiciatis dicta delectus ipsa corporis mollitia voluptatum nobis."
                                }
                            }
                        },
                        {
                            conversation: {
                                conversationId: "2",
                                name: "Tirefd",
                                isRead: false,
                                groupChatProfilePicture: {
                                    type: "participants",
                                    participants: [
                                        {
                                            participantId: "1",
                                        },
                                        {
                                            participantId: "2",
                                        },
                                        {
                                            participantId: "3",
                                        },
                                        {
                                            participantId: "4",
                                        }
                                    ]
                                }
                            },
                            latestMessage: {
                                timestamp: new Date(),
                                content: {
                                    messageType: "file",
                                    fileSize: 13000000
                                }
                            }
                        }
                    ])
                    
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