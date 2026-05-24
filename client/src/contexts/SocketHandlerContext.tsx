import React, { useContext, useEffect } from "react";
import { Socket, io } from "socket.io-client";
import { domain } from "../constants/EnvironmentAPI";
import { useNewAccessToken } from "../hooks/useNewAccessToken";
import { useJWTSocketConnection } from "../hooks/useJWTSocketConnection";
import { useAuth } from "../features/auth/contexts/AuthContext";
import { useError } from "../features/error/contexts/ErrorContext";
import { LoadingCircle } from "../components/LoadingCircle";
import styles from "./SocketHandlerContext.module.css";

export const SocketContext = React.createContext<Socket | null>(null);


export type ISocketProviderContext = Socket | null;


export const SocketProvider = ({
    children
}: { children: React.ReactNode }) => {

    const [socket, setSocket] = React.useState<Socket | null>(null);
    const [isConnecting, setIsConnecting] = React.useState<boolean>(true);
    const { getSocketHandler } = useJWTSocketConnection();
    const { setAuthLevel } = useAuth();
    const errorCtx = useError();

    useEffect(() => {

        async function connectSocket() {

            if (!errorCtx) {
                console.error("Error context is not available in SocketProvider");
                return;
            }

            setIsConnecting(true);


            const socketAttempt = await getSocketHandler();
            if (socketAttempt.returnType === "fetchError" || socketAttempt.returnType === "loginError") {
                console.error("Error connecting to socket:", socketAttempt.error);
                setAuthLevel({ userType: "none" });
                errorCtx.throwError(socketAttempt.error);
                return;

            }

            const newSocket = socketAttempt.data;
            setSocket(newSocket);
            console.log("Connected to socket with id:", newSocket.id);

            setIsConnecting(false);



        }

        connectSocket();


        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, []);


    const ctx: ISocketProviderContext = socket;


    return (
        <SocketContext.Provider value={ctx}>


            {
                isConnecting ?

                    <div className={styles.loadingContainer}>

                        <LoadingCircle height="5rem" />

                    </div>

                :

                children

            }


        </SocketContext.Provider>
    );
}



export function useSocket() {
    const socket = useContext(SocketContext);

    if (!socket || !(socket?.id)) {
        throw new Error("Socket not available");
    }

    return socket;
}