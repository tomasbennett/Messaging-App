import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { APIErrorSchema } from "../../../../../shared/features/api/models/APIErrorResponse";
import { FILES_KEY_NAME } from "../../../../../shared/features/message/constants";
import { IMessageContentFile, IMessageContentFileArray, MessageContentFileArraySchema, MessageContentFileSchema } from "../../../../../shared/features/message/models/IMessageContent";
import { IMessageSendSocketData, MessageSuccessUploadSocketSchema } from "../../../../../shared/features/sockets/models/IMessageSocket";
import { noErrorCtxError, notExpectedFormatError, unknownError } from "../../../constants/errorConstants";
import { errorPageRoute, homePageRoute } from "../../../constants/routes";
import { useSocket } from "../../../contexts/SocketHandlerContext";
import { useJWTFetch } from "../../../hooks/useJWTFetch";
import { useAuth } from "../../auth/contexts/AuthContext";
import { useError } from "../../error/contexts/ErrorContext";
import { domain } from "../../../constants/EnvironmentAPI";
import { IInputMessageComponentProps, IInputMessageErrors } from "../models/IInputMessageProps";
import { IInlineOrDownloadableFile } from "../../../../../shared/features/files/discriminatedUnions/InlineVsDownloadableFiles";
import { IFileArrayProperties } from "../../../../../shared/features/files/models/IFileArray";
import { allowedAllFileTypes, allowedImgTypes, allowedTextFileTypes, maxFileSizeInBytes } from "../../../../../shared/features/files/constants";

