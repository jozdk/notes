import { default as express } from "express";
import { NotesStore as notes } from "../app.js";
export const router = express.Router();

router.get("/add", (req, res, next) => {
    res.render("note-edit", {
        title: "Add a Note",
        docreate: true,
        notekey: "",
        note: undefined
    })
});

router.post("/save", async (req, res, next) => {
    try {
        const { docreate, notekey, title, body } = req.body;
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

router.get("/view", async (req, res, next) => {
    try {
        const { key } = req.query;
        let note = await notes.read(key);
        res.render("note-view", {
            title: note ? note.title : "",
            notekey: key,
            notetitle: note ? note.title : "",
            notebody: note ? note.body : ""
        });
    } catch(err) {
        next(err);
    }
});