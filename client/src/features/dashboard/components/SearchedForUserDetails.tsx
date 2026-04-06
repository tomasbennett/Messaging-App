import { ISearchForFriendsUserDetails } from "../models/ISidebarUserDetails";
import styles from "./SearchedForUserDetails.module.css";
import defaultUserImg from "../../../assets/DEFAULT_USER_IMG.png";
import { useState } from "react";
import { APIErrorSchema, ICustomErrorResponse } from "../../../../../shared/features/api/models/APIErrorResponse";
import { domain } from "../../../constants/EnvironmentAPI";
import { LoadingCircle } from "../../../components/LoadingCircle";
import { useError } from "../../error/contexts/ErrorContext";
import { jwtFetchHandler } from "../../../services/BasicResponseHandle";
import { useNavigate } from "react-router-dom";
import { notExpectedFormatError } from "../../../constants/errorConstants";
import { IUserFriendStatusRelationship } from "../../../../../shared/features/friendRequest/models/IUserFriendStatusRelationship";

// type ISearchedForUserDetailsProps = {
//     userId: string;
//     userProfilePictureUrl: string | undefined;
//     username: string;    
// }



export function SearchedForUserDetails({
    otherUserId: userId,
    otherUserProfilePictureUrl: userProfilePictureUrl,
    otherUserUsername: username,
    friendStatus
}: IUserFriendStatusRelationship) {

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const errorCtx = useError();

    const nav = useNavigate();

    const addFriend = async () => {
        if (!errorCtx) {
            console.error("Error context is not available");
            return;
        }

        try {
            setIsLoading(true);

            const response = await jwtFetchHandler(`${domain}/api/friends/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    friendUserId: userId
                })
            }, nav);

            if (!response) {
                return;
            }

            if (response.returnType !== "response") {
                errorCtx.throwError(response.error);
                return;
            }

            const addFriendResponse = response.data;
            if (addFriendResponse.ok) {

                return;
            }

            const errorResponseJson = await addFriendResponse.json();

            const errorResult = APIErrorSchema.safeParse(errorResponseJson);
            if (errorResult.success) {
                const errorData = errorResult.data;
                errorCtx.throwError(errorData);
                return;
            }

            errorCtx.throwError(notExpectedFormatError);



        } catch (error: unknown) {
            if (error instanceof Error) {
                errorCtx.throwError({
                    message: error.message,
                    status: 0,
                    ok: false
                });
                return;
            }

            errorCtx.throwError({
                message: "An unknown error occurred while sending the friend request.",
                status: 0,
                ok: false
            });

            return;



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
                    isLoading ?
                        <div className={styles.sendingRequestText}>
                            <LoadingCircle height="90%" />
                        </div>

                        :

                        friendStatus === "pending" ?
                            <p className={styles.pendingRequestText}>
                                Pending<span className={styles.loadingEllipsis}>.</span><span className={styles.loadingEllipsis}>.</span><span className={styles.loadingEllipsis}>.</span>
                            </p>

                            :

                        friendStatus === "no request sent yet" ?


                            <button onClick={addFriend} className={styles.addFriendBtn} type="button">
                                Add Friend
                            </button>

                            :

                        friendStatus === "accepted" ?

                            <p className={styles.alreadyFriendsText}>
                                Already Friends
                            </p>


                            :

                            null
                }


            </div>


        </div>
    );
}