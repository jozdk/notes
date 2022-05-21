import { useAuth } from "./AuthProvider.jsx";
import { Outlet, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Login } from "./Login.jsx";

export const ProtectedRoutes = () => {
    const { authState: { user, isLoading } } = useAuth();

    console.log(isLoading);

    // return user ? <Outlet /> : <Login />
    if (user) {
        return <Outlet />;
    } else if (isLoading) {
        return (
            <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        )
    } else {
        return <Navigate to="/users/login" />
    }
}