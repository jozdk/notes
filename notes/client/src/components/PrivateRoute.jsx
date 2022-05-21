import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../App.jsx";
import { useAuth } from "./AuthProvider.jsx";

export const PrivateRoute = ({ children }) => {
    // const user = useContext(AuthContext);
    const { user } = useAuth();

    console.log(user);

    if (!user) {
        return <Navigate to="/users/login" />
    }

    return children;
};