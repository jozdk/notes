import { default as express } from "express";
import { NotesStore as notes } from "../app.js";
export const router = express.Router();

router.get("/", async (req, res, next) => {
    try {
        const keylist = await notes.keylist();
        const keyPromises = keylist.map((key) => {
            return notes.read(key);
        });
        const noteList = await Promise.all(keyPromises);
        res.render("index", {
            title: "Notes",
            noteList: noteList
        });
    } catch (err) {
        next(err);
    }    
});