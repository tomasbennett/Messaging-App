import { useEffect, useRef, useState } from "react";
import { AddMessageIcon } from "../../../assets/icons/AddMessageIcon";
import { SidebarUserDetails } from "../components/SidebarUserDetails";
import { ISidebarMessageHeader } from "../models/ISidebarMessageHeader";
import { ISidebarFriendsUserDetails } from "../models/ISidebarUserDetails";
import styles from "./SidebarUserDetailsList.module.css";
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




type ISidebarUserDetailsListProps = {
    userDetailsList: IFriendPreviewMessages[];
}

export function SidebarUserDetailsList({
    userDetailsList
}: ISidebarUserDetailsListProps) {

    const {
        sidebarHeaderMode,
        getSearchMode,
        sidebarContainerRef,
        setSidebarHeaderMode
    } = useSidebarHeaderMode();


    const abortControllerRef = useRef<AbortController | null>(null);

    const [isSearchFriendsLoading, setIsSearchFriendsLoading] = useState<boolean>(false);
    const [searchResults, setSearchResults] = useState<IUserFriendStatusRelationship[]>([]);

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
        <div ref={sidebarContainerRef} className={styles.container}>

            <div className={styles.titleContainer}>

                {
                    sidebarHeaderMode === "title" ?
                        <>

                            <h2 className={styles.title}>Friends</h2>

                            <div className={styles.btnContainer}>

                                <button
                                    className={styles.addFriend}
                                    onClick={() => getSearchMode()}
                                >
                                    <AddMessageIcon />
                                </button>

                            </div>

                        </>


                        :

                        sidebarHeaderMode === "search" ?
                            <>
                                <div className={styles.searchInputContainer}>
                                    <input
                                        type="text"
                                        className={styles.searchInput}
                                        placeholder="Search for friends..."
                                        autoFocus
                                        onChange={(e) => searchForFriends(e.target.value)}
                                    />



                                </div>
                            </>

                            :

                            null

                }


            </div>

            <ul className={styles.listContainer}>

                {

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

            </ul>
        </div>
    );
}