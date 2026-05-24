import { useState, useRef, useEffect, useMemo } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { APIErrorSchema, ICustomErrorResponse } from "../../../../../shared/features/api/models/APIErrorResponse";
import { IConversationHeaderInfo } from "../../../../../shared/features/conversation/models/IHeaderInfo";
import { IConversationMessage, ReceiveConversationMessagesAndHeaderInfoFrontendSchema } from "../../../../../shared/features/message/models/IConversationMessage";
import { LoadingCircle } from "../../../components/LoadingCircle";
import { notExpectedFormatError, unknownError } from "../../../constants/errorConstants";
import { errorPageRoute } from "../../../constants/routes";
import { useJWTFetch } from "../../../hooks/useJWTFetch";
import { useAuth } from "../../auth/contexts/AuthContext";
import { useError } from "../../error/contexts/ErrorContext";
import styles from "./ConversationBody.module.css";
import { ConversationHeader } from "../components/ConversationHeader";
import { InputMessageComponent } from "../components/InputMessage";
import { MessageComponent } from "../components/Message";
import { domain } from "../../../constants/EnvironmentAPI";
import { IConversationGroupSingleUnion } from "../../../../../shared/features/conversation/discriminatedUnions/IGroupSingleUnion";
import { useFriendMessageContext } from "../contexts/PreviewFriendConversationContext";
import { APISuccessSchema } from "../../../../../shared/features/api/models/APISuccessResponse";


