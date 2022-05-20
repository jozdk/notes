import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

export const NoteDestroy = ({ setNotelist }) => {
    const navigate = useNavigate();
    const { notekey } = useParams();
    const [note, setNote] = useState(null);

    useEffect(() => {
        const fetchNote = async () => {
            try {
                const response = await fetch(`/notes/destroy?key=${notekey}`, {
                    credentials: "same-origin"
                });
                const data = await response.json();
                setNote(data.note);
            } catch (err) {
                console.log(err);
                setNote(null);
            }
        };
        fetchNote();
    }, []);

    const handleDestroy = (event) => {
        destroyNote(notekey);
        navigate("/");
    };

    const destroyNote = async (notekey) => {
        try {
            const response = await fetch(`/notes/destroy/confirm?key=${notekey}`, {
                method: "POST",
                mode: "same-origin",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ notekey: notekey })
            });
            const data = await response.json();

            if (data.success === true) {
                setNotelist((notelist) => notelist.filter(note => note.key !== notekey));
            }
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="container-fluid">
            {
                note ? (
                    <>
                        <p>Delete {note.title}?</p>
                        <div className="btn-group">
                            <button className="btn btn-outline-dark" onClick={handleDestroy}>DELETE</button>
                            <Link to={`/notes/view/${notekey}`} className="btn btn-outline-dark" role="button">Cancel</Link>
                        </div>
                    </>
                ) : (
                    <p>Loading...</p>
                )
            }
        </div>
    );
}