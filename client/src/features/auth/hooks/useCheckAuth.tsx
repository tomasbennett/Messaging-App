import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SendToSignInErrorHandler } from "../../../services/SendToSignInErrorHandler";
import { NewAccessTokenRequest } from "../../../services/NewAccessTokenRequest";
import { domain } from "../../../constants/EnvironmentAPI";
import { jwtFetchHandler } from "../../../services/BasicResponseHandle";
import { IAuthLevel } from "../models/IUseCheckAuth";
import { useError } from "../../error/contexts/ErrorContext";
import { notExpectedFormatError } from "../../../constants/errorConstants";
import {  signUpPageRoute as signInPageRoute } from "../../../constants/routes";



export function useCheckAuth() {
    const errorCtx = useError();

    const [userAuth, setUserAuth] = useState<IAuthLevel>("none");
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        async function checkAuth() {

            if (!errorCtx) {
                console.error("Error context is not available in useCheckAuth");
                return;
            }

            try {
                setIsLoading(true);

                const response = await jwtFetchHandler(`${domain}/api/auth/checkAuthLevel`, {
                    method: "GET",

                }, navigate);

                if (!response) {
                    setUserAuth("none");
                    return;
                }

                if (response.returnType === "loginError") {
                    setUserAuth("none");
                    errorCtx.throwError(response.error);
                    return;
                }

                const authLevelRes = response.data;

                if (authLevelRes.status === 200) {
                    setUserAuth("user");
                    return;
                }

                setUserAuth("none");
                errorCtx.throwError(notExpectedFormatError);
                return;


            } catch (error: unknown) {
                setUserAuth("none");
                if (error instanceof Error) {
                    errorCtx.throwError({
                        ok: false,
                        status: 0,
                        message: error.message
                    });
                    return;
                }

                errorCtx.throwError({
                    ok: false,
                    status: 0,
                    message: "An unknown error occurred."
                });

            } finally {
                setIsLoading(false);
            }

        }

        checkAuth();
    }, []);


    return {
        userAuth,
        isLoading
    }
}