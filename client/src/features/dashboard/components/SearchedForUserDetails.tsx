import { ISearchForFriendsUserDetails } from "../models/ISidebarUserDetails";
import styles from "./SearchedForUserDetails.module.css";
import defaultUserImg from "../../../assets/DEFAULT_USER_IMG.png";
import { useState } from "react";
import { ICustomErrorResponse } from "../../../../../shared/features/api/models/APIErrorResponse";
import { handleErrorResponse } from "../../../services/ErrorReqHandling";
import { domain } from "../../../constants/EnvironmentAPI";
import { LoadingCircle } from "../../../components/LoadingCircle";

// type ISearchedForUserDetailsProps = {
//     userId: string;
//     userProfilePictureUrl: string | undefined;
//     username: string;    
// }



export function SearchedForUserDetails({
    userId,
    userProfilePictureUrl,
    username,
    isPendingFriendRequest
}: ISearchForFriendsUserDetails) {
    
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<ICustomErrorResponse | null>(null);

    const addFriend = async () => {
        try {

            setIsLoading(true);
            setError(null);

            const response = await fetch(`${domain}/api/friends/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 
                    friendUserId: userId 
                })
            });

            if (!response.ok) {
                throw new Error("Failed to send friend request");
            }

            
        } catch (error: unknown) {
            handleErrorResponse(error, setError);

        } finally {
            setIsLoading(false);
        }
    };



    return (
        <div className={styles.outerContainer}>

            <div className={styles.imgContainer}>
                {
                    userProfilePictureUrl ?
                        <img src={userProfilePictureUrl} alt={`${username}'s profile picture`} className={styles.userIcon} />
                        :
                        <img src={defaultUserImg} alt={`User Icon: ${username}`} />
                }
            </div>

            <div className={styles.upperContainer}>

                <p className={styles.username}>{username}</p>

            </div>

            <div className={styles.lowerContainer}>

                {
                    isPendingFriendRequest ?
                        <p className={styles.pendingRequestText}>
                            Pending<span className={styles.loadingEllipsis}>.</span><span className={styles.loadingEllipsis}>.</span><span className={styles.loadingEllipsis}>.</span>
                        
                        </p>
                        :

                    isLoading ?
                        <div className={styles.sendingRequestText}>
                            <LoadingCircle height="90%" />
                        </div>

                    :

                        <button onClick={addFriend} className={styles.addFriendBtn} type="button">
                            Add Friend
                        </button>
                }


            </div>


        </div>
    );
}