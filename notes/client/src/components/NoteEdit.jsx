import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../App.jsx";
import { useParams, useNavigate } from "react-router-dom";
import { NotLoggedIn } from "./NotLoggedIn.jsx";
import { data } from "autoprefixer";

export const NoteEdit = ({ doCreate, setNotelist }) => {
    const navigate = useNavigate();
    const user = useContext(AuthContext);
    const { notekey } = useParams();
    const [note, setNote] = useState(null);

    useEffect(() => {
        const fetchNote = async () => {
            console.log("doCreate: ", doCreate);
            if (doCreate === "update") {
                try {
                    const response = await fetch(`/notes/edit?key=${notekey}`);
                    const data = await response.json();
                    setNote(data.note);
                } catch (err) {
                    console.log(err);
                    setNote(null);
                }
            }
        };
        fetchNote();
    }, [doCreate]);

    const onNoteTitleChange = (event) => {
        setNote((prevNote) => {
            if (prevNote) {
                prevNote.title = event.target.value;
                return prevNote;
            } else {
                const note = {};
                note.title = event.target.value;
                return note;
            }
        });
    };

    const onNoteBodyChange = (event) => {
        setNote((prevNote) => {
            if (prevNote) {
                prevNote.body = event.target.value;
                return prevNote;
            } else {
                const note = {};
                note.body = event.target.value;
                return note;
            }
        });
    };

    const onNoteKeyChange = (event) => {
        setNote((prevNote) => {
            if (prevNote) {
                prevNote.key = event.target.value;
                return prevNote;
            } else {
                const note = {};
                note.key = event.target.value;
                return note;
            }
        });
    };

    const handleSaveNote = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch("/notes/save", {
                method: "POST",
                mode: "same-origin",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    note,
                    doCreate
                })
            });
            const data = await response.json();

            if (data.success === true) {
                setNotelist(data.notelist);
                navigate(`/notes/view/${data.notekey}`);
            } else {
                setNote({ error: data.msg });
                console.log(JSON.stringify(note, null, 2));
            }
        } catch (err) {
            setNote({ error: err.message });
        }

    };

    return (
        <form>
            <div className="container-fluid">

                {/* <input type="hidden" name="docreate" value="{{#if docreate}}create{{else}}update{{/if}}" /> */}
                <p>
                    Key:
                    {doCreate === "create" ? (
                        <input type="text" defaultValue="" onChange={onNoteKeyChange} />
                    ) : (
                        <span>{notekey}</span>
                    )}
                    {/* <input type="hidden" name="notekey" value="{{#if notekey}}{{notekey}}{{/if}}" /> */}
                </p>
                <p>
                    Title:
                    <input type="text" name="title" defaultValue={note?.title ? note.title : ""} onChange={onNoteTitleChange} />
                </p>

                {note?.error && (
                    <p className="lead text-danger mt-1">{note.error}</p>
                )}

                <textarea name="body" id="" cols="40" rows="5" defaultValue={note?.body ? note.body : ""} onChange={onNoteBodyChange}></textarea>
                <br />
                <input type="submit" value="Submit" onClick={handleSaveNote} />

            </div>
        </form>
    );
}