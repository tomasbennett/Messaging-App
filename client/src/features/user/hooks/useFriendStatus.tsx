import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useError } from "../../error/contexts/ErrorContext";
import { useAuth } from "../../auth/contexts/AuthContext";
import { IFriendRequestStatus } from "../../../../../shared/features/friendRequest/constants";
import { useJWTFetch } from "../../../hooks/useNewAccessToken";
import { domain } from "../../../constants/EnvironmentAPI";
import { errorPageRoute } from "../../../constants/routes";
import { APIErrorSchema } from "../../../../../shared/features/api/models/APIErrorResponse";
import { notExpectedFormatError } from "../../../constants/errorConstants";
import { ReceiveFriendRequestConfirmationFrontendSchema } from "../../../../../shared/features/friendRequest/models/IFrontendFriendRequest";

export function useFriendStatus(
    friendId: string,
    updateFriendStatus: (newStatus: IFriendRequestStatus) => void,
) {

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const errorCtx = useError();
    const nav = useNavigate();
    const { setAuthLevel } = useAuth();
    const { jwtFetchHandler } = useJWTFetch();


    async function addFriend() {
        console.log(`Adding friend with ID: ${friendId}`);

        if (!errorCtx) {
            console.error("Error context is not available");
            return;
        }

        try {
            setIsLoading(true);

            const response = await jwtFetchHandler(`${domain}/api/friends/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    friendUserId: friendId
                })
            });

            if (!response) {
                return;
            }

            if (response.returnType === "loginError") {
                errorCtx.throwError(response.error);
                setAuthLevel({ userType: "none" });
                return;
            }

            if (response.returnType === "fetchError") {
                errorCtx.throwError(response.error);
                // nav(errorPageRoute, {
                //     state: {
                //         error: response.error
                //     }
                // });
                return;
            }

            const addFriendResponse = response.data;
            const addFriendResponseJSON = await addFriendResponse.json();

            const addFriendResult = ReceiveFriendRequestConfirmationFrontendSchema.safeParse(addFriendResponseJSON);
            if (addFriendResult.success) {
                updateFriendStatus("pending");
                return;
            }


            const customErrorResult = APIErrorSchema.safeParse(addFriendResponseJSON);
            if (customErrorResult.success) {
                errorCtx.throwError(customErrorResult.data);
                return;
            }

            errorCtx.throwError(notExpectedFormatError);
            return;


        } catch (error: unknown) {

            if (error instanceof Error) {
                errorCtx.throwError({
                    message: error.message,
                    status: 0,
                    ok: false
                });
                return;
            }

            errorCtx.throwError({
                message: "An unknown error occurred while sending the friend request.",
                status: 0,
                ok: false
            });
            return;

        } finally {
            setIsLoading(false);
        }

    }


    async function removeFriend() {
        console.log(`Removing friend with ID: ${friendId}`);

        if (!errorCtx) {
            console.error("Error context is not available");
            return;
        }

        try {
            setIsLoading(true);


            const response = await jwtFetchHandler(`${domain}/api/friends/${friendId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response) {
                return;
            }

            if (response.returnType === "loginError") {
                errorCtx.throwError(response.error);
                setAuthLevel({ userType: "none" });
                return;
            }

            if (response.returnType === "fetchError") {
                errorCtx.throwError(response.error);
                // nav(errorPageRoute, {
                //     state: {
                //         error: response.error
                //     }
                // });
                return;
            }

            const removeFriendResponse = response.data;

            if (removeFriendResponse.status === 204) {
                updateFriendStatus("no request sent yet");
                return;
            }

            const removeFriendResponseJSON = await removeFriendResponse.json();

            const customErrorResult = APIErrorSchema.safeParse(removeFriendResponseJSON);
            if (customErrorResult.success) {
                errorCtx.throwError(customErrorResult.data);
                return;
            }

            errorCtx.throwError(notExpectedFormatError);
            return;



        } catch (error: unknown) {

            if (error instanceof Error) {
                errorCtx.throwError({
                    message: error.message,
                    status: 0,
                    ok: false
                });
                return;
            }

            errorCtx.throwError({
                message: "An unknown error occurred while sending the friend request.",
                status: 0,
                ok: false
            });
            return;

        } finally {
            setIsLoading(false);
        }

    }

    return { addFriend, removeFriend, isLoading };
}