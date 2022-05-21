import { useState, useEffect, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext(null);

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    

    // useEffect(() => {
    //     const fetchUser = async () => {
    //         setIsLoading(true);
    //         const response = await fetch("/auth", {
    //             method: "POST",
    //             mode: "same-origin",
    //             credentials: "same-origin",
    //             headers: {
    //                 "Content-Type": "application/json"
    //             },
    //             body: JSON.stringify({})
    //         });
    //         const data = response.json();

    //         if (data.success === true) {
    //             setUser(data.user);
    //         } else {
    //             setIsRejected(true);
    //         }
    //     };
    //     fetchUser();
    // }, []);

    useEffect(() => {
        const loggedInUser = localStorage.getItem("user");
        if (loggedInUser) {
            setUser(JSON.parse(loggedInUser));
        }
    }, []);

    const value = {
        user: user,
        login: async (username, password) => {
            try {
                const response = await fetch("/users/login", {
                    method: "POST",
                    mode: "same-origin",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password
                    })
                });
                const data = await response.json();

                if (data.success === true) {
                    setUser(data.user);
                    localStorage.setItem("user", JSON.stringify(data.user));
                    navigate("/");
                } else {
                    setUser(null);
                    localStorage.setItem("user", null);
                }

            } catch (err) {
                console.log(err);
                setUser(null);
                localStorage.setItem("user", null);
            }
        },
        logout: async () => {
            try {
                const response = await fetch("/users/logout", {
                    method: "POST",
                    mode: "same-origin",
                    credentials: "same-origin",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({})
                });
                const data = await response.json();

                if (data.success === true) {
                    setUser(null);
                    localStorage.setItem("user", null);
                    navigate("/");
                }
            } catch (err) {
                console.log(err);
            }
        }
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}