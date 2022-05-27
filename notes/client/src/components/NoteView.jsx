import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "../App.jsx";
import { useAuth } from "./AuthProvider.jsx";
import { NoteDelete } from "./NoteDelete.jsx";

export const NoteView = ({ setNotelist }) => {
    // const user = useContext(AuthContext);
    const navigate = useNavigate();
    const { authState: { user } } = useAuth();
    const { notekey } = useParams();
    const [note, setNote] = useState(null);
    const [showModal, setShowModal] = useState(false);

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
    }, [notekey]);

    useEffect(() => {
        if (notekey) {
            const newSocket = io(`/notes?key=${notekey}`);
            newSocket.on("connect", () => {
                console.log(`socketio connection on /notes?key=${notekey}`);
            });
            newSocket.on("noteupdated", (note) => {
                setNote(note);
            });
            newSocket.on("notedestroyed", (key) => {
                navigate("/");
            });
            return () => newSocket.close();
        }
    }, [notekey]);

    const handleShowModal = () => {
        setShowModal(true);
    }

    return (
        <div className="basis-4/5 flex h-[calc(100vh_-_72px)] overflow-y-scroll">

            {note ? (
                <div className="p-5 mx-auto w-full 2xl:w-3/4">

                    <div className="min-h-[calc(100%_-_57px)]">
                        <div className="pb-1 mb-3 border-b border-grey-100 flex justify-between">
                            <h3 className="text-2xl font-semibold ">{note.title}</h3>
                            {user && notekey && (
                                <div className="w-20 flex justify-around items-center">
                                    <Link to={`/notes/edit/${notekey}`}>
                                        <i className="bi bi-pencil-fill text-slate-500 cursor-pointer"></i>
                                    </Link>
                                    <button onClick={handleShowModal}>
                                        <i className="bi bi-trash3-fill text-slate-500 cursor pointer"></i>
                                    </button>
                                </div>
                            )}
                        </div>


                        <p className="mb-10">{note.body}</p>
                        {/* <p>Key: {notekey}</p> */}
                    </div>



                    {user && notekey && (

                        <div className="inline-block border-t border-grey-100 pt-2 pb-5 pr-3">
                            <Link className="inline-block py-2 px-4 bg-main text-black shadow-md rounded-md hover:outline hover:outline-dark mr-2" to={`/notes/edit/${notekey}`}><i className="bi bi-pencil-fill mr-1"></i> Edit</Link>
                            <button
                                className="py-2 px-4 bg-main text-black shadow-md rounded-md hover:outline hover:outline-dark"
                                onClick={handleShowModal}
                            ><i className="bi bi-trash3-fill mr-1"></i> Delete</button>
                        </div>


                    )}
                </div>
            ) : (
                <p>Loading...</p>
            )}

            <NoteDelete
                note={note}
                showModal={showModal}
                setShowModal={setShowModal}
                setNotelist={setNotelist}
            />
        </div>
    );
}