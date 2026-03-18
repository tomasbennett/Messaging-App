import { ICustomErrorResponse } from "../../../shared/features/api/models/APIErrorResponse";
import { notExpectedFormatError } from "../constants/errorConstants";

export function handleErrorResponse(error: unknown, setError: React.Dispatch<React.SetStateAction<ICustomErrorResponse | null>>): void {
    if (!(error instanceof Error)) {
        setError(notExpectedFormatError);
        return;
    }

    // if (error.name === "AbortError") {
    //     console.log("Search aborted");
    //     return;
    // }

    const customError: ICustomErrorResponse = {
        ok: false,
        status: 0,
        message: error.message
    };
    setError(customError);
    return;
}