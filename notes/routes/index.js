import { default as express } from "express";
import { NotesStore as notes } from "../models/notes-store.js";
// import { default as util } from "util";
export const router = express.Router();

router.get("/", async (req, res, next) => {
    try {
        const keylist = await notes.keylist();
        const keyPromises = keylist.map((key) => {
            return notes.read(key);
        });
        const noteList = await Promise.all(keyPromises);
        const noteListLean = noteList.map((note) => {
            return {
                key: note.key,
                title: note.title,
                body: note.body
            }
        })
        // console.log(util.inspect(noteList));
        res.render("index", {
            title: "Notes",
            notelist: noteListLean,
            user: req.user ? req.user : undefined
        });
    } catch (err) {
        next(err);
    }    
});

export function init() {
    
}