import { Link } from "react-router-dom";

const Home = ({ notelist }) => {
    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12 btn-group-vertical" role="group" id="notetitles">
                    {notelist.map((note) => {
                        return (
                            <Link key={note.key} to={`/notes/view/${note.key}`} className="btn btn-lg btn-block btn-outline-dark">
                                {note.title}
                            </Link>
                            // <a key={note.key} href={`/notes/view/${note.key}`} className="btn btn-lg btn-block btn-outline-dark">{note.title}</a>
                        );
                    })}
                </div>
            </div>
        </div>
    )
}

export default Home;