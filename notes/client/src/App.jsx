import { useState, useEffect, createContext } from "react";
import { Routes, Route } from "react-router-dom";
import io from "socket.io-client";
import { Header } from "./components/Header.jsx";
import Home from "./components/Home.jsx";
import { Login } from "./components/Login.jsx";
import { NoteView } from "./components/NoteView.jsx";
import { NoteDestroy } from "./components/NoteDestroy.jsx";
import { NoteEdit } from "./components/NoteEdit.jsx";
import NotFound from "./components/NotFound.jsx";
import { ProtectedRoutes } from "./components/ProtectedRoutes.jsx";
// import { PrivateRoute } from "./components/PrivateRoute.jsx";
import { AuthProvider } from "./components/AuthProvider.jsx";

// export const AuthContext = createContext(null);

export const App = () => {
    const [notelist, setNotelist] = useState([]);
    // const [user, setUser] = useState(null);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch("/list");
            const data = await response.json();
            setNotelist(data.notelist);
            // setUser(data.user);
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
            <Header />
            <Routes>
                {/* <Route path="/" element={<Home notelist={notelist} />} /> */}
                <Route path="/" element={<Home notelist={notelist} />}>
                    <Route path="/users/login" element={<Login />} />
                    <Route path="/notes/view/:notekey" element={<NoteView />} />
                    <Route path="*" element={<NotFound />} />
                    <Route element={<ProtectedRoutes />}>
                        <Route path="/notes/add" element={<NoteEdit doCreate="create" setNotelist={setNotelist} />} />
                        <Route path="/notes/edit/:notekey" element={<NoteEdit doCreate="update" setNotelist={setNotelist} />} />
                        <Route path="/notes/destroy/:notekey" element={<NoteDestroy setNotelist={setNotelist} />} />
                    </Route>
                </Route>

            </Routes>
        </AuthProvider>
    );
};