import { ISentConversationInvite } from "../../../../../shared/features/inviteReq/models/ISentConversationInvite";
import styles from "./SentInvitePending.module.css";
import defaultUserProfileImg from "../../../assets/DEFAULT_USER_IMG.png";



type ISentInvitePendingProps = ISentConversationInvite;

export function SentInvitePending({
    conversationId,
    conversationName,
    userId,
    username,
    userProfileImgUrl
}: ISentInvitePendingProps) {



    return (
        <>
            <div className={styles.outerContainer}>

                <div className={styles.imgContainer}>
                    <img className={styles.img} src={userProfileImgUrl ?? defaultUserProfileImg} alt="User profile image" />
                </div>

                <div className={styles.rightSideContainer}>

                    <div className={styles.textUpperContainer}>

                        <p className={styles.username}>
                            <span>
                                {`Invited: ${username}`}
                            </span>
                        </p>

                        <p className={styles.conversationName}>
                            <span>
                                {`To: ${conversationName}`}
                            </span>
                        </p>

                    </div>



                    <div className={styles.btnLowerContainer}>

                        <div className={styles.pending}>
                            Pending...
                        </div>

                    </div>


                </div>



            </div>
        </>
    )
}