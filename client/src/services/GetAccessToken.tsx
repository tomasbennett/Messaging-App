import { NavigateFunction } from "react-router-dom";
import { NewAccessTokenRequest } from "./NewAccessTokenRequest";
import { accessTokenLocalStorageKey } from "../constants/accessTokenLocalStorageKey";
import { IJWTFetchResponses } from "../models/IJWTFetchResponses";


export async function GetAccessToken(
    navigate: NavigateFunction
): Promise<IJWTFetchResponses<string> | null> {
    const accessToken = localStorage.getItem(accessTokenLocalStorageKey);
    if (accessToken) {
        return {
            returnType: "response",
            data: accessToken
        };
    }

    console.log("ACCESS TOKEN NOT FOUND");

    const newAccessToken = await NewAccessTokenRequest(navigate);
    return newAccessToken;
    // CAN EITHER RETURN ACCESS TOKEN OR ERROR STATE

}