import styles from "./AsideMenuLayout.module.css";
import githubImage from "../../../assets/github-profile-image.png";
import { NavLink } from "react-router-dom";
import { homePageRoute } from "../../../constants/routes";
import { AsideMenuOption } from "../components/AsideMenuOption";
import { MessageIcon } from "../../../assets/icons/MessageIcon";
import { useFriendMessageContext } from "../../messages/contexts/FriendMessageContext";
import { useMemo } from "react";

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
                            label={"Messages"}
                            icon={<MessageIcon />}
                            notification={
                                unreadMessagesCount > 0 ? unreadMessagesCount : undefined
                            }
                            />


                    </ul>
                </aside>

                <main className={styles.main}>
                    {
                        children
                    }
                </main>

            </div>

        </>
    );
}