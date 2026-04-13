import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SendToSignInErrorHandler } from "../../../services/SendToSignInErrorHandler";
import { domain } from "../../../constants/EnvironmentAPI";
import { IAuthLevel } from "../models/IUseCheckAuth";
import { useError } from "../../error/contexts/ErrorContext";
import { notExpectedFormatError } from "../../../constants/errorConstants";
import {  errorPageRoute, signUpPageRoute as signInPageRoute } from "../../../constants/routes";
import { APIErrorSchema } from "../../../../../shared/features/api/models/APIErrorResponse";
import { ReceiveUserAuthContextInfoSchema } from "../../../../../shared/features/auth/models/ILoginSuccessUserInfo";
import { useAuth } from "../contexts/AuthContext";
import { useJWTFetch } from "../../../hooks/useNewAccessToken";



export function useCheckAuth() {
    const errorCtx = useError();

    const {
        authLevel: userAuth,
        setAuthLevel: setUserAuth
    } = useAuth();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const navigate = useNavigate();

    const { jwtFetchHandler } = useJWTFetch();

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
                });

                if (response.returnType === "loginError") {
                    if (userAuth.userType === "unknown") { return; } //MIGHT NEED TO SET TO NONE HERE IN CASE OF UNKNOWN USER TYPE //, BUT WE MAY WANT TO KEEP IT AS UNKNOWN TO DIFFERENTIATE BETWEEN A USER THAT HAS NOT BEEN CHECKED YET AND A USER THAT HAS BEEN CHECKED AND IS NOT AUTHENTICATED

                    errorCtx.throwError(response.error);
                    setUserAuth({ userType: "none" });
                    return;
                }

                if (response.returnType === "fetchError") {
                    // errorCtx.throwError(response.error);
                    return;
                }

                const authLevelRes = response.data;
                const authLevelJSON = await authLevelRes.json();
                const authLevelUserResult = ReceiveUserAuthContextInfoSchema.safeParse(authLevelJSON);

                if (authLevelRes.status === 200 && authLevelUserResult.success) {
                    setUserAuth({
                        userType: "user",
                        userId: authLevelUserResult.data.userId,
                        username: authLevelUserResult.data.username,
                    });
                    return;
                }

                const customErrorResult = APIErrorSchema.safeParse(authLevelJSON);
                if (customErrorResult.success) {
                    setUserAuth({ userType: "none" });
                    errorCtx.throwError(customErrorResult.data);
                    return;
                }


                setUserAuth({ userType: "none" });
                errorCtx.throwError(notExpectedFormatError);
                return;


            } catch (error: unknown) {
                setUserAuth({ userType: "none" });
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