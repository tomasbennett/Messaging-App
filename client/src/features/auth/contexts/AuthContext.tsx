import { createContext, useContext, useEffect, useState } from "react";
import { IAuthContextType, IAuthLevel } from "../models/IUseCheckAuth";
import { setLogoutFn } from "../services/LogoutAuthContext";
import { useError } from "../../error/contexts/ErrorContext";
import { useJWTFetch } from "../../../hooks/useNewAccessToken";
import { domain } from "../../../constants/EnvironmentAPI";
import { ReceiveUserAuthContextInfoSchema } from "../../../../../shared/features/auth/models/ILoginSuccessUserInfo";
import { APIErrorSchema } from "../../../../../shared/features/api/models/APIErrorResponse";
import { notExpectedFormatError } from "../../../constants/errorConstants";
import { useNavigate } from "react-router-dom";
import { errorPageRoute } from "../../../constants/routes";












const AuthContext = createContext<IAuthContextType | null>(null);


export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [authLevel, setAuthLevel] = useState<IAuthLevel>({
        userType: "unknown"
    });

    const [isLoading, setIsLoading] = useState<boolean>(true);

    const errorCtx = useError();

    const { jwtFetchHandler } = useJWTFetch();

    const nav = useNavigate();
    

    const checkAuth = async () => {
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
                const wasUnknown = authLevel.userType === "unknown";
                console.log(authLevel.userType + "Login error detected in useCheckAuth, setting auth level to none and throwing error if previous auth level was not unknown");
                setAuthLevel({ userType: "none" });

                if (!wasUnknown) {
                    errorCtx.throwError(response.error);
                }
                return;
            }

            if (response.returnType === "fetchError") {
                // errorCtx.throwError(response.error);
                errorCtx.throwError(response.error);
                nav(errorPageRoute, { state: { error: response.error } });
                
                return;
            }

            const authLevelRes = response.data;
            const authLevelJSON = await authLevelRes.json();
            const authLevelUserResult = ReceiveUserAuthContextInfoSchema.safeParse(authLevelJSON);

            if (authLevelRes.status === 200 && authLevelUserResult.success) {
                setAuthLevel({
                    userType: "user",
                    userId: authLevelUserResult.data.userId,
                    username: authLevelUserResult.data.username,
                });
                return;
            }

            const customErrorResult = APIErrorSchema.safeParse(authLevelJSON);
            if (customErrorResult.success) {
                setAuthLevel({ userType: "none" });
                errorCtx.throwError(customErrorResult.data);
                return;
            }


            setAuthLevel({ userType: "none" });
            errorCtx.throwError(notExpectedFormatError);
            return;


        } catch (error: unknown) {
            setAuthLevel({ userType: "none" });
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

    useEffect(() => {
        
        checkAuth();


    }, []);


    const ctx: IAuthContextType = {
        authLevel,
        setAuthLevel,
        isLoading,
        checkAuth
    }
    
    return (
        <AuthContext.Provider value={ctx}>
            {children}
        </AuthContext.Provider>
    );
}



export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};