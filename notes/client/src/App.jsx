//import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect, createContext } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout.jsx";
import Home from "./components/home.jsx";
import Login from "./components/login.jsx";
import NotFound from "./components/notfound.jsx";
import axios from "axios";

export const AuthContext = createContext(null);

export const App = () => {
    const [notelist, setNotelist] = useState([]);
    const [user, setUser] = useState(null);

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

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
    };

    const handlePasswordChange = (event) => {
        console.log("hello?");
        console.log(event.target.value);
        setPassword(event.target.value);
    };

    const checkPassword = async () => {
        try {
            // const response = await fetch("/users/login", {
            //     method: "POST",
            //     // mode: "same-origin",
            //     headers: {
            //         "Content-Type": "application/json"
            //     },
            //     body: JSON.stringify({
            //         username: username,
            //         password: password
            //     })
            // });
            // const data = await response.json();

            const response = await axios.post("/users/login", { username: username, password: password });

            console.log(response.data);

            if (response.data.success === true) {
                setUser(response.data.user);
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
        console.log("trying the fuck to log in")
        checkPassword();
    };

    return (
        <AuthContext.Provider value={user}>
            <BrowserRouter>
                <Routes>
                    <Route element={<Layout user={user} />}>
                        <Route index element={<Home notelist={notelist} />} />
                        <Route path="users/login" element={<Login
                            onLogin={handleLogin}
                            onUsernameChange={handleUsernameChange}
                            onPasswordChange={handlePasswordChange} />} />
                        <Route path="*" element={<NotFound />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthContext.Provider>
    );
};