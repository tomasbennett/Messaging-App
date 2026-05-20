import { useState, useRef, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { APIErrorSchema, ICustomErrorResponse } from "../../../../../shared/features/api/models/APIErrorResponse";
import { IConversationHeaderInfo } from "../../../../../shared/features/conversation/models/IHeaderInfo";
import { IConversationMessage, ReceiveConversationMessagesAndHeaderInfoFrontendSchema } from "../../../../../shared/features/message/models/IConversationMessage";
import { LoadingCircle } from "../../../components/LoadingCircle";
import { notExpectedFormatError } from "../../../constants/errorConstants";
import { errorPageRoute } from "../../../constants/routes";
import { useJWTFetch } from "../../../hooks/useJWTFetch";
import { useAuth } from "../../auth/contexts/AuthContext";
import { useError } from "../../error/contexts/ErrorContext";
import styles from "./ConversationBody.module.css";
import { ConversationHeader } from "../components/ConversationHeader";
import { InputMessageComponent } from "../components/InputMessage";
import { MessageComponent } from "../components/Message";
import { domain } from "../../../constants/EnvironmentAPI";


export function ConversationBody() {

    const { conversationId } = useParams<{ conversationId: string }>();


    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [conversationMessages, setConversationMessages] = useState<IConversationMessage[]>([]);
    const [conversationHeaderInfo, setConversationHeaderInfo] = useState<IConversationHeaderInfo | null>(null);
    const conversationGroupType = ;

    const errorCtx = useError();

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
                    setConversationMessages(conversationDataResult.data.messages);
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



    const onMessageSent = (newMessage: IConversationMessage) => {
        setConversationMessages((prevMessages) => [...prevMessages, newMessage]);
    }


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
                                    isMessges ?

                                        <div className={styles.messagesContainer}>

                                            {
                                                conversationMessages.map((message) => (
                                                    <MessageComponent
                                                        key={message.messageId}
                                                        messageId={message.messageId}
                                                        conversationId={message.conversationId}
                                                        timestamp={message.timestamp}
                                                        content={message.content}
                                                        files={message.files}
                                                        conversationGroupType={message.conversationGroupType}
                                                        senderId={message.senderId}
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



            <InputMessageComponent onMessageSent={onMessageSent} conversationDetails={{
                conversationId: ,
                // conversationGroupType: ,
                senderId: ,
            }} />



        </div>
    );
}