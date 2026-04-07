import { FileIcon } from "../../../assets/icons/FileIcon";
import { IPropsMessageComponent } from "../models/IPropsMessage";
import styles from "./Message.module.css";
import defaultUserProfileImg from "../../../assets/DEFAULT_USER_IMG.png"



export function MessageComponent({
    messageId,
    conversationId,
    timestamp,
    content,
    files,
    conversationGroupType
}: IPropsMessageComponent) {



    return (
        <>


            <div className={styles.outerContainer}>


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