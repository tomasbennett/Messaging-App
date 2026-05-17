import { useEffect, useMemo, useRef, useState } from "react"
import { IPendingInviteSentvsReceivedDisUnion, IPendingInviteTypes } from "../../../../../shared/features/inviteReq/discriminatedUnions/IPendingInviteSentvsReceived";
import { useError } from "../../error/contexts/ErrorContext";
import { useNavigate } from "react-router-dom";
import { errorPageRoute } from "../../../constants/routes";
import { noErrorCtxError, notExpectedFormatError, unknownError } from "../../../constants/errorConstants";
import { APIErrorSchema, ICustomErrorResponse } from "../../../../../shared/features/api/models/APIErrorResponse";
import { useJWTFetch } from "../../../hooks/useJWTFetch";
import { domain } from "../../../constants/EnvironmentAPI";
import { useAuth } from "../../auth/contexts/AuthContext";
import { PendingConversationInvitesAPISuccess } from "../../../../../shared/features/inviteReq/models/IPendingConversationInvites";
import { unMountComponentAbort } from "../../../constants/AbortFetch";

export function usePendingInviteType() {


    const [pendingInvites, setPendingInvites] = useState<IPendingInviteSentvsReceivedDisUnion[]>([
        // {
        //     type: "receivedInvite",
        //     conversationId: "1",
        //     conversationName: "afkasf",
        //     inviterUserId: "1",
        //     inviterUsername: "Chuff",
        //     inviterProfilePictureUrl: undefined
        // },
        // {
        //     type: "receivedInvite",
        //     conversationId: "2",
        //     conversationName: "Pandy",
        //     inviterUserId: "1",
        //     inviterUsername: "Chuff",
        //     inviterProfilePictureUrl: undefined
        // },
        // {
        //     type: "receivedInvite",
        //     conversationId: "3",
        //     conversationName: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Est totam ullam ab. Saepe nesciunt, rerum culpa quam veritatis nam ut? Velit quae quaerat odit veritatis facilis suscipit officiis quos unde esse dolorem natus repudiandae deleniti consectetur repellendus dolor nemo doloremque autem a vero, iusto ad? Obcaecati id odit culpa. Aut.",
        //     inviterUserId: "2",
        //     inviterUsername: "ChamberTorak",
        //     inviterProfilePictureUrl: undefined
        // },
        // {
        //     type: "sentInvite",
        //     conversationId: "4",
        //     conversationName: "Rna",
        //     userId: "4",
        //     username: "Chuffdalre",
        //     userProfileImgUrl: undefined
        // },
        // {
        //     type: "sentInvite",
        //     conversationId: "5",
        //     conversationName: "Rematea",
        //     userId: "5",
        //     username: "harblue",
        //     userProfileImgUrl: undefined
        // },
        // {
        //     type: "sentInvite",
        //     conversationId: "6",
        //     conversationName: "treaason",
        //     userId: "6",
        //     username: "tampor",
        //     userProfileImgUrl: undefined
        // },
        // {
        //     type: "sentInvite",
        //     conversationId: "7",
        //     conversationName: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae quis maiores laborum consequatur eum rerum aut, consectetur necessitatibus quod, vero ullam voluptatibus. Minus qui sint fugit sed! Dolorum hic id necessitatibus illo perferendis, eaque porro facere voluptas consequuntur numquam dolor reiciendis soluta sunt commodi incidunt sequi! Magnam vero veniam modi.",
        //     userId: "7",
        //     username: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quisquam nobis rerum sapiente delectus distinctio ducimus fugiat dolore nam odio voluptatibus atque obcaecati itaque inventore ex hic est, provident mollitia cum molestiae, nulla perspiciatis iste odit. Quam beatae porro architecto cumque maiores delectus aspernatur commodi vitae velit ut ratione, quod minus omnis ipsum. Expedita facere, cum nulla quasi quidem earum officiis?",
        //     userProfileImgUrl: undefined
        // }
    ]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [currentState, setCurrentState] = useState<IPendingInviteTypes>("receivedInvite");
    const inviteTitles: Record<IPendingInviteTypes, string> = {
        receivedInvite: "Received Invites",
        sentInvite: "Sent Invites"
    }
    const title = useMemo<string>(() => {
        return inviteTitles[currentState];
    }, [currentState]);


    const errCtx = useError();
    const nav = useNavigate();

    const { jwtFetchHandler } = useJWTFetch();
    const { setAuthLevel } = useAuth();

    const abortControllerRef = useRef<AbortController | null>(null);


    const getPendingInvites = async () => {
        if (!errCtx) {
            nav(errorPageRoute, {
                replace: true,
                state: {
                    error: noErrorCtxError
                }
            });

            return;
        }


        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;


        try {
            setIsLoading(true);

            const response = await jwtFetchHandler(`${domain}/api/invites/pending`, {
                method: "GET",
                signal: controller.signal
            });

            if (controller !== abortControllerRef.current) {
                return;
            }

            if (controller.signal.aborted && controller.signal.reason === unMountComponentAbort) {
                return;
            }

            if (response.returnType === "fetchError") {
                errCtx.throwError(response.error);
                return;

            }

            if (response.returnType === "loginError") {
                setAuthLevel({
                    userType: "none"
                });

                errCtx.throwError(response.error);

                return;

            }

            const resJSON = await response.data.json();

            const pendingResults = PendingConversationInvitesAPISuccess.safeParse(resJSON);

            if (pendingResults.success) {
                const pendingInvites = pendingResults.data.pendingInvites;
                setPendingInvites(pendingInvites);

                return;


            }

            const errorResult = APIErrorSchema.safeParse(resJSON);

            if (errorResult.success) {
                errCtx.throwError(errorResult.data);
                nav(errorPageRoute, {
                    replace: true,
                    state: {
                        error: errorResult.data
                    }
                });
                return;
            }

            errCtx.throwError(notExpectedFormatError);
            nav(errorPageRoute, {
                replace: true,
                state: {
                    error: notExpectedFormatError
                }
            });

            return;



        } catch (error: unknown) {
            if (controller !== abortControllerRef.current) {
                return;
            }

            if (error instanceof Error) {
                const knownError: ICustomErrorResponse = {
                    ok: false,
                    status: 0,
                    message: error.message
                }

                nav(errorPageRoute, {
                    replace: true,
                    state: {
                        error: knownError
                    }
                });

                errCtx.throwError(knownError);

                return;
            }

            nav(errorPageRoute, {
                replace: true,
                state: {
                    error: unknownError
                }
            });

            errCtx.throwError(unknownError);

            return;

        } finally {
            if (controller !== abortControllerRef.current) {
                return;
            }

            setIsLoading(false);

        }
    }


    const onSentInviteClick = () => {
        setCurrentState("sentInvite");
    }

    const onReceiveInviteClick = () => {
        setCurrentState("receivedInvite");
    }


    useEffect(() => {
        getPendingInvites();
        // setIsLoading(false);

        return () => {
            abortControllerRef.current?.abort(unMountComponentAbort);
        }
    }, []);



    return {
        isLoading,
        title,
        pendingInvites,
        currentState,
        onSentInviteClick,
        onReceiveInviteClick,
        setPendingInvites
    }
}