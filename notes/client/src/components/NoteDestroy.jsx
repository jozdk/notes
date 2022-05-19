import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../App.jsx";
import { Link, useNavigate, useParams } from "react-router-dom";

export const NoteDestroy = ({ destroyNote }) => {
    const navigate = useNavigate();
    const user = useContext(AuthContext);
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
                {user ? (
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
                    )) : (
                    <div className="mt-4 p-5 bg-light text-dark rounded">
                        <h1>Not Logged In</h1>
                        <p>You need to be logged in to perform this action</p>
                        <Link to="/users/login" className="btn btn-dark">Login</Link>
                    </div>
                )}
            </div>
        
    )
}