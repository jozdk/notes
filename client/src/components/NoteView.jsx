import { useParams, Link, useNavigate, useOutletContext } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "../App.jsx";
import { useAuth } from "./AuthProvider.jsx";
import { NoteDelete } from "./NoteDelete.jsx";
import { Spinner } from "./Spinner.jsx";
import { NoteNotFound } from "./NoteNotFound.jsx";

export const NoteView = () => {
    // const user = useContext(AuthContext);
    const navigate = useNavigate();
    const { authState: { user } } = useAuth();
    const { notekey } = useParams();
    const [note, setNote] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const { setDisplaySidebar, setNotelist } = useOutletContext();

    useEffect(() => {
        const fetchNote = async () => {
            try {
                const response = await fetch(`/notes/view?key=${notekey}`);
                if (!response.ok) {
                    throw new Error();
                }
                const data = await response.json();
                if (data) {
                    setNote(data.note);
                }
                if (window.innerWidth <= 768) {
                    setDisplaySidebar(false);
                }
            } catch (err) {
                setNote("Not found");
            }
        };
        fetchNote();
    }, [notekey]);

    useEffect(() => {
        if (notekey) {
            const newSocket = io(`/notes?key=${notekey}`, { forceNew: true });
            // newSocket.on("connect", () => {
            //     console.log(`socketio connection on /notes?key=${notekey}`);
            // });
            newSocket.on("noteupdated", (note) => {
                setNote(note);
            });
            newSocket.on("notedestroyed", (key) => {
                navigate("/notes");
            });
            return () => newSocket.disconnect();
        }
    }, [notekey]);

    const handleShowModal = () => {
        setShowModal(true);
    }

    return (
        <>
            {note != null && note !== "Not found" ? (
                <div className="p-5 pb-3 mx-auto w-full 2xl:w-3/5 xl:w-4/5 lg:w-10/12">

                    <div className="min-h-[calc(100%_-_57px)]">
                        <div className="pb-1 mb-3 border-b border-grey-100 flex justify-between">
                            <h3 className="text-2xl font-semibold ">{note.title}</h3>
                            {user && notekey && (
                                <div className="w-20 flex justify-around items-end">
                                    <Link to={`/notes/edit/${notekey}`} style={{paddingBottom: "2px"}}>
                                        <i className="bi bi-pencil-fill text-slate-500 cursor-pointer"></i>
                                    </Link>
                                    <button onClick={handleShowModal} style={{paddingBottom: "2px"}}>
                                        <i className="bi bi-trash3-fill text-slate-500 cursor pointer"></i>
                                    </button>
                                </div>
                            )}
                        </div>


                        <p className="mb-10 whitespace-pre-wrap">{note.body}</p>
                    </div>



                    {user && notekey && (

                        <div className="inline-block border-t border-grey-100 pt-2 pr-3">
                            <Link className="inline-block py-2 px-4 bg-main text-black shadow-md rounded-md hover:outline hover:outline-dark mr-2" to={`/notes/edit/${notekey}`}><i className="bi bi-pencil-fill mr-1"></i> Edit</Link>
                            <button
                                className="py-2 px-4 bg-main text-black shadow-md rounded-md hover:outline hover:outline-dark"
                                onClick={handleShowModal}
                            ><i className="bi bi-trash3-fill mr-1"></i> Delete</button>
                        </div>


                    )}
                </div>
            ) : note === "Not found"
                ? <NoteNotFound />
                : <Spinner />
            }

            <NoteDelete
                note={note}
                showModal={showModal}
                setShowModal={setShowModal}
                setNotelist={setNotelist}
            />
        </>
    );
}