import styles from "./SearchedForUserDetails.module.css";
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



    // const handleAddFriend = async () => {
    //     if (!errorCtx) {
    //         console.error("Error context is not available");
    //         return;
    //     }

    //     try {
    //         setIsLoading(true);

    //         const addFriendResult = await addFriend(userId, nav);

    //         if (addFriendResult === null) {
    //             return;
    //         }

    //         if (addFriendResult.returnType === "loginError") {
    //             errorCtx.throwError(addFriendResult.error);
    //             return;
    //         }

    //         //TURN STATUS TO PENDING IN UI
    //         updateFriendStatus(userId, "pending");



    //     } catch (error: unknown) {
    //         if (error instanceof Error) {
    //             errorCtx.throwError({
    //                 message: error.message,
    //                 status: 0,
    //                 ok: false
    //             });
    //             return;
    //         }

    //         errorCtx.throwError({
    //             message: "An unknown error occurred while sending the friend request.",
    //             status: 0,
    //             ok: false
    //         });

    //         return;



    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    // const handleRemoveFriend = async () => {
    //     if (!errorCtx) {
    //         console.error("Error context is not available");
    //         return;
    //     }

    //     try {

    //         setIsLoading(true);

    //         const removeFriendResult = await removeFriend(userId, nav);

    //         if (removeFriendResult === null) {
    //             return;
    //         }

    //         if (removeFriendResult.returnType === "loginError") {
    //             errorCtx.throwError(removeFriendResult.error);
    //             return;
    //         }

    //         //TURN STATUS TO NO REQUEST SENT YET IN UI
    //         updateFriendStatus(userId, "no request sent yet");



    //     } catch (error) {
    //         if (error instanceof Error) {
    //             errorCtx.throwError({
    //                 message: error.message,
    //                 status: 0,
    //                 ok: false
    //             });
    //             return;
    //         }

    //         errorCtx.throwError({
    //             message: "An unknown error occurred while removing the friend.",
    //             status: 0,
    //             ok: false
    //         });

    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    const {
        isLoading,
        addFriend: handleAddFriend,
        removeFriend: handleRemoveFriend
    } = useFriendStatus(userId, updateFriendStatus);

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
    );
}