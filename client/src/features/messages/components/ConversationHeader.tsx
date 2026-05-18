import { UserCogsIcon } from "../../../assets/icons/UserCogsIcon";
import { IPropsConversationHeaderComponent } from "../models/IPropsConversationHeaderComponent";
import styles from "./ConversationHeader.module.css";
import defaultUserImg from "../../../assets/DEFAULT_USER_IMG.png";
import { LogoutIcon } from "../../../assets/icons/LogoutIcon";
import { LeaveConversationIcon } from "../../../assets/icons/LeaveConversationIcon";


export function ConversationHeader({
    conversationId,
    name,
    groupChatProfilePicture,
}: IPropsConversationHeaderComponent) {

    return (
        <div className={styles.conversationHeader}>

            <div className={styles.leftHeaderContainer}>

                {
                    groupChatProfilePicture.type === "custom" ?

                        <div className={styles.profImgContainer}>
                            <img
                                src={groupChatProfilePicture.groupChatProfileImgUrl}
                                alt={`${name}'s profile picture`}
                                className={styles.profImg} />
                        </div>

                        :

                        groupChatProfilePicture.participants.length > 1 ?
                            <div className={styles.multiIconContainer}>

                                <img
                                    src={groupChatProfilePicture.participants[0]?.profileImgUrl ?? defaultUserImg}
                                    alt={`User Icon: ${name}`}
                                    className={styles.multiIcon}
                                />

                                <div className={styles.participantsNumber}>
                                    {`+${groupChatProfilePicture.participants.length - 1}`}
                                </div>

                            </div>

                            :

                            <div className={styles.profImgContainer}>
                                <img
                                    src={groupChatProfilePicture.participants[0]?.profileImgUrl ?? defaultUserImg}
                                    alt={`${name}'s profile picture`}
                                    className={styles.profImg} />
                            </div>
                }

                <div className={styles.conversationNameContainer}>

                    <p className={styles.conversationNameText}>{name}</p>
                    <small className={styles.contactInfo}>Click here for contact info</small>

                </div>

            </div>

            <div className={styles.rightHeaderContainer}>

                <div className={`${styles.svgContainer} ${styles.svgOptionsContainer}`}>
                    <UserCogsIcon />
                </div>

                <div className={`${styles.svgContainer} ${styles.svgLeaveConversationContainer}`}>
                    <LeaveConversationIcon />
                </div>

            </div>

        </div>
    );
}