import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useOutletContext } from "react-router-dom";
import { NoteNotFound } from "./NoteNotFound";

export const NoteEdit = ({ doCreate }) => {
    const navigate = useNavigate();
    const { notekey } = useParams();
    const [note, setNote] = useState(null);
    const [error, setError] = useState(null);
    const { setNotelist } = useOutletContext();

    useEffect(() => {
        const fetchNote = async () => {
            if (doCreate === "update") {
                try {
                    const response = await fetch(`/notes/view?key=${notekey}`);
                    if (!response.ok) {
                        throw new Error();
                    }
                    const data = await response.json();
                    setNote(data.note);
                } catch (err) {
                    setNote("Not found");
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
                note.body = "";
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
                note.title = "";
                return note;
            }
        });
    };

    const handleSaveNote = async (event) => {
        event.preventDefault();
        try {
            if (!note) {
                throw new Error("This note has no content. Write a note title and/or body.")
            }
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
                console.log(data.msg)
                setError("This note could not be saved.");
            }
        } catch (err) {
            if (err.message === "This note has no content. Write a note title and/or body.") {
                setError(err.message);
            } else {
                setError("Internal Server Error: This note could not be saved.");
            }
        }

    };

    if ((note !== "Not found") || doCreate === "create") {
        return (
            <div className="p-5 mx-auto w-full 2xl:w-3/5 xl:w-4/5 lg:w-10/12 min-h-[calc(100%_-_57px)] flex flex-col">

                <input
                    className="border border-gray-300 p-2 rounded-md focus:outline focus:outline-main mb-2"
                    type="text" name="title"
                    placeholder="Title"
                    defaultValue={note?.title ? note.title : ""}
                    onChange={onNoteTitleChange}
                />


                {error && (
                    <p className="text-red-600 mt-1">{error}</p>
                )}

                <textarea
                    className="border border-gray-300 p-2 rounded-md focus:outline focus:outline-main mb-3"
                    cols="40"
                    rows="10"
                    defaultValue={note?.body ? note.body : ""}
                    onChange={onNoteBodyChange}
                    placeholder="Note"
                ></textarea>

                <div className="flex justify-end">
                    <Link
                        className="py-2 px-4 bg-gray-100 text-black shadow-md rounded-md hover:outline hover:outline-dark mr-2"
                        to={notekey ? `/notes/view/${notekey}` : "/notes"}
                    >
                        Cancel
                    </Link>
                    <button
                        className="py-2 px-4 bg-main text-black shadow-md rounded-md hover:outline hover:outline-dark"
                        onClick={handleSaveNote}
                    >
                        Submit
                    </button>
                </div>

            </div>
        );
    } else {
        return <NoteNotFound />;
    }
}