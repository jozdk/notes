import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../App.jsx";
import { useParams } from "react-router-dom";
import { NotLoggedIn } from "./NotLoggedIn.jsx";

export const NoteEdit = ({ doCreate }) => {
    const user = useContext(AuthContext);
    const { notekey } = useParams();
    const [note, setNote] = useState(null);

    useEffect(() => {
        const fetchNote = async () => {
            console.log("doCreate: ", doCreate);
            if (doCreate === false) {
                try {
                    const response = await fetch(`/notes/edit/${notekey}`);
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


    return user ? (
        <form method="POST" action="/notes/save">
            <div className="container-fluid">

                {/* <input type="hidden" name="docreate" value="{{#if docreate}}create{{else}}update{{/if}}" /> */}
                <p>
                    Key:
                    {doCreate ? (
                        <input type="text" name="notekey" defaultValue="" />
                    ) : (
                        <span>{notekey}</span>
                    )}
                    {/* <input type="hidden" name="notekey" value="{{#if notekey}}{{notekey}}{{/if}}" /> */}
                </p>
                <p>
                    Title:
                    <input type="text" name="title" defaultValue={note ? note.title : ""} />
                </p>
                <textarea name="body" id="" cols="40" rows="5" defaultValue={note ? note.body : ""}></textarea>
                <br />
                <input type="submit" value="Submit" />

            </div>
        </form>
    ) : (
        <NotLoggedIn />
    )
}