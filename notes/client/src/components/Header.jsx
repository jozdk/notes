import { Link, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
// import { useContext } from "react";
// import { AuthContext } from "../App.jsx";
import { useAuth } from "./AuthProvider.jsx";

export const Header = () => {
    // const user = useContext(AuthContext);
    const { authState: { user }, logout } = useAuth();
    const [displayMenu, setDisplayMenu] = useState(false);

    const handleLogout = () => {
        setDisplayMenu(false);
        logout();
    }

    const handleDisplayMenu = () => {
        if (displayMenu) {
            setDisplayMenu(false);
        } else {
            setDisplayMenu(true);
        }
    }

    return (
        <>
            <header className="w-full bg-dark text-white p-4">
                <div className="flex flex-col md:flex-row container mx-auto md:items-center">

                    <div id="nav-base" className="text-white flex justify-between md:pr-5">

                        {/* Always visible: Home and Add-Button */}
                        <div className="flex items-center">
                            <Link className="text-white pr-5" to="/">
                                <i className="bi-house text-3xl hover:text-main"></i>
                            </Link>
                            {user && <Link className="inline-block py-2 px-4 bg-main text-black rounded-md hover:outline hover:outline-white" to='/notes/add'>Add a Note</Link>}
                        </div>

                        {/* Menu Bars: hidden for medium screen upwards */}
                        {displayMenu
                            ? <button className="block md:hidden rounded-md focus:outline focus:outline-main" onClick={handleDisplayMenu}>
                                <i class="bi bi-x-lg text-3xl"></i>
                            </button>
                            : <button className="block md:hidden rounded-md focus:outline focus:outline-main" onClick={handleDisplayMenu}>
                                <i className="bi bi-list text-3xl"></i>
                            </button>
                        }


                    </div>

                    {/* Additional nav content: visible for medium screen upwards */}
                    <div id="nav-additional" className={`grow md:flex md:flex-row ${displayMenu ? "flex flex-col" : "hidden"} pt-4 md:pt-0`}>

                        <div className="mr-auto pb-3 md:pb-0">
                            <form>
                                <input className="outline focus:outline-mainIntensive p-2 rounded-md mr-3" type="search" placeholder="Search Note" aria-label="Search" />
                                {/* <button className="p-2 bg-main text-black rounded-md hover:outline hover:outline-white" type="submit">Search</button> */}
                            </form>
                        </div>

                        <div className="md:ml-2">
                            {user
                                ? <button onClick={handleLogout} className="py-2 px-4 bg-main text-black rounded-md hover:outline hover:outline-white">
                                    Logout <span className="p-1 rounded-md font-medium">{user.username}</span>
                                </button>
                                : <Link to="/users/login" className="inline-block py-2 px-4 bg-main text-black rounded-md hover:outline hover:outline-white" onClick={() => setDisplayMenu(false)}>Login</Link>
                            }
                        </div>

                    </div>

                </div>
            </header>
            <Outlet />
        </>
    )
}