import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export function RequireAuth({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const urlToken = queryParams.get("token");
        const urlShareLink = queryParams.get("shareLink");
        const urlUser = queryParams.get("user");

        if (urlToken) {
            localStorage.setItem("token", urlToken);
            if (urlShareLink) localStorage.setItem("shareLink", urlShareLink);
            if (urlUser) localStorage.setItem("user", urlUser);

            // Clean up the URL by removing the query parameters
            navigate(location.pathname, { replace: true });
        }
        setIsChecking(false);
    }, [location.search, location.pathname, navigate]);

    if (isChecking) {
        return null; 
    }

    const token = localStorage.getItem("token");
    return token ? children : <Navigate to="/signin" replace />;
}
