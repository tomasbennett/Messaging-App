import { useMemo } from "react";
import { LoadingCircle } from "../../../components/LoadingCircle";
import { usePendingInviteType } from "../hooks/usePendingInviteType";
import styles from "./InvitesLayout.module.css";
import { IPendingInviteSentvsReceivedDisUnion, IPendingInviteTypes, PendingInviteTypes } from "../../../../../shared/features/inviteReq/discriminatedUnions/IPendingInviteSentvsReceived";
import { ReceivedInvitePending } from "../components/ReceivedInvitePending";
import { IReceivingAnInvite } from "../../../../../shared/features/inviteReq/models/IReceivingAnInvite";
import { ISentConversationInvite } from "../../../../../shared/features/inviteReq/models/ISentConversationInvite";
import { SentInvitePending } from "../components/SentInvitePending";
import { usePendingInvitesContext } from "../contexts/PendingInviteContext";



export function InvitesLayout() {

    const {
        isLoading,
        title,
        pendingInvites,
        currentState,
        onSentInviteClick,
        onReceiveInviteClick,
        setPendingInvites
    } = usePendingInvitesContext();

    const receivedInvites = useMemo<IReceivingAnInvite[]>(() => {
        return pendingInvites
            .filter((i): i is Extract<IPendingInviteSentvsReceivedDisUnion, { type: typeof PendingInviteTypes.received }> => i.type === "receivedInvite")
            .map(({ type, ...rest }) => rest);
    }, [pendingInvites]);

    const sentPendingInvites = useMemo<ISentConversationInvite[]>(() => {
        return pendingInvites
            .filter((p): p is Extract<IPendingInviteSentvsReceivedDisUnion, { type: typeof PendingInviteTypes.sent }> => p.type === "sentInvite")
            .map(({ type, ...rest }) => rest);
    }, [pendingInvites]);


    return (
        <>
            <div className={styles.outerContainer}>

                <div className={styles.innerContainer}>

                    <div className={styles.leftSideContainer}>
                        <h2 className={styles.title}>
                            Pending Invites
                        </h2>
                        <ul className={styles.inviteFilterList}>
                            <li onClick={() => {
                                onReceiveInviteClick();
                            }} className={`${currentState === "receivedInvite" ? styles.active : styles.inactive} ${styles.inviteFilterOption}`}>
                                Received Invites
                            </li>
                            <li onClick={() => {
                                onSentInviteClick()
                            }} className={`${currentState === "sentInvite" ? styles.active : styles.inactive} ${styles.inviteFilterOption}`}>
                                Sent Invites
                            </li>
                        </ul>
                    </div>

                    <div className={styles.rightSideContainer}>

                        {
                            isLoading ?
                                <LoadingCircle height="5rem" />

                                :

                                <div className={styles.invitesContainer}>
                                    {
                                        currentState === "receivedInvite" ?


                                            receivedInvites.length > 0 ?

                                            receivedInvites.map(i => {


                                                return (
                                                    <ReceivedInvitePending
                                                        setPendingInvites={setPendingInvites}
                                                        key={i.conversationId + i.inviterUserId}
                                                        conversationId={i.conversationId}
                                                        conversationName={i.conversationName}
                                                        inviterUserId={i.inviterUserId}
                                                        inviterUsername={i.inviterUsername}
                                                        inviterProfilePictureUrl={i.inviterProfilePictureUrl}
                                                    />
                                                )
                                            })

                                            :

                                            <div className={styles.noInvitesContainer}>
                                                No invites received that are pending right now
                                            </div>

                                            :

                                            currentState === "sentInvite" ?

                                                sentPendingInvites.length > 0 ?

                                                sentPendingInvites.map(i => {

                                                    return (
                                                        <SentInvitePending
                                                            key={i.conversationId + i.userId}
                                                            userId={i.userId}
                                                            username={i.username}
                                                            userProfileImgUrl={i.userProfileImgUrl}
                                                            conversationId={i.conversationId}
                                                            conversationName={i.conversationName}
                                                        />
                                                    )
                                                })


                                                :

                                                <div className={styles.noInvitesContainer}>
                                                    No invites sent that are pending right now
                                                </div>

                                                :


                                                null
                                    }
                                </div>


                        }


                    </div>

                </div>


            </div>
        </>
    )
}