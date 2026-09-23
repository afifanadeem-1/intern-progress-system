import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import API_URL from "../config/api";

function ProtectedRoute({ children, allowedRole }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const verifyUser = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    `${API_URL}/api/auth/me`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (!response.ok) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    return;
                }

                const data = await response.json();

                setUser(data.user);

                if (
                    !allowedRole ||
                    data.user.role === allowedRole
                ) {
                    setAuthorized(true);
                }

            } catch (error) {
                console.error(
                    "Authentication verification failed",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        verifyUser();
    }, [allowedRole]);

    if (loading) {
        return <p>Checking authentication...</p>;
    }

    if (!user) {
    return <Navigate to="/login" replace />;
}

if (!authorized) {
    if (user.role === "admin") {
        return <Navigate to="/admin" replace />;
    }

    if (user.role === "intern") {
        return <Navigate to="/intern" replace />;
    }

    return <Navigate to="/login" replace />;
}

    return children;
}

export default ProtectedRoute;  