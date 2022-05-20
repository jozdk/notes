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
// import axios from "axios";

export const AuthContext = createContext(null);

export const App = () => {
    const [notelist, setNotelist] = useState([]);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

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

    const destroyNote = async (notekey) => {
        try {
            const response = await fetch(`/notes/destroy/confirm?key=${notekey}`, {
                method: "POST",
                mode: "same-origin",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ notekey: notekey })
            });
            const data = await response.json();

            if (data.success === true) {
                setNotelist(notelist.filter(note => note.key !== notekey));
            }
        } catch (err) {
            console.log(err);
        }
    }

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
                <Route element={<ProtectedRoutes />}>
                    <Route path="/notes/add" element={<NoteEdit doCreate={true} />} />
                    <Route path="/notes/edit/:notekey" element={<NoteEdit doCreate={false} />} />
                    <Route path="/notes/destroy/:notekey" element={<NoteDestroy destroyNote={destroyNote} />} />
                </Route>
                <Route path="/" element={<Home notelist={notelist} />} />
                <Route path="/users/login" element={<Login setUser={setUser} />} />
                <Route path="/notes/view/:notekey" element={<NoteView />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </AuthContext.Provider>
    );
};