export function ConversationBody() {

    const { conversationId } = useParams<{ conversationId: string }>();

    const errorCtx = useError();

    if (!conversationId || typeof conversationId !== "string" || conversationId.trim() === "") {
        const noConversationIdError: ICustomErrorResponse = {
            message: "No conversation ID provided. Please select a conversation to view messages!!!",
            status: 400,
            ok: false
        };
        errorCtx?.throwError(noConversationIdError);
        return <Navigate to={errorPageRoute} replace={true} state={{ error: noConversationIdError }} />;
    }


    const [isLoading, setIsLoading] =
        useState<boolean>(false);

    const [conversationMessages, setConversationMessages] =
        useState<IConversationMessage[]>([]);

    const [conversationHeaderInfo, setConversationHeaderInfo] =
        useState<IConversationHeaderInfo | null>(null);

    const { friendMessages } = useFriendMessageContext();

    const conversationGroupType = useMemo<IConversationGroupSingleUnion | null>(() => {
        const friendConversation = friendMessages.find((friendMessage) => friendMessage.conversation.conversationId === conversationId);
        if (friendConversation) {
            return friendConversation.conversation.conversationGroupType;
        }

        return null

    }, [conversationId, friendMessages]);

    const nav = useNavigate();

    const abortControllerRef = useRef<AbortController | null>(null);

    const { jwtFetchHandler } = useJWTFetch();
    const { setAuthLevel } = useAuth();


    useEffect(() => {
        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        async function fetchConversationData() {

            if (!errorCtx) {
                console.error("Error context is not available");
                return;
            }

            if (!conversationId || typeof conversationId !== "string" || conversationId.trim() === "") {
                errorCtx.throwError({
                    message: "Invalid conversation ID. Please select a valid conversation!!!",
                    status: 400,
                    ok: false
                });
                return;
            }

            try {
                setIsLoading(true);

                const response = await jwtFetchHandler(`${domain}/api/conversations/${conversationId}`, {
                    method: "GET",
                    signal: controller.signal
                });

                if (controller !== abortControllerRef.current) {
                    console.log("Fetch aborted, ignoring response");
                    return;
                }

                if (response.returnType === "loginError") {
                    errorCtx.throwError(response.error);
                    setAuthLevel({ userType: "none" });
                    return;
                }

                if (response.returnType === "fetchError") {
                    errorCtx.throwError(response.error);
                    nav(errorPageRoute, {
                        replace: true,
                        state: {
                            error: response.error
                        }
                    });
                    return;
                }

                const conversationResponse = response.data;
                const conversationJSON = await conversationResponse.json();

                const conversationDataResult = ReceiveConversationMessagesAndHeaderInfoFrontendSchema.safeParse(conversationJSON);
                if (conversationDataResult.success) {
                    const messagesWithLocalUrlFiles: IConversationMessage[] = await Promise.all(
                        conversationDataResult.data.messages.map(async (message) => {
                            if (message.files) {
                                message.files = await Promise.all(
                                    message.files.map(async (file) => {
                                        if (file.fileDetails.fileType === "inline") {
                                            const res = await fetch(file.fileDetails.signedUrl);
                                            const blob = await res.blob();
                                            const localUrl = URL.createObjectURL(blob);

                                            return {
                                                ...file,
                                                fileDetails: {
                                                    ...file.fileDetails,
                                                    signedUrl: localUrl
                                                }
                                            }

                                        } else {
                                            const res = await fetch(file.fileDetails.supabaseId);
                                            const arrayBuffer = await res.arrayBuffer();

                                            const blob = new Blob(
                                                [arrayBuffer],
                                                {
                                                    type: file.fileDetails.mimetype
                                                }
                                            );

                                            const localUrl = URL.createObjectURL(blob);

                                            return {
                                                ...file,
                                                fileDetails: {
                                                    ...file.fileDetails,
                                                    supabaseId: localUrl
                                                }
                                            }

                                        }
                                    })
                                )
                            }

                            return message;
                        })

                    );


                    setConversationMessages(messagesWithLocalUrlFiles);
                    setConversationHeaderInfo(conversationDataResult.data.headerInfo);

                    return;
                }

                const errorResult = APIErrorSchema.safeParse(conversationJSON);
                if (errorResult.success) {
                    errorCtx.throwError(errorResult.data);
                    nav(errorPageRoute, {
                        replace: true,
                        state: {
                            error: errorResult.data
                        }
                    });
                    return;
                }

                errorCtx.throwError(notExpectedFormatError);
                nav(errorPageRoute, {
                    replace: true,
                    state: {
                        error: notExpectedFormatError
                    }
                });
                return;



            } catch (error: unknown) {
                if (controller !== abortControllerRef.current) {
                    console.log("Fetch aborted, ignoring error");
                    return;
                }

                if (!(error instanceof Error)) {
                    console.error("Unexpected error format:", error);
                    const unknownError: ICustomErrorResponse = {
                        message: "An unexpected error occurred. Please try again.",
                        status: 500,
                        ok: false
                    };
                    errorCtx.throwError(unknownError);
                    nav(errorPageRoute, {
                        replace: true,
                        state: {
                            error: unknownError
                        }
                    });
                    return;
                }

                const knownError: ICustomErrorResponse = {
                    message: error.message,
                    status: 500,
                    ok: false
                };

                errorCtx.throwError(knownError);
                nav(errorPageRoute, {
                    replace: true,
                    state: {
                        error: knownError
                    }
                });
                return;

                //MIGHT NEED TO NAV ON ERRORS HERE AS OTHERWISE CONVERSATION PAGE WILL BE BLANK WHEN LOADING ENDS, COULD BE GOOD TO HAVE AN ERROR STATE TO EACH PAGE AS WELL???

            } finally {
                if (controller !== abortControllerRef.current) {
                    return;
                }

                setIsLoading(false);

            }
        }

        fetchConversationData();



        return () => {
            //SO I NEED TO ABORT BUT ALSO HAVE NO EFFECT HAPPENING
            //PROBABLY SHOULD PUT A FLAG HERE INSTEAD BUT THIS SHOULD WORK
            abortControllerRef.current = null;
            controller.abort();

            conversationMessages.forEach((message) => {
                if (message.files) {
                    message.files.forEach((file) => {
                        if (file.fileDetails.fileType === "inline") {
                            URL.revokeObjectURL(file.fileDetails.signedUrl);
                        } else {
                            URL.revokeObjectURL(file.fileDetails.supabaseId);
                        }
                    });
                }
            });
        };

    }, [conversationId]);

    const isMessges = useMemo<boolean>(() => {
        return conversationMessages.length > 0;
    }, [conversationMessages]);


    //THIS ONE IS FOR CLEARING THE ISREAD PART OF THE CONVERSATION
    const { setFriendMessages } = useFriendMessageContext();
    useEffect(() => {
        setFriendMessages((prev) => {
            return prev.map((conversation) => {
                if (conversation.conversation.conversationId === conversationId) {
                    return {
                        ...conversation,
                        conversation: {
                            ...conversation.conversation,
                            isRead: true,
                        }
                    }
                } else {
                    return conversation;
                }
            });
        });

        return () => {

            async function markConversationAsRead() {
                try {
                    const response = await jwtFetchHandler(`${domain}/api/conversations/${conversationId}/mark_as_read`, {
                        method: "POST",
                    });

                    if (response.returnType === "fetchError") {
                        console.error("Error marking conversation as read:", response.error);
                        errorCtx?.throwError(response.error);
                        return;
                    }

                    if (response.returnType === "loginError") {
                        console.error("Login error while marking conversation as read:", response.error);
                        errorCtx?.throwError(response.error);
                        setAuthLevel({ userType: "none" });
                        return;
                    }

                    const resJSON = await response.data.json();

                    const successResult = APISuccessSchema.safeParse(resJSON);
                    if (successResult.success) {
                        console.log("Successfully marked conversation as read:", successResult.data);
                        return;
                    }

                    const errorResult = APIErrorSchema.safeParse(resJSON);
                    if (errorResult.success) {
                        console.error("API error while marking conversation as read:", errorResult.data);
                        errorCtx?.throwError(errorResult.data);
                        return;
                    }

                    console.error("Unexpected response format while marking conversation as read:", resJSON);
                    errorCtx?.throwError(notExpectedFormatError);
                    return;


                } catch (error) {
                    console.error("Error clearing isRead status:", error);

                    if (error instanceof Error) {
                        const knownError: ICustomErrorResponse = {
                            message: error.message,
                            status: 500,
                            ok: false
                        };
                        errorCtx?.throwError(knownError);
                        return;
                    }

                    errorCtx?.throwError(unknownError);
                    return;
                }

            }

            markConversationAsRead();


        }
    }, [conversationId]);


    const onMessageSent = (newMessage: IConversationMessage) => {
        setConversationMessages((prevMessages) => [...prevMessages, newMessage]);
    }

    const messagesContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const container = messagesContainerRef.current;

        if (!container) return;

        container.scrollTop = container.scrollHeight;
    }, []);

    return (
        <div className={styles.outerContainer}>

            <div className={styles.contentContainer}>

                {
                    isLoading ?

                        <div className={styles.loadingContainer}>

                            <LoadingCircle height="5rem" />

                        </div>

                        :

                        <>


                            {
                                conversationHeaderInfo &&
                                <ConversationHeader
                                    conversationId={conversationHeaderInfo.conversationId}
                                    name={conversationHeaderInfo.name}
                                    groupChatProfilePicture={conversationHeaderInfo.groupChatProfilePicture}
                                />
                            }


                            <div
                                className={`${!isMessges && styles.noMessagesContainer} ${styles.conversationContentsContainer}`}>
                                {
                                    isMessges && conversationGroupType ?

                                        <div ref={messagesContainerRef} className={styles.messagesContainer}>

                                            {
                                                conversationMessages.map((message) => (
                                                    <MessageComponent
                                                        key={message.messageId}
                                                        messageId={message.messageId}
                                                        conversationId={message.conversationId}
                                                        timestamp={message.timestamp}
                                                        content={message.content}
                                                        files={message.files}
                                                        conversationGroupType={conversationGroupType}
                                                        senderId={message.senderId}
                                                        senderName={message.senderName}
                                                        senderProfileImgUrl={message.senderProfileImgUrl}
                                                    />
                                                ))
                                            }

                                        </div>

                                        :

                                        <p className={styles.noMessagesText}>No messages in this conversation yet. Start the conversation by sending a message!</p>
                                }
                            </div>

                        </>


                }

            </div>



            <InputMessageComponent onMessageSent={onMessageSent} conversationId={conversationId} />



        </div>
    );
}