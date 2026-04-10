import { FileIcon } from "../../../assets/icons/FileIcon";
import { IPropsMessageComponent } from "../models/IPropsMessage";
import styles from "./Message.module.css";
import defaultUserProfileImg from "../../../assets/DEFAULT_USER_IMG.png"
import { useAuth } from "../../auth/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { logInPageRoute } from "../../../constants/routes";
import { useError } from "../../error/contexts/ErrorContext";
import { useMemo } from "react";



export function MessageComponent({
    messageId,
    conversationId,
    timestamp,
    content,
    files,
    senderId,
    conversationGroupType
}: IPropsMessageComponent) {


    const { authLevel } = useAuth();

    const errorCtx = useError();

    if (authLevel.userType === "none") {
        errorCtx?.throwError({
            message: "You must be logged in to view messages. Please log in and try again.",
            status: 401,
            ok: false
        });

        return (
            <Navigate to={logInPageRoute} replace={true} />
        )
    }


    const isOwnMessage = useMemo<boolean>(() => { return authLevel.userId === senderId; }, [senderId, authLevel.userId]);

    const messageContainerClassName = useMemo<string>(() => {
        let baseClass = styles.outerContainer;

        if (isOwnMessage) {
            baseClass += ` ${styles.ownMessage}`;
        } else {
            baseClass += ` ${styles.otherMessage}`;
        }

        return baseClass;
    }, [isOwnMessage]);

    return (
        <>


            <div className={messageContainerClassName}>

                {
                    conversationGroupType.type === "group" &&

                    <>
                    
                        <p className={styles.senderUsername}>{conversationGroupType.senderName}</p>
                        
                        <div className={styles.profileImgContainer}>
                            <img src={conversationGroupType?.senderProfileImgUrl ?? defaultUserProfileImg} alt={`User profile image: ${conversationGroupType.senderName}`} />
                        </div>
                    
                    </>
                }


                {
                    files && files.length > 0 &&
                    <div className={styles.filesContainer}>
                        {
                            files.map((file, index) => {
                                const isImage = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(file.fileUrl);

                                if (isImage) {
                                    return (
                                        <div key={file.fileId} className={styles.imgContainer}>
                                            <img src={file.fileUrl} alt={`Message image: ${file.fileUrl}`} />
                                        </div>
                                    )
                                }

                                return (

                                    <a key={index} href={file.fileUrl} target="_blank" rel="noopener noreferrer" className={styles.fileLink}>
                                        <div className={styles.fileContainer}>

                                            <div className={styles.fileSVGContainer}>
                                                <FileIcon />
                                            </div>

                                            <div className={styles.fileRightSideContainer}>

                                                <p className={styles.fileName}>{file.fileUrl.split("/").pop()}</p>
                                                <p className={styles.fileType}>{file.fileUrl.split(".").pop()?.toUpperCase()} File</p>

                                            </div>

                                        </div>
                                    </a>

                                )
                            })
                        }
                    </div>
                }


                {
                    content &&
                    <p className={styles.messageContent}>{content}</p>
                }

                {
                    timestamp &&
                    <p className={styles.timestamp}>{timestamp.toLocaleString()}</p>
                }




            </div>



        </>
    )
}