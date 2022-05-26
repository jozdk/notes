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
    }, [notekey]);

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
        <div className="grow basis-4/5">

            {note ? (
                <div className="p-5">
                    <h3 className="text-2xl font-semibold pb-1 mb-3 border-b border-grey-100">
                        {note.title}
                        {/* <i class="bi bi-pencil-fill text-sm text-slate-500"></i>
                        <i class="bi bi-trash3-fill text-sm text-slate-500"></i> */}
                    </h3>
                    <p className="mb-10">{note.body}</p>
                    {/* <p>Key: {notekey}</p> */}

                    {user && notekey && (

                        <div className="inline-block border-t border-grey-100 py-2 pr-3">
                            <Link className="inline-block py-2 px-4 bg-main text-black shadow-md rounded-md hover:outline hover:outline-dark mr-2" to={`/notes/destroy/${notekey}`}><i class="bi bi-trash3-fill mr-1"></i> Delete</Link>
                            <Link className="inline-block py-2 px-4 bg-main text-black shadow-md rounded-md hover:outline hover:outline-dark" to={`/notes/edit/${notekey}`}><i class="bi bi-pencil-fill mr-1"></i> Edit</Link>
                        </div>


                    )}
                </div>
            ) : (
                <p>Loading...</p>
            )}

        </div>
    );
}