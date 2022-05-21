import { useAuth } from "./AuthProvider.jsx";
import { Outlet, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Login } from "./Login.jsx";

export const ProtectedRoutes = () => {
    const { user } = useAuth();

    return user ? <Outlet /> : <Login />
}