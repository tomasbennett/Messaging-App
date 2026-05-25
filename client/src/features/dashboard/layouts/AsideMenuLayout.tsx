import styles from "./AsideMenuLayout.module.css";
import githubImage from "../../../assets/github-profile-img.jpg";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { errorPageRoute, homePageRoute, invitesPageRoute, myAccountPageRoute, newConversationPageRoute } from "../../../constants/routes";
import { AsideMenuOption } from "../components/AsideMenuOption";
import { MessageIcon } from "../../../assets/icons/MessageIcon";
import { useFriendMessageContext } from "../../messages/contexts/PreviewFriendConversationContext";
import { useMemo, useState } from "react";
import { UserIcon } from "../../../assets/icons/UserIcon";
import { InviteConversationIcon } from "../../../assets/icons/InviteConversationIcon";
import { AddMessageIcon } from "../../../assets/icons/AddMessageIcon";
import { LogoutIcon } from "../../../assets/icons/LogoutIcon";
import { useAuth } from "../../auth/contexts/AuthContext";
import { useError } from "../../error/contexts/ErrorContext";
import { noErrorCtxError, notExpectedFormatError, unknownError } from "../../../constants/errorConstants";
import { domain } from "../../../constants/EnvironmentAPI";
import { APIErrorSchema, ICustomErrorResponse } from "../../../../../shared/features/api/models/APIErrorResponse";
import { LoadingCircle } from "../../../components/LoadingCircle";
import { useJWTFetch } from "../../../hooks/useJWTFetch";
import { accessTokenLocalStorageKey } from "../../../constants/accessTokenLocalStorageKey";
import { usePendingInvitesContext } from "../../inviteReq/contexts/PendingInviteContext";

interface IAsideMenuLayoutProps {
    children: React.ReactNode;
}

export function AsideMenuLayout({
    children
}: IAsideMenuLayoutProps) {

    const {
        friendMessages,
        isLoading: areFriendMessagesLoading,
        setFriendMessages
    } = useFriendMessageContext();

    const unreadMessagesCount = useMemo(() => {
        // if (areFriendMessagesLoading) {
        //     return 0;
        // }

        return friendMessages.reduce((count, friendMessage) => {
            if (!friendMessage.conversation.isRead) {
                return count + 1;
            }
            return count;
        }, 0);
    }, [friendMessages]);

    const { setAuthLevel } = useAuth();
    const { jwtFetchHandler } = useJWTFetch();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const errCtx = useError();

    const nav = useNavigate();

    const onLogOut = async () => {
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

            const response = await jwtFetchHandler(`${domain}/api/sign-in/logout`, {
                method: "DELETE",
                credentials: "include"
            });

            if (response.returnType === "fetchError") {
                errCtx.throwError(response.error);
                return;
            }

            if (response.returnType === "loginError") {
                errCtx.throwError(response.error);
                setAuthLevel({
                    userType: "none"
                });
                return;
            }

            if (response.data.status === 204) {
                localStorage.removeItem(accessTokenLocalStorageKey);
                setAuthLevel({
                    userType: "none"
                });
                return;
            }

            const resJSON = await response.data.json();

            const errorResult = APIErrorSchema.safeParse(resJSON);
            if (errorResult.success) {
                errCtx.throwError(errorResult.data);
                return;
            }

            errCtx.throwError(notExpectedFormatError);
            return;

        } catch (error) {
            if (error instanceof Error) {
                const knownError: ICustomErrorResponse = {
                    ok: false,
                    status: 0,
                    message: error.message
                }

                errCtx.throwError(knownError);
                return;
            }

            errCtx.throwError(unknownError);
            return;

        } finally {
            setIsLoading(false);
        }
    }


    const { 
        pendingInvites
    } = usePendingInvitesContext();


    const pendingInvitesNotificationCount = useMemo<number>(() => {
        return pendingInvites.filter(p => p.type === "receivedInvite").length;

    }, [pendingInvites]);


    return (
        <>
            <div className={styles.outerContainer}>

                <header className={styles.header}>
                    <div className={styles.titleContainer}>
                        <div className={styles.gitHubProfileImgContainer}>
                            <img src={githubImage} alt="Github Profile Image" />
                        </div>
                        <h1 className={styles.title}>MessageApp</h1>
                    </div>
                </header>

                <div className={styles.lowerContainer}>

                    <aside className={styles.aside}>
                        <ul className={styles.menuOptionsList}>

                            <AsideMenuOption
                                navigateTo={homePageRoute}
                                icon={<MessageIcon />}
                                label="Dashboard"
                                notification={
                                    unreadMessagesCount > 0 ? unreadMessagesCount : undefined
                                }
                            />

                            <AsideMenuOption
                                navigateTo={newConversationPageRoute}
                                icon={<AddMessageIcon />}
                                label="New Conversation"

                            />


                            <AsideMenuOption
                                navigateTo={invitesPageRoute}
                                icon={<InviteConversationIcon />}
                                label="Pending Invites"
                                notification={
                                    pendingInvitesNotificationCount > 0 ? pendingInvitesNotificationCount : undefined
                                }
                            />


                            {/* This could have the users profile picture if requested cleverly with a secondary request to the conversations but this would require tricky magic with an abort controller on the current running conversations if they are still being requested */}

                                <div className={styles.lowerAsideOptionsContainer}>
                                    
                                    <div onClick={() => {
                                        if (isLoading) return;
                                        onLogOut();
                                    }} className={styles.logOutSVGContainer}>
                                        {
                                            isLoading ?
                                                <LoadingCircle height="80%" />
                                                :
                                                <LogoutIcon />
                                        }
                                    </div>
                                    
                                    <div className={styles.separationBar}></div>
                                    
                                    <AsideMenuOption
                                        navigateTo={myAccountPageRoute}
                                        icon={<UserIcon />}
                                        label="My Account"
                                    />

                                </div>





                        </ul>
                    </aside>

                    <main className={styles.main}>
                        {
                            children
                        }
                    </main>

                </div>

            </div>

        </>
    );
}