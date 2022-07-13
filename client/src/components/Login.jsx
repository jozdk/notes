import { useState } from "react";
import { useAuth } from "./AuthProvider.jsx";
import { Spinner } from "./Spinner.jsx";
import { Navigate } from "react-router-dom";

export const Login = () => {
    const auth = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [alert, setAlert] = useState("");

    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleLogin = (event) => {
        event.preventDefault();
        auth.login(username, password, setAlert);
    }

    if (auth.authState?.user) {
        return <Navigate to="/notes" />
    } else if (auth.authState?.isLoading) {
        return (
            <div className="h-screen w-screen flex">
                <Spinner />
            </div>
        )
    } else {
        return (
            <div className="bg-dark h-screen w-screen">
                <div className="flex h-full">
                    <div className="flex flex-col m-auto">
                        <h1 className="text-6xl text-main text-center mb-10">NOTES</h1>
                        <form>
                            {alert && (
                                <div className="mb-2 text-red-500 text-center">
                                    {alert}
                                </div>
                            )}
                            <div className="mb-3">
                                <input
                                    onChange={handleUsernameChange}
                                    type="text"
                                    defaultValue=""
                                    placeholder="Username"
                                    className="p-2 rounded-md focus:outline focus:outline-main placeholder:text-gray-500"
                                />
                            </div>
                            <div className="mb-5">
                                <input
                                    onChange={handlePasswordChange}
                                    type="password"
                                    defaultValue=""
                                    placeholder="Password"
                                    className="p-2 rounded-md focus:outline focus:outline-main placeholder:text-gray-500"
                                />
                            </div>
                            <div className="text-right">
                                <button
                                    type="submit"
                                    className="py-2 px-4 bg-main text-black shadow-md rounded-md hover:outline hover:outline-white w-full"
                                    onClick={handleLogin}
                                >Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

}