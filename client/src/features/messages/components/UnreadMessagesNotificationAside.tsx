import styles from "./UnreadMessagesNotificationAside.module.css";



export function UnreadMessagesNotificationNumber() {

    


    return (
        <div className={styles.notificationContainer}>
            <span className={styles.notificationText}>{numberNewNotifications}</span>
        </div>
    );
}