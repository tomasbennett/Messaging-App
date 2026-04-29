import { APIErrorSchema, ICustomErrorResponse } from "../../../shared/features/api/models/APIErrorResponse";
import { invalidRefreshTokenStatus } from "../../../shared/features/auth/constants";
import { AccessTokenResponseSchema } from "../../../shared/features/auth/models/IAccessTokenResponse";
import { domain } from "../constants/EnvironmentAPI";
import { accessTokenLocalStorageKey } from "../constants/accessTokenLocalStorageKey";
import { notExpectedFormatError } from "../constants/errorConstants";
import { IJWTFetchResponses } from "../models/IJWTFetchResponses";



let refreshTokenPromise: Promise<IJWTFetchResponses<string>> | null = null;


export function useNewAccessToken() {




    async function refreshAccessToken(): Promise<IJWTFetchResponses<string>> {
        if (refreshTokenPromise) {
            return refreshTokenPromise;
        }

        refreshTokenPromise = (async () => {
            // if (!errorCtx) {
            //     console.error("Error context is not available in refreshAccessToken");
            //     const errorResponse: ICustomErrorResponse = {
            //         ok: false,
            //         status: 500,
            //         message: "Error context is not available in refreshAccessToken"
            //     };
            //     navigate(errorPageRoute, {
            //         replace: true,
            //         state: {
            //             error: errorResponse
            //         }
            //     });
            //     return {
            //         returnType: "fetchError",
            //         error: errorResponse
            //     };
            // }

            try {
                console.log("THE NEW ACCESS TOKEN REQ RUNS");
                const newAccessTokenReq = await fetch(`${domain}/api/auth/grantNewAccessToken`, {
                    credentials: "include"
                });

                if (newAccessTokenReq.status === invalidRefreshTokenStatus) {
                    //USER NEEDS TO SIGN IN AGAIN
                    // navigate(logInPageRoute, { replace: true });
                    // IF WE ARE ON THE LOGIN PAGE AND GET A 401 THROUGH CHECKAUTH THEN IT MAY CREATE AN INFINITE LOOP TO NAV BACK TO LOGIN PAGE HERE

                    return {
                        returnType: "loginError",
                        error: {
                            ok: false,
                            status: invalidRefreshTokenStatus,
                            message: "No session detected!!!"
                        }
                    };
                }

                if (newAccessTokenReq.status >= 500 && newAccessTokenReq.status <= 599) {
                    const serverError: ICustomErrorResponse = {
                        ok: false,
                        status: newAccessTokenReq.status,
                        message: "A server error occurred. Please try again later!!!"
                    };
                    // errorCtx.throwError(serverError);
                    // navigate(errorPageRoute, {
                    //     replace: true,
                    //     state: {
                    //         error: serverError
                    //     }
                    // });
                    return {
                        returnType: "fetchError",
                        error: serverError
                    };
                }


                const accessTokenJSON = await newAccessTokenReq.json();

                const accessTokenResult = AccessTokenResponseSchema.safeParse(accessTokenJSON);
                if (accessTokenResult.success) {
                    localStorage.setItem(accessTokenLocalStorageKey, accessTokenResult.data.accessToken);
                    return {
                        returnType: "response",
                        data: accessTokenResult.data.accessToken
                    };
                }

                const apiCustomErrorResult = APIErrorSchema.safeParse(accessTokenJSON);
                if (apiCustomErrorResult.success) {
                    // navigate(errorPageRoute, {
                    //     replace: true,
                    //     state: {
                    //         error: apiCustomErrorResult.data
                    //     }
                    // });
                    // errorCtx.throwError(apiCustomErrorResult.data);

                    return {
                        returnType: "fetchError",
                        error: apiCustomErrorResult.data
                    };
                }


                // navigate(errorPageRoute, {
                //     state: {
                //         error: notExpectedFormatError
                //     }
                // });
                // errorCtx.throwError(notExpectedFormatError);
                return {
                    returnType: "fetchError",
                    error: notExpectedFormatError
                };



            } catch (error: unknown) {
                console.error("Error refreshing access token:", error);

                if (error instanceof Error) {
                    const fetchError: ICustomErrorResponse = {
                        ok: false,
                        status: 0,
                        message: error.message
                    };
                    // navigate(errorPageRoute, {
                    //     replace: true,
                    //     state: {
                    //         error: fetchError
                    //     }
                    // });
                    // errorCtx.throwError(fetchError);

                    return {
                        returnType: "fetchError",
                        error: fetchError
                    };
                }

                const unknownError: ICustomErrorResponse = {
                    ok: false,
                    status: 0,
                    message: "An unknown error occurred while refreshing access token."
                };

                // errorCtx.throwError(unknownError);

                // navigate(errorPageRoute, {
                //     replace: true,
                //     state: {
                //         error: unknownError
                //     }
                // });

                return {
                    returnType: "fetchError",
                    error: unknownError
                };

            } finally {
                refreshTokenPromise = null;
            }

        })();


        return refreshTokenPromise;
    }


    return {
        refreshAccessToken
    }
}