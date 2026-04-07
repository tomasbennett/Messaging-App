import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { LoadingCircle } from "../../../components/LoadingCircle";
import { useCheckAuth } from "../hooks/useCheckAuth";
import { homePageRoute, logInPageRoute } from "../../../constants/routes";
import { SocketProvider } from "../../../contexts/SocketHandlerContext";




export function ProtectedRoute() {
    const { userAuth, isLoading } = useCheckAuth();


    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%', flex: '1 1 0' }}>
                <LoadingCircle height="5rem" />
            </div>
        )

    }
    
    if (userAuth.userType === "none") {
        return <Navigate to={logInPageRoute} replace />;

    }


    return (


        <SocketProvider>

            <Outlet />

        </SocketProvider>

        
    );

}



export function NotAuthenticatedRoute() {
    const { userAuth, isLoading } = useCheckAuth();


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
