import { Link } from "react-router-dom";

export const Notelist = ({ notelist }) => {
    return (
        <div className="basis-1/5 bg-gray-50 border border-slate-200 rounded-md" id="notetitles">
            {notelist.map((note) => {
                return (
                    <Link key={note.key} to={`/notes/view/${note.key}`} className="block border-b border-gray-200 flex justify-between hover:bg-main">
                        <span className="p-3">{note.title}</span>
                        <span className="text-slate-400 text-xs self-end p-1">date</span>
                    </Link>
                );
            })}
        </div>
    );
}