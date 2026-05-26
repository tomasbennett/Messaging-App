import { UserCogsIcon } from "../../../assets/icons/UserCogsIcon";
import { IPropsConversationHeaderComponent } from "../models/IPropsConversationHeaderComponent";
import styles from "./ConversationHeader.module.css";
import defaultUserImg from "../../../assets/DEFAULT_USER_IMG.png";
import { LogoutIcon } from "../../../assets/icons/LogoutIcon";
import { LeaveConversationIcon } from "../../../assets/icons/LeaveConversationIcon";
import { useMemo, useState } from "react";
import { useAuth } from "../../auth/contexts/AuthContext";
import { useError } from "../../error/contexts/ErrorContext";
import { useLocation, useNavigate } from "react-router-dom";
import { LoadingCircle } from "../../../components/LoadingCircle";
import { conversationPageRoute, errorPageRoute, homePageRoute } from "../../../constants/routes";
import { noErrorCtxError, noSocketConnectionError, notExpectedFormatError, unknownError } from "../../../constants/errorConstants";
import { useJWTFetch } from "../../../hooks/useJWTFetch";
import { domain } from "../../../constants/EnvironmentAPI";
import { useSocket } from "../../../contexts/SocketHandlerContext";
import { IBaseSocketEmitData } from "../../../../../shared/features/sockets/models/IBaseSocketReqData";
import { useInviteReqContext } from "../../inviteReq/contexts/InviteReqContext";
import { APIErrorSchema, ICustomErrorResponse } from "../../../../../shared/features/api/models/APIErrorResponse";
import { useFriendMessageContext } from "../contexts/PreviewFriendConversationContext";
import { usePendingInvitesContext } from "../../inviteReq/contexts/PendingInviteContext";
import { SharedOrSingleProfileImg } from "../../../components/SharedOrSingleProfileImg";


export function ConversationHeader({
    conversationId,
    name,
    groupChatProfilePicture,
}: IPropsConversationHeaderComponent) {


    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { authLevel, setAuthLevel } = useAuth();
    const socket = useSocket();
    const { setFriendMessages } = useFriendMessageContext();
    const groupChatProfileMainImg = useMemo<string>(() => {
        if (groupChatProfilePicture.type === "custom") {
            return groupChatProfilePicture.groupChatProfileImgUrl;

        } else {
            return groupChatProfilePicture.participants[0]?.profileImgUrl ?? defaultUserImg;

        }
    }, [groupChatProfilePicture]);


    const errCtx = useError();
    const { jwtFetchHandler } = useJWTFetch();
    const { showInvitePopup } = useInviteReqContext();


    const nav = useNavigate();
    const location = useLocation();

    const {
        setPendingInvites
    } = usePendingInvitesContext();


    const leaveConversation = async () => {
        if (!errCtx) {
            nav(errorPageRoute, {
                replace: true,
                state: {
                    error: noErrorCtxError
                }
            });
            return;
        }

        if (authLevel.userType !== "user") {
            const notLoggedInError: ICustomErrorResponse = {
                message: "You must be logged in to leave a conversation.",
                status: 401,
                ok: false
            }

            errCtx.throwError(notLoggedInError);
            nav(errorPageRoute, {
                replace: true,
                state: {
                    error: notLoggedInError
                }
            });

            return;
        }

        if (!socket || !socket.id) {
            errCtx.throwError(noSocketConnectionError);
            setAuthLevel({ userType: "none" });
            return;
        }


        try {

            setIsLoading(true);

            const reqBody: IBaseSocketEmitData = {
                userSocketId: socket.id,
            }

            const response = await jwtFetchHandler(`${domain}/api/invites/${conversationId}/leave`, {
                method: "DELETE",
                body: JSON.stringify(reqBody),
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (response.returnType === "fetchError") {
                errCtx.throwError(response.error);
                return;
            }

            if (response.returnType === "loginError") {
                setAuthLevel({ userType: "none" });
                errCtx.throwError(response.error);
                return;
            }

            if (response.data.status === 204) {
                if (location.pathname === `${conversationPageRoute}/${conversationId}`) {
                    nav(homePageRoute, { replace: true });
                }
                showInvitePopup({
                    conversationId,
                    conversationName: name,
                    inviterUserId: authLevel.userId,
                    inviterUsername: authLevel.username,
                    inviterProfilePictureUrl: authLevel.userProfileImgUrl,
                    bcg: "blue",
                    message: `You have left ${name} successfully.`
                });
                setFriendMessages(prev => prev.filter(conv => conv.conversation.conversationId !== conversationId));
                setPendingInvites(prev => prev.filter(invite => invite.conversationId !== conversationId));
                return;
            }

            const resJson = await response.data.json();

            const customErrorResult = APIErrorSchema.safeParse(resJson);
            if (customErrorResult.success) {
                errCtx.throwError(customErrorResult.data);
                return;
            }

            errCtx.throwError(notExpectedFormatError);
            return;



        } catch (error) {
            if (error instanceof Error) {
                errCtx.throwError({
                    message: error.message,
                    status: 0,
                    ok: false
                });
                return;
            }

            errCtx.throwError(unknownError);
            return;

        } finally {
            setIsLoading(false);
        }


    }

    const { friendMessages } = useFriendMessageContext();

    const conversationGroupType = useMemo(() => {
        const currentConv = friendMessages.find(conv => conv.conversation.conversationId === conversationId);
        if (!currentConv) return null;
        return currentConv.conversation.conversationGroupType;

    }, [friendMessages, conversationId]);


    return (
        <div className={styles.conversationHeader}>

            <div className={styles.leftHeaderContainer}>

                {
                    // groupChatProfilePicture.type === "custom" ?

                    //     <div className={styles.profImgContainer}>
                    //         <img
                    //             src={groupChatProfilePicture.groupChatProfileImgUrl}
                    //             alt={`${name}'s profile picture`}
                    //             className={styles.profImg} />
                    //     </div>

                    //     :

                    //     conversationGroupType === "group" ?
                    //         <div className={styles.multiIconContainer}>

                    //             <img
                    //                 src={groupChatProfilePicture.participants[0]?.profileImgUrl ?? defaultUserImg}
                    //                 alt={`User Icon: ${name}`}
                    //                 className={styles.multiIcon}
                    //             />

                    //             <div className={styles.participantsNumber}>
                    //                 {`+${groupChatProfilePicture.participants.length - 1}`}
                    //             </div>

                    //         </div>

                    //         :

                    //         <div className={styles.profImgContainer}>
                    //             <img
                    //                 src={groupChatProfilePicture.participants[0]?.profileImgUrl ?? defaultUserImg}
                    //                 alt={`${name}'s profile picture`}
                    //                 className={styles.profImg} />
                    //         </div>

                    <div className={styles.conversationProfileImgContainer}>
                        <SharedOrSingleProfileImg groupProfileImgType={groupChatProfilePicture} />
                    </div>
                }

                <div className={styles.conversationNameContainer}>

                    <p className={styles.conversationNameText}>{name}</p>
                    <small className={styles.contactInfo}>Click here for contact info</small>

                </div>

            </div>

            <div className={styles.rightHeaderContainer}>

                <div className={`${styles.svgContainer} ${styles.svgOptionsContainer}`}>
                    <UserCogsIcon />
                </div>

                <div onClick={() => {
                    if (isLoading) return;
                    leaveConversation();
                }} className={`${styles.svgContainer} ${styles.svgLeaveConversationContainer}`}>
                    {
                        isLoading ?
                            <LoadingCircle height="70%" />
                            :
                            <LeaveConversationIcon />
                    }


                </div>

            </div>

        </div>
    );
}