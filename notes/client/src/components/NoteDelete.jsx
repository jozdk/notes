export const NoteDelete = ({ showModal, setShowModal, note, setNotelist }) => {
    const handleCloseModal = (event) => {
        event.stopPropagation();
        setShowModal(false);
    }

    const handleDestroyNote = () => {
        destroyNote(note.key);
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

    return showModal && (
        <div className="flex justify-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 bg-modal" onClick={handleCloseModal}>
            <div className="w-3/12 my-6 mx-auto mt-64 min-w-96">
                <div className="border-0 rounded-lg shadow-lg flex flex-col w-full bg-white outline-none focus:outline-none">
                    <div className="p-3 text-right">
                        <button onClick={handleCloseModal}><i className="bi bi-x-lg"></i></button>
                    </div>
                    <div className="p-3 pb-8">
                        Are you sure you want to delete {note.title}?
                    </div>
                    <div className="p-3">
                        <button
                            className="py-2 px-4 bg-main text-black shadow-md rounded-md hover:outline hover:outline-dark mr-2"
                            onClick={handleDestroyNote}
                        >Delete</button>
                        <button
                            className="py-2 px-4 bg-main text-black shadow-md rounded-md hover:outline hover:outline-dark mr-2"
                            onClick={handleCloseModal}
                        >Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    )
}