import styles from "./SidebarUserDetails.module.css";
import defaultUserImg from "../../../assets/DEFAULT_USER_IMG.png";

type ISidebarUserDetailsProps = {
    userProfilePictureUrl: string | undefined;
    username: string;
    lastMessage: string | undefined;
    lastMessageTimestamp: Date | undefined;
}

export function SidebarUserDetails({
    userProfilePictureUrl,
    username,
    lastMessage,
    lastMessageTimestamp
}: ISidebarUserDetailsProps) {




    return (
        <div className={styles.outerContainer}>

            <div className={styles.userIconContainer}>
                {
                    userProfilePictureUrl ?
                        <img src={userProfilePictureUrl} alt={`${username}'s profile picture`} className={styles.userIcon} />
                        :
                        <img src={defaultUserImg} alt={`User Icon: ${username}`} />
                }
            </div>
            <div className={styles.textDetailsContainer}>
                <div className={styles.upperTextContainer}>

                    <p className={styles.username}>{username}</p>   
                    <p className={styles.timestamp}>{lastMessageTimestamp ? lastMessageTimestamp.toLocaleTimeString() : ""}</p>

                </div>
                <div className={styles.lowerTextContainer}>

                    <p className={styles.lastMessage}>{lastMessage || ""}</p>

                </div>
            </div>

        </div>
    );
}  