import styles from "./ConversationLayout.module.css";


export function ConversationLayout({ children }: { children: React.ReactNode }) {


    return (
        <>
            <div className={styles.outerContainer}>
                
                {
                    children
                }

            </div>
        
        
        </>
    )
}