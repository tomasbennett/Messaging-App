import { IPrepInvitations } from "../models/IPrepInvitations";
import styles from "./PreppedParticipant.module.css";
import defaultUserImg from "../../../assets/DEFAULT_USER_IMG.png";
import { useInviteUsersToConversation } from "../hooks/useInviteUsersToConversation";


type IPreppedParticipantProps = IPrepInvitations & {
    prepUser: ReturnType<typeof useInviteUsersToConversation>["prepUser"];
    removeUser: ReturnType<typeof useInviteUsersToConversation>["removeUser"];
}


export function PreppedParticipant({
    userId,
    username,
    userProfileImgUrl,
    prepstatus,
    prepUser,
    removeUser
}: IPreppedParticipantProps) {


    return (
        <>
            <div className={styles.outerContainer}>
                <div className={styles.imgContainer}>
                    <img className={styles.img} src={userProfileImgUrl ?? defaultUserImg} alt="User profile picture" />
                </div>

                <div className={styles.rightSideContainer}>
                    <p className={styles.username}>
                        <span>{username}</span>
                    </p>

                    {
                        prepstatus === "invite_prepped" ?
                            <button onClick={() => {
                                removeUser(userId);
                            }} className={styles.removeBtn} type="button">
                                Remove
                            </button>

                            :

                            prepstatus === "no_invite_prepped" ?
                                <button onClick={() => {
                                    prepUser({
                                        userId,
                                        username,
                                        userProfileImgUrl,
                                        prepstatus
                                    })
                                }} className={styles.inviteBtn} type="button">
                                    Invite
                                </button>

                                :

                                null
                    }

                </div>


            </div>

        </>
    )
}