import { Link } from "react-router-dom";

export const Notelist = ({ notelist }) => {
    return (
        <>
            {notelist.map((note) => {
                return (
                    <Link key={note.key} to={`/notes/view/${note.key}`} className="block border-b rounded-md border-gray-200 last:border-0 hover:bg-main">
                        <div className="pb-1">
                            <div className="p-3">{note.title}</div>
                            <div className="text-slate-400 text-xs text-right px-3">date</div>
                        </div>

                    </Link>
                );
            })}
        </>
    );
}