import { Notelist } from "./Notelist.jsx";
import { Outlet, useOutletContext } from "react-router-dom";

export const Layout = ({ notelist, searchTerm }) => {
    const [displaySidebar, setDisplaySidebar] = useOutletContext();

    const handleHideSidebar = () => {
        if (displaySidebar) {
            setDisplaySidebar(false);
        }
    }

    return (
        <div className="flex">
            <div style={{ width: `${displaySidebar ? "320px" : "0"}`, left: `${displaySidebar ? "0px" : "-50px"}` }} className="fixed z-10 overflow-x-hidden bg-gray-50 h-[calc(100vh_-_72px)] hover:overflow-y-scroll md:shadow-none shadow-sidebar lg:pl-12 pl-3 md:pt-6">
                <Notelist notelist={notelist} searchTerm={searchTerm} />
            </div>
            <div className={`fixed w-100 h-100 top-72px left-0 right-0 bottom-0 bg-modal ${displaySidebar ? "block md:hidden" : "hidden"}`} onClick={handleHideSidebar}></div>
            <div className={`flex h-[calc(100vh_-_72px)] grow overflow-y-scroll ${displaySidebar ? "ml-0 md:ml-320px" : "ml-0"}`}>
                <Outlet context={setDisplaySidebar} />
            </div>
        </div>
    )
}