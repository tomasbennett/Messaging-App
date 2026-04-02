import { NavigateFunction } from "react-router-dom";
import { ISignInError } from "../../../shared/features/auth/models/ILoginSchema";
import { ICustomErrorResponse } from "../../../shared/features/api/models/APIErrorResponse";
import { errorPageRoute } from "../constants/routes";

export function SendToSignInErrorHandler(
    error: unknown,
    navigate: NavigateFunction
) {
    if (error instanceof Error) {
        const signInError: ICustomErrorResponse = {
            ok: false,
            status: 0,
            message: error.message
        }
        navigate(errorPageRoute, {
            state: {
                error: signInError
            }
        });
    }


    const signInError: ICustomErrorResponse = {
        ok: false,
        status: 0,
        message: "An unknown error occurred."
    }
    navigate(errorPageRoute, {
        state: {
            error: signInError
        }
    });
}