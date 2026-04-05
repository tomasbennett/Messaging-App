import { createContext, useContext, useEffect, useRef, useState } from "react";
import { IFriendPreviewMessages, ReceiveFriendPreviewMessagesFrontendSchema } from "../../../../../shared/features/conversation/models/IFriendPreviewMessages";
import { useError } from "../../error/contexts/ErrorContext";
import { IFriendMessagesContext } from "../models/IFriendMessagesContext";
import { notExpectedFormatError } from "../../../constants/errorConstants";
import { domain } from "../../../constants/EnvironmentAPI";
import { useNavigate } from "react-router-dom";
import { SendToSignInErrorHandler } from "../../../services/SendToSignInErrorHandler";
import { jwtFetchHandler } from "../../../services/BasicResponseHandle";
import { APIErrorSchema } from "../../../../../shared/features/api/models/APIErrorResponse";


const FriendMessageContext = createContext<IFriendMessagesContext | null>(null);


export function FriendMessageProvider({ children }: { children: React.ReactNode }) {

    const [friendMessages, setFriendMessages] = useState<IFriendPreviewMessages[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const errorCtx = useError();

    const abortController = useRef<AbortController | null>(null);

    const nav = useNavigate();

    useEffect(() => {

        async function fetchFriendMessages() {

            if (!errorCtx) {
                console.error("Error context is not available in MessageProvider!!!");
                return;
            }
    
            abortController.current?.abort();
            const controller = new AbortController();
            abortController.current = controller;
            
            try {
    
                const response = await jwtFetchHandler(`${domain}/api/conversations/preview`, {
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

                const friendsRes = response.data;
                const friendsMessagesJSON = await friendsRes.json();

                const friendsMessagesResult = ReceiveFriendPreviewMessagesFrontendSchema.safeParse(friendsMessagesJSON);
                if (friendsMessagesResult.success) {
                    setFriendMessages(friendsMessagesResult.data.friendPreviewsData);
                    return;
                }

                const errorResult = APIErrorSchema.safeParse(friendsMessagesJSON);
                if (errorResult.success) {
                    errorCtx.throwError(errorResult.data);
                    return;
                }

                console.error("Unexpected response format for friend messages:", friendsMessagesJSON);
                errorCtx.throwError(notExpectedFormatError);
                return;
    
    
    
    
            } catch (err: unknown) {
                if (controller !== abortController.current) return;
    
                console.error("Error fetching friend messages:", err);
    
                SendToSignInErrorHandler(err, nav);
                return;
                //MIGHT NEED TO NAVIGATE TO AN ERROR PAGE SHOULD THIS FAIL TO FETCH
    
    
    
            } finally {
                if (controller !== abortController.current) return;
    
                setIsLoading(false);
            }

        }

        fetchFriendMessages();

    }, []);

    const ctx: IFriendMessagesContext = {
        friendMessages,
        setFriendMessages,
        isLoading,
    }


    return (
        <FriendMessageContext.Provider value={ctx}>
            {children}
        </FriendMessageContext.Provider>
    );
}



export function useMessageContext() {
    const context = useContext(FriendMessageContext);
    return context;
}