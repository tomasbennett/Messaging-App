import { Navigate, isRouteErrorResponse, useRouteError } from "react-router-dom";
import { ICustomErrorResponse } from "../../../../../shared/features/api/models/APIErrorResponse";


export function ErrorElement() {
    const error = useRouteError();

    

    if (isRouteErrorResponse(error)) {
        const state: ICustomErrorResponse = {
            ok: false,
            status: error.status,
            message: error.statusText
        };
        return <Navigate to="/error" replace state={{ error: state }} />;
    }

    if (error instanceof Error) {
        return <Navigate to="/error" replace state={{ error: error }} />;
    }

    const unknownState: ICustomErrorResponse = {
        ok: false,
        status: 500,
        message: "An unknown error occurred."
    };
    return <Navigate to="/error" replace state={{ error: unknownState }} />;

}   