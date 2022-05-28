import { useAuth } from "./AuthProvider.jsx";
import { Outlet, Navigate } from "react-router-dom";
import { Spinner } from "./Spinner.jsx";
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
            <div className="h-screen w-screen flex">
                <Spinner />
            </div>
        )
    } else {
        return <Navigate to="/users/login" />
    }
}