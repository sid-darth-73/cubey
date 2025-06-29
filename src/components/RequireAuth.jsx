import { Navigate } from "react-router-dom";

export function RequireAuth({ children }) {
    const token = localStorage.getItem("token");
    return token ? children : <Navigate to="/signin" />;
}
