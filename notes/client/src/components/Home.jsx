import { Notelist } from "./Noteslist.jsx";
import { Outlet } from "react-router-dom";

export const Home = ({ notelist }) => {
    return (
        <div className="container mx-auto flex">
            <Notelist notelist={notelist} />
            <Outlet />
        </div>
    )
}