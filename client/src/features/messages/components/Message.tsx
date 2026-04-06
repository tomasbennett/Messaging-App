import { FileIcon } from "../../../assets/icons/FileIcon";
import { IPropsMessageComponent } from "../models/IPropsMessage";
import styles from "./Message.module.css";




export function MessageComponent({
    messageId,
    senderUsername,
    timestamp,
    content,
    files
}: IPropsMessageComponent) {



    return (
        <>


            <div className={styles.outerContainer}>


                {
                    senderUsername &&
                    <p className={styles.senderUsername}>{senderUsername}</p>
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