export function useInputMessage({
    conversationDetails,
    onMessageSent
}: IInputMessageComponentProps) {

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<IInputMessageErrors>({
        content: undefined,
        files: undefined,
        root: undefined
    });


    const { setAuthLevel, authLevel } = useAuth();
    const { jwtFetchHandler } = useJWTFetch();
    const socket = useSocket();


    const [preppedFiles, setPreppedFiles] = useState<{ fileId: string, file: File }[]>([]);
    const [preppedFilePreviews, setPreppedFilePreviews] = useState<IFileArrayProperties[]>([]);
    const [content, setContent] = useState<string>("");


    const errCtx = useError();
    const nav = useNavigate();




    const onSubmit = async () => {
        if (!errCtx) {
            nav(errorPageRoute, {
                replace: true,
                state: {
                    error: noErrorCtxError
                }
            });
            return;
        }

        if (!socket || !socket.id) {
            errCtx.throwError({
                ok: false,
                status: 0,
                message: "WebSocket connection is not established. Please try again later!!!"
            });
            nav(errorPageRoute, {
                replace: true,
                state: {
                    error: {
                        ok: false,
                        status: 0,
                        message: "WebSocket connection is not established. Please try again later!!!"
                    }
                }
            });
            return;
        }

        if (authLevel.userType !== "user") {
            errCtx.throwError({
                ok: false,
                status: 0,
                message: "You must be logged in to send messages!!!"
            });
            setAuthLevel({ userType: "none" });
            nav(homePageRoute, {
                replace: true
            });
            return;
        }


        try {
            setIsLoading(true);

            const snapshot: IMessageContentFileArray = {
                content,
                files: preppedFiles.map(f => f.file)
            };

            const isValidSubmission = MessageContentFileArraySchema.safeParse(snapshot);
            const filePreviewTypes: IFileArrayProperties[] = [...preppedFilePreviews];
            const conversationId = conversationDetails.conversationId;

            if (!isValidSubmission.success) {
                const validationErrors = isValidSubmission.error.flatten();

                setErrors({
                    content: validationErrors.fieldErrors.content?.[0],
                    files: validationErrors.fieldErrors.files?.[0],
                    root: validationErrors.formErrors?.[0]
                });

                return;
            }

            const data: IMessageContentFileArray = { ...isValidSubmission.data };


            const reqBody: IMessageSendSocketData = {
                conversationId,
                content: data.content,
                userSocketId: socket.id,
                [FILES_KEY_NAME]: undefined
            };

            const formData = new FormData();

            formData.append("conversationId", conversationId);
            formData.append("userSocketId", socket.id);

            if (data.content) {
                formData.append("content", data.content);
            }

            if (data[FILES_KEY_NAME]) {
                const files = data[FILES_KEY_NAME];
                for (let i = 0; i < files.length; i++) {
                    formData.append(FILES_KEY_NAME, files[i]);
                }
            }

            const response = await jwtFetchHandler(`${domain}/api/messages/${conversationId}/send`, {
                method: "POST",
                body: formData
            });

            if (response.returnType === "fetchError") {
                errCtx.throwError(response.error);
                return;
            }

            if (response.returnType === "loginError") {
                errCtx.throwError(response.error);
                setAuthLevel({ userType: "none" });
                return;
            }

            const resJSON = await response.data.json();

            const messageUploadResult = MessageSuccessUploadSocketSchema.safeParse(resJSON);
            if (messageUploadResult.success) {

                //ON SUBMIT CLEAR ALL STATES AS THE PREDEFINED VALUES WILL BE USED INSIDE OF ONMESSAGESENT
                //DO NOT URL.REVOKE OBJECT URLS HERE AS THEY ARE STILL NEEDED IN THE COMPONENT TO DISPLAY ON THE CONVERSATION
                setContent("");
                setPreppedFiles([]);
                setPreppedFilePreviews([]);
                setErrors({
                    content: undefined,
                    files: undefined,
                    root: undefined
                })

                onMessageSent({
                    ...conversationDetails,
                    content: data.content,
                    timestamp: new Date(),
                    files: filePreviewTypes,
                    messageId: messageUploadResult.data.messageId
                });
                return;

            }

            const errorResult = APIErrorSchema.safeParse(resJSON);
            if (errorResult.success) {
                errCtx.throwError(errorResult.data);
                return;
            }

            errCtx.throwError(notExpectedFormatError);
            return;






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

    const prepFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target?.files;

        if (!files || files.length === 0) {
            return;
        }

        const fileArray = Array.from(files);

        const invalidFile = fileArray.find(file =>
            !allowedAllFileTypes.includes(file.type) ||
            file.size > maxFileSizeInBytes
        );

        if (invalidFile) {
            setErrors(prev => ({
                ...prev,
                files: `File ${invalidFile.name} is either too large or of an unsupported file type.`
            }));

            return;
        }

        const filePreviews: { fileObjs: { fileId: string, file: File }, previewFiles: IFileArrayProperties }[] = fileArray.map((file) => {
            const previewUrl = URL.createObjectURL(file);
            let fileType: IInlineOrDownloadableFile;


            if (allowedImgTypes.includes(file.type)) {
                fileType = {
                    fileType: "inline",
                    signedUrl: previewUrl
                };
            } else {
                fileType = {
                    fileType: "downloadable",
                    supabaseId: previewUrl,
                    filename: file.name,
                    mimetype: file.type,
                    fileSizeInBytes: file.size
                };
            }

            const randomId = crypto.randomUUID();

            return {
                fileObjs: {
                    file,
                    fileId: randomId
                },
                previewFiles: {
                    fileId: randomId,
                    fileDetails: fileType
                }
            }
        });

        setPreppedFilePreviews(prev => {
            return [...prev, ...filePreviews.map(file => file.previewFiles)]

        });
        setPreppedFiles(prev => {
            return [...prev, ...filePreviews.map(file => file.fileObjs)]
        });

        return;

    }


    const removeFile = (fileId: string) => {
        if (preppedFiles.length <= 0 || preppedFilePreviews.length <= 0) return;

        const fileToRemove = preppedFilePreviews.find(file => file.fileId === fileId);

        if (!fileToRemove) return;

        if (fileToRemove.fileDetails.fileType === "inline") {
            URL.revokeObjectURL(fileToRemove.fileDetails.signedUrl);
        } else {
            URL.revokeObjectURL(fileToRemove.fileDetails.supabaseId);
        }

        setPreppedFilePreviews(prev => prev.filter(file => file.fileId !== fileId));
        setPreppedFiles(prev => prev.filter(file => file.fileId !== fileId));

    }


    useEffect(() => {
        setErrors({
            content: undefined,
            files: undefined,
            root: undefined
        });
    }, [content, preppedFiles]);

    return {
        content,
        setContent,
        onSubmit,
        prepFiles,
        removeFile,
        preppedFilePreviews,
        isLoading,
        errors
    }
}