import { ICustomErrorResponse } from "../../../shared/features/api/models/APIErrorResponse"

export type IJWTFetchResponses<ReturnDataType> = {
    returnType: "loginError",
    error: ICustomErrorResponse
} | {
    returnType: "response",
    data: ReturnDataType
}