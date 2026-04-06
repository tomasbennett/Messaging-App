import styles from "./SidebarUserDetails.module.css";
import defaultUserImg from "../../../assets/DEFAULT_USER_IMG.png";
import { ISidebarFriendsUserDetails } from "../models/ISidebarUserDetails";
import { useNavigate } from "react-router-dom";
import { conversationPageRoute } from "../../../constants/routes";
import { IFriendPreviewMessages } from "../../../../../shared/features/conversation/models/IFriendPreviewMessages";
import { FileIcon } from "../../../assets/icons/FileIcon";



export function SidebarUserDetails({
    conversation,
    latestMessage
}: IFriendPreviewMessages) {

    const {
        conversationId,
        name: conversationName,
        groupChatProfilePicture: conversationProfilePictureUrl,
        isRead
    } = conversation;

    const {
        timestamp: lastMessageTimestamp,
        content: lastMessageContent
    } = latestMessage || {};


    const nav = useNavigate();

    const openConversation = () => {
        console.log(`Opening conversation with ID: ${conversationId}`);
        
        nav(`${conversationPageRoute}/${conversationId}`, { replace: true });

    }



    return (
        <div className={styles.outerContainer} onClick={openConversation}>

            <div className={styles.userIconContainer}>
                {
                    conversationProfilePictureUrl.type === "custom" ?
                        
                        <img 
                            src={conversationProfilePictureUrl.groupChatProfileImgUrl} 
                            alt={`${conversationName}'s profile picture`} 
                            className={styles.singleIcon} />
                        
                        :

                        conversationProfilePictureUrl.participants.length > 1 ?

                        <div className={styles.multiIconContainer}>

                            <img 
                                src={conversationProfilePictureUrl.participants[0]?.profileImgUrl ?? defaultUserImg} 
                                alt={`User Icon: ${conversationName}`} 
                                className={styles.multiIcon}
                                />

                            <div className={styles.participantsNumber}>
                                {`+${conversationProfilePictureUrl.participants.length - 1}`}
                            </div>

                        </div>

                        :

                        <img 
                            src={defaultUserImg} 
                            alt={`User Icon: ${conversationName}`} 
                            className={styles.singleIcon}
                            />
                }
            </div>

            <div className={styles.textDetailsContainer}>
                <div className={styles.upperTextContainer}>

                    <p className={styles.username}>{conversationName}</p>   
                    <p className={styles.timestamp}>{lastMessageTimestamp ? lastMessageTimestamp.toLocaleTimeString() : ""}</p>

                </div>
                <div className={styles.lowerTextContainer}>

                    {
                        lastMessageContent &&

                            lastMessageContent.messageType === "text" ?

                                <p className={styles.lastMessage}>{lastMessageContent.textContent || ""}</p>
                            
                                :

                                <div className={styles.fileLastMessageContainer}>

                                    <div className={styles.fileSVGContainer}>
                                        
                                        <FileIcon />

                                    </div>

                                    <p className={styles.fileLastMessageText}>{`File Size: ${lastMessageContent?.fileSize}`}</p>

                                </div>
                    }


                </div>
            </div>

        </div>
    );
}  