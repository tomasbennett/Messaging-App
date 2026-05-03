import { useEffect, useRef, useState } from "react";
import { AddMessageIcon } from "../../../assets/icons/AddMessageIcon";
import { SidebarUserDetails } from "../components/SidebarConversationDetails";
import { ISidebarMessageHeader } from "../models/ISidebarMessageHeader";
import { ISidebarFriendsUserDetails } from "../models/ISidebarUserDetails";
import styles from "./InnerSidebarList.module.css";
import { useSidebarHeaderMode } from "../hooks/useSidebarHeaderMode";
import { APIErrorSchema, ICustomErrorResponse } from "../../../../../shared/features/api/models/APIErrorResponse";
import { notExpectedFormatError } from "../../../constants/errorConstants";
import { domain } from "../../../constants/EnvironmentAPI";
import { useError } from "../../error/contexts/ErrorContext";
import { useNavigate } from "react-router-dom";
import { ReceiveUserFrontendSchema } from "../../../../../shared/features/user/models/IFrontendUser";
import { IUserFriendStatusRelationship, ReceiveUserFriendStatusRelationshipSchema } from "../../../../../shared/features/inviteReq/models/IUserFriendStatusRelationship";
import { IFriendPreviewMessages } from "../../../../../shared/features/conversation/models/IFriendPreviewMessages";
import { useJWTFetch } from "../../../hooks/useJWTFetch";
import { useAuth } from "../../auth/contexts/AuthContext";
import { errorPageRoute } from "../../../constants/routes";
import { MessageListIcon } from "../../../assets/icons/MessageListIcon";
import { LoadingCircle } from "../../../components/LoadingCircle";
import { SearchedForUserDetails } from "../components/SearchedForFriendReq";
import { IFriendRequestStatus } from "../../../../../shared/features/inviteReq/constants";
import { ISearchUsersQueryParams } from "../../../../../shared/features/user/models/ISearchUsers";
import { toQueryString } from "../../../util/ToQueryString";




type ISidebarUserDetailsListProps = {
    userDetailsList: IFriendPreviewMessages[];
}

export function SidebarUserDetailsList({
    userDetailsList
}: ISidebarUserDetailsListProps) {




    return (
        <div className={styles.container}>

            <div className={styles.titleContainer}>

                <div className={styles.btnContainer}>

                    <h2 className={styles.title}>Conversations</h2>

                </div>

            </div>

            <ul className={styles.listContainer}>

                {
                    userDetailsList.length === 0 ? (
                        <li className={styles.noConversationsText}>No conversations yet. Start by searching for friends and sending them a message!</li>
                    )

                        :

                        userDetailsList.map((details) => (
                            <li
                                key={details.conversation.conversationId}
                                className={styles.listItem}>

                                <SidebarUserDetails
                                    conversation={details.conversation}
                                    latestMessage={details.latestMessage}
                                />

                            </li>
                        ))

                }

            </ul>
        </div>
    );
}