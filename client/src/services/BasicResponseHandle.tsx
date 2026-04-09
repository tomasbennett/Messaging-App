// import { NavigateFunction } from "react-router-dom";

// import { ICustomErrorResponse, APIErrorSchema } from "../../../shared/features/api/models/APIErrorResponse";
// import { IJWTFetchResponses } from "../models/IJWTFetchResponses";
// import { GetAccessToken } from "./GetAccessToken";
// import { SendToSignInErrorHandler } from "./SendToSignInErrorHandler";
// import { errorPageRoute } from "../constants/routes";
// import { NewAccessTokenRequest } from "./NewAccessTokenRequest";


// export async function jwtFetchHandler(
//     url: string,
//     fetchOptions: RequestInit,
//     navigate: NavigateFunction,
// ): Promise<IJWTFetchResponses<Response> | null> {
//     const accessTokenAttemptResponse = await GetAccessToken(navigate);
//     if (!accessTokenAttemptResponse) {
//         return null;
//     }

//     if (accessTokenAttemptResponse.returnType !== "response") {
//         return accessTokenAttemptResponse;
//     }

//     const accessToken = accessTokenAttemptResponse.data;
//     const res = await FetchHandlerHelper(
//         url,
//         fetchOptions,
//         navigate,
//         accessToken
//     );

//     return res;
// }



// async function FetchHandlerHelper(
//     url: string,
//     fetchOptions: RequestInit,
//     navigate: NavigateFunction,
//     accessToken: string,
//     hasRetried: boolean = false
// ): Promise<IJWTFetchResponses<Response> | null> {
//     try {

//         const authFetchOptions: RequestInit = {
//             ...fetchOptions,
//             headers: {
//                 ...fetchOptions?.headers,
//                 Authorization: `Bearer ${accessToken}`
//             }
//         }

//         const response = await fetch(url, authFetchOptions);

//         if (response.status >= 500 && response.status <= 599) {
//             const data = await response.json();

//             const result = APIErrorSchema.safeParse(data);
//             if (result.success) {
//                 const serverError: ICustomErrorResponse = {
//                     ok: false,
//                     status: response.status,
//                     message: result.data.message || "Internal Server Error"
//                 };
//                 navigate(errorPageRoute, {
//                     replace: true,
//                     state: {
//                         error: serverError
//                     }
//                 });
//                 return null;
//             }

//             const serverError: ICustomErrorResponse = {
//                 ok: false,
//                 status: response.status,
//                 message: "A server error occurred. Please try again later!!!"
//             };

//             navigate(errorPageRoute, {
//                 replace: true,
//                 state: {
//                     error: serverError
//                 }
//             });

//             return null;

//         }

//         if (response.status === 401 && !hasRetried) {
//             console.log("DATA SENT CORRECTLY FROM ERROR HANDLER!!!");

//             const newAccessToken = await NewAccessTokenRequest(navigate);
//             if (!newAccessToken) return null;

//             if (newAccessToken.returnType !== "response") {
//                 return newAccessToken;
//             }

//             const res = await FetchHandlerHelper(
//                 url,
//                 fetchOptions,
//                 navigate,
//                 newAccessToken.data,
//                 true
//             );

//             return res;

//         }

//         return {
//             returnType: "response",
//             data: response
//         };



//     } catch (error: unknown) {
//         console.error("Error fetching folder page data:", error);
//         SendToSignInErrorHandler(error, navigate);

//         return null;

//     }
// }