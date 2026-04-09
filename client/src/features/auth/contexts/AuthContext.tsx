import { createContext, useContext, useState } from "react";
import { IAuthContextType, IAuthLevel } from "../models/IUseCheckAuth";
import { setLogoutFn } from "../services/LogoutAuthContext";












const AuthContext = createContext<IAuthContextType | null>(null);


export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [authLevel, setAuthLevel] = useState<IAuthLevel>({
        userType: "none"
    });
    
    const ctx: IAuthContextType = {
        authLevel,
        setAuthLevel
    }

    // setLogoutFn(() => {
    //     setAuthLevel({
    //         userType: "none"
    //     });
    // });
    
    return (
        <AuthContext.Provider value={ctx}>
            {children}
        </AuthContext.Provider>
    );
}



export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};