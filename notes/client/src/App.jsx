import { Routes, Route } from "react-router-dom";
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
    return (
        <AuthProvider>
            {/* <Header /> */}
            <Routes>
                {/* <Route path="/" element={<Home notelist={notelist} />} /> */}
                <Route element={<ProtectedRoutes />}>
                    <Route element={<Header />}>
                        <Route element={<Layout />}>
                            <Route path="/notes" element={<Home />} />
                            <Route path="/notes/view/:notekey" element={<NoteView />} />
                            <Route path="/notes/add" element={<NoteEdit doCreate="create" />} />
                            <Route path="/notes/edit/:notekey" element={<NoteEdit doCreate="update" />} />
                        </Route>
                    </Route>
                </Route>
                <Route path="/" element={<Login />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </AuthProvider>
    );
};