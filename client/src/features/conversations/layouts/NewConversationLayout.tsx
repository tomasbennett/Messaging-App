import { useInviteUsersToConversation } from "../hooks/useInviteUsersToConversation";
import styles from "./NewConversationLayout.module.css";



export function NewConversationLayout({

}) {

    const {
        isLoading,
    } = useInviteUsersToConversation();



    return (
        <div className={styles.outerContainer}>
            

            <div className={styles.innerContainer}>


                


            </div>


        </div>
    )
}