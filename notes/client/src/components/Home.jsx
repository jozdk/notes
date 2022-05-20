import { Notelist } from "./Noteslist.jsx";

const Home = ({ notelist }) => {
    return (
        <div className="container-fluid">
            <div className="row">
                <Notelist notelist={notelist} />
            </div>
        </div>
    )
}

export default Home;