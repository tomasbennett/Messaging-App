import { useForm } from "react-hook-form";
import styles from "./InputMessage.module.css";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConversationMessageSchema, IConversationMessage } from "../../../../../shared/features/message/models/IConversationMessage";
import { IMessageContentFile, MessageContentFileSchema } from "../../../../../shared/features/message/models/IMessageContent";
import { useEffect, useState } from "react";
import { useAuth } from "../../auth/contexts/AuthContext";
import { useJWTFetch } from "../../../hooks/useJWTFetch";
import { useError } from "../../error/contexts/ErrorContext";
import { useNavigate } from "react-router-dom";
import { errorPageRoute } from "../../../constants/routes";
import { noErrorCtxError, unknownError } from "../../../constants/errorConstants";
import { LoadingCircle } from "../../../components/LoadingCircle";
import { ArrowIcon } from "../../../assets/icons/ArrowIcon";





export function InputMessageComponent() {

    const {
        handleSubmit,
        formState: { errors },
        register,
        setError,
        
    } = useForm<IMessageContentFile>({
        resolver: zodResolver(MessageContentFileSchema)
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { setAuthLevel } = useAuth();
    const { jwtFetchHandler } = useJWTFetch();
    const errCtx = useError();

    const nav = useNavigate();

    const onSubmit = async (data: IMessageContentFile) => {
        if (!errCtx) {
            nav(errorPageRoute, {
                replace: true,
                state: {
                    error: noErrorCtxError
                }
            });
            return;
        }


        try {
            setIsLoading(true);


        } catch (error) {
            if (error instanceof Error) {
                errCtx.throwError({
                    ok: false,
                    status: 0,
                    message: error.message
                });
                return;
            }

            errCtx.throwError(unknownError);
            return;


        } finally {
            setIsLoading(false);
        }

    }

    // useEffect(() => {
    //     if (!errCtx) {
    //         nav(errorPageRoute, {
    //             replace: true,
    //             state: {
    //                 error: noErrorCtxError
    //             }
    //         });
    //         return;
    //     }

    //     if (errors.content?.message) {
    //         errCtx.throwError({
    //             message: errors.content.message,
    //             status: 0,
    //             ok: false
    //         });
    //     } 
    //     if (errors.files?.message) {
    //         errCtx.throwError({
    //             message: errors.files.message,
    //             status: 0,
    //             ok: false
    //         });
    //     } 
    //     if (errors.root?.message) {
    //         errCtx.throwError({
    //             message: errors.root.message,
    //             status: 0,
    //             ok: false
    //         });
    //     }
    // }, [errors.content?.message, errors.files?.message, errors.root?.message]);

    return (
        <>

            <div className={styles.outerContainer}>
                {/* <form onSubmit={handleSubmit(onSubmit)} className={styles.formContainer}> */}

                <form className={styles.innerContainer}>

                    <div className={styles.fileInputContainer}>
                        <label className={`${styles.fileInput} ${styles.inputField}`}>
                            +
                            <input hidden type="file" multiple />
                        </label>

                    </div>

                    <div className={styles.textInputContainer}>
                        <textarea placeholder="Enter your message here..." className={`${styles.textInput} ${styles.inputField}`} />
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


                {/* </form> */}
            </div>

        </>
    )
}