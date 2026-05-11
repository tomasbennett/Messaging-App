import { useEffect, useRef, useState } from "react";
import { IPrepInvitations } from "../models/IPrepInvitations";
import { useJWTFetch } from "../../../hooks/useJWTFetch";
import { useError } from "../../error/contexts/ErrorContext";
import { domain } from "../../../constants/EnvironmentAPI";
import { ISearchUsersQueryParams, SearchedUserNewConversationAPISuccess } from "../../../../../shared/features/user/models/ISearchUsers";
import { toQueryString } from "../../../util/ToQueryString";
import { useNavigate } from "react-router-dom";
import { errorPageRoute } from "../../../constants/routes";
import { APIErrorSchema, ICustomErrorResponse } from "../../../../../shared/features/api/models/APIErrorResponse";
import { notExpectedFormatError } from "../../../constants/errorConstants";

export function useInviteUsersToConversation() {

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [searchText, setSearchText] = useState<string>("");
    const [searchResults, setSearchResults] = useState<IPrepInvitations[]>([]);
    const [selectedUsersToJoin, setSelectedUsersToJoin] = useState<{ userId: string }[]>([]);

    const [isMoreLoadable, setIsMoreLoadable] = useState<boolean>(true);
    const [isMoreLoading, setIsMoreLoading] = useState<boolean>(false);

    const limit: number = 10;
    const [offset, setOffset] = useState<number>(0);


    const abortControllerRef = useRef<AbortController | null>(null);

    const { jwtFetchHandler } = useJWTFetch();
    const errorCtx = useError();

    const nav = useNavigate();

    const isAbortedWithoutNewRequestFlag = useRef<boolean>(false);

    useEffect(() => {
        setSearchResults([]);
        setOffset(0);
        setIsMoreLoadable(true);
        
        if (searchText.trim() === "") {
            abortControllerRef.current?.abort();
            isAbortedWithoutNewRequestFlag.current = true;
            return;
        }

        inviteUsersToConversation(setIsLoading, 0);

    }, [searchText]);



    async function inviteUsersToConversation(
        setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
        offset: number
    ) {

        if (!errorCtx) {
            const err: ICustomErrorResponse = {
                ok: false,
                status: 0,
                message: "Error context didn't appear in the client!!!"
            }
            nav(errorPageRoute, {
                state: {
                    error: err
                }
            });
            return;
        }

        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        
        try {
            setIsLoading(true);

            const queryParams: ISearchUsersQueryParams = {
                limit,
                offset,
                search: searchText
            }

            const generatedQueryParams = toQueryString(queryParams);

            const response = await jwtFetchHandler(`${domain}/api/users/search?${generatedQueryParams}`, {
                method: "GET",
                signal: controller.signal
            });

            if (isAbortedWithoutNewRequestFlag.current) {
                console.log("Aborted without a new request sent do not impact state except for loading!!!");
                isAbortedWithoutNewRequestFlag.current = false;
                return;
            }

            if (controller !== abortControllerRef.current) {
                console.log("Not current fetch request!!!");
                return;
            }

            if (response.returnType === "fetchError" || response.returnType === "loginError") {
                errorCtx.throwError(response.error);
                return;
            }

            const resJSON = await response.data.json();

            const searchedUserResults = SearchedUserNewConversationAPISuccess.safeParse(resJSON);
            if (searchedUserResults.success) {
                console.log("Success on the searched users!!!");
                const usersPrepped: IPrepInvitations[] = searchedUserResults.data.searchedUsers.map(user => {
                    const isPreppedUserAlready = selectedUsersToJoin.some(preselectedUser => preselectedUser.userId === user.userId);

                    return {
                        userId: user.userId,
                        username: user.username,
                        userProfileImgUrl: user.userProfileImgUrl,
                        prepstatus: isPreppedUserAlready ? "invite_prepped" : "no_invite_prepped"
                    }
                });
                setSearchResults(prev => {
                    return [...prev, ...usersPrepped]
                });
                setOffset(offset + limit);

                setIsMoreLoadable(searchedUserResults.data.searchedUsers.length === limit)


                return;

            }

            const errorResult = APIErrorSchema.safeParse(resJSON);
            if (errorResult.success) {
                errorCtx.throwError(errorResult.data);
                return;
            }

            errorCtx.throwError(notExpectedFormatError);
            return;


            
        } catch (error: unknown) {
            console.error("Error inviting users to conversation:", error);

            if (controller !== abortControllerRef.current) {
                console.log("Not current fetch request!!!");
                return;
            }

            if (error instanceof Error) {
                const knownError: ICustomErrorResponse = {
                    ok: false,
                    status: 0,
                    message: error.message
                }
                errorCtx.throwError(knownError);
                return;
            }

            const unknownError: ICustomErrorResponse = {
                ok: false,
                status: 0,
                message: "An unknown error occurred!!!"
            }
            errorCtx.throwError(unknownError);
            return;


        } finally {
            if (controller !== abortControllerRef.current) {
                console.log("Not current fetch request!!!");
                return;
            }
            setIsLoading(false);
        }
    }

    function loadMoreUsers() {
        if (isLoading || isMoreLoading || !isMoreLoadable) {
            console.log("Can not load more whilst search is loading or if there are no more results at the moment!!!");
            return;
            
        }

        
        inviteUsersToConversation(setIsMoreLoading, offset);
        
    }

    function prepUser(userId: string) {

        if (selectedUsersToJoin.some(preselectedUser => preselectedUser.userId === userId)) {
            console.log("User already has been selected for invitation to this new conversation!!!");
            return;
        }

        setSelectedUsersToJoin(prev => {
            return [...prev, { userId }]
        });

        setSearchResults(prev => {
            return prev.map(user => {
                if (user.userId === userId) {
                    return {
                        userId: user.userId,
                        username: user.username,
                        userProfileImgUrl: user.userProfileImgUrl,
                        prepstatus: "invite_prepped"
                    }
                }

                return user;
            });
        });

    }



    return {
        isLoading,
        isMoreLoadable,
        isMoreLoading,
        setSearchText,
        searchResults,
        loadMoreUsers,
        selectedUsersToJoin,
        prepUser
    }

}