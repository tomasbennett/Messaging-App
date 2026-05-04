import { useState } from "react";
import { domain } from "../../../constants/EnvironmentAPI";
import { useNavigate } from "react-router-dom";
import { APIErrorSchema, ICustomErrorResponse } from "../../../../../shared/features/api/models/APIErrorResponse";
import { APISuccessSchema, ICustomSuccessMessage } from "../../../../../shared/features/api/models/APISuccessResponse";
import { ReceiveFriendRequestConfirmationFrontendSchema } from "../../../../../shared/features/inviteReq/models/IFrontendFriendRequest";
import { notExpectedFormatError } from "../../../constants/errorConstants";
import { errorPageRoute } from "../../../constants/routes";
import { useJWTFetch } from "../../../hooks/useJWTFetch";
import { useAuth } from "../../auth/contexts/AuthContext";
import { useError } from "../../error/contexts/ErrorContext";
import { useSocket } from "../../../contexts/SocketHandlerContext";
import { IBaseSocketEmitData } from "../../../../../shared/features/sockets/models/IBaseSocketReqData";

export function useConversationParticipantStatus(conversationId: string) {

    
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const errorCtx = useError();
    const nav = useNavigate();
    const { setAuthLevel } = useAuth();
    const { jwtFetchHandler } = useJWTFetch();
    const socket = useSocket();

    const socketReqBody: IBaseSocketEmitData = {
        userSocketId: socket.id!
    }

    const conversationsUrl = `${domain}/api/conversations`;


    async function addToConversation(friendId: string): Promise<ICustomErrorResponse | ICustomSuccessMessage> {
        console.log(`Adding friend with ID: ${friendId}`);

        if (!errorCtx) {
            console.error("Error context is not available");
            return {
                message: "Error context is not available",
                status: 0,
                ok: false
            };
        }

        try {
            setIsLoading(true);

            const response = await jwtFetchHandler(`${conversationsUrl}/${conversationId}/add/${friendId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(socketReqBody)
            });


            if (response.returnType === "loginError") {
                errorCtx.throwError(response.error);
                setAuthLevel({ userType: "none" });
                return {
                    message: response.error.message,
                    status: response.error.status,
                    ok: false
                };
            }

            if (response.returnType === "fetchError") {
                errorCtx.throwError(response.error);
                nav(errorPageRoute, {
                    replace: true,
                    state: {
                        error: response.error
                    }
                });
                return {
                    message: response.error.message,
                    status: response.error.status,
                    ok: false
                };
            }

            const addFriendResponse = response.data;
            const addFriendResponseJSON = await addFriendResponse.json();

            const addFriendResult = ReceiveFriendRequestConfirmationFrontendSchema.safeParse(addFriendResponseJSON);
            if (addFriendResult.success) {
                return {
                    message: addFriendResult.data.message,
                    status: addFriendResponse.status,
                    ok: true
                };
            }


            const customErrorResult = APIErrorSchema.safeParse(addFriendResponseJSON);
            if (customErrorResult.success) {
                errorCtx.throwError(customErrorResult.data);
                return {
                    message: customErrorResult.data.message,
                    status: customErrorResult.data.status,
                    ok: false
                };
            }

            errorCtx.throwError(notExpectedFormatError);
            return {
                message: notExpectedFormatError.message,
                status: notExpectedFormatError.status,
                ok: false
            };


        } catch (error: unknown) {

            if (error instanceof Error) {
                errorCtx.throwError({
                    message: error.message,
                    status: 0,
                    ok: false
                });
                return {
                    message: error.message,
                    status: 0,
                    ok: false
                };
            }

            errorCtx.throwError({
                message: "An unknown error occurred while sending the friend request.",
                status: 0,
                ok: false
            });
            return {
                message: "An unknown error occurred while sending the friend request.",
                status: 0,
                ok: false
            };

        } finally {
            setIsLoading(false);
        }

    }

    async function leaveConversation(): Promise<ICustomErrorResponse | ICustomSuccessMessage> {

        if (!errorCtx) {
            console.error("Error context is not available");
            return {
                message: "Error context is not available",
                status: 0,
                ok: false
            };
        }

        try {
            setIsLoading(true);


            const response = await jwtFetchHandler(`${conversationsUrl}/${conversationId}/leave`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(socketReqBody)
            });

            if (!response) {
                return {
                    message: "No response from server",
                    status: 0,
                    ok: false
                };
            }

            if (response.returnType === "loginError") {
                errorCtx.throwError(response.error);
                setAuthLevel({ userType: "none" });
                return {
                    message: response.error.message,
                    status: response.error.status,
                    ok: false
                };
            }

            if (response.returnType === "fetchError") {
                errorCtx.throwError(response.error);
                // nav(errorPageRoute, {
                //     state: {
                //         error: response.error
                //     }
                // });
                return {
                    message: response.error.message,
                    status: response.error.status,
                    ok: false
                };
            }

            const removeFriendResponse = response.data;

            if (removeFriendResponse.status === 204) {
                return {
                    message: "Successfully left the conversation.",
                    status: 204,
                    ok: true
                }
            }

            const removeFriendResponseJSON = await removeFriendResponse.json();

            const customErrorResult = APIErrorSchema.safeParse(removeFriendResponseJSON);
            if (customErrorResult.success) {
                errorCtx.throwError(customErrorResult.data);
                return {
                    message: customErrorResult.data.message,
                    status: customErrorResult.data.status,
                    ok: false
                };
            }

            errorCtx.throwError(notExpectedFormatError);
            return {
                message: notExpectedFormatError.message,
                status: notExpectedFormatError.status,
                ok: false
            };



        } catch (error: unknown) {

            if (error instanceof Error) {
                errorCtx.throwError({
                    message: error.message,
                    status: 0,
                    ok: false
                });
                return {
                    message: error.message,
                    status: 0,
                    ok: false
                };
            }

            errorCtx.throwError({
                message: "An unknown error occurred while sending the friend request.",
                status: 0,
                ok: false
            });
            return {
                message: "An unknown error occurred while sending the friend request.",
                status: 0,
                ok: false
            };

        } finally {
            setIsLoading(false);
        }

    }

    async function acceptRequest(): Promise<ICustomErrorResponse | ICustomSuccessMessage> {
        if (!errorCtx) {
            console.error("Error context is not available");
            return {
                message: "Error context is not available",
                status: 0,
                ok: false
            };
        }

        try {
            setIsLoading(true);

            const response = await jwtFetchHandler(`${conversationsUrl}/${conversationId}/acceptInvite`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(socketReqBody)
            });

            if (!response) {
                return {
                    message: "No response from server",
                    status: 0,
                    ok: false
                };
            }

            if (response.returnType === "loginError") {
                errorCtx.throwError(response.error);
                setAuthLevel({ userType: "none" });
                return {
                    message: response.error.message,
                    status: response.error.status,
                    ok: false
                };
            }

            if (response.returnType === "fetchError") {
                errorCtx.throwError(response.error);
                // nav(errorPageRoute, {
                //     state: {
                //         error: response.error
                //     }
                // });
                return {
                    message: response.error.message,
                    status: response.error.status,
                    ok: false
                };
            }

            const aacceptFriendReqResponse = response.data;
            const acceptFriendReqJSON = await aacceptFriendReqResponse.json();

            const acceptFriendResult = APISuccessSchema.safeParse(acceptFriendReqJSON);
            if (acceptFriendResult.success) {
                return {
                    message: acceptFriendResult.data.message,
                    status: aacceptFriendReqResponse.status,
                    ok: true
                }
            }


            const customErrorResult = APIErrorSchema.safeParse(acceptFriendReqJSON);
            if (customErrorResult.success) {
                errorCtx.throwError(customErrorResult.data);
                return {
                    message: customErrorResult.data.message,
                    status: customErrorResult.data.status,
                    ok: false
                };
            }

            errorCtx.throwError(notExpectedFormatError);
            return {
                message: notExpectedFormatError.message,
                status: notExpectedFormatError.status,
                ok: false
            };



        } catch (error: unknown) {

            if (error instanceof Error) {
                errorCtx.throwError({
                    message: error.message,
                    status: 0,
                    ok: false
                });
                return {
                    message: error.message,
                    status: 0,
                    ok: false
                };
            }

            errorCtx.throwError({
                message: "An unknown error occurred while sending the friend request.",
                status: 0,
                ok: false
            });
            return {
                message: "An unknown error occurred while sending the friend request.",
                status: 0,
                ok: false
            };

        } finally {
            setIsLoading(false);
        }
    }

    async function declineRequest(): Promise<ICustomErrorResponse | ICustomSuccessMessage> {
        // Similar to removeFriend but with a different endpoint or body if needed

        if (!errorCtx) {
            console.error("Error context is not available");
            return {
                message: "Error context is not available",
                status: 0,
                ok: false
            };
        }

        try {
            setIsLoading(true);

            const response = await jwtFetchHandler(`${conversationsUrl}/${conversationId}/acceptInvite`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(socketReqBody)
            });

            if (!response) {
                return {
                    message: "No response from server",
                    status: 0,
                    ok: false
                };
            }

            if (response.returnType === "loginError") {
                errorCtx.throwError(response.error);
                setAuthLevel({ userType: "none" });
                return {
                    message: response.error.message,
                    status: response.error.status,
                    ok: false
                };
            }

            if (response.returnType === "fetchError") {
                errorCtx.throwError(response.error);
                // nav(errorPageRoute, {
                //     state: {
                //         error: response.error
                //     }
                // });
                return {
                    message: response.error.message,
                    status: response.error.status,
                    ok: false
                };
            }

            const aacceptFriendReqResponse = response.data;
            const acceptFriendReqJSON = await aacceptFriendReqResponse.json();

            const acceptFriendResult = APISuccessSchema.safeParse(acceptFriendReqJSON);
            if (acceptFriendResult.success) {
                return {
                    message: acceptFriendResult.data.message,
                    status: aacceptFriendReqResponse.status,
                    ok: true
                }
            }


            const customErrorResult = APIErrorSchema.safeParse(acceptFriendReqJSON);
            if (customErrorResult.success) {
                errorCtx.throwError(customErrorResult.data);
                return {
                    message: customErrorResult.data.message,
                    status: customErrorResult.data.status,
                    ok: false
                };
            }

            errorCtx.throwError(notExpectedFormatError);
            return {
                message: notExpectedFormatError.message,
                status: notExpectedFormatError.status,
                ok: false
            };



        } catch (error: unknown) {

            if (error instanceof Error) {
                errorCtx.throwError({
                    message: error.message,
                    status: 0,
                    ok: false
                });
                return {
                    message: error.message,
                    status: 0,
                    ok: false
                };
            }

            errorCtx.throwError({
                message: "An unknown error occurred while sending the friend request.",
                status: 0,
                ok: false
            });
            return {
                message: "An unknown error occurred while sending the friend request.",
                status: 0,
                ok: false
            };

        } finally {
            setIsLoading(false);
        }


    }

    return { addToConversation, leaveConversation, acceptRequest, declineRequest, isLoading };
}