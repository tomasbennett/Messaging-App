import { useState } from "react";
import styles from "./DashboardLayout.module.css";
import { ICustomErrorResponse } from "../../../../../shared/features/api/models/APIErrorResponse";



export function DashboardLayout() {
  const [isMessageLoading, setIsMessageLoading] = useState<boolean>(false);
  const [messageError, setMessageError] = useState<ICustomErrorResponse | null>(null);


  const [isFileLoading, setIsFileLoading] = useState<boolean>(false);
  const [fileError, setFileError] = useState<ICustomErrorResponse | null>(null);



  const handleMessageSubmit = async () => {
    try {
      setIsMessageLoading(true);
      setMessageError(null);

      await new Promise((resolve) => setTimeout(resolve, 2000));

    } catch (error) {
      const err = error as ICustomErrorResponse;
      setMessageError(err);

    } finally {
      setIsMessageLoading(false);
      
    }

  };

  const handleFileSubmit = async () => {
    try {
      setIsFileLoading(true);
      setFileError(null);

      await new Promise((resolve) => setTimeout(resolve, 2000));

    } catch (error) {
      const err = error as ICustomErrorResponse;
      setFileError(err);

    } finally {
      setIsFileLoading(false);

    }
  };



  return (
    <div className={styles.container}>
      <h1>Dashboard</h1>

      <div>
        <form>
          <input type="text" placeholder="Type your message..." className={styles.messageInput} />
          <button type="submit" className={styles.sendButton}>{
            isMessageLoading ?
              "Sending..."
              :
              "Send Message"
          }</button>
        </form>
      </div>

      <div>
        <form>
          <input type="file" />
          <button type="submit">{
            isFileLoading ?
              "Uploading..."

              :

              "Submit File"
          }</button>
        </form>
      </div>

      <ul className={styles.messagesContainer}>

      </ul>


    </div>
  );
}