import styles from "./ErrorLayout.module.css";

import { Navigate, useLocation} from "react-router-dom";
import { useEffect } from "react";
import { APIErrorSchema } from "../../../../../shared/features/api/models/APIErrorResponse";

export function ErrorPageLayout() {
    const location = useLocation();
    const errorState = location.state?.error;

    console.log(errorState);

    useEffect(() => {
        if (errorState) {
            window.history.replaceState({}, document.title);
        }
    }, [location, errorState]);
    

    if (!errorState) {
        return <Navigate to="/" replace />;
    }

    
    const result = APIErrorSchema.safeParse(errorState);
    if (result.success) {
        
        return (
            
            <div className={styles.errorContainer}>
                <h1 className={styles.errorTitle}>Error {result.data.status}</h1>
                <p className={styles.errorMessage}>{result.data.message}</p>
            </div>
        );
    }


    if (errorState instanceof Error) {
        return (
            <div className={styles.errorContainer}>
                <h1 className={styles.errorTitle}>Error</h1>
                <p className={styles.errorMessage}>Error {errorState.name}</p>
                <p className={styles.errorMessage}>{errorState.message}</p>
            </div>
        );
    }

    return (
        <div className={styles.errorContainer}>
            <h1 className={styles.errorTitle}>Something went wrong!!!</h1>
            <p className={styles.errorMessage}>There was an undefined error in the system</p>
        </div>
    );


}