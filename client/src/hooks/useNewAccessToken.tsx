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


let refreshTokenPromise: Promise<string | null> | null = null;


export function useNewAccessToken() {
    const { setAuthLevel } = useAuth();
    const errorCtx = useError();
    const navigate = useNavigate();


    async function refreshAccessToken(): Promise<string | null> {
        if (refreshTokenPromise) {
            return refreshTokenPromise;
        }

        refreshTokenPromise = (async () => {
            if (!errorCtx) {
                console.error("Error context is not available in useNewAccessToken");
                return null;
            }

            try {
                console.log("THE NEW ACCESS TOKEN REQ RUNS");
                const newAccessTokenReq = await fetch(`${domain}/api/auth/grantNewAccessToken`, {
                    credentials: "include"
                });

                if (newAccessTokenReq.status === invalidRefreshTokenStatus) {
                    //USER NEEDS TO SIGN IN AGAIN
                    // navigate(logInPageRoute, { replace: true });
                    // IF WE ARE ON THE LOGIN PAGE AND GET A 401 THROUGH CHECKAUTH THEN IT MAY CREATE AN INFINITE LOOP TO NAV BACK TO LOGIN PAGE HERE
                    setAuthLevel({ userType: "none" });
                    errorCtx.throwError({
                        message: "Your session has expired. Please sign in again!!!",
                        status: invalidRefreshTokenStatus,
                        ok: false
                    });

                    return null;
                }

                if (newAccessTokenReq.status >= 500 && newAccessTokenReq.status <= 599) {
                    const serverError: ICustomErrorResponse = {
                        ok: false,
                        status: newAccessTokenReq.status,
                        message: "A server error occurred. Please try again later!!!"
                    };
                    navigate(errorPageRoute, {
                        replace: true,
                        state: {
                            error: serverError
                        }
                    });
                    return null;
                }


                const accessTokenJSON = await newAccessTokenReq.json();

                const accessTokenResult = AccessTokenResponseSchema.safeParse(accessTokenJSON);
                if (accessTokenResult.success) {
                    localStorage.setItem(accessTokenLocalStorageKey, accessTokenResult.data.accessToken);
                    return accessTokenResult.data.accessToken;
                }

                const apiCustomErrorResult = APIErrorSchema.safeParse(accessTokenJSON);
                if (apiCustomErrorResult.success) {

                    setAuthLevel({ userType: "none" });
                    errorCtx.throwError(apiCustomErrorResult.data);

                    return null;
                }


                navigate(errorPageRoute, {
                    state: {
                        error: notExpectedFormatError
                    }
                });
                return null;



            } catch (error: unknown) {
                console.error("Error refreshing access token:", error);
                setAuthLevel({ userType: "none" });

                if (error instanceof Error) {
                    errorCtx.throwError({
                        message: error.message,
                        status: 500,
                        ok: false
                    });
                    return null;
                }

                errorCtx.throwError({
                    message: "An unknown error occurred while refreshing access token",
                    status: 500,
                    ok: false
                });

                return null;

            } finally {
                refreshTokenPromise = null;
            }

        })();


        return refreshTokenPromise;
    }


    async function jwtFetchHandler(
        url: string,
        fetchOptions: RequestInit,
        controller?: AbortController
    ): Promise<IJWTFetchResponses<Response> | null> {

        if (!errorCtx) {
            console.error("Error context is not available in useNewAccessToken");
            return null;
        }
        
        try {
            const localStorageAccessToken = localStorage.getItem(accessTokenLocalStorageKey);
            
            if (!localStorageAccessToken) {
                const newAccessToken = await refreshAccessToken();
                if (!newAccessToken) {
                    return null;
                }
                const authFetchOptions: RequestInit = {
                    ...fetchOptions,
                    signal: controller?.signal,
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
                signal: controller?.signal,
                headers: {
                    ...fetchOptions?.headers,
                    Authorization: `Bearer ${localStorageAccessToken}`
                }
            };

            const response = await fetch(url, authFetchOptions);

            if (response.status === invalidRefreshTokenStatus) {
                const newAccessToken = await refreshAccessToken();
                if (!newAccessToken) {
                    return null;
                }

                const retryAuthFetchOptions: RequestInit = {
                    ...fetchOptions,
                    signal: controller?.signal,
                    headers: {
                        ...fetchOptions?.headers,
                        Authorization: `Bearer ${newAccessToken}`
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
            // if (error instanceof DOMException && error.name === "AbortError") {
            //     console.log("Fetch aborted, ignoring error");
            //     return null;
            // }

            // setAuthLevel({ userType: "none" });

            if (error instanceof Error) {
                // errorCtx.throwError({
                //     message: error.message,
                //     status: 500,
                //     ok: false
                // });
                return {
                    returnType: "loginError",
                    error: {
                        message: error.message,
                        status: 500,
                        ok: false
                    }
                };
            }

            // errorCtx.throwError({
            //     message: "An unknown error occurred in jwtFetchHandler",
            //     status: 500,
            //     ok: false
            // });

            return {
                returnType: "loginError",
                error: {
                    message: "An unknown error occurred in jwtFetchHandler",
                    status: 500,
                    ok: false
                }
            };


        }

    }



    return {
        jwtFetchHandler
    };


}