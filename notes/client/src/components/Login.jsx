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
        <div className="bg-dark h-screen w-screen">
            <div className="flex h-full">
                <div className="flex flex-col m-auto">
                    <h1 className="text-6xl text-main text-center mb-20">NOTES</h1>
                    <div>
                        <form>
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
        </div>
    );

}