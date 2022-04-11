import { default as express } from "express";
import { NotesStore as notes } from "../app.js";
export const router = express.Router();

router.get("/add", (req, res, next) => {
    console.log(req.query);
    res.render("note-edit", {
        title: "Add a Note",
        docreate: true,
        notekey: "",
        note: undefined
    })
});

router.post("/save", async (req, res, next) => {
    const { docreate, notekey, title, body } = req.body;
    try {
        let note;
        if (docreate === "create") {
            note = await notes.create(notekey, title, body);
        } else {
            note = await notes.update(notekey, title, body);
        }
        res.redirect(`/notes/view?key=${notekey}`);
    } catch (err) {
        next(err);
    }
})