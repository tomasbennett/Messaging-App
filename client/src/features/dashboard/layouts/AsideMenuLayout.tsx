import styles from "./AsideMenuLayout.module.css";
import githubImage from "../../../assets/github-profile-img.jpg";
import { NavLink, Outlet } from "react-router-dom";
import { homePageRoute, invitesPageRoute, myAccountPageRoute, newConversationPageRoute } from "../../../constants/routes";
import { AsideMenuOption } from "../components/AsideMenuOption";
import { MessageIcon } from "../../../assets/icons/MessageIcon";
import { useFriendMessageContext } from "../../messages/contexts/PreviewFriendConversationContext";
import { useMemo } from "react";
import { UserIcon } from "../../../assets/icons/UserIcon";
import { InviteConversationIcon } from "../../../assets/icons/InviteConversationIcon";
import { AddMessageIcon } from "../../../assets/icons/AddMessageIcon";

interface IAsideMenuLayoutProps {
    children: React.ReactNode;
}

export function AsideMenuLayout({
    children
}: IAsideMenuLayoutProps) {

    const {
        friendMessages,
        isLoading: areFriendMessagesLoading,
        setFriendMessages
    } = useFriendMessageContext();

    const unreadMessagesCount = useMemo(() => {
        // if (areFriendMessagesLoading) {
        //     return 0;
        // }

        return friendMessages.reduce((count, friendMessage) => {
            if (!friendMessage.conversation.isRead) {
                return count + 1;
            }
            return count;
        }, 0);
    }, [friendMessages]);



    return (
        <>
            <div className={styles.outerContainer}>

                <header className={styles.header}>
                    <div className={styles.titleContainer}>
                        <div className={styles.gitHubProfileImgContainer}>
                            <img src={githubImage} alt="Github Profile Image" />
                        </div>
                        <h1 className={styles.title}>MessageApp</h1>
                    </div>
                </header>

                <div className={styles.lowerContainer}>

                    <aside className={styles.aside}>
                        <ul className={styles.menuOptionsList}>

                            <AsideMenuOption
                                navigateTo={homePageRoute}
                                icon={<MessageIcon />}
                                label="Dashboard"
                                notification={
                                    unreadMessagesCount > 0 ? unreadMessagesCount : undefined
                                }
                            />

                            <AsideMenuOption
                                navigateTo={newConversationPageRoute}
                                icon={<AddMessageIcon />}
                                label="New Conversation"

                            />


                            <AsideMenuOption
                                navigateTo={invitesPageRoute}
                                icon={<InviteConversationIcon />}
                                label="Pending Invites"

                            />


                            {/* This could have the users profile picture if requested cleverly with a secondary request to the conversations but this would require tricky magic with an abort controller on the current running conversations if they are still being requested */}

                            <AsideMenuOption
                                navigateTo={myAccountPageRoute}
                                icon={<UserIcon />}
                                label="My Account"
                            />





                        </ul>
                    </aside>

                    <main className={styles.main}>
                        {
                            children
                        }
                    </main>

                </div>

            </div>

        </>
    );
}