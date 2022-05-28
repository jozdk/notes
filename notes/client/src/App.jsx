import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import io from "socket.io-client";
import { Header } from "./components/Header.jsx";
import { Layout } from "./components/Layout.jsx";
import { Login } from "./components/Login.jsx";
import { NoteView } from "./components/NoteView.jsx";
import { NoteEdit } from "./components/NoteEdit.jsx";
import { NotFound } from "./components/NotFound.jsx";
import { ProtectedRoutes } from "./components/ProtectedRoutes.jsx";
import { AuthProvider } from "./components/AuthProvider.jsx";
import { Home } from "./components/Home.jsx";

export const App = () => {
    const [notelist, setNotelist] = useState([]);
    const [socket, setSocket] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch("/list");
            const data = await response.json();
            setNotelist(data.notelist);
        };
        fetchData();
    }, []);

    useEffect(() => {
        const newSocket = io("/home");
        setSocket(newSocket);
        newSocket.on("connect", () => {
            console.log("socketio connection on /home");
        });
        newSocket.on("notetitles", (arg) => {
            const notelist = arg.notelist;
            setNotelist(notelist);
        });
        return () => newSocket.close();
    }, []);

    return (
        <AuthProvider>
            {/* <Header /> */}
            <Routes>
                {/* <Route path="/" element={<Home notelist={notelist} />} /> */}
                <Route element={<ProtectedRoutes />}>
                    <Route element={<Header setSearchTerm={setSearchTerm} />}>
                        <Route element={<Layout notelist={notelist} searchTerm={searchTerm} />}>
                            <Route path="/" element={<Home />} />
                            <Route path="/notes/view/:notekey" element={<NoteView setNotelist={setNotelist} />} />
                            <Route path="/notes/add" element={<NoteEdit doCreate="create" setNotelist={setNotelist} />} />
                            <Route path="/notes/edit/:notekey" element={<NoteEdit doCreate="update" setNotelist={setNotelist} />} />
                            <Route path="*" element={<NotFound />} />
                        </Route>
                    </Route>
                </Route>
                <Route path="/users/login" element={<Login />} />
            </Routes>
        </AuthProvider>
    );
};