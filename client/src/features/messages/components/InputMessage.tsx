import { useForm } from "react-hook-form";
import styles from "./InputMessage.module.css";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConversationMessageSchema, IConversationMessage } from "../../../../../shared/features/message/models/IConversationMessage";
import { IMessageContentFile, MessageContentFileSchema } from "../../../../../shared/features/message/models/IMessageContent";
import { useEffect, useState } from "react";
import { useAuth } from "../../auth/contexts/AuthContext";
import { useJWTFetch } from "../../../hooks/useJWTFetch";
import { useError } from "../../error/contexts/ErrorContext";
import { Navigate, useNavigate } from "react-router-dom";
import { errorPageRoute, homePageRoute } from "../../../constants/routes";
import { noErrorCtxError, notExpectedFormatError, unknownError } from "../../../constants/errorConstants";
import { LoadingCircle } from "../../../components/LoadingCircle";
import { ArrowIcon } from "../../../assets/icons/ArrowIcon";
import { domain } from "../../../constants/EnvironmentAPI";
import { IMessageSendSocketData, MessageSuccessUploadSocketSchema } from "../../../../../shared/features/sockets/models/IMessageSocket";
import { useSocket } from "../../../contexts/SocketHandlerContext";
import { FILES_KEY_NAME } from "../../../../../shared/features/message/constants";
import { APIErrorSchema } from "../../../../../shared/features/api/models/APIErrorResponse";
import { IInputMessageComponentProps } from "../models/IInputMessageProps";
import { useInputMessage } from "../hooks/useInputMessage";
import { FileElementComponent } from "./FileElement";



export function InputMessageComponent({
    conversationDetails,
    onMessageSent
}: IInputMessageComponentProps) {

    const {
        isLoading,
        prepFiles,
        removeFile,
        onSubmit,
        setContent,
        content,
        preppedFilePreviews,
        errors,

    } = useInputMessage({
        conversationDetails,
        onMessageSent
    });

    return (
        <>

            <div className={styles.outerContainer}>

                <div className={styles.errorContainer}>
                    {
                        Object.entries(errors).filter(([key, value]) => value !== undefined).map(([key, value]) => (
                            <p key={key} className={styles.errorText}>{value}</p>
                        ))
                    }
                </div>

                <form onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit();
                }} className={styles.innerContainer}>

                    <div className={styles.fileInputContainer}>
                        <label className={`${styles.fileInput} ${styles.inputField}`}>
                            +
                            <input hidden type="file" multiple />
                        </label>

                    </div>

                    <div className={styles.textInputContainer}>

                        <div className={styles.filesDisplayContainer}>
                            {
                                preppedFilePreviews.map((file) => (
                                    <FileElementComponent
                                        key={file.fileId}
                                        />

                                ))
                            }
                        </div>

                        <div className={styles.textareaInnerContainer}>
                            <textarea value={content} onChange={(e) => {
                                setContent(e.target.value);
                            }} placeholder="Enter your message here..." className={`${styles.textInput} ${styles.inputField}`} />
                        </div>

                    </div>

                    <button disabled={isLoading} type="submit" className={styles.sendButton}>
                        {
                            isLoading ?
                                <LoadingCircle height="80%" />

                                :

                                <ArrowIcon />

                        }
                    </button>

                </form>

            </div>

        </>
    )
}