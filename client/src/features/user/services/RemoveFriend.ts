import { NavigateFunction } from "react-router-dom";
import { IJWTFetchResponses } from "../../../models/IJWTFetchResponses";
import { jwtFetchHandler } from "../../../services/BasicResponseHandle";
import { APIErrorSchema } from "../../../../../shared/features/api/models/APIErrorResponse";
import { notExpectedFormatError } from "../../../constants/errorConstants";
import { domain } from "../../../constants/EnvironmentAPI";

export async function removeFriend(friendId: string, nav: NavigateFunction): Promise<IJWTFetchResponses<{ successfulFriendRemovedId: string }> | null> {
    try {

        const response = await jwtFetchHandler(`${domain}/api/friends/${friendId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        }, nav);

        if (!response) {
            return null;
        }

        if (response.returnType !== "response") {
            return response;
        }

        if (response.data.status === 204) {
            return {
                returnType: "response",
                data: {
                    successfulFriendRemovedId: friendId
                }
            };
        }

        const responseJSON = await response.data.json();

        const customErrorResult = APIErrorSchema.safeParse(responseJSON);
        if (customErrorResult.success) {
            return {
                returnType: "loginError",
                error: customErrorResult.data
            };
        }

        return {
            returnType: "loginError",
            error: notExpectedFormatError
        };

        
    } catch (error: unknown) {

        console.error("Error removing friend:", error);

        if (error instanceof Error) {
            return {
                returnType: "loginError",
                error: {
                    message: error.message,
                    status: 0,
                    ok: false
                }
            };
        }

        return {
            returnType: "loginError",
            error: {
                message: "An unknown error occurred while removing the friend.",
                status: 0,
                ok: false
            }
        };

    }
}