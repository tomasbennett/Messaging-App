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
    
    const error = useError();

    const abortController = useRef<AbortController | null>(null);

    const nav = useNavigate();

    useEffect(() => {
        if (!error) {
            console.error("Error context is not available in MessageProvider!!!");
            return;
        }

        try {
            abortController.current?.abort();
            abortController.current = new AbortController();
            const signal = abortController.current.signal;


            const response = fetch(`${domain}/api/`);


            
        } catch (err) {
            console.error("Error fetching friend messages:", err);
            if (!(err instanceof Error)) {
                error.throwError(notExpectedFormatError);
                return;
            }

            if (err.name === "AbortError") {
                console.log("Fetch aborted");
                return;
            }

            error.throwError({
                message: err.message,
                status: 0,
                ok: false,
            });
            
            return;
            //MIGHT NEED TO NAVIGATE TO AN ERROR PAGE SHOULD THIS FAIL TO FETCH


            
        } finally {
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