import { Link } from "react-router-dom";

const Header = ({ user, breadcrumb }) => {
    return (
        <header>
            <nav className="navbar navbar-expand-md navbar-light bg-light">
                <div className="container-fluid">
                    <div className="d-flex">
                        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse"
                            data-bs-target="#navbarContent">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <a className="nav-item nav-link" href="/">
                            <i className="bi-house"></i>
                        </a>
                    </div>

                    {user && <a className="nav-item nav-link" href='/notes/add'>Add a Note</a>}

                    <div className="collapse navbar-collapse" id="navbarContent">
                        <div className="navbar-nav me-auto mb-2 mb-lg-0">
                            {breadcrumb && (<a className="nav-item nav-link" href='{{breadcrumb.url}}'>{breadcrumb.title}</a>)}
                        </div>
                        <form className="d-flex">
                            <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search" />
                            <button className="btn btn-outline-secondary" type="submit">Search</button>
                        </form>

                        {user
                            ? <div className="nav-item nav-link mb-2 mb-lg-0">
                                <Link to="/users/logout" className="btn btn-dark col-auto">Logout<span className="badge bg-light text-dark">{user.username}</span></Link>
                                {/* <a href="/users/logout" className="btn btn-dark col-auto">Logout <span className="badge bg-light text-dark">{user.username}</span></a> */}
                            </div>
                            : <div className="nav-item nav-link mb-2 mb-lg-0">
                                <Link to="/users/login" className="btn btn-dark col-auto">Login</Link>
                                {/* <a href="/users/login" className="btn btn-dark col-auto">Login</a> */}
                            </div>}
                    </div>
                </div>
            </nav>
        </header>
    )
}

export default Header;