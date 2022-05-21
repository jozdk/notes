import { default as express } from "express";
import { io } from "../app.js";
import { emitNoteTitles } from "./index.js";
import { NotesStore as notes } from "../models/notes-store.js";
import { ensureAuthenticated } from "./users.js";
import { getKeyTitlesList } from "./index.js";
import DBG from "debug";
import util from "util";
import { UniqueConstraintError } from "sequelize";

const debug = DBG("notes:notes");

export const router = express.Router();

// router.get("/add", ensureAuthenticated, (req, res, next) => {
//     res.render("note-edit", {
//         title: "Add a Note",
//         docreate: true,
//         notekey: "",
//         notetitle: undefined,
//         notebody: undefined,
//         user: req.user
//     })
// });

router.post("/save", ensureAuthenticated, async (req, res, next) => {
    try {
        const { doCreate, note } = req.body;
        let savedNote;

        if (doCreate === "create") {
            savedNote = await notes.create(note.key, note.title, note.body);
        } else {
            savedNote = await notes.update(note.key, note.title, note.body);
        }

        const newNotelist = await getKeyTitlesList();
        res.json({
            success: true,
            notekey: savedNote.key,
            notelist: newNotelist
        });
    } catch (err) {
        if (err instanceof UniqueConstraintError) {
            err.message = "This note key is already in use";
        }
        res.json({
            success: false,
            msg: err.message
        });
    }
})

// router.get("/view", async (req, res, next) => {
//     try {
//         const { key } = req.query;
//         const note = await notes.read(key);
//         res.render("note-view", {
//             title: note ? note.title : "",
//             notekey: key,
//             notetitle: note ? note.title : "",
//             notebody: note ? note.body : "",
//             user: req.user ? req.user : undefined
//         });
//     } catch(err) {
//         next(err);
//     }
// });

router.get("/view", async (req, res, next) => {
    try {
        const { key } = req.query;
        const note = await notes.read(key);
        debug(note);
        // res.render("note-view", {
        //     title: note ? note.title : "",
        //     notekey: key,
        //     notetitle: note ? note.title : "",
        //     notebody: note ? note.body : "",
        //     user: req.user ? req.user : undefined
        // });
        res.json({
            note: {
                key: note.key,
                title: note.title,
                body: note.body
            }
        });
    } catch (err) {
        next(err);
    }
});

router.get("/edit", ensureAuthenticated, async (req, res, next) => {
    try {
        const { key } = req.query;
        const note = await notes.read(key);
        // res.render("note-edit", {
        //     title: note ? `Edit ${note.title}` : "Add a Note",
        //     docreate: false,
        //     notekey: key,
        //     notetitle: note.title,
        //     notebody: note.body,
        //     user: req.user
        // });
        res.json({
            note: {
                key: note.key,
                title: note.title,
                body: note.body
            }
        });
    } catch (err) {
        next(err);
    }
});

router.get("/destroy", ensureAuthenticated, async (req, res, next) => {
    try {
        const { key } = req.query;
        const note = await notes.read(key);
        // res.render("note-destroy", {
        //     title: note ? note.title : "",
        //     notekey: key,
        //     notetitle: note.title,
        //     notebody: note.body,
        //     user: req.user
        // });
        res.json({
            note: {
                key: note.key,
                title: note.title,
                body: note.body
            }
        });
    } catch (err) {
        next(err);
    }
});

router.post("/destroy/confirm", ensureAuthenticated, async (req, res, next) => {
    try {
        const { notekey } = req.body;
        await notes.destroy(notekey);
        // res.redirect("/");
        res.json({
            success: true
        });
    } catch (err) {
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