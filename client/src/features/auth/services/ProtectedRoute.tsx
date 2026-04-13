import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { LoadingCircle } from "../../../components/LoadingCircle";
import { homePageRoute, logInPageRoute } from "../../../constants/routes";
import { SocketProvider } from "../../../contexts/SocketHandlerContext";
import { useAuth } from "../contexts/AuthContext";




export function ProtectedRoute() {
    const { authLevel: userAuth, isLoading } = useAuth();


    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%', flex: '1 1 0' }}>
                <LoadingCircle height="5rem" />
            </div>
        )

    }
    
    if (userAuth.userType === "none" || userAuth.userType === "unknown") {
        return <Navigate to={logInPageRoute} replace />;

    }


    return (


        // <SocketProvider>

            <Outlet />

        // </SocketProvider>

        
    );

}



export function NotAuthenticatedRoute() {
    const { authLevel: userAuth, isLoading } = useAuth();


    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%', flex: '1 1 0' }}>
                <LoadingCircle height="5rem" />
            </div>
        )
    }

    if (userAuth.userType === "user") {
        return <Navigate to={homePageRoute} replace />;
    }

    return <Outlet />;
}
