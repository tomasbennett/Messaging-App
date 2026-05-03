import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { errorPageRoute } from "../../../constants/routes";
import { useJWTFetch } from "../../../hooks/useJWTFetch";
import { useError } from "../../error/contexts/ErrorContext";
import { domain } from "../../../constants/EnvironmentAPI";
import { APIErrorSchema, ICustomErrorResponse } from "../../../../../shared/features/api/models/APIErrorResponse";
import { ISearchUsersQueryParams, ISearchedUser, SearchedUsersAPISuccess } from "../../../../../shared/features/user/models/ISearchUsers";
import { notExpectedFormatError } from "../../../constants/errorConstants";
import { toQueryString } from "../../../util/ToQueryString";
import { useAuth } from "../../auth/contexts/AuthContext";

export function useUserSearchPerConversation(
    conversationId: string
) {
    const abortControllerRef = useRef<AbortController | null>(null);

    const [isSearchFriendsLoading, setIsSearchFriendsLoading] = useState<boolean>(false);
    const [searchResults, setSearchResults] = useState<ISearchedUser[]>([
        {
            userId: "1",
            friendStatus: "no request sent yet",
            username: "Axel_Taker",
        },
        {
            userId: "2",
            friendStatus: "accepted",
            username: "AAAHHHHHH",
        },
        {
            userId: "3",
            friendStatus: "pending",
            username: "BA",
        },
        {
            userId: "4",
            friendStatus: "no request sent yet",
            username: "falcon9999999999",
        },
    ]);
    const [inputSearchText, setInputSearchText] = useState<string>("");

    const errorCtx = useError();
    const { jwtFetchHandler } = useJWTFetch();
    const { setAuthLevel } = useAuth();

    const isUnmountingRef = useRef<boolean>(false);

    useEffect(() => {
        return () => {
            isUnmountingRef.current = true;
            abortControllerRef.current?.abort();
        };
    }, []);


    const [offset, setOffset] = useState<number>(0);
    const [hasMoreResults, setHasMoreResults] = useState<boolean>(true);
    const limit = 10;
    const previousSearchTextRef = useRef<string>("");

    const resetSearch = () => {
        setOffset(0);
        setHasMoreResults(true);
        setSearchResults([]);
    };

    useEffect(() => {
        searchForFriends(inputSearchText);

    }, [inputSearchText]);

    const searchForFriends = async (searchText: string) => {
        if (searchText.trim() === "") {
            return;
        }

        if (!errorCtx) {
            return;
        }

        const isNewSearch = searchText !== previousSearchTextRef.current;

        const currentOffset: number = isNewSearch ? 0 : offset;

        if (isNewSearch) {
            resetSearch();
            previousSearchTextRef.current = searchText;
        }


        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;


        try {
            setIsSearchFriendsLoading(true);

            const userSearchParams = {
                limit,
                search: searchText,
                offset: currentOffset
            } satisfies ISearchUsersQueryParams;

            const urlParams = toQueryString(userSearchParams);

            const response = await jwtFetchHandler(`${domain}/api/${conversationId}/search?${urlParams}`, {
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
                // nav(errorPageRoute, {
                //     replace: true,
                //     state: {
                //         error: response.error
                //     }
                // });
                return;
            }

            const searchResponse = response.data;
            const searchResJSON = await searchResponse.json();

            const searchResult = SearchedUsersAPISuccess.safeParse(searchResJSON);

            if (searchResult.success) {
                const searchedUsers = searchResult.data.searchedUsers;
                setHasMoreResults(searchedUsers.length === limit);
                // setOffset(prev => isNewSearch ? searchedUsers.length : prev + searchedUsers.length); //COULD BE CURRENTOFFSET + searchedUsers.length
                setOffset(currentOffset + searchedUsers.length);

                setSearchResults(prev => isNewSearch ? searchedUsers : [...prev, ...searchedUsers]);
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

    const loadMoreResults = () => {
        if (isSearchFriendsLoading || !hasMoreResults) {
            return;
        }

        searchForFriends(inputSearchText);
    }

    return { 
        isSearchFriendsLoading, 
        searchResults, 
        inputSearchText, 
        setInputSearchText,
        loadMoreResults,
        hasMoreResults
    };
}

