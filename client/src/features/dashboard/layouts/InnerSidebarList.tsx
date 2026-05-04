import { SidebarUserDetails } from "../components/SidebarConversationDetails";
import styles from "./InnerSidebarList.module.css";
import { IFriendPreviewMessages } from "../../../../../shared/features/conversation/models/IFriendPreviewMessages";





type ISidebarUserDetailsListProps = {
    userDetailsList: IFriendPreviewMessages[];
}

export function SidebarUserDetailsList({
    userDetailsList
}: ISidebarUserDetailsListProps) {




    return (
        <div className={styles.container}>

            <div className={styles.titleContainer}>

                <div className={styles.btnContainer}>

                    <h2 className={styles.title}>Conversations</h2>

                </div>

            </div>

            <ul className={styles.listContainer}>

                {
                    userDetailsList.length === 0 ? (
                        <li className={styles.noConversationsText}>No conversations yet. Start by searching for friends and sending them a message!</li>
                    )

                        :

                        userDetailsList.map((details) => (
                            <li
                                key={details.conversation.conversationId}
                                className={styles.listItem}>

                                <SidebarUserDetails
                                    conversation={details.conversation}
                                    latestMessage={details.latestMessage}
                                />

                            </li>
                        ))

                }

            </ul>
        </div>
    );
}