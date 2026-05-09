import { Socket, io } from "socket.io-client";
import { IJWTFetchResponses } from "../models/IJWTFetchResponses";
import { useNewAccessToken } from "./useNewAccessToken";
import { accessTokenLocalStorageKey } from "../constants/accessTokenLocalStorageKey";
import { domain } from "../constants/EnvironmentAPI";
import { SOCKET_INVALID_ACCESS_TOKEN_MESSAGE } from "../../../shared/features/auth/constants";
import { usePairSocketListeners } from "./usePairSocketListeners";

export function useJWTSocketConnection() {

    const { refreshAccessToken } = useNewAccessToken();

    function getSocketHandler(): Promise<IJWTFetchResponses<Socket>> {

        return new Promise(async (resolve, reject) => {
            const connectionErrorName: string = "connect_error";

            const localStorageAccessToken = localStorage.getItem(accessTokenLocalStorageKey);

            if (!localStorageAccessToken) {
                const newAccessToken = await refreshAccessToken();
                if (newAccessToken.returnType === "fetchError" || newAccessToken.returnType === "loginError") {
                    return resolve(newAccessToken);
                }

                const socket = io(`${domain}`, {
                    withCredentials: true,
                    auth: {
                        token: "Bearer " + newAccessToken.data
                    }
                });




                const handleConnectionError = (err: unknown) => {
                    
                    console.error("Connection error:", err);
                    return resolve({
                        returnType: "fetchError",
                        error: {
                            ok: false,
                            status: 500,
                            message: "Socket connection error: " + (err instanceof Error ? err.message : String(err))
                        }
                    });
                }

                const handleConnect = () => {
                    console.log("Connected to Socket.IO server", socket.id);
                    return resolve({
                        returnType: "response",
                        data: socket
                    });
                }
                
                usePairSocketListeners(socket, handleConnect, handleConnectionError);
                return;

            }

            const socket = io(`${domain}`, {
                withCredentials: true,
                auth: {
                    token: "Bearer " + localStorageAccessToken
                }
            });



            const handleConnectionError = async (err: unknown) => {
                if (!(err instanceof Error)) {
                    console.error("Connection error:", err);
                    return resolve({
                        returnType: "fetchError",
                        error: {
                            ok: false,
                            status: 500,
                            message: "Socket connection error"
                        }
                    });
                }

                const errMessage = err.message;

                if (errMessage === SOCKET_INVALID_ACCESS_TOKEN_MESSAGE) {
                    const newAccessToken = await refreshAccessToken();
                    if (newAccessToken.returnType === "fetchError" || newAccessToken.returnType === "loginError") {
                        return resolve(newAccessToken);
                    }



                    const retrySocket = io(`${domain}`, {
                        withCredentials: true,
                        auth: {
                            token: "Bearer " + newAccessToken.data
                        }
                    });


                    const retryHandleConnectionError = (retryErr: unknown) => {
                        console.error("Retry connection error:", retryErr);

                        if (!(retryErr instanceof Error)) {
                            return resolve({
                                returnType: "fetchError",
                                error: {
                                    ok: false,
                                    status: 500,
                                    message: "Socket connection error on retry"
                                }
                            });
                        }

                        return resolve({
                            returnType: "fetchError",
                            error: {
                                ok: false,
                                status: 500,
                                message: "Socket connection error on retry: " + retryErr.message
                            }
                        });
                    }

                    const retryHandleConnect = () => {
                        console.log("Connected to Socket.IO server on retry", retrySocket.id);
                        return resolve({
                            returnType: "response",
                            data: retrySocket
                        });
                    }


                    usePairSocketListeners(retrySocket, retryHandleConnect, retryHandleConnectionError);

                    return;

                }

                return resolve({
                    returnType: "fetchError",
                    error: {
                        ok: false,
                        status: 500,
                        message: "Socket connection error: " + err.message
                    }
                });

            }

            const handleConnect = () => {
                console.log("Connected to Socket.IO server", socket.id);
                return resolve({
                    returnType: "response",
                    data: socket
                });
            }

            usePairSocketListeners(socket, handleConnect, handleConnectionError);


        });


    }


    return {
        getSocketHandler
    }

}