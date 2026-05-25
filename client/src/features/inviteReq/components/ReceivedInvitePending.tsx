import { ISentConversationInvite } from "../../../../../shared/features/inviteReq/models/ISentConversationInvite";
import styles from "./ReceivedInvitePending.module.css";
import defaultUserProfileImg from "../../../assets/DEFAULT_USER_IMG.png";
import { IReceivingAnInvite } from "../../../../../shared/features/inviteReq/models/IReceivingAnInvite";
import { useState } from "react";
import { useError } from "../../error/contexts/ErrorContext";
import { useJWTFetch } from "../../../hooks/useJWTFetch";
import { useSocket } from "../../../contexts/SocketHandlerContext";
import { useAuth } from "../../auth/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { conversationPageRoute, errorPageRoute, invitesPageRoute } from "../../../constants/routes";
import { noErrorCtxError, noSocketConnectionError, notExpectedFormatError, unknownError } from "../../../constants/errorConstants";
import { domain } from "../../../constants/EnvironmentAPI";
import { APIErrorSchema, ICustomErrorResponse } from "../../../../../shared/features/api/models/APIErrorResponse";
import { IBaseSocketEmitData } from "../../../../../shared/features/sockets/models/IBaseSocketReqData";
import { APISuccessSchema } from "../../../../../shared/features/api/models/APISuccessResponse";
import { IPendingInviteSentvsReceivedDisUnion } from "../../../../../shared/features/inviteReq/discriminatedUnions/IPendingInviteSentvsReceived";
import { LoadingCircle } from "../../../components/LoadingCircle";
import { usePopup } from "../../../hooks/usePopup";
import { useInviteReqContext } from "../contexts/InviteReqContext";
import { useFriendMessageContext } from "../../messages/contexts/PreviewFriendConversationContext";
import { ReceiveFriendPreviewMessagesFrontendSchema } from "../../../../../shared/features/conversation/models/IFriendPreviewMessages";



type IReceivedInvitePendingProps = IReceivingAnInvite & {
    setPendingInvites: React.Dispatch<React.SetStateAction<IPendingInviteSentvsReceivedDisUnion[]>>;
};

export function ReceivedInvitePending({
    conversationId,
    conversationName,
    inviterUserId,
    inviterUsername,
    inviterProfilePictureUrl,
    setPendingInvites
}: IReceivedInvitePendingProps) {

    const [isAcceptLoading, setIsAcceptLoading] = useState<boolean>(false);
    const [isDeclineLoading, setIsDeclineLoading] = useState<boolean>(false);

    const errCtx = useError();

    const { setAuthLevel } = useAuth();
    const { jwtFetchHandler } = useJWTFetch();
    const socket = useSocket();

    const nav = useNavigate();

    const { showInvitePopup } = useInviteReqContext();
    const { setFriendMessages } = useFriendMessageContext();

    const onAccept = async () => {
        const setIsLoading = setIsAcceptLoading;

        if (!errCtx) {
            nav(errorPageRoute, {
                state: {
                    error: noErrorCtxError
                }
            });

            return;
        }

        if (!socket.id) {
            errCtx.throwError(noSocketConnectionError);
            nav(errorPageRoute, {
                state: {
                    error: noSocketConnectionError
                }
            });
            return;
        }


        try {
            const reqBodySocketData: IBaseSocketEmitData = {
                userSocketId: socket.id
            }

            setIsLoading(true);

            const response = await jwtFetchHandler(`${domain}/api/invites/${conversationId}/acceptInvite`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(reqBodySocketData)
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

            const successResult = ReceiveFriendPreviewMessagesFrontendSchema.safeParse(resJSON);
            if (successResult.success) {
                const newConversationData = successResult.data.friendPreviewsData[0];

                const onClick = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    nav(`${conversationPageRoute}/${conversationId}`, { replace: true });
                }
                showInvitePopup({
                    conversationId,
                    conversationName,
                    inviterUserId,
                    inviterUsername,
                    inviterProfilePictureUrl,
                    onClick,
                    bcg: "green",
                    message: `Successfully joined: ${conversationName}`
                });
                setPendingInvites(prev => {
                    return prev
                        .filter(p => {
                            if (p.type === "sentInvite") return true;

                            return p.conversationId !== conversationId || p.inviterUserId !== inviterUserId
                        });
                });

                setFriendMessages(prev => {
                    return [
                        ...prev,
                        {
                            conversation: newConversationData.conversation,
                            latestMessage: newConversationData.latestMessage,
                        }
                    ]
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

    const onDecline = async () => {
        const setIsLoading = setIsDeclineLoading;

        if (!errCtx) {
            nav(errorPageRoute, {
                state: {
                    error: noErrorCtxError
                }
            });

            return;
        }

        if (!socket.id) {
            errCtx.throwError(noSocketConnectionError);
            nav(errorPageRoute, {
                state: {
                    error: noSocketConnectionError
                }
            });
            return;
        }


        try {
            const reqBodySocketData: IBaseSocketEmitData = {
                userSocketId: socket.id
            }

            setIsLoading(true);

            const response = await jwtFetchHandler(`${domain}/api/invites/${conversationId}/declineInvite`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(reqBodySocketData)
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

            const successResult = APISuccessSchema.safeParse(resJSON);
            if (successResult.success) {
                showInvitePopup({
                    conversationId,
                    conversationName,
                    inviterUserId,
                    inviterUsername,
                    inviterProfilePictureUrl,
                    bcg: "purple",
                    message: `Declined invite: ${conversationName}`
                });

                setPendingInvites(prev => {
                    return prev
                        .filter(p => {
                            if (p.type === "sentInvite") return true;

                            return p.conversationId !== conversationId || p.inviterUserId !== inviterUserId
                        });
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



    return (
        <>
            <div className={styles.outerContainer}>

                <div className={styles.imgContainer}>
                    <img className={styles.img} src={inviterProfilePictureUrl ?? defaultUserProfileImg} alt="User profile image" />
                </div>

                <div className={styles.rightSideContainer}>

                    <div className={styles.textUpperContainer}>

                        <p className={styles.username}>
                            <span>
                                {`User: ${inviterUsername}`}
                            </span>
                        </p>

                        <p className={styles.conversationName}>
                            <span>
                                {`Invited to: ${conversationName}`}
                            </span>
                        </p>

                    </div>



                    <div className={styles.btnLowerContainer}>

                        <button disabled={isAcceptLoading || isDeclineLoading} onClick={onAccept} className={styles.acceptBtn} type="button">
                            {
                                isAcceptLoading ?
                                    <LoadingCircle height="60%" />

                                    :

                                    "Accept"
                            }
                        </button>

                        <button disabled={isAcceptLoading || isDeclineLoading} onClick={onDecline} className={styles.declineBtn} type="button">
                            {
                                isDeclineLoading ?
                                    <LoadingCircle height="60%" />

                                    :

                                    "Decline"
                            }
                        </button>

                    </div>


                </div>



            </div>
        </>
    )
}