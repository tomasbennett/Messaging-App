import { Socket, io } from "socket.io-client";
import { IJWTFetchResponses } from "../models/IJWTFetchResponses";
import { useNewAccessToken } from "./useNewAccessToken";
import { accessTokenLocalStorageKey } from "../constants/accessTokenLocalStorageKey";
import { domain } from "../constants/EnvironmentAPI";
import { SOCKET_INVALID_ACCESS_TOKEN_MESSAGE } from "../../../shared/features/auth/constants";

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
                        token: newAccessToken.data
                    }
                });





                

                socket.once("connect", () => {
                    console.log("Connected to Socket.IO server", socket.id);
                    return resolve({
                        returnType: "response",
                        data: socket
                    })
                });

                socket.once(connectionErrorName, (err) => {
                    console.error("Connection error:", err);
                    return resolve({
                        returnType: "fetchError",
                        error: {
                            ok: false,
                            status: 500,
                            message: "Socket connection error: " + err.message
                        }
                    });
                });









                return;

            }

            const socket = io(`${domain}`, {
                withCredentials: true,
                auth: {
                    token: localStorageAccessToken
                }
            });

            socket.once("connect", () => {
                console.log("Connected to Socket.IO server", socket.id);
                return resolve({
                    returnType: "response",
                    data: socket
                });
            });

            socket.once(connectionErrorName, async (err) => {
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
                            token: newAccessToken.data
                        }
                    });

                    retrySocket.once("connect", () => {
                        console.log("Connected to Socket.IO server on retry", retrySocket.id);
                        return resolve({
                            returnType: "response",
                            data: retrySocket
                        });
                    });

                    retrySocket.once(connectionErrorName, (retryErr) => {
                        console.error("Retry connection error:", retryErr);
                        return resolve({
                            returnType: "fetchError",
                            error: {
                                ok: false,
                                status: 500,
                                message: "Socket connection error on retry: " + retryErr.message
                            }
                        });
                    });


                }

                return resolve({
                    returnType: "fetchError",
                    error: {
                        ok: false,
                        status: 500,
                        message: "Socket connection error: " + err.message
                    }
                });

            });


        });


    }


    return {
        getSocketHandler
    }

}