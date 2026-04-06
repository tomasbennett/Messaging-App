import { useEffect, useRef, useState } from "react";
import styles from "./Conversation.module.css";
import { useError } from "../../error/contexts/ErrorContext";
import { useNavigate, useParams } from "react-router-dom";
import { jwtFetchHandler } from "../../../services/BasicResponseHandle";
import { domain } from "../../../constants/EnvironmentAPI";
import { APIErrorSchema } from "../../../../../shared/features/api/models/APIErrorResponse";
import { notExpectedFormatError } from "../../../constants/errorConstants";




export function ConversationLayout() {

    const { conversationId } = useParams<{ conversationId: string }>();


    const [isLoading, setIsLoading] = useState<boolean>(false);

    const errorCtx = useError();

    const nav = useNavigate();

    const abortControllerRef = useRef<AbortController | null>(null);


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
                }, nav);

                if (!response) {
                    return;
                }

                if (response.returnType !== "response") {
                    errorCtx.throwError(response.error);
                    return;
                }

                const conversationResponse = response.data;
                const conversationJSON = await conversationResponse.json();
    
                const conversationDataResult = .safeParse(conversationJSON);
                if (conversationDataResult.success) {
                    // setConversationData(conversationDataResult.data);
                    return;
                }

                const errorResult = APIErrorSchema.safeParse(conversationJSON);
                if (errorResult.success) {
                    errorCtx.throwError(errorResult.data);
                    return;
                }

                errorCtx.throwError(notExpectedFormatError);
                return;
    
    
                
            } catch (error: unknown) {
                if (controller !== abortControllerRef.current) {
                    console.log("Fetch aborted, ignoring error");
                    return;
                }
    
                if (!(error instanceof Error)) {
                    console.error("Unexpected error format:", error);
                    errorCtx.throwError({
                        message: "An unexpected error occurred. Please try again.",
                        status: 500,
                        ok: false
                    });
                    return;
                }
    
                if (error.name === "AbortError") {
                    console.log("Fetch aborted, ignoring error");
                    return;
                }
    
                errorCtx.throwError({
                    message: error.message,
                    status: 0,
                    ok: false
                });
    
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
            controller.abort();
        };


    }, []);




    return (
        <div className={styles.outerContainer}>

            <p className={styles.placeholderText}>Select a conversation to start chatting!</p>

        </div>
    );
}