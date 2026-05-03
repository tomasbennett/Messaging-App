import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { errorPageRoute } from "../../../constants/routes";
import { useJWTFetch } from "../../../hooks/useJWTFetch";
import { useError } from "../../error/contexts/ErrorContext";
import { domain } from "../../../constants/EnvironmentAPI";
import { APIErrorSchema, ICustomErrorResponse } from "../../../../../shared/features/api/models/APIErrorResponse";
import { IUserFriendStatusRelationship, ReceiveUserFriendStatusRelationshipSchema } from "../../../../../shared/features/inviteReq/models/IUserFriendStatusRelationship";
import { ISearchUsersQueryParams } from "../../../../../shared/features/user/models/ISearchUsers";
import { notExpectedFormatError } from "../../../constants/errorConstants";
import { toQueryString } from "../../../util/ToQueryString";
import { useAuth } from "../../auth/contexts/AuthContext";

export function useUserSearchPerConversation() {
    const abortControllerRef = useRef<AbortController | null>(null);

    const [isSearchFriendsLoading, setIsSearchFriendsLoading] = useState<boolean>(false);
    const [searchResults, setSearchResults] = useState<IUserFriendStatusRelationship[]>([
        {
            otherUserId: "1",
            friendStatus: "no request sent yet",
            otherUserUsername: "Axel_Taker",
        },
        {
            otherUserId: "2",
            friendStatus: "accepted",
            otherUserUsername: "AAAHHHHHH",
        },
        {
            otherUserId: "3",
            friendStatus: "pending",
            otherUserUsername: "BA",
        },
        {
            otherUserId: "4",
            friendStatus: "no request sent yet",
            otherUserUsername: "falcon9999999999",
        },
    ]);
    const [inputSearchText, setInputSearchText] = useState<string>("");

    const errorCtx = useError();
    const nav = useNavigate();
    const { jwtFetchHandler } = useJWTFetch();
    const { setAuthLevel } = useAuth();

    const isUnmountingRef = useRef<boolean>(false);

    useEffect(() => {
        return () => {
            isUnmountingRef.current = true;
            abortControllerRef.current?.abort();
        };
    }, []);

    const searchForFriends = async (searchText: string) => {
        if (searchText.trim() === "") {
            return;
        }

        if (!errorCtx) {
            return;
        }

        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;


        try {
            setIsSearchFriendsLoading(true);

            const userSearchParams = {
                limit: 10,
                search: searchText
            } satisfies ISearchUsersQueryParams;

            const urlParams = toQueryString(userSearchParams);

            const response = await jwtFetchHandler(`${domain}/api/users/search?${urlParams}}`, {
                method: "GET",
                signal: controller.signal
            });

            if (!response) {
                return;
            }

            if (controller !== abortControllerRef.current) return;

            if (isUnmountingRef.current === true) {
                isUnmountingRef.current = false;
                return;
            }

            if (response.returnType === "loginError") {
                errorCtx.throwError(response.error);
                setAuthLevel({ userType: "none" });
                return;
            }

            if (response.returnType === "fetchError") {
                errorCtx.throwError(response.error);
                nav(errorPageRoute, {
                    replace: true,
                    state: {
                        error: response.error
                    }
                });
                return;
            }

            const searchResponse = response.data;
            const searchResJSON = await searchResponse.json();

            const searchResult = ReceiveUserFriendStatusRelationshipSchema.safeParse(searchResJSON);

            if (searchResult.success) {
                setSearchResults(searchResult.data.userFriendStatusRelationships);
                return;
            }

            const errorResult = APIErrorSchema.safeParse(searchResJSON);
            if (errorResult.success) {
                errorCtx.throwError(errorResult.data);
                return;
            }


            errorCtx.throwError(notExpectedFormatError);
            return;



        } catch (error: unknown) {
            if (controller !== abortControllerRef.current) return;

            if (!(error instanceof Error)) {
                errorCtx.throwError(notExpectedFormatError);
                return;
            }

            const customError: ICustomErrorResponse = {
                ok: false,
                status: 0,
                message: error.message
            };

            errorCtx.throwError(customError);
            return;


        } finally {
            if (controller !== abortControllerRef.current) return;

            setIsSearchFriendsLoading(false);
        }



    };

    return { isSearchFriendsLoading, searchResults, inputSearchText, setInputSearchText, searchForFriends };
}