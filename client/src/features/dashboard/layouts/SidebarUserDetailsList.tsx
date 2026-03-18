import { SidebarUserDetails } from "../components/SidebarUserDetails";
import { ISidebarFriendsUserDetails } from "../models/ISidebarUserDetails";
import styles from "./SidebarUserDetailsList.module.css";

type ISidebarUserDetailsListProps = {
    userDetailsList: ISidebarFriendsUserDetails[];
}

export function SidebarUserDetailsList({
    userDetailsList
}: ISidebarUserDetailsListProps) {
    
    
        return (
            <div className={styles.container}>

                <div className={styles.titleContainer}>
                    <h2 className={styles.title}>Messages</h2>
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