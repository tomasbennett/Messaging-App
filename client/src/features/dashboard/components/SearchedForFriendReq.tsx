import styles from "./SearchedForFriendReq.module.css";
import defaultUserImg from "../../../assets/DEFAULT_USER_IMG.png";
import { useState } from "react";
import { LoadingCircle } from "../../../components/LoadingCircle";
import { useError } from "../../error/contexts/ErrorContext";
import { useNavigate } from "react-router-dom";
import { IUserFriendStatusRelationship } from "../../../../../shared/features/friendRequest/models/IUserFriendStatusRelationship";
import { IPropsSearchForFriendsUserDetails } from "../models/ISidebarUserDetails";
import { useFriendStatus } from "../../user/hooks/useFriendStatus";

// type ISearchedForUserDetailsProps = {
//     userId: string;
//     userProfilePictureUrl: string | undefined;
//     username: string;    
// }



export function SearchedForUserDetails({
    otherUserId: userId,
    otherUserProfilePictureUrl: userProfilePictureUrl,
    otherUserUsername: username,
    friendStatus,
    updateFriendStatus
}: IPropsSearchForFriendsUserDetails) {


    const {
        isLoading,
        addFriend: handleAddFriend,
        removeFriend: handleRemoveFriend
    } = useFriendStatus(userId, updateFriendStatus);

    return (
        <div className={styles.outerContainer}>

            <div className={styles.imgContainer}>

                <img src={userProfilePictureUrl ?? defaultUserImg} alt={`${username}'s profile picture`} className={styles.userIcon} />

            </div>


            <div className={styles.rightSideContainer}>
                
                <div className={styles.upperContainer}>

                    <p className={styles.username}>{username}</p>

                </div>

                <div className={styles.lowerContainer}>

                    {
                        friendStatus === "pending" ?
                            <p className={styles.pendingRequestText}>
                                Pending<span className={styles.loadingEllipsis}>.</span><span className={styles.loadingEllipsis}>.</span><span className={styles.loadingEllipsis}>.</span>
                            </p>

                            :

                            friendStatus === "no request sent yet" ?

                                <div className={styles.addFriendContainer}>

                                    {
                                        isLoading ?
                                            <LoadingCircle height="90%" />

                                            :

                                            <button onClick={handleAddFriend} className={styles.addFriendBtn} type="button">
                                                {

                                                    "Add Friend"
                                                }
                                            </button>

                                    }
                                </div>



                                :

                                friendStatus === "accepted" ?

                                    <div className={styles.removeFriendContainer}>

                                        {
                                            isLoading ?
                                                <LoadingCircle height="90%" />

                                                :

                                                <button onClick={handleRemoveFriend} className={styles.removeFriendBtn} type="button">
                                                    {

                                                        "Remove Friend"
                                                    }
                                                </button>

                                        }

                                    </div>




                                    :

                                    null
                    }


                </div>

            </div>



        </div>
    );
}