import React, { useEffect, useRef, useState } from "react";
import { ICustomErrorResponse } from "../../../../../shared/features/api/models/APIErrorResponse";
import styles from "./ErrorContext.module.css";
import { waitForAnimationEnd } from "../../../util/WaitForAnimationToEnd";
import { popupTime } from "../../../constants/popUpConstants";
import { usePopup } from "../../../hooks/usePopup";


const ErrorContext = React.createContext<{
    throwError: (error: ICustomErrorResponse) => void;
} | null>(null);


export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    // const [error, setError] = useState<ICustomErrorResponse | null>(null);

    // const queueRef = useRef<ICustomErrorResponse[]>([]);

    // const isProcessingRef = useRef(false);

    // const errorContainerRef = useRef<HTMLDivElement | null>(null);
    // const [isClosing, setIsClosing] = useState<boolean>(false);



    // const processQueue = async () => {
    //     if (isProcessingRef.current) return;

    //     isProcessingRef.current = true;

    //     while (queueRef.current.length > 0) {
    //         const nextError = queueRef.current.shift()!;

    //         setError(nextError);
    //         console.log(nextError.message);

    //         await new Promise((resolve) => setTimeout(resolve, popupTime));

    //         setIsClosing(true);

    //         if (errorContainerRef.current) {
    //             await waitForAnimationEnd(errorContainerRef.current);
    //         };

    //         setIsClosing(false);

    //         setError(null);
    //     }

    //     isProcessingRef.current = false;
    // };



    // const throwError = (error: ICustomErrorResponse) => {
    //     queueRef.current.push(error);
    //     processQueue();
    // };

    const {
        startPopup: throwError,
        infoContainerRef: errorContainerRef,
        isClosing,
        info: error
    } = usePopup<ICustomErrorResponse>();



    useEffect(() => {
        if (error) {
            console.log(error.message);
            console.dir(error);
        }
    }, [error]);

    return (
        <ErrorContext.Provider value={{ throwError }}>
            {
                children
            }
            {
                error && (
                    <>
                        <div
                            ref={errorContainerRef}
                            className={`${styles.outerContainer} ${isClosing ? styles.exitScreen : ""}`}
                        >
                            <strong>Error: {error.message}</strong>
                            <p>Status: {error.status}</p>
                        </div>
                    </>
                )
            }
        </ErrorContext.Provider>
    );
};


export const useError = () => {
    const context = React.useContext(ErrorContext);
    return context;
};