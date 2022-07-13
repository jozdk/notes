import { useState, useEffect, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext(null);

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setIsLoading(true);
                const response = await fetch("/auth", {
                    method: "POST",
                    mode: "same-origin",
                    credentials: "same-origin",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({})
                });
                if (!response.ok) {
                    throw new Error();
                }
                const data = await response.json();
    
                if (data.success === true) {
                    setUser(data.user);
                    setIsLoading(false);
                } else {
                    setIsLoading(false);
                    setUser(null);
                }
            } catch (err) {
                setIsLoading(false);
                setUser(null);
            }
        };
        fetchUser();
    }, []);
    
    const value = {
        authState: { user, isLoading },
        login: async (username, password, setAlert) => {
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
                if (!response.ok) {
                    throw new Error();
                }
                const data = await response.json();

                if (data.success === true) {
                    setUser(data.user);
                    navigate("/notes");
                } else {
                    setUser(null);
                    setAlert("Wrong username or password");
                }

            } catch (err) {
                setUser(null);
                setAlert("Wrong username or password");
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