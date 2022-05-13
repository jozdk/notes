import { default as express } from "express";
import { io } from "../app.js";
import { emitNoteTitles } from "./index.js";
import { NotesStore as notes } from "../models/notes-store.js";
import { ensureAuthenticated } from "./users.js";
import DBG from "debug";

const debug = DBG("notes:notes");

export const router = express.Router();

router.get("/add", ensureAuthenticated, (req, res, next) => {
    res.render("note-edit", {
        title: "Add a Note",
        docreate: true,
        notekey: "",
        notetitle: undefined,
        notebody: undefined,
        user: req.user
    })
});

router.post("/save", ensureAuthenticated, async (req, res, next) => {
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
            notebody: note ? note.body : "",
            user: req.user ? req.user : undefined
        });
    } catch(err) {
        next(err);
    }
});

router.get("/edit", ensureAuthenticated, async (req, res, next) => {
    try {
        const { key } = req.query;
        const note = await notes.read(key);
        res.render("note-edit", {
            title: note ? `Edit ${note.title}` : "Add a Note",
            docreate: false,
            notekey: key,
            notetitle: note.title,
            notebody: note.body,
            user: req.user
        });
    } catch(err) {
        next(err);
    }
});

router.get("/destroy", ensureAuthenticated, async (req, res, next) => {
    try {
        const { key } = req.query;
        const note = await notes.read(key);
        res.render("note-destroy", {
            title: note ? note.title : "",
            notekey: key,
            notetitle: note.title,
            notebody: note.body,
            user: req.user
        });
    } catch(err) {
        next(err);
    } 
});

router.post("/destroy/confirm", ensureAuthenticated, async (req, res, next) => {
    try {
        const { notekey } = req.body;
        await notes.destroy(notekey);
        res.redirect("/");
    } catch(err) {
        next(err);
    }
});

export function init() {
    io.of("/notes").on("connect", (socket) => {
        debug("socketio connection on /notes");

        if (socket.handshake.query.key) {
            debug(`New client in room ${socket.handshake.query.key}`);
            socket.join(socket.handshake.query.key);
        }

        notes.on("noteupdated", (note) => {
            const toemit = {
                key: note.key,
                title: note.title,
                body: note.body
            };
            io.of("/notes").to(note.key).emit("noteupdated", toemit);
            emitNoteTitles();
        });
        notes.on("notedestroyed", (key) => {
            io.of("/notes").to(key).emit("notedestroyed", key);
            emitNoteTitles();
        });
    });
}