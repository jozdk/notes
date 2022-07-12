import { Link } from "react-router-dom";

export const NotLoggedIn = () => {
    return (
        <div className="mt-4 p-5 bg-light text-dark rounded">
            <h1>Not Logged In</h1>
            <p>You need to be logged in to perform this action</p>
            <Link to="/users/login" className="btn btn-dark">Login</Link>
        </div>
    )
};