import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = ({ setUser }) => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const checkPassword = async () => {
        try {
            const response = await fetch("/users/login", {
                method: "POST",
                mode: "same-origin",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });
            const data = await response.json();

            if (data.success === true) {
                setUser(data.user);
                navigate("/");
            } else {
                setUser(null);
            }

        } catch (err) {
            console.log(err);
            setUser(null);
        }
    }

    const handleLogin = (event) => {
        event.preventDefault();
        checkPassword();
    };

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

export default Login;