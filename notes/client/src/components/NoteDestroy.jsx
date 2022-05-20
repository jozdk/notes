import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export const NoteDestroy = ({ destroyNote }) => {
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

    return (

        <div className="container-fluid">
            {
                note ? (
                    <>
                        {/* <input type="hidden" name="notekey" value="{{#if notekey}}{{notekey}}{{/if}}" /> */}
                        <p>Delete {note.title}?</p>
                        <div className="btn-group">
                            <button className="btn btn-outline-dark" onClick={handleDestroy}>DELETE</button>
                            <a href="/notes/view?key={{#if notekey}}{{notekey}}{{/if}}" className="btn btn-outline-dark" role="button">Cancel</a>
                        </div>
                    </>
                ) : (
                    <p>Loading...</p>
                )
            }
        </div>

    )
}