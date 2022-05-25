import { Link, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
// import { useContext } from "react";
// import { AuthContext } from "../App.jsx";
import { useAuth } from "./AuthProvider.jsx";
// import "../App.css";

const Header = ({ breadcrumb }) => {
    // const user = useContext(AuthContext);
    const { authState: { user }, logout } = useAuth();
    const [displayMenu, setDisplayMenu] = useState(false);
    const [onSmallScreen, setOnSmallScreen] = useState(null);

    const handleLogout = () => {
        logout();
    }

    const handleDisplayMenu = () => {
        console.log(displayMenu);
        if (displayMenu) {
            setDisplayMenu(false);
        } else {
            setDisplayMenu(true);
        }
    }

    useEffect(() => {
        window.matchMedia("min-width: 768px").addEventListener("change", (event) => {
            console.log(event);
        })
    }, []);

    (
        <>
            <header>
                <nav className="navbar navbar-expand-md navbar-light bg-light">
                    <div className="container-fluid">
                        <div className="d-flex">
                            <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse"
                                data-bs-target="#navbarContent">
                                <span className="navbar-toggler-icon"></span>
                            </button>
                            <Link className="nav-item nav-link" to="/">
                                <i className="bi-house"></i>
                            </Link>
                        </div>

                        {user && <Link className="nav-item nav-link" to='/notes/add'>Add a Note</Link>}

                        <div className="collapse navbar-collapse" id="navbarContent">
                            <div className="navbar-nav me-auto mb-2 mb-lg-0">
                                {breadcrumb && (<Link className="nav-item nav-link" to='{{breadcrumb.url}}'>{breadcrumb.title}</Link>)}
                            </div>
                            <form className="d-flex">
                                <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search" />
                                <button className="btn btn-outline-secondary" type="submit">Search</button>
                            </form>

                            {user
                                ? <div className="nav-item nav-link mb-2 mb-lg-0">
                                    <button onClick={handleLogout} className="btn btn-dark col-auto">Logout<span className="badge bg-light text-dark">{user.username}</span></button>
                                    {/* <Link to="/users/logout" className="btn btn-dark col-auto">Logout<span className="badge bg-light text-dark">{user.username}</span></Link> */}
                                </div>
                                : <div className="nav-item nav-link mb-2 mb-lg-0">
                                    <Link to="/users/login" className="btn btn-dark col-auto">Login</Link>
                                </div>}
                        </div>
                    </div>
                </nav>
            </header>
            <Outlet />
        </>
    )

    return (
        <>
            <header className="w-full bg-dark text-white">
                <div className="flex flex-col md:flex-row container mx-auto">
                    <div id="nav-base" className="text-white flex justify-between p-4">

                        {/* Always visible: Home and Add-Button */}
                        <div className="flex items-baseline">
                            <Link className="text-white pr-3" to="/">
                                <i className="bi-house text-3xl"></i>
                            </Link>
                            {user && <Link className="text-white" to='/notes/add'>Add a Note</Link>}
                        </div>

                        {/* Menu Bars: hidden for medium screen upwards */}
                        <button className="block md:hidden" onClick={handleDisplayMenu}>
                            <i className="bi bi-list text-3xl"></i>
                        </button>

                    </div>
                    
                    <div id="nav-additional" className={`grow md:flex md:flex-row ${displayMenu ? "flex flex-col" : "hidden"}`}>

                        {/* Additional nav content: visible for medium screen upwards */}
                        
                        {/* <div className="flex flex-col md:flex-row" id="additionalContent"> */}
                            <div id="search">
                                <form className="">
                                    <input className="outline focus:outline-mainIntensive p-2 rounded-md" type="search" placeholder="Search Note" aria-label="Search" />
                                    <button className="p-2 bg-main text-black rounded-md border border-white" type="submit">Search</button>
                                </form>
                            </div>


                            {user
                                ? <div className="">
                                    <button onClick={handleLogout} className="p-2 bg-main text-black rounded-md">
                                        Logout <span className="p-1 rounded-md font-medium">{user.username}</span>
                                    </button>
                                </div>
                                : <div className="">
                                    <Link to="/users/login" className="btn btn-dark col-auto">Login</Link>
                                </div>}

                        {/* </div> */}


                    </div>

                </div>

            </header>


            {/* {displayMenu && <MenuModal
                user={user}
                handleLogout={handleLogout}
                onToggle={handleDisplayMenu}
            />} */}

            <Outlet />
        </>
    )
}

const MenuModal = ({ user, handleLogout, onToggle }) => {

    const handleDisplayMenu = (event) => {
        event.stopPropagation();
        onToggle();
    }

    return (
        <>
            <div className="fixed inset-0 bg-transparent h-full w-full z-10" onClick={handleDisplayMenu} >

            </div>
            <div className="relative mx-auto px-5 pb-5 w-full shadow-lg z-20 flex flex-col bg-dark">
                {/* <div class="basis-full text-right">
                    <i className="bi bi-x-lg cursor-pointer" onClick={onToggle}></i>
                </div> */}
                <SearchForm />
                <div>
                    {user
                        ? <button onClick={handleLogout} className="p-2 bg-main text-black rounded-md">
                            Logout <span className="p-1 rounded-md font-medium">{user.username}</span>
                        </button>
                        : <Link to="/users/login" className="btn btn-dark col-auto">Login</Link>}
                </div>

            </div>
        </>

    )
}

const SearchForm = () => {
    return (
        <form className="pb-2">
            <input className="outline focus:outline-mainIntensive p-2 rounded-md mr-2" type="search" placeholder="Search Note" aria-label="Search" />
            <button className="p-2 bg-main text-black rounded-md" type="submit">Search</button>
        </form>
    );
}

export default Header;