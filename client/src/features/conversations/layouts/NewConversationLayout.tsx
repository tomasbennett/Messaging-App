import { useForm } from "react-hook-form";
import { useInviteUsersToConversation } from "../hooks/useInviteUsersToConversation";
import styles from "./NewConversationLayout.module.css";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClientNewConversation, IClientNewConversation } from "../models/ICreateNewConversationClient";
import { CONVERSATION_CUSTOM_IMAGE_FILE_KEY } from "../../../../../shared/features/conversation/constants";
import { useJWTFetch } from "../../../hooks/useJWTFetch";
import { domain } from "../../../constants/EnvironmentAPI";
import { useError } from "../../error/contexts/ErrorContext";
import { useLocation, useNavigate } from "react-router-dom";
import { errorPageRoute, homePageRoute, newConversationPageRoute } from "../../../constants/routes";
import { APIErrorSchema, ICustomErrorResponse } from "../../../../../shared/features/api/models/APIErrorResponse";
import { noErrorCtxError, notExpectedFormatError, unknownError } from "../../../constants/errorConstants";
import { APISuccessSchema } from "../../../../../shared/features/api/models/APISuccessResponse";
import { useEffect, useMemo, useState } from "react";

import defaultUserImg from "../../../assets/DEFAULT_USER_IMG.png";
import { useImageUpload } from "../../../hooks/useImageUpload";
import { LoadingCircle } from "../../../components/LoadingCircle";
import { useMediaQuery } from "react-responsive";
import { mediumScreenMaxWidth, thinScreenMaxWidth } from "../../../constants/screenDimensions";
import { PreppedParticipant } from "../components/PreppedParticipant";
import { useInviteReqContext } from "../../inviteReq/contexts/InviteReqContext";



