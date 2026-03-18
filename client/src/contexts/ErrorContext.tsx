import React from "react";
import { ICustomErrorResponse } from "../../../shared/features/api/models/APIErrorResponse";
import styles from "./ErrorContext.module.css";


const ErrorContext = React.createContext<{
    throwError: (error: ICustomErrorResponse) => void;
} | null>(null);


export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [error, setError] = React.useState<ICustomErrorResponse | null>(null);

    const throwError = (error: ICustomErrorResponse) => {
        setError(error);
        // DO SOME ANIMATION LOGIC HERE TO KEEP IT UP ONLY FOR A PERIOD OF TIME AND CREATE A QUEUE SYSTEM FOR MULTIPLE ERRORS
        setTimeout(() => {
            setError(null);
        }, 7000);
    };



    return (
        <ErrorContext.Provider value={{ throwError }}>
            {
                children
            }
            {
                error && (
                    <>
                        <div className={styles.outerContainer}>
                            <strong>Error: {error.message}</strong>
                            <p>Status: {error.status}</p>
                        </div>
                    </>
                )
            }
        </ErrorContext.Provider>
    );
};


export const useError = () => {
    const context = React.useContext(ErrorContext);
    return context;
};