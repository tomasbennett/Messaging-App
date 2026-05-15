import { IReceivingAnInvite } from "../../../../../shared/features/inviteReq/models/IReceivingAnInvite";
import React, { useContext } from "react";
import { InviteNotification } from "../components/InviteNotification";
import { usePopup } from "../../../hooks/usePopup";

const InviteReqContext = React.createContext<{
    showInvitePopup: (inviteInfo: IReceivingAnInvite) => void;
} | null>(null);



export function InviteReqProvider({ 
    children 
}: { children: React.ReactNode }) {

    const {
        startPopup: showInvitePopup,
        isClosing,
        infoContainerRef,
        info
    } = usePopup<IReceivingAnInvite>();


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