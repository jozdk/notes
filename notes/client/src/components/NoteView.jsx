import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "../App.jsx";
import { useAuth } from "./AuthProvider.jsx";

export const NoteView = () => {
    // const user = useContext(AuthContext);
    const navigate = useNavigate();
    const { authState: { user } } = useAuth();
    const { notekey } = useParams();
    const [note, setNote] = useState(null);
    const [socket, setSocket] = useState();

    useEffect(() => {
        const fetchNote = async () => {
            try {
                const response = await fetch(`/notes/view?key=${notekey}`);
                const data = await response.json();
                setNote(data.note);
            } catch (err) {
                console.log(err);
                setNote(null);
            }
        };
        fetchNote();
    }, []);

    useEffect(() => {
        if (notekey) {
            const newSocket = io(`/notes?key=${notekey}`);
            newSocket.on("connect", () => {
                console.log(`socketio connection on /notes?key=${notekey}`);
            });
            newSocket.on("noteupdated", (note) => {
                setNote(note);
            });
            newSocket.on("notedestroyed", (key) => {
                navigate("/");
            });
            return () => newSocket.close();
        }
    }, [notekey]);

    return (
        <div className="container-fluid mt-2">

            {note ? (
                <>
                    <h3 id="notetitle">{note.title}</h3>
                    <p id="notebody">{note.body}</p>
                    <p>Key: {notekey}</p>

                    {user && notekey && (
                        <>
                            <hr />
                            <div className="btn-group">
                                <Link className="btn btn-outline-dark" to={`/notes/destroy/${notekey}`}>Delete</Link>
                                <Link className="btn btn-outline-dark" to={`/notes/edit/${notekey}`}>Edit</Link>
                            </div>
                        </>

                    )}
                </>
            ) : (
                <p>Loading...</p>
            )}

        </div>
    );
}