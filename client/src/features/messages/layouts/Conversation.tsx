import { useEffect, useRef, useState } from "react";
import styles from "./Conversation.module.css";
import { useError } from "../../error/contexts/ErrorContext";
import { useNavigate, useParams } from "react-router-dom";
import { domain } from "../../../constants/EnvironmentAPI";
import { APIErrorSchema, ICustomErrorResponse } from "../../../../../shared/features/api/models/APIErrorResponse";
import { notExpectedFormatError } from "../../../constants/errorConstants";
import { IConversationMessage, ReceiveConversationMessagesFrontendSchema } from "../../../../../shared/features/message/models/IConversationMessage";
import { LoadingCircle } from "../../../components/LoadingCircle";
import { InputMessageComponent } from "../components/InputMessage";
import { MessageComponent } from "../components/Message";
import { useJWTFetch } from "../../../hooks/useNewAccessToken";
import { errorPageRoute } from "../../../constants/routes";
import { useAuth } from "../../auth/contexts/AuthContext";




export function ConversationLayout() {

    const { conversationId } = useParams<{ conversationId: string }>();


    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [conversationMessages, setConversationMessages] = useState<IConversationMessage[]>([]);

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

                if (!response) {
                    return;
                }

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

                const conversationDataResult = ReceiveConversationMessagesFrontendSchema.safeParse(conversationJSON);
                if (conversationDataResult.success) {
                    setConversationMessages(conversationDataResult.data.messages);
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
        };

    }, [conversationId]);




    return (
        <div className={styles.outerContainer}>

            <div className={styles.contentContainer}>

                {
                    isLoading ?

                        <div className={styles.loadingContainer}>

                            <LoadingCircle height="5rem" />

                        </div>

                        :


                        conversationMessages.length > 0 ?

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

            <div className={styles.inputContainer}>

                <InputMessageComponent />

            </div>


        </div>
    );
}