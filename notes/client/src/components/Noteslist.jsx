import { Link } from "react-router-dom";

export const Notelist = ({ notelist }) => {
    return (
        <div className="col-12 btn-group-vertical" role="group" id="notetitles">
            {notelist.map((note) => {
                return (
                    <Link key={note.key} to={`/notes/view/${note.key}`} className="btn btn-lg btn-block btn-outline-dark">
                        {note.title}
                    </Link>
                );
            })}
        </div>
    );
}