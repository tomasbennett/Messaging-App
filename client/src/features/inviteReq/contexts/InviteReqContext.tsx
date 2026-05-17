import { IReceivingAnInvite } from "../../../../../shared/features/inviteReq/models/IReceivingAnInvite";
import React, { useContext } from "react";
import { InviteNotification } from "../components/InviteNotification";
import { usePopup } from "../../../hooks/usePopup";
import { useNavigate } from "react-router-dom";
import { invitesPageRoute } from "../../../constants/routes";
import { IPopupNotificationProps } from "../models/IInviteNotificationProps";

const InviteReqContext = React.createContext<{
    showInvitePopup: (inviteInfo: IReceivingAnInvite & IPopupNotificationProps) => void;
} | null>(null);



export function InviteReqProvider({ 
    children 
}: { children: React.ReactNode }) {

    const {
        startPopup: showInvitePopup,
        isClosing,
        infoContainerRef,
        info
    } = usePopup<IReceivingAnInvite & IPopupNotificationProps>();

    const nav = useNavigate();


    return (
        <>
        
            <InviteReqContext.Provider value={{ showInvitePopup }}>


                {
                    children
                }

                {
                    info && (
                        <InviteNotification 
                            conversationId={info.conversationId}
                            conversationName={info.conversationName}
                            inviteContainerRef={infoContainerRef}
                            isClosing={isClosing}
                            inviterUserId={info.inviterUserId}
                            inviterUsername={info.inviterUsername}
                            inviterProfilePictureUrl={info.inviterProfilePictureUrl}
                            bcg={info.bcg}
                            onClick={info.onClick}
                            message={info.message}
                            />
                    )
                }


            </InviteReqContext.Provider>
        
        
        </>
    )

}



export function useInviteReqContext() {
    const ctx = useContext(InviteReqContext);

    if (ctx === null) {
        throw new Error("Invite request context not available!!!");
    }

    return ctx;
}