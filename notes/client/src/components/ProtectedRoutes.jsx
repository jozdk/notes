import { useContext } from "react";
import { AuthContext } from "../App.jsx";
import { Outlet, Navigate } from "react-router-dom";

export const ProtectedRoutes = () => {
    const user = useContext(AuthContext);

    return user ? <Outlet /> : <Navigate to="/users/login" />
}