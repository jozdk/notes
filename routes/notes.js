import { default as express } from "express";
import { NotesStore as notes } from "../app.js";
export const router = express.Router();

router.get("/add", (req, res, next) => {
    res.render("note-edit", {
        title: "Add a Note",
        docreate: true,
        notekey: "",
        notetitle: undefined,
        notebody: undefined
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
        const note = await notes.read(key);
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

router.get("/edit", async (req, res, next) => {
    try {
        const { key } = req.query;
        const note = await notes.read(key);
        res.render("note-edit", {
            title: note ? `Edit ${note.title}` : "Add a Note",
            docreate: false,
            notekey: key,
            notetitle: note.title,
            notebody: note.body
        })
    } catch(err) {
        next(err);
    }
});

router.get("/destroy", async (req, res, next) => {
    try {
        const { key } = req.query;
        const note = await notes.read(key);
        res.render("note-destroy", {
            title: note ? note.title : "",
            notekey: key,
            notetitle: note.title,
            notebody: note.body
        });
    } catch(err) {
        next(err);
    } 
});

router.post("/destroy/confirm", async (req, res, next) => {
    try {
        const { notekey } = req.body;
        await notes.destroy(notekey);
        res.redirect("/");
    } catch(err) {
        next(err);
    }
});