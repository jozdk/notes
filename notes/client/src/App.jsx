//import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect, createContext } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./components/Home.jsx";
import Login from "./components/Login.jsx";
import { NoteView } from "./components/NoteView.jsx";
import NotFound from "./components/NotFound.jsx";
import { ProtectedRoutes } from "./components/ProtectedRoutes.jsx";
import axios from "axios";

export const AuthContext = createContext(null);

export const App = () => {
    const [notelist, setNotelist] = useState([]);
    const [user, setUser] = useState(null);
    // const [loggedOut, setLoggedOut] = useState(false);
    const navigate = useNavigate();

    // Probably better to do that in Home.jsx
    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch("/api/list");
            const data = await response.json();
            // console.log(data);
            setNotelist(data.notelist);
            setUser(data.user);
        };
        fetchData();
    }, []);

    // useEffect(() => {
    //     navigate("/");
    // }, [user]);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const checkPassword = async () => {
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
            // const data = await response.json();

            // const response = await axios.post("/users/login", { username: username, password: password });

            if (data.success === true) {
                setUser(data.user);
                navigate("/");
            } else {
                setUser(null);
            }

        } catch (err) {
            console.log(err);
            setUser(null);
        }
    }

    const handleLogin = (event) => {
        event.preventDefault();
        checkPassword();
    };

    const handleLogout = async (event) => {
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
                navigate("/");
            }
        } catch (err) {
            console.log(err);
        }
    };

    // return (
    //     <AuthContext.Provider value={user}>
    //         <Routes>
    //             <Route element={<Layout user={user} onLogout={handleLogout} />}>
    //                 <Route index element={<Home notelist={notelist} />} />
    //                 <Route path="users/login" element={<Login
    //                     onLogin={handleLogin}
    //                     onUsernameChange={handleUsernameChange}
    //                     onPasswordChange={handlePasswordChange} />} />
    //                 <Route path="*" element={<NotFound />} />
    //             </Route>
    //         </Routes>
    //     </AuthContext.Provider>
    // );

    return (
        <AuthContext.Provider value={user}>

            <Layout user={user} onLogout={handleLogout} />
            <Routes>
                <Route path="/" element={<Home notelist={notelist} />} />
                <Route path="/users/login" element={<Login
                    onLogin={handleLogin}
                    onUsernameChange={handleUsernameChange}
                    onPasswordChange={handlePasswordChange} />} />
                <Route path="/notes/view/:notekey" element={<NoteView />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
            {/* <ProtectedRoutes>
                
            </ProtectedRoutes> */}

        </AuthContext.Provider>
    );
};