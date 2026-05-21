import { FileIcon } from "../../../assets/icons/FileIcon";
import { IPropsMessageComponent } from "../models/IPropsMessage";
import styles from "./Message.module.css";
import defaultUserProfileImg from "../../../assets/DEFAULT_USER_IMG.png"
import { useAuth } from "../../auth/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { logInPageRoute } from "../../../constants/routes";
import { useError } from "../../error/contexts/ErrorContext";
import { useMemo } from "react";
import { domain } from "../../../constants/EnvironmentAPI";
import { formatSentAtDate } from "../../../util/FormatDateMessage";



export function MessageComponent({
    messageId,
    conversationId,
    timestamp,
    content,
    files,
    senderId,
    conversationGroupType,
    senderName,
    senderProfileImgUrl
}: IPropsMessageComponent) {


    const { authLevel } = useAuth();

    const errorCtx = useError();

    if (authLevel.userType === "none" || authLevel.userType === "unknown") {
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
                    conversationGroupType === "group" &&

                    <div className={styles.userDetailsContainer}>

                        <div className={styles.profileImgContainer}>
                            <img src={senderProfileImgUrl ?? defaultUserProfileImg} alt={`User profile image: ${senderName}`} />
                        </div>
                        <p className={styles.senderUsername}>
                            <span>
                                {senderName}
                            </span>
                        </p>


                    </div>

                }


                {
                    files && files.length > 0 &&
                    <div className={styles.filesContainer}>
                        {
                            files.map((file, index) => {
                                // const isImage = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(file.fileUrl);

                                if (file.fileDetails.fileType === "inline") {
                                    return (
                                        <div key={file.fileId} className={styles.imgContainer}>
                                            <img src={file.fileDetails.signedUrl} alt={`Message image: ${file.fileDetails.signedUrl}`} />
                                        </div>
                                    )
                                }

                                return (

                                    <a key={index} href={`${domain}/api/conversations/${conversationId}/download/${file.fileDetails.supabaseId}`} target="_blank" rel="noopener noreferrer" className={styles.fileLink}>
                                        <div className={styles.fileContainer}>

                                            <div className={styles.fileSVGContainer}>
                                                <FileIcon />
                                            </div>

                                            <div className={styles.fileRightSideContainer}>

                                                <p className={styles.fileName}>{file.fileDetails.filename}</p>
                                                <p className={styles.fileType}>{file.fileDetails.mimetype} File</p>

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
                    <p className={styles.timestamp}>{formatSentAtDate(timestamp)}</p>
                }




            </div>



        </>
    )
}