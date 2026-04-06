// import { useContext, useEffect, useState } from "react";
// import styles from "./DashboardLayout.module.css";
// import { APIErrorSchema, ICustomErrorResponse } from "../../../../../shared/features/api/models/APIErrorResponse";
// import { SocketContext } from "../../../contexts/SocketHandlerContext";
// import { IReceiveMessage, ReceiveMessageSchema } from "../../../../../shared/features/message/models/IReceiveMessage";
// import { SOCKET_CHAT_RECEIVE_EVENT, SOCKET_CHAT_SEND_EVENT } from "../../../../../shared/features/message/constants";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { ISendMessageFrontend, SendMessageFrontendSchema } from "../../../../../shared/features/message/models/ISendMessage";
// import { APISuccessSchema } from "../../../../../shared/features/api/models/APISuccessResponse";



// export function DashboardLayout() {
//   const [isMessageLoading, setIsMessageLoading] = useState<boolean>(false);
//   const [messageError, setMessageError] = useState<ICustomErrorResponse | null>(null);


//   const socket = useContext(SocketContext);


//   const [messages, setMessages] = useState<IReceiveMessage[]>([]);


//   const handleMessageSubmit = async (data: ISendMessageFrontend) => {
//     if (!socket) {
//       console.error("Socket not available, cannot send message");
//       return;
//     }

//     try {


//       setIsMessageLoading(true);
//       setMessageError(null);

//       socket.emit(SOCKET_CHAT_SEND_EVENT, data, (response: unknown) => {
//         const resSuccessResult = APISuccessSchema.safeParse(response);
//         if (resSuccessResult.success) {

//           console.log("Message sent successfully:", resSuccessResult.data);
//           return;
//         }

//         const resErrorResult = APIErrorSchema.safeParse(response);
//         if (resErrorResult.success) {
//           setMessageError(resErrorResult.data);
//           console.error("Error sending message:", resErrorResult.data);
//           return;
//         }

//         console.error("Received unexpected response format:", response);

//       });

//     } catch (error) {
//       const err = error as ICustomErrorResponse;
//       setMessageError(err);

//     } finally {
//       setIsMessageLoading(false);

//     }

//   };




//   useEffect(() => {
//     if (!socket) {
//       console.error("Socket not available, cannot listen for messages");
//       return;
//     }

//     const handleNewMessage = (message: unknown) => {

//       const messageResult = ReceiveMessageSchema.safeParse(message);
//       if (!messageResult.success) {
//         console.error("Received invalid message format:", message);
//         return;
//       }

//       setMessages((prevMessages) => [...prevMessages, messageResult.data]);


//       console.log("Received message:", message);
//     };

//     socket.on(SOCKET_CHAT_RECEIVE_EVENT, handleNewMessage);

//     return () => {
//       socket.off(SOCKET_CHAT_RECEIVE_EVENT, handleNewMessage);
//     };
//   }, [socket]);


//   const {
//     register,
//     handleSubmit,
//     formState: { errors },

//   } = useForm({
//     resolver: zodResolver(SendMessageFrontendSchema)
//   });


//   return (
//     <div className={styles.container}>
//       <h1>Dashboard</h1>

//       <form onSubmit={handleSubmit(handleMessageSubmit)}>
//         {
//           errors?.content && <p className={styles.errorText}>{errors.content.message}</p>
//         }
//         <input {...register("content")} type="text" placeholder="Type your message..." className={styles.messageInput} />

//         {/* <input type="file" /> */}

//         {
//           isMessageLoading ?
//             <p>Sending...</p>
//             :
//             <button type="submit">Send Message</button>
//         }

//       </form>

//       <ul className={styles.messagesContainer}>
//         {
//           messages.map((msg) => (
//             <li key={msg.timestamp.toLocaleDateString()} className={styles.messageItem}>
//               <strong>{msg.content}</strong>
//               <br />
//               <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
//             </li>
//           ))
//         }
//       </ul>


//     </div>
//   );
// }

import { useEffect, useState } from "react";
import styles from "./DashboardLayout.module.css";
import { SidebarUserDetailsList } from "./SidebarUserDetailsList";
import { ISidebarFriendsUserDetails } from "../models/ISidebarUserDetails";
import { useError } from "../../error/contexts/ErrorContext";
import { useFriendMessageContext } from "../../messages/contexts/FriendMessageContext";
import { LoadingCircle } from "../../../components/LoadingCircle";


export function DashboardLayout() {
  const [friendsDetailsList, setFriendsDetailsList] = useState<ISidebarFriendsUserDetails[]>([]);

  const errorContext = useError();

  useEffect(() => {
    // Mock data for friends details list
    const mockFriendsDetails: ISidebarFriendsUserDetails[] = [
      {
        userId: "1",
        userProfilePictureUrl: undefined,
        username: "Alice",
        lastMessage: "Hey, how are you?",
        lastMessageTimestamp: new Date()
      },
      {
        userId: "2",
        userProfilePictureUrl: undefined,
        username: "Bob",
        lastMessage: "Are we still on for tomorrow?",
        lastMessageTimestamp: new Date()
      },
      {
        userId: "3",
        userProfilePictureUrl: undefined,
        username: "Charlie",
        lastMessage: "Check out this cool link!",
        lastMessageTimestamp: new Date()
      }
    ];

    setFriendsDetailsList(mockFriendsDetails);

    if (errorContext) {
      errorContext.throwError({
        message: "This is a test error",
        status: 500,
        ok: false
      });


    }
  }, []);



  const {
    friendMessages,
    isLoading: isFriendMessagesLoading,
    setFriendMessages
  } = useFriendMessageContext();



  return (

    <>

      {
        isFriendMessagesLoading ?

          <LoadingCircle height="6rem" />

          :

          <div className={styles.outerContainer}>

            <SidebarUserDetailsList userDetailsList={friendsDetailsList} />

          </div>
      }

    </>

  );
}