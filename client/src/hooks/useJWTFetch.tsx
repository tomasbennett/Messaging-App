import { useNavigate } from "react-router-dom";
import { APIErrorSchema, ICustomErrorResponse } from "../../../shared/features/api/models/APIErrorResponse";
import { invalidRefreshTokenStatus } from "../../../shared/features/auth/constants";
import { domain } from "../constants/EnvironmentAPI";
import { errorPageRoute } from "../constants/routes";
import { useAuth } from "../features/auth/contexts/AuthContext";
import { useError } from "../features/error/contexts/ErrorContext";
import { AccessTokenResponseSchema } from "../../../shared/features/auth/models/IAccessTokenResponse";
import { accessTokenLocalStorageKey } from "../constants/accessTokenLocalStorageKey";
import { notExpectedFormatError } from "../constants/errorConstants";
import { IJWTFetchResponses } from "../models/IJWTFetchResponses";
import { useNewAccessToken } from "./useNewAccessToken";




export function useJWTFetch() {
    // const errorCtx = useError();
    // const navigate = useNavigate();


    const { refreshAccessToken } = useNewAccessToken();


    async function jwtFetchHandler(
        url: string,
        fetchOptions: RequestInit,
    ): Promise<IJWTFetchResponses<Response>> {

        
        try {
            const localStorageAccessToken = localStorage.getItem(accessTokenLocalStorageKey);
            
            if (!localStorageAccessToken) {
                const newAccessToken = await refreshAccessToken();
                if (newAccessToken.returnType === "fetchError" || newAccessToken.returnType === "loginError") {
                    return newAccessToken;
                }
                const authFetchOptions: RequestInit = {
                    ...fetchOptions,
                    headers: {
                        ...fetchOptions?.headers,
                        Authorization: `Bearer ${newAccessToken}`
                    }
                };

                const response = await fetch(url, authFetchOptions);
                return {
                    returnType: "response",
                    data: response
                };
            }

            const authFetchOptions: RequestInit = {
                ...fetchOptions,
                headers: {
                    ...fetchOptions?.headers,
                    Authorization: `Bearer ${localStorageAccessToken}`
                }
            };

            const response = await fetch(url, authFetchOptions);

            if (response.status === invalidRefreshTokenStatus) {
                const newAccessToken = await refreshAccessToken();
                if (newAccessToken.returnType === "fetchError" || newAccessToken.returnType === "loginError") {
                    return newAccessToken;
                }

                const retryAuthFetchOptions: RequestInit = {
                    ...fetchOptions,
                    headers: {
                        ...fetchOptions?.headers,
                        Authorization: `Bearer ${newAccessToken.data}`
                    }
                };

                const retryResponse = await fetch(url, retryAuthFetchOptions);
                return {
                    returnType: "response",
                    data: retryResponse
                };
            }

            return {
                returnType: "response",
                data: response
            };
            
        } catch (error: unknown) {
            console.error("Error in jwtFetchHandler:", error);


            if (error instanceof Error) {
                const fetchError: ICustomErrorResponse = {
                    message: error.message,
                    status: 500,
                    ok: false
                };

                return {
                    returnType: "fetchError",
                    error: fetchError
                };
            }

            const unknownError: ICustomErrorResponse = {
                message: "An unknown error occurred in jwtFetchHandler",
                status: 500,
                ok: false
            };

            return {
                returnType: "fetchError",
                error: unknownError
            };


        }

    }



    return {
        jwtFetchHandler
    };


}