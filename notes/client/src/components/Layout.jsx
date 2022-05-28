import { Notelist } from "./Notelist.jsx";
import { Outlet } from "react-router-dom";

export const Layout = ({ notelist }) => {
    return (
        <div className="flex">
            <div className="lg:basis-1/5 basis-2/6 bg-gray-50 rounded-md h-[calc(100vh_-_72px)] hover:overflow-y-scroll md:pl-12 pl-7 md:pt-6">
                <Notelist notelist={notelist} />
            </div>
            <div className="basis-4/5 flex h-[calc(100vh_-_72px)] overflow-y-scroll">
                <Outlet />
            </div>
        </div>
    )
}