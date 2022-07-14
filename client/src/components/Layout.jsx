import { Notelist } from "./Notelist.jsx";
import { Outlet, useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";
import io from "socket.io-client";

export const Layout = () => {
    const { displaySidebar, setDisplaySidebar, searchTerm } = useOutletContext();
    const [notelist, setNotelist] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch("/notes/list");
            const data = await response.json();
            setNotelist(data.notelist);
        };
        fetchData();
    }, []);

    useEffect(() => {
        const newSocket = io("/home");
        newSocket.on("connect", () => {
            console.log("socketio connection on /home");
        });
        newSocket.on("notetitles", (arg) => {
            const notelist = arg.notelist;
            setNotelist(notelist);
        });
        return () => newSocket.close();
    }, []);

    const handleHideSidebar = () => {
        if (displaySidebar) {
            setDisplaySidebar(false);
        }
    }

    return (
        <div className="flex">
            <div
                style={{
                    width: `${displaySidebar ? "320px" : "0"}`,
                    left: `${displaySidebar ? "0px" : "-50px"}`,
                    height: "calc(100vh - 72px)",
                    height: "calc(calc(var(--vh, 1vh) * 100) - 72px)"
                }}
                className="fixed z-10 overflow-x-hidden bg-gray-50 overflow-y-auto md:shadow-none shadow-sidebar lg:pl-12 pl-3 md:pt-6"
            >
                <Notelist notelist={notelist} searchTerm={searchTerm} />
            </div>
            <div className={`fixed w-100 h-100 top-72px left-0 right-0 bottom-0 bg-modal ${displaySidebar ? "block md:hidden" : "hidden"}`} onClick={handleHideSidebar}></div>
            <div
                style={{ height: "calc(100vh - 72px)", height: "calc(calc(var(--vh, 1vh) * 100) - 72px)" }}
                className={`flex grow overflow-y-auto ${displaySidebar ? "ml-0 md:ml-320px" : "ml-0"}`}
            >
                <Outlet context={{ setDisplaySidebar, setNotelist }} />
            </div>
        </div>
    )
}