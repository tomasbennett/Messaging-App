import { IInlineOrDownloadableFile } from "../../../../../shared/features/files/discriminatedUnions/InlineVsDownloadableFiles";
import { FileIcon } from "../../../assets/icons/FileIcon";
import { formatFileSize } from "../../../util/FormatBytes";
import { useInputMessage } from "../hooks/useInputMessage";
import styles from "./FileElement.module.css";



type IFileElementProps = {
    fileId: string,
    fileDetails: IInlineOrDownloadableFile,
    removeFile?: ReturnType<typeof useInputMessage>["removeFile"]
}


export function FileElementComponent({
    fileId,
    fileDetails,
    removeFile
}: IFileElementProps) {









    return (
        <>
            <div className={styles.outerContainer}>

                {
                    fileDetails.fileType === "inline" ? (
                        <>
                        
                            <div className={styles.imgContainer}>
                                <img src={fileDetails.signedUrl} alt={`Image file prepped for sending`} />
                                {
                                    removeFile &&
                                        <div className={`${styles.removeImgContainer} ${styles.removeFileContainer}`}>
                                            <button onClick={() => removeFile(fileId)} className={styles.removeFileButton}>X</button>
                                        </div>
                                }
                            </div>
                        
                        </>
                    )

                    : (
                        <>

                            <a href={fileDetails.supabaseId} target="_blank" rel="noopener noreferrer" className={styles.downloadableFileContainer}>
                                <div className={styles.svgContainer}>
                                    <FileIcon />
                                </div>

                                <div className={styles.textContainer}>
                                    <p className={styles.fileName}>{fileDetails.filename}</p>
                                    <p className={styles.fileSize}>{`File size: ${formatFileSize(fileDetails.fileSizeInBytes)}`}</p>
                                </div>

                                {
                                    removeFile &&
                                        <div className={`${styles.removeDownloadableContainer} ${styles.removeFileContainer}`}>

                                            <button onClick={(e) => {
                                                e.stopPropagation();
                                                removeFile(fileId);
                                            }} className={styles.removeFileButton}>
                                                X
                                            </button>

                                        </div>
                                }


                            </a>
                        
                        
                        
                        </>
                    )



                }






            </div>
        </>
    )
}