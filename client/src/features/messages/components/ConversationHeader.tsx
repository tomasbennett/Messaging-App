import { UserCogsIcon } from "../../../assets/icons/UserCogsIcon";
import { IPropsConversationHeaderComponent } from "../models/IPropsConversationHeaderComponent";
import styles from "./ConversationHeader.module.css";
import defaultUserImg from "../../../assets/DEFAULT_USER_IMG.png";


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

                        <img
                            src={groupChatProfilePicture.groupChatProfileImgUrl}
                            alt={`${name}'s profile picture`}
                            className={styles.profImg} />

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

                            <img
                                src={groupChatProfilePicture.participants[0]?.profileImgUrl ?? defaultUserImg}
                                alt={`${name}'s profile picture`}
                                className={styles.profImg} />
                }

                <div className={styles.conversationNameContainer}>

                    <p className={styles.conversationNameText}>{name}</p>
                    <small>Click here for contact info</small>

                </div>

            </div>

            <div className={styles.rightHeaderContainer}>

                <div className={styles.svgOptionsContainer}>
                    <UserCogsIcon />
                </div>

            </div>

        </div>
    );
}