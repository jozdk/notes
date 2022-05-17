import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";

const root = ReactDOM.createRoot(document.querySelector("#root"));
root.render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<App />} />
            <Route path="users/login" element={<Login />} />
        </Routes>
    </BrowserRouter>
)
