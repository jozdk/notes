import { useState } from "react";
import { useAuth } from "./AuthProvider.jsx";

export const Login = () => {
    const auth = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleLogin = (event) => {
        event.preventDefault();
        auth.login(username, password);
    }

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12 btn-group-vertical" role="group">
                    <form>
                        <div className="mb-3">
                            <label htmlFor="username" className="form-label">Username</label>
                            <input onChange={handleUsernameChange} type="text" id="username" name="username" defaultValue="" placeholder="Your username" className="form-control" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input onChange={handlePasswordChange} type="password" id="password" name="password" defaultValue="" placeholder="Your password" className="form-control" />
                        </div>
                        <button type="submit" className="btn btn-secondary" onClick={handleLogin}>Submit</button>
                    </form>
                </div>
            </div>
        </div>
    );
}