export function NewConversationLayout({

}) {

    const {
        showInvitePopup
    } = useInviteReqContext();


    useEffect(() => {
        showInvitePopup({
            conversationId: "1",
            conversationName: "Ameno",
            inviterUserId: "1",
            inviterUsername: "Hi_this_is_me",

        });
        showInvitePopup({
            conversationId: "2",
            conversationName: "Qatuna",
            inviterUserId: "2",
            inviterUsername: "Hi_this_is_you",

        });
        showInvitePopup({
            conversationId: "3",
            conversationName: "Pablo",
            inviterUserId: "1",
            inviterUsername: "Hi_this_is_me",

        });
    }, []);










    const {
        isLoading,
        isMoreLoadable,
        isMoreLoading,
        selectedUsersToJoin,
        setSearchText,
        searchResults,
        searchText,
        prepUser,
        removeUser,
        loadMoreUsers
    } = useInviteUsersToConversation();

    const {
        register,
        handleSubmit,
        setError,
        clearErrors,
        formState: { errors }
    } = useForm<IClientNewConversation>({
        resolver: zodResolver(ClientNewConversation)
    });

    const { jwtFetchHandler } = useJWTFetch();
    const errorCtx = useError();
    const nav = useNavigate();

    const [isSubmissionLoading, setIsSubmissionLoading] = useState<boolean>(false);

    const location = useLocation();

    const onSubmit = async (data: IClientNewConversation) => {
        if (!errorCtx) {
            nav(errorPageRoute, {
                state: {
                    error: noErrorCtxError
                }
            });
            return;
        }


        try {
            setIsSubmissionLoading(true);

            const file = data[CONVERSATION_CUSTOM_IMAGE_FILE_KEY]?.[0];

            const formData = new FormData();

            formData.append("name", data.name);

            selectedUsersToJoin.forEach(user => {
                formData.append("participantIds", user.userId);
            });

            if (file) {
                formData.append(CONVERSATION_CUSTOM_IMAGE_FILE_KEY, file);
            }


            const response = await jwtFetchHandler(`${domain}/api/conversations/new`, {
                method: "POST",
                body: formData
            });

            if (response.returnType === "fetchError" || response.returnType === "loginError") {
                setError("root", {
                    message: response.error.message
                });
                errorCtx.throwError(response.error);
                return;

            }

            const resJSON = await response.data.json();

            const successResult = APISuccessSchema.safeParse(resJSON);
            if (successResult.success) {
                if (location.pathname === newConversationPageRoute) {
                    nav(homePageRoute, {
                        replace: true,
                    });

                }
                //SOME NOTIFICATION POSITIVE THAT THE INVITES HAVE BEEN SENT
                return;

            }

            const customErrorResult = APIErrorSchema.safeParse(resJSON);
            if (customErrorResult.success) {
                setError("root", {
                    message: customErrorResult.data.message
                });
                errorCtx.throwError(customErrorResult.data);
                return;
            }


            setError("root", {
                message: notExpectedFormatError.message
            });
            errorCtx.throwError(notExpectedFormatError);
            return;




        } catch (error: unknown) {

            if (error instanceof Error) {
                const knownError: ICustomErrorResponse = {
                    ok: false,
                    status: 0,
                    message: error.message
                }
                setError("root", {
                    message: knownError.message
                });
                errorCtx.throwError(knownError);
                return;
            }

            setError("root", {
                message: unknownError.message
            });
            errorCtx.throwError(unknownError);
            return;



        } finally {
            setIsSubmissionLoading(false);

        }



    }


    const {
        file,
        preview,
        handleFileChange
    } = useImageUpload();

    const fileInput = register(CONVERSATION_CUSTOM_IMAGE_FILE_KEY);
    const title = "Start a new conversation...";

    const isThinScreen = useMediaQuery({ maxWidth: thinScreenMaxWidth });
    const isMediumScreen = useMediaQuery({ maxWidth: mediumScreenMaxWidth });

    const screenWidthClassName = useMemo<string>(() => {
        if (isThinScreen) {
            return styles.thinScreen;
        }

        if (isMediumScreen) {
            return styles.mediumScreen;
        }

        return styles.wideScreen;

    }, [isThinScreen, isMediumScreen]);

    const searchParticipantsBoxStatusClassName = useMemo<string>(() => {
        console.log(searchResults.length);
        if (isLoading || searchResults.length > 0 || !isMoreLoadable) {
            return styles.active;
        }

        return styles.inactive;

    }, [searchResults, isLoading, isMoreLoadable]);

    const preppedParticipantsStatusClassName = useMemo<string>(() => {
        if (selectedUsersToJoin.length > 0) {
            return styles.active;
        }

        return styles.inactive;

    }, [selectedUsersToJoin]);




    return (
        <div className={styles.outerContainer}>


            <div className={styles.innerContainer}>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className={`${styles.form} ${screenWidthClassName}`}>

                    {
                        isThinScreen && (
                            <h2 className={`${styles.title} ${screenWidthClassName}`}>{title}</h2>
                        )
                    }


                    <div className={`${styles.chatImgOuterContainer} ${screenWidthClassName}`}>

                        <div className={`${styles.chatImgInnerContainer} ${screenWidthClassName}`}>

                            <div className={styles.imgOverflowContainer}>

                                <img
                                    src={`${preview ?? defaultUserImg}`}
                                    alt="Preview chat image"
                                    className={styles.img} />

                            </div>

                            <label className={styles.imgLabel}>
                                +
                                <input {...fileInput} type="file" hidden className={styles.imgInput} onChange={(e) => {
                                    fileInput.onChange(e);
                                    handleFileChange(e);
                                }} />

                            </label>

                        </div>

                    </div>

                    <div className={`${styles.chatTextOuterContainer} ${screenWidthClassName}`}>

                        {
                            !isThinScreen && (
                                <h2 className={styles.title}>{title}</h2>
                            )
                        }

                        <div className={`${styles.errorContainer} ${screenWidthClassName}`}>
                            {
                                errors.root && (
                                    <p className={styles.errorMessage}>
                                        {errors.root.message}
                                    </p>
                                )
                            }
                            {
                                errors[CONVERSATION_CUSTOM_IMAGE_FILE_KEY] && (
                                    <p className={styles.errorMessage}>
                                        {errors[CONVERSATION_CUSTOM_IMAGE_FILE_KEY].message}
                                    </p>
                                )
                            }
                            {
                                errors.name && (
                                    <p className={styles.errorMessage}>
                                        {errors.name.message}
                                    </p>
                                )
                            }


                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="name">Chat name</label>
                            <input
                                type="text"
                                {...register("name")}
                                id="name"
                                placeholder="Enter a chat name here..."
                                name="name"
                            />
                        </div>

                        <div className={styles.searchParticipantsInputResultContainer}>

                            <div className={`${styles.inputGroup} ${styles.searchParticipantsInputContainer}`}>

                                <input
                                    type="text"
                                    placeholder="Search for users you want to invite..."
                                    className={styles.searchUserInput}
                                    value={searchText}
                                    onChange={(e) => {
                                        setSearchText(e.target.value);
                                    }}
                                />

                            </div>

                            <div className={styles.searchParticipantsOuterContainer}>

                                <div className={`${styles.searchParticipantsInnerContainer} ${searchParticipantsBoxStatusClassName}`}>

                                    {
                                        isLoading ?

                                            <div className={styles.initialLoadingContainer}>
                                                <LoadingCircle height="5rem" />
                                            </div>

                                            :

                                            searchResults.length > 0 ? (
                                                <>

                                                    <ul className={styles.selectedParticipantsListContainer}>
                                                        {
                                                            searchResults.map(preppedParticipant => {

                                                                return <PreppedParticipant
                                                                    key={preppedParticipant.userId}
                                                                    userId={preppedParticipant.userId}
                                                                    username={preppedParticipant.username}
                                                                    userProfileImgUrl={preppedParticipant.userProfileImgUrl}
                                                                    prepstatus={preppedParticipant.prepstatus}
                                                                    prepUser={prepUser}
                                                                    removeUser={removeUser} />
                                                            })
                                                        }
                                                    </ul>

                                                    <div className={styles.loadMoreContainer}>
                                                        {
                                                            isMoreLoadable ?
                                                                <>

                                                                    {
                                                                        isMoreLoading ?
                                                                            <div className={styles.loadMoreLoadingContainer}>
                                                                                <LoadingCircle height="60%" />
                                                                            </div>

                                                                            :


                                                                            <button onClick={() => {
                                                                                loadMoreUsers();
                                                                            }} className={styles.loadMoreBtn} type="button">
                                                                                Load More...
                                                                            </button>
                                                                    }

                                                                </>
                                                                :
                                                                <p className={styles.noMoreSearchResults}>
                                                                    No more results for this search
                                                                </p>
                                                        }
                                                    </div>

                                                </>
                                            )

                                                :

                                                null


                                    }

                                </div>

                                <div className={`${preppedParticipantsStatusClassName} ${styles.preppedParticipantContainer}`}>
                                    {
                                        selectedUsersToJoin.length > 0 &&
                                        <ul className={styles.preppedParticipantsList}>
                                            {
                                                selectedUsersToJoin.map(preppedUser => {
                                                    return <PreppedParticipant
                                                        key={preppedUser.userId}
                                                        userId={preppedUser.userId}
                                                        username={preppedUser.username}
                                                        userProfileImgUrl={preppedUser.userProfileImgUrl}
                                                        prepstatus={preppedUser.prepstatus}
                                                        prepUser={prepUser}
                                                        removeUser={removeUser} />
                                                })
                                            }
                                        </ul>
                                    }
                                </div>

                            </div>


                        </div>

                        <div className={styles.submitBtnContainer}>
                            {
                                isSubmissionLoading ?
                                    <LoadingCircle height="60%" />

                                    :

                                    <button className={styles.submitBtn} type="submit">Create Conversation</button>
                            }
                        </div>

                    </div>

                </form>

            </div >


        </div >
    )
}