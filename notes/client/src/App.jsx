import { useState, useEffect, createContext } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./components/Home.jsx";
import Login from "./components/Login.jsx";
import { NoteView } from "./components/NoteView.jsx";
import { NoteDestroy } from "./components/NoteDestroy.jsx";
import { NoteEdit } from "./components/NoteEdit.jsx";
import NotFound from "./components/NotFound.jsx";
import { ProtectedRoutes } from "./components/ProtectedRoutes.jsx";

export const AuthContext = createContext(null);

export const App = () => {
    const [notelist, setNotelist] = useState([]);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch("/api/list");
            const data = await response.json();
            setNotelist(data.notelist);
            setUser(data.user);
        };
        fetchData();
    }, []);

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

    return (
        <AuthContext.Provider value={user}>
            <Layout user={user} onLogout={handleLogout} />
            <Routes>
                <Route element={<ProtectedRoutes />}>
                    <Route path="/notes/add" element={<NoteEdit doCreate={true} />} />
                    <Route path="/notes/edit/:notekey" element={<NoteEdit doCreate={false} />} />
                    <Route path="/notes/destroy/:notekey" element={<NoteDestroy setNotelist={setNotelist} />} />
                </Route>
                <Route path="/" element={<Home notelist={notelist} />} />
                <Route path="/users/login" element={<Login setUser={setUser} />} />
                <Route path="/notes/view/:notekey" element={<NoteView />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </AuthContext.Provider>
    );
};