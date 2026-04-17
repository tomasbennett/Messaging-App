import { useEffect, useRef, useState } from "react";
import { AddMessageIcon } from "../../../assets/icons/AddMessageIcon";
import { SidebarUserDetails } from "../components/SidebarConversationDetails";
import { ISidebarMessageHeader } from "../models/ISidebarMessageHeader";
import { ISidebarFriendsUserDetails } from "../models/ISidebarUserDetails";
import styles from "./InnerSidebarList.module.css";
import { useSidebarHeaderMode } from "../hooks/useSidebarHeaderMode";
import { APIErrorSchema, ICustomErrorResponse } from "../../../../../shared/features/api/models/APIErrorResponse";
import { notExpectedFormatError } from "../../../constants/errorConstants";
import { domain } from "../../../constants/EnvironmentAPI";
import { useError } from "../../error/contexts/ErrorContext";
import { useNavigate } from "react-router-dom";
import { ReceiveUserFrontendSchema } from "../../../../../shared/features/user/models/IFrontendUser";
import { ReceiveFriendRequestFrontendSchema } from "../../../../../shared/features/friendRequest/models/IFrontendFriendRequest";
import { IUserFriendStatusRelationship, ReceiveUserFriendStatusRelationshipSchema } from "../../../../../shared/features/friendRequest/models/IUserFriendStatusRelationship";
import { IFriendPreviewMessages } from "../../../../../shared/features/conversation/models/IFriendPreviewMessages";
import { useJWTFetch } from "../../../hooks/useNewAccessToken";
import { useAuth } from "../../auth/contexts/AuthContext";
import { errorPageRoute } from "../../../constants/routes";
import { MessageListIcon } from "../../../assets/icons/MessageListIcon";
import { LoadingCircle } from "../../../components/LoadingCircle";
import { SearchedForUserDetails } from "../components/SearchedForFriendReq";
import { IFriendRequestStatus } from "../../../../../shared/features/friendRequest/constants";




type ISidebarUserDetailsListProps = {
    userDetailsList: IFriendPreviewMessages[];
}

export function SidebarUserDetailsList({
    userDetailsList
}: ISidebarUserDetailsListProps) {

    const {
        sidebarHeaderMode,
        // getSearchMode,
        // sidebarContainerRef,
        setSidebarHeaderMode
    } = useSidebarHeaderMode();


    const abortControllerRef = useRef<AbortController | null>(null);

    const [isSearchFriendsLoading, setIsSearchFriendsLoading] = useState<boolean>(false);
    const [searchResults, setSearchResults] = useState<IUserFriendStatusRelationship[]>([]);
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

            const response = await jwtFetchHandler(`${domain}/api/users/search?query=${encodeURIComponent(searchText)}`, {
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



    return (
        <div
            // ref={sidebarContainerRef} 
            className={styles.container}
        >

            <div className={styles.titleContainer}>

                {
                    sidebarHeaderMode === "conversations" ?
                        <>


                            <div className={styles.btnContainer}>

                                <h2 className={styles.title}>Conversations</h2>

                                <button
                                    type="button"
                                    className={styles.changeModeBtn}
                                    onClick={() => setSidebarHeaderMode("search")}
                                >
                                    <AddMessageIcon />
                                </button>

                            </div>

                        </>


                        :

                        sidebarHeaderMode === "search" ?
                            <>
                                <div className={styles.upperSearchContainer}>

                                    <h2 className={styles.title}>Search for friends</h2>
                                    <button
                                        type="button"
                                        className={styles.changeModeBtn}
                                        onClick={() => setSidebarHeaderMode("conversations")}
                                    >
                                        <MessageListIcon />
                                    </button>

                                </div>

                                <div className={styles.searchInputContainer}>
                                    <input
                                        type="text"
                                        className={styles.searchInput}
                                        placeholder="Search for friends..."
                                        autoFocus
                                        onChange={(e) => {
                                            searchForFriends(e.target.value);
                                            setInputSearchText(e.target.value);
                                        }}
                                    />



                                </div>
                            </>

                            :

                            null

                }


            </div>

            <ul className={styles.listContainer}>

                {
                    sidebarHeaderMode === "conversations" ?

                        <>
                            {
                                userDetailsList.length === 0 ? (
                                    <li className={styles.noConversationsText}>No conversations yet. Start by searching for friends and sending them a message!</li>
                                )

                                    :

                                    userDetailsList.map((details) => (
                                        <li
                                            key={details.conversation.conversationId}
                                            className={styles.listItem}>

                                            <SidebarUserDetails
                                                conversation={details.conversation}
                                                latestMessage={details.latestMessage}
                                            />

                                        </li>
                                    ))

                            }


                        </>

                        :

                        sidebarHeaderMode === "search" ?

                            <>

                                {
                                    isSearchFriendsLoading ?
                                        <li className={styles.searchFriendsLoadingContainer}>
                                            <LoadingCircle height="4rem" />
                                        </li>
                                        :
                                        searchResults.length <= 0 && inputSearchText.trim() !== "" ? (
                                            <li className={styles.noConversationsText}>No users found with provided username please keep searching...</li>
                                        )
                                            :
                                            searchResults.map((searchedForUser) => {

                                                const updateFriendStatus = (status: IFriendRequestStatus) => {
                                                    setSearchResults((prev) =>
                                                        prev.map((user) =>
                                                            user.otherUserId === searchedForUser.otherUserId
                                                                ? { ...user, friendStatus: status }
                                                                : user
                                                        )
                                                    );
                                                };

                                                return (
                                                    <SearchedForUserDetails
                                                        key={searchedForUser.otherUserId}
                                                        otherUserId={searchedForUser.otherUserId}
                                                        otherUserUsername={searchedForUser.otherUserUsername}
                                                        otherUserProfilePictureUrl={searchedForUser.otherUserProfilePictureUrl}
                                                        friendStatus={searchedForUser.friendStatus}
                                                        updateFriendStatus={updateFriendStatus}
                                                    />
                                                )
                                            })



                                }

                            </>

                            :

                            null


                }

            </ul>
        </div>
    );
}