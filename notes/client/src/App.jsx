//import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout.jsx";
import Home from "./components/home.jsx";
import Login from "./components/login.jsx";
import NotFound from "./components/notfound.jsx";

const App = () => {
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

    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout user={user} />}>
                    <Route index element={<Home notelist={notelist} />} />
                    <Route path="users/login" element={<Login />} />
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default App;