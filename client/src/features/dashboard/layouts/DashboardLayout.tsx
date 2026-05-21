import { useEffect, useState } from "react";
import styles from "./DashboardLayout.module.css";
import { SidebarUserDetailsList } from "./InnerSidebarList";
import { ISidebarFriendsUserDetails } from "../models/ISidebarUserDetails";
import { useError } from "../../error/contexts/ErrorContext";
import { useFriendMessageContext } from "../../messages/contexts/PreviewFriendConversationContext";
import { LoadingCircle } from "../../../components/LoadingCircle";
import { useInviteReqContext } from "../../inviteReq/contexts/InviteReqContext";


export function DashboardLayout({
  children
}: { children: React.ReactNode }) {
  // const [friendsDetailsList, setFriendsDetailsList] = useState<ISidebarFriendsUserDetails[]>([]);

  const errorContext = useError();

  useEffect(() => {
    // Mock data for friends details list
    // const mockFriendsDetails: ISidebarFriendsUserDetails[] = [
    //   {
    //     conversationId: "1",
    //     conversationProfilePictureUrl: undefined,
    //     conversationName: "Alice",
    //     lastMessage: "Hey, how are you?",
    //     lastMessageTimestamp: new Date()
    //   },
    //   {
    //     conversationId: "2",
    //     conversationProfilePictureUrl: undefined,
    //     conversationName: "Bob",
    //     lastMessage: "Are we still on for tomorrow?",
    //     lastMessageTimestamp: new Date()
    //   },
    //   {
    //     conversationId: "3",
    //     conversationProfilePictureUrl: undefined,
    //     conversationName: "Charlie",
    //     lastMessage: "Check out this cool link!",
    //     lastMessageTimestamp: new Date()
    //   }
    // ];

    // setFriendsDetailsList(mockFriendsDetails);

  }, []);



  const {
    friendMessages,
    isLoading: isFriendConversationsLoading,
    setFriendMessages
  } = useFriendMessageContext();




  return (

    <>
      <div className={styles.outerContainer}>



        {
          isFriendConversationsLoading ?

            <LoadingCircle height="5rem" />

            :

            <div className={styles.innerContainer}>

              <SidebarUserDetailsList userDetailsList={friendMessages} />

              {
                children
              }

            </div>
        }


      </div>

    </>

  );
}