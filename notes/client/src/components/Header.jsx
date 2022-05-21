import { Link, Outlet } from "react-router-dom";
// import { useContext } from "react";
// import { AuthContext } from "../App.jsx";
import { useAuth } from "./AuthProvider.jsx";

const Header = ({ breadcrumb }) => {
    // const user = useContext(AuthContext);
    const { authState: { user }, logout } = useAuth();

    const handleLogout = () => {
        logout();
    }

    return (
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
}

export default Header;