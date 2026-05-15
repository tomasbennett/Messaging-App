import { useState, useRef } from "react";
import { ICustomErrorResponse } from "../../../shared/features/api/models/APIErrorResponse";
import { popupTime } from "../constants/popUpConstants";
import { waitForAnimationEnd } from "../util/WaitForAnimationToEnd";

export function usePopup<T>() {
    const [info, setInfo] = useState<T | null>(null);

    const queueRef = useRef<T[]>([]);

    const isProcessingRef = useRef(false);

    const infoContainerRef = useRef<HTMLDivElement | null>(null);
    const [isClosing, setIsClosing] = useState<boolean>(false);


    const processQueue = async () => {
        if (isProcessingRef.current) return;

        isProcessingRef.current = true;

        while (queueRef.current.length > 0) {
            const nextInfo = queueRef.current.shift()!;

            setInfo(nextInfo);

            await new Promise((resolve) => setTimeout(resolve, popupTime));

            setIsClosing(true);

            if (infoContainerRef.current) {
                await waitForAnimationEnd(infoContainerRef.current);
            };

            setIsClosing(false);

            setInfo(null);
        }

        isProcessingRef.current = false;
    };



    const startPopup = (info: T) => {
        queueRef.current.push(info);
        processQueue();
    };



    return {
        startPopup,
        isClosing,
        infoContainerRef,
        info
    }



}