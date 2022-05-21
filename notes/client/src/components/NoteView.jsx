import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../App.jsx";
import { useAuth } from "./AuthProvider.jsx";

export const NoteView = () => {
    // const user = useContext(AuthContext);
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
    }, []);

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
                            {/* <p>
                                <button>Delete</button>
                                <a className="btn btn-outline-dark m-1" href="/notes/destroy?key={{notekey}}">Delete</a>
                                <a className="btn btn-outline-dark m-1" href="/notes/edit?key={{notekey}}">Edit</a>
                            </p> */}
                        </>

                    )}
                </>
            ) : (
                <p>Loading...</p>
            )}

        </div>
    );
}