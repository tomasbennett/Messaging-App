import { useRef, useState } from "react";
import { AddMessageIcon } from "../../../assets/icons/AddMessageIcon";
import { SidebarUserDetails } from "../components/SidebarUserDetails";
import { ISidebarMessageHeader } from "../models/ISidebarMessageHeader";
import { ISearchForFriendsUserDetails, ISidebarFriendsUserDetails } from "../models/ISidebarUserDetails";
import styles from "./SidebarUserDetailsList.module.css";
import { useSidebarHeaderMode } from "../hooks/useSidebarHeaderMode";
import { ICustomErrorResponse } from "../../../../../shared/features/api/models/APIErrorResponse";
import { notExpectedFormatError } from "../../../constants/errorConstants";
import { domain } from "../../../constants/EnvironmentAPI";




type ISidebarUserDetailsListProps = {
    userDetailsList: ISidebarFriendsUserDetails[];
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
    const [searchFriendsError, setSearchFriendsError] = useState<ICustomErrorResponse | null>(null);
    const [searchResults, setSearchResults] = useState<ISearchForFriendsUserDetails[]>([]);


    const searchForFriends = async (searchText: string) => {
        if (searchText.trim() === "") {
            return;
        }

        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;


        try {
            setIsSearchFriendsLoading(true);
            setSearchFriendsError(null);

            const response = await fetch(`${domain}/api/users/search?query=${encodeURIComponent(searchText)}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                signal: controller.signal
            });

            


            
        } catch (error: unknown) {
            if (controller !== abortControllerRef.current) return;

            // handleErrorResponse(error, setSearchFriendsError);
            
        } finally {
            if (controller !== abortControllerRef.current) {
                return;
            }
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
                            key={details.userId}
                            className={styles.listItem}>

                            <SidebarUserDetails
                                userId={details.userId}
                                userProfilePictureUrl={details.userProfilePictureUrl}
                                username={details.username}
                                lastMessage={details.lastMessage}
                                lastMessageTimestamp={details.lastMessageTimestamp}
                            />

                        </li>
                    ))
                }

            </ul>
        </div>
    );
}