import { useParams } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../App.jsx";

export const NoteView = () => {
    const user = useContext(AuthContext);
    const { notekey } = useParams();
    const [note, setNote] = useState(null);

    useEffect(() => {
        const fetchNote = async () => {
            try {
                console.log("fetching note");
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
        <div className="container-fluid">

            {note ? (
                <>
                    <h3 id="notetitle">{note.title}</h3>
                    <p id="notebody">{note.body}</p>
                    <p>Key: {notekey}</p>

                    {user && notekey && (
                        <>
                            <hr />
                            <p>
                                <a className="btn btn-outline-dark m-1" href="/notes/destroy?key={{notekey}}">Delete</a>
                                <a className="btn btn-outline-dark m-1" href="/notes/edit?key={{notekey}}">Edit</a>
                            </p>
                        </>

                    )}
                </>
            ) : (
                <p>Loading...</p>
            )}

        </div>
    );
}