import { Link, Outlet } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
// import { useContext } from "react";
// import { AuthContext } from "../App.jsx";
import { useAuth } from "./AuthProvider.jsx";

export const Header = ({ setSearchTerm }) => {
    // const user = useContext(AuthContext);
    const { authState: { user }, logout } = useAuth();
    const [displaySidebar, setDisplaySidebar] = useState(window.innerWidth <= 768 ? false : true);
    const [displayUserDropdown, setDisplayUserDropdown] = useState(false);
    const [useSearch, setUseSearch] = useState(false);

    const searchRef = useRef(null);

    useEffect(() => {
        window.addEventListener("resize", () => {
            if (window.innerWidth <= 768) {
                if (document.activeElement !== searchRef.current) {
                    setDisplaySidebar(false);
                }
            } else {
                setDisplaySidebar(true);
            }
        })
    }, [])

    const handleLogout = () => {
        setDisplayMenu(false);
        logout();
    }

    const handleSearchInput = (event) => {
        console.log(event.target.value);
        setSearchTerm(event.target.value);
    }

    const handleDisplaySidebar = () => {
        if (displaySidebar) {
            setDisplaySidebar(false)
        } else {
            setDisplaySidebar(true);
        }
    }

    const handleDisplayUserDropdown = () => {
        if (displayUserDropdown) {
            setDisplayUserDropdown(false);
        } else {
            setDisplayUserDropdown(true);
        }
    }

    const handleSearchFocus = (event) => {
        setUseSearch(true);
        setDisplaySidebar(true);
    }

    const handleSearchBlur = (event) => {
        setUseSearch(false);
    }

    return (
        <>
            <header className="w-full bg-dark text-white py-4">
                <div className="flex flex-col md:flex-row mx-auto md:items-center md:px-12 px-3">

                    <div id="nav-base" className="text-white flex grow justify-between md:pr-5">

                        {/* Always visible: Home and Add-Button */}
                        <div className="flex items-center">
                            <button onClick={handleDisplaySidebar}>
                                <i className="bi bi-list text-3xl hover:text-main pr-4"></i>
                            </button>
                            <Link className="text-white pr-4" to="/notes">
                                <i className="bi-house text-3xl hover:text-main"></i>
                            </Link>
                            {user && <Link className="inline-block py-2 px-4 mr-3 bg-main text-text rounded-md hover:outline hover:outline-white" to='/notes/add' onClick={() => { if (window.innerWidth <= 768) setDisplaySidebar(false)} }>
                                <i className="md:hidden bi bi-plus-lg"></i>
                                <span className="hidden md:block">Add a Note</span>
                            </Link>}
                        </div>

                        {/* Menu Bars: hidden for medium screen upwards */}
                        {/* {displayMenu
                            ? <button className="block md:hidden rounded-md focus:outline focus:outline-main" onClick={handleDisplayMenu}>
                                <i class="bi bi-x-lg text-3xl"></i>
                            </button>
                            : <button className="block md:hidden rounded-md focus:outline focus:outline-main" onClick={handleDisplayMenu}>
                                <i className="bi bi-list text-3xl"></i>
                            </button>
                        } */}

                        <div className={`mr-auto ${useSearch ? "fixed md:static z-10 md:z-auto w-1/2 md:w-fit right-3 md:right-auto" : "static z-auto w-16 md:w-fit"}`}>
                            <input
                                className="text-text focus:outline focus:outline-main focus:ring focus:ring-main hover:outline hover:outline-main hover:ring hover:ring-main p-2 rounded-md mr-3 w-full"
                                type="search"
                                placeholder="Search Note by Title"
                                defaultValue=""
                                onChange={handleSearchInput}
                                onFocus={handleSearchFocus}
                                onBlur={handleSearchBlur}
                                ref={searchRef}
                            />
                            {/* <button className="p-2 bg-main text-black rounded-md hover:outline hover:outline-white" type="submit">Search</button> */}
                        </div>

                        <div className="md:ml-2">
                            {user
                                ? <div className="relative inline-block" onClick={handleDisplayUserDropdown}>
                                    <button className="rounded-full bg-main text-text p-2">
                                        <span style={{ width: "23px", height: "23px" }} className="inline-block">{user.username.slice(0, 1)}</span>
                                    </button>
                                    <div className={`fixed bg-transparent inset-0 ${displayUserDropdown ? "block" : "hidden"}`}></div>
                                    <div className={`whitespace-nowrap rounded-md bg-white border border-gray-300 z-10 absolute right-1 py-2 ${displayUserDropdown ? "block" : "hidden"}`}>
                                        <div className="text-text p-2 px-4 mb-2 border-b border-gray-300 select-none">
                                            Logged in as <strong>{user.username}</strong>
                                        </div>
                                        <button className="py-1 px-4 w-full text-text hover:bg-main text-left" onClick={handleLogout}>
                                            <i className="bi bi-box-arrow-right mr-2 text-lg"></i>
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                </div>
                                : <Link to="/users/login" className="inline-block py-2 px-4 bg-main text-text rounded-md hover:outline hover:outline-white">Login</Link>
                            }
                        </div>

                    </div>

                    {/* Additional nav content: visible for medium screen upwards */}
                    {/* <div id="nav-additional" className={`grow md:flex md:flex-row ${displayMenu ? "flex flex-col" : "hidden"} pt-4 md:pt-0`}>

                        <div className="mr-auto pb-3 md:pb-0">
                            <input
                                className="text-text focus:outline focus:outline-main focus:ring focus:ring-main hover:outline hover:outline-main hover:ring hover:ring-main p-2 rounded-md mr-3"
                                type="search"
                                placeholder="Search Note by Title"
                                defaultValue=""
                                onChange={handleSearchInput}
                            />
                            
                        </div>

                        <div className="md:ml-2">
                            {user
                                ? <button onClick={handleLogout} className="py-2 px-4 bg-main text-text rounded-md hover:outline hover:outline-white">
                                    Logout <span className="p-1 rounded-md font-medium">{user.username}</span>
                                </button>
                                : <Link to="/users/login" className="inline-block py-2 px-4 bg-main text-text rounded-md hover:outline hover:outline-white" onClick={() => setDisplayMenu(false)}>Login</Link>
                            }
                        </div>

                    </div> */}

                </div>
            </header>
            <Outlet context={[displaySidebar, setDisplaySidebar]} />
        </>
    )
}