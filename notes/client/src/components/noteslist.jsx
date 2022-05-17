const Notelist = ({ notelist }) => {
    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12 btn-group-vertical" role="group" id="notetitles">
                    {notelist.map((note) => {
                        return (
                            <a key={note.key} href="/notes/view?key={{key}}" className="btn btn-lg btn-block btn-outline-dark">{note.title}</a>
                        );
                    })}
                </div>
            </div>
        </div>
    )
}

export default Notelist;