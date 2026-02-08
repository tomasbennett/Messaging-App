import { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { LoadingCircle } from "../../../components/LoadingCircle";
import { domain } from "../../../services/EnvironmentAPI";

export function ProtectedRoute() {
    const [auth, setAuth] = useState<boolean | null>(null);
    const navigate = useNavigate();

    useEffect(() => {   
        async function checkAuth() {
            try {
                console.log("Checking auth...");
                const response = await fetch(`${domain}/auth/check`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: { Accept: 'application/json' }
                });
                console.log("Fetch response received");
    
                if (response.ok) {
                    setAuth(true);

                } else {
                    const data = await response.json();
                    console.log(data?.message);
                    console.log("not authenticated");
                    setAuth(false);

                }
            } catch (error) {
                console.log("Fetch error:", error);
                setAuth(false);
            }
        }
    
        checkAuth();
    }, []);



    if (auth === null) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%', flex: '1 1 0' }}>
                <LoadingCircle width="5rem" />
            </div>
        )

    } else if (auth === false) {
        return <Navigate to="/sign-in/login" replace />;

    } else {
        return <Outlet />;

    }

}



export function NotAuthenticatedRoute() {
    const [auth, setAuth] = useState<boolean | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function checkAuth() {
            try {
                const response = await fetch(`${domain}/auth/check`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: { Accept: 'application/json' }
                });

                if (response.ok) {
                    setAuth(true);
                } else if (response.status === 401) {
                    setAuth(false);
                } else {
                    setAuth(false);
                }
            } catch {
                setAuth(false);
            }
        }

        checkAuth();
    }, []);




    if (auth === null) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%', flex: '1 1 0' }}>
                <LoadingCircle width="5rem" />
            </div>
        )
    }

    if (auth === false) {
        return <Outlet />;
    }

    return <Navigate to="/" replace />;
}
