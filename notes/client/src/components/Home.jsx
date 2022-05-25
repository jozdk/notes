import { Notelist } from "./Noteslist.jsx";

const Home = ({ notelist }) => {
    return (
        <div className="container mx-auto flex">
            <Notelist notelist={notelist} />
        </div>
    )
}

export default Home;