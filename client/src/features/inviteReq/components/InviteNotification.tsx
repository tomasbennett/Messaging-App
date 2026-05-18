import { IReceivingAnInvite } from "../../../../../shared/features/inviteReq/models/IReceivingAnInvite";
import styles from "./InviteNotification.module.css";
import defaultUserImage from "../../../assets/DEFAULT_USER_IMG.png";
import { useNavigate } from "react-router-dom";
import { conversationPageRoute } from "../../../constants/routes";
import { IPopupNotificationProps } from "../models/IInviteNotificationProps";


type IInviteNotificationProps = IReceivingAnInvite & IPopupNotificationProps & {
    inviteContainerRef: React.RefObject<HTMLDivElement | null>,
    isClosing: boolean,
    
}

export function InviteNotification({
    conversationId,
    conversationName,
    inviterUserId,
    inviterUsername,
    inviterProfilePictureUrl,
    inviteContainerRef,
    isClosing,
    message,
    bcg,
    onClick
}: IInviteNotificationProps) {

    // const nav = useNavigate();

    // const onClick = (e: React.MouseEvent) => {
    //     e.stopPropagation();
    //     nav(`${conversationPageRoute}/${conversationId}`, { replace: true });
    // }

    const isOnClick: boolean = !!onClick;
    

    return (
        <>

            <div style={{ borderLeftColor: bcg, cursor: isOnClick ? "pointer" : "auto" }}  ref={inviteContainerRef} onClick={onClick} className={`${styles.outerContainer} ${isClosing ? styles.exitScreen : ""}`}>

                <div className={styles.imgContainer}>
                    <img className={styles.img} src={inviterProfilePictureUrl ?? defaultUserImage} alt="Inviter user profile image" />
                </div>

                <div className={styles.rightSideContainer}>
                    
                    <p className={styles.inviterUsername}>
                        <span>

                            {inviterUsername}

                        </span>
                    </p>

                    <p className={styles.conversationName}>
                        <span>

                            {message}

                        </span>
                    </p>

                </div>

            </div>

        </>
    )
}