import { useState } from "react";

const Login = ({ onUsernameChange, onPasswordChange, onLogin }) => {
    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12 btn-group-vertical" role="group">
                    <form>
                        <div className="mb-3">
                            <label htmlFor="username" className="form-label">Username</label>
                            <input onChange={onUsernameChange} type="text" id="username" name="username" defaultValue="" placeholder="Your username" className="form-control" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input onChange={onPasswordChange} type="password" id="password" name="password" defaultValue="" placeholder="Your password" className="form-control" />
                        </div>
                        <button type="submit" className="btn btn-secondary" onClick={onLogin}>Submit</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;