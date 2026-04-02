import { createContext, useContext, useEffect, useRef, useState } from "react";
import { IFriendPreviewMessages } from "../../../../../shared/features/conversation/models/IFriendPreviewMessages";
import { useError } from "../../error/contexts/ErrorContext";
import { IFriendMessagesContext } from "../models/IFriendMessagesContext";
import { notExpectedFormatError } from "../../../constants/errorConstants";
import { domain } from "../../../constants/EnvironmentAPI";
import { useNavigate } from "react-router-dom";


const MessageContext = createContext<IFriendMessagesContext | null>(null);


export function MessageProvider({ children }: { children: React.ReactNode }) {

    const [friendMessages, setFriendMessages] = useState<IFriendPreviewMessages[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const errorCtx = useError();

    const abortController = useRef<AbortController | null>(null);

    const nav = useNavigate();

    useEffect(() => {
        if (!errorCtx) {
            console.error("Error context is not available in MessageProvider!!!");
            return;
        }

        abortController.current?.abort();
        const controller = new AbortController();
        abortController.current = controller;

        try {

            




        } catch (err) {
            if (controller !== abortController.current) return;

            console.error("Error fetching friend messages:", err);

            if (!(err instanceof Error)) {
                nav('/error', {
                    replace: true,
                    state: {
                        error: notExpectedFormatError
                    }
                });

                return;

            }

            nav('/error', {
                replace: true,
                state: {
                    error: {
                        ok: false,
                        status: 0,
                        message: err.message || "An unexpected error occurred while fetching friend messages."
                    }
                }
            });


            return;
            //MIGHT NEED TO NAVIGATE TO AN ERROR PAGE SHOULD THIS FAIL TO FETCH



        } finally {
            if (controller !== abortController.current) return;

            setIsLoading(false);
        }
    }, []);

    const ctx: IFriendMessagesContext = {
        friendMessages,
        setFriendMessages,
        isLoading,
    }


    return (
        <MessageContext.Provider value={ctx}>
            {children}
        </MessageContext.Provider>
    );
}



export function useMessageContext() {
    const context = useContext(MessageContext);
    return context;
}