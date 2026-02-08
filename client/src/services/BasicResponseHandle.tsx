import { NavigateFunction } from "react-router-dom";

import { FieldValues, UseFormSetError } from "react-hook-form";
import { ICustomErrorResponse, APIErrorSchema } from "../../../shared/features/api/models/APIErrorResponse";
import { ISignInError } from "../../../shared/features/auth/models/ILoginSchema";
import { jsonParsingError } from "../constants/constants";

export async function basicResponseHandle<T extends FieldValues>(
    url: string,
    fetchOptions: RequestInit,
    navigate: NavigateFunction,
    setIsError: React.Dispatch<React.SetStateAction<ICustomErrorResponse | null>>,
    setFormError?: UseFormSetError<T>
): Promise<Response | null> {
    try {
        const response = await fetch(url, fetchOptions);

        if (response.status >= 500 && response.status <= 599) {

            const serverError: ICustomErrorResponse = {
                ok: false,
                status: response.status,
                message: response?.statusText || "Internal Server Error"
            };

            try {
                const data = await response.json();

                const result = APIErrorSchema.safeParse(data);
                if (result.success) {
                    serverError.message = result.data.message;

                }

            } catch (err) {
                console.error("Error parsing server error response:", err);
                setIsError(jsonParsingError);
                setFormError?.("root", {
                    message: jsonParsingError.message,
                    type: "server"
                });
                return null;

            }

            navigate('/error', {
                replace: true,
                state: {
                    error: serverError
                }
            });

            return null;
        }

        if (response.status === 401) {
            console.log("DATA SENT CORRECTLY FROM ERROR HANDLER!!!")
            const signInError: ISignInError = {
                message: "You were logged out!!!",
                inputType: "root"
            }
            navigate('/sign-in/login', {
                replace: true,
                state: {
                    error: signInError
                }
            });

            return null;

        }

        return response;







    } catch (error: unknown) {
        console.error("Error fetching folder page data:", error);

        if (!(error instanceof Error)) {
            navigate('/error', {
                replace: true,
                state: {
                    error: {
                        ok: false,
                        status: 0,
                        message: "An unknown error occurred."
                    }
                }
            });

            return null;
        }

        if (error.name === "AbortError") {
            console.log("Fetch aborted in catch block!!!");
            return null; // ??? Why return null here or error?

        }

        const customError: ICustomErrorResponse = {
            ok: false,
            status: 0,
            message: error.message
        };
        setIsError(customError);
        setFormError?.("root", {
            message: error.message,
            type: "server"
        });
        return null;

    }
}