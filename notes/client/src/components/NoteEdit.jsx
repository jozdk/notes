import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export const NoteEdit = ({ doCreate, setNotelist }) => {
    const navigate = useNavigate();
    const { notekey } = useParams();
    const [note, setNote] = useState(null);

    useEffect(() => {
        const fetchNote = async () => {
            if (doCreate === "update") {
                try {
                    const response = await fetch(`/notes/edit?key=${notekey}`);
                    const data = await response.json();
                    setNote(data.note);
                } catch (err) {
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
                console.log(data.msg)
                setNote({ error: "Internal Server Error: This note could not be saved" });
            }
        } catch (err) {
            setNote({ error: err.message });
        }

    };

    return (
        <div className="p-5 mx-auto w-full 2xl:w-3/5 xl:w-4/5 lg:w-10/12 min-h-[calc(100%_-_57px)] flex flex-col">

            <input
                className="border border-gray-300 p-2 rounded-md focus:outline focus:outline-main mb-2 w-96"
                type="text" name="title"
                placeholder="Title"
                defaultValue={note?.title ? note.title : ""}
                onChange={onNoteTitleChange}
            />


            {note?.error && (
                <p className="text-red-600 mt-1">{note.error}</p>
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
                <button
                    className="py-2 px-4 bg-main text-black shadow-md rounded-md hover:outline hover:outline-dark"
                    onClick={handleSaveNote}
                >
                    Submit
                </button>
            </div>

        </div>
    );
}