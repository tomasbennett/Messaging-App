import { NavigateFunction } from "react-router-dom";
import { APIErrorSchema, ICustomErrorResponse } from "../../../shared/features/api/models/APIErrorResponse";
import { AccessTokenResponseSchema } from "../../../shared/features/auth/models/IAccessTokenResponse";
import { ISignInError } from "../../../shared/features/auth/models/ILoginSchema";

import { invalidRefreshTokenStatus } from "../../../shared/features/auth/constants";
import { useContext, useState } from "react";
import { domain } from "../constants/EnvironmentAPI";
import { notExpectedFormatError } from "../constants/errorConstants";
import { SendToSignInErrorHandler } from "./SendToSignInErrorHandler";
import { accessTokenLocalStorageKey } from "../constants/accessTokenLocalStorageKey";
import { IJWTFetchResponses } from "../models/IJWTFetchResponses";
import { errorPageRoute, logInPageRoute } from "../constants/routes";



export async function NewAccessTokenRequest(
    navigate: NavigateFunction
): Promise<IJWTFetchResponses<string> | null> {

    try {

        console.log("THE NEW ACCESS TOKEN REQ RUNS");
        const newAccessTokenReq = await fetch(`${domain}/api/auth/refreshToken`, {
            credentials: "include"
        });
    
        if (newAccessTokenReq.status === invalidRefreshTokenStatus) {
            //USER NEEDS TO SIGN IN AGAIN
            navigate(logInPageRoute, { replace: true });

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
            return {
                returnType: "response",
                data: accessTokenResult.data.accessToken, 
            };
        }
    
        const apiCustomErrorResult = APIErrorSchema.safeParse(accessTokenJSON);
        if (apiCustomErrorResult.success) {
            return {
                returnType: "loginError",
                error: apiCustomErrorResult.data
            };
        }
    

        navigate(errorPageRoute, {
            state: {
                error: notExpectedFormatError
            }
        });
        return null;

    } catch (error: unknown) {

        console.log("ERROR OCCURS WHEN FETCHING without ACCESS TOKEN: ", error);
        SendToSignInErrorHandler(error, navigate);
        return null; //ERROR PAGE THUS NULL RETURN

    }
}