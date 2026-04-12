import styles from "./NoConversationSelected.module.css";






export function NoConversationSelected() {

  return (
    <div className={styles.noConversationSelectedContainer}>
      <p className={styles.noConversationSelectedText}>No conversation selected</p>
    </div>
  )
}