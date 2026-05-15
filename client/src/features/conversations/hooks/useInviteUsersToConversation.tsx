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
import { emptySearchTextAbort } from "../../../constants/AbortFetch";

export function useInviteUsersToConversation() {

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [searchText, setSearchText] = useState<string>("");
    const [searchResults, setSearchResults] = useState<IPrepInvitations[]>([
        // {
        //     userId: "1",
        //     username: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam dolorum aut qui deserunt nemo amet unde nisi optio excepturi explicabo repudiandae, placeat omnis, vero ipsum cupiditate totam assumenda a ipsa ullam eligendi cumque neque ab! Illum vero eius velit aut libero. Saepe culpa, nobis officia dolorum quod quas minus repellendus!",
        //     prepstatus: "no_invite_prepped"
        // },
        // {
        //     userId: "2",
        //     username: "Cannon Basics",
        //     prepstatus: "invite_prepped"
        // },
        // {
        //     userId: "3",
        //     username: "JAMAL__DESPERADO",
        //     prepstatus: "invite_prepped"
        // },
        // {
        //     userId: "4",
        //     username: "CharredRemains123",
        //     prepstatus: "no_invite_prepped"
        // }
    ]);
    const [selectedUsersToJoin, setSelectedUsersToJoin] = useState<IPrepInvitations[]>([
        // {
        //     userId: "2",
        //     username: "Cannon Basics",
        //     prepstatus: "invite_prepped"
        // },
        // {
        //     userId: "3",
        //     username: "JAMAL__DESPERADO",
        //     prepstatus: "invite_prepped"
        // },
    ]);

    const [isMoreLoadable, setIsMoreLoadable] = useState<boolean>(true);
    const [isMoreLoading, setIsMoreLoading] = useState<boolean>(false);

    const limit: number = 10;
    const [offset, setOffset] = useState<number>(0);


    const abortControllerRef = useRef<AbortController | null>(null);

    const { jwtFetchHandler } = useJWTFetch();
    const errorCtx = useError();

    const nav = useNavigate();

    useEffect(() => {
        
        if (searchText.trim() === "") {
            // setSearchResults([]);
            setOffset(0);
            setIsMoreLoadable(true);
            abortControllerRef.current?.abort(emptySearchTextAbort);
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

            
            if (controller !== abortControllerRef.current) {
                console.log("Not current fetch request!!!");
                return;
            }
            
            if (controller.signal.aborted && controller.signal.reason === emptySearchTextAbort) {
                console.log("Aborted without a new request sent do not impact state except for loading!!!");
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

    function prepUser(user: IPrepInvitations) {

        if (selectedUsersToJoin.some(preselectedUser => preselectedUser.userId === user.userId)) {
            console.log("User already has been selected for invitation to this new conversation!!!");
            return;
        }

        setSelectedUsersToJoin(prev => {
            return [...prev, user]
        });

        setSearchResults(prev => {
            return prev.map(searchedUser => {
                if (searchedUser.userId === user.userId) {
                    return {
                        userId: searchedUser.userId,
                        username: searchedUser.username,
                        userProfileImgUrl: searchedUser.userProfileImgUrl,
                        prepstatus: "invite_prepped"
                    }
                }

                return searchedUser;
            });
        });

    }


    function removeUser(userId: string) {
        setSelectedUsersToJoin(prev => {
            return prev.filter(preppedUser => preppedUser.userId !== userId)
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
        prepUser,
        searchText,
        removeUser
    }

}