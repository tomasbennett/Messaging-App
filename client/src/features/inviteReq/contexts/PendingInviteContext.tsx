import { createContext, useEffect } from "react";
import { IPendingInvitesContext } from "../models/IPendingInvitesContext";
import { usePendingInviteType } from "../hooks/usePendingInviteType";
import React from "react";
import { useSocket } from "../../../contexts/SocketHandlerContext";
import { useInviteReqContext } from "./InviteReqContext";
import { useError } from "../../error/contexts/ErrorContext";
import { useNavigate } from "react-router-dom";
import { SOCKET_INVITE_REQ_RECEIVE_EVENT, SOCKET_USER_DECLINED_CONVERSATION_INVITE } from "../../../../../shared/features/inviteReq/constants";
import { notExpectedFormatError, unknownError } from "../../../constants/errorConstants";
import { ReceivingAnInviteSchema } from "../../../../../shared/features/inviteReq/models/IReceivingAnInvite";
import { APIErrorSchema } from "../../../../../shared/features/api/models/APIErrorResponse";
import { DeclineConversationInviteSchema } from "../../../../../shared/features/inviteReq/models/IDeclineConversationInvite";

const PendingInvitesCtx = createContext<IPendingInvitesContext | null>(null);



export function PendingInvitesProvider({
    children
}: {
    children: React.ReactNode
}) {
    const pendingInvitesCtx = usePendingInviteType();

    const socket = useSocket();

    const { showInvitePopup } = useInviteReqContext();
    const errCtx = useError();

    const nav = useNavigate();

    useEffect(() => {
        
        socket.on(`${SOCKET_INVITE_REQ_RECEIVE_EVENT}`, (data: unknown) => {
            try {
                const receivedInviteResult = ReceivingAnInviteSchema.safeParse(data);
                if (receivedInviteResult.success) {
                    const receivedInvite = receivedInviteResult.data;
                    showInvitePopup({
                        conversationId: receivedInvite.conversationId,
                        conversationName: receivedInvite.conversationName,
                        inviterUserId: receivedInvite.inviterUserId,
                        inviterUsername: receivedInvite.inviterUsername,
                        inviterProfilePictureUrl: receivedInvite.inviterProfilePictureUrl,
                        bcg: "orange",
                        message: `${receivedInvite.inviterUsername} invited you to ${receivedInvite.conversationName}`,
                    });

                    pendingInvitesCtx.setPendingInvites((prev) => [...prev, {
                        type: "receivedInvite",
                        conversationId: receivedInvite.conversationId,
                        conversationName: receivedInvite.conversationName,
                        inviterUserId: receivedInvite.inviterUserId,
                        inviterUsername: receivedInvite.inviterUsername,
                        inviterProfilePictureUrl: receivedInvite.inviterProfilePictureUrl,
                    }]);
                    
                    return;
                }

                const customErrorResult = APIErrorSchema.safeParse(data);
                if (customErrorResult.success) {
                    const customError = customErrorResult.data;
                    errCtx?.throwError(customError);
                    return;
                }

                errCtx?.throwError(notExpectedFormatError);
                return;


            } catch (err) {
                console.error("Error parsing invite data:", err);
                if (err instanceof Error) {
                    errCtx?.throwError({
                        ok: false,
                        message: err.message,
                        status: 0
                    });
                    return;
                }

                errCtx?.throwError(unknownError);
                return;
            }
        });

        socket.on(SOCKET_USER_DECLINED_CONVERSATION_INVITE, (data: unknown) => {
                try {
                    const receivedDeclineResult = DeclineConversationInviteSchema.safeParse(data);
                    if (receivedDeclineResult.success) {

                        const receivedDecline = receivedDeclineResult.data;

                        pendingInvitesCtx.setPendingInvites((prev) => prev.filter(invite => {

                            if (invite.type === "sentInvite") {
                                return invite.conversationId !== receivedDecline.conversationId || invite.userId !== receivedDecline.userDecliningId;

                            }

                            return true;


                        }));
                        
                        return;
                    }
    
                    const customErrorResult = APIErrorSchema.safeParse(data);
                    if (customErrorResult.success) {
                        const customError = customErrorResult.data;
                        errCtx?.throwError(customError);
                        return;
                    }
    
                    errCtx?.throwError(notExpectedFormatError);
                    return;

                } catch (err) {
                    console.error("Error parsing decline invite data:", err);
                    if (err instanceof Error) {
                        errCtx?.throwError({
                            ok: false,
                            message: err.message,
                            status: 0
                        });
                        return;
                    }

                    errCtx?.throwError(unknownError);
                    return;
                }
        });


        return () => {
            socket.off(`${SOCKET_INVITE_REQ_RECEIVE_EVENT}`);
            socket.off(SOCKET_USER_DECLINED_CONVERSATION_INVITE);
        }


    }, []);




    return (
        <PendingInvitesCtx.Provider value={pendingInvitesCtx}>
            {
                children
            }
        </PendingInvitesCtx.Provider>
    );
};



export const usePendingInvitesContext = () => {
    const ctx = React.useContext(PendingInvitesCtx);

    if (!ctx) {
        throw new Error("usePendingInvitesContext must be used within a PendingInvitesProvider");
    }

    return ctx;
}