import { ICustomErrorResponse } from "../../../shared/features/api/models/APIErrorResponse"

export const jsonParsingError: ICustomErrorResponse = {
    ok: false,
    status: 0,
    message: "There was an error parsing the json data!!!"
}



export const notExpectedFormatError: ICustomErrorResponse = {
    ok: false,
    status: 0,
    message: "The returned data was not in the correct format!!!"
}


export const noErrorCtxError: ICustomErrorResponse = {
    ok: false,
    status: 0,
    message: "No errorCtx object present for the component!!!"
}


export const unknownError: ICustomErrorResponse = {
    ok: false,
    status: 0,
    message: "An unexpected error occured!!!"
}


export const noSocketConnectionError: ICustomErrorResponse = {
    ok: false,
    status: 0,
    message: "Invalid socket id, please try reconnecting to the web socket!!!"
}