import { Notelist } from "./Noteslist.jsx";
import { Outlet } from "react-router-dom";

const Home = ({ notelist }) => {
    return (
        <div className="container mx-auto flex">
            <Notelist notelist={notelist} />
            <Outlet />
        </div>
    )
}

export default Home;