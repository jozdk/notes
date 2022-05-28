import { Link } from "react-router-dom";

export const Placeholder = () => {
    return (
        <div className="basis-4/5 flex h-[calc(100vh_-_72px)] overflow-y-scroll">
            <div className="w-80 m-auto">
                <div>
                    <img src="/assets/svg/add_notes.svg" alt="Add some notes!" />
                </div>
                <div className="mt-5 text-center">
                    <Link className="inline-block py-2 px-4 bg-main text-black rounded-md hover:outline hover:outline-dark w-full" to='/notes/add'>Add a Note</Link>
                </div>
                {/* <h4 className="text-center p-5 mt-3 text-neutral-400">Add a new Note</h4> */}
            </div>

        </div>
    );
}