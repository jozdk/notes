import { default as express } from "express";
import { io } from "../app.js";
import { emitNoteTitles } from "./index.js";
import { NotesStore as notes } from "../models/notes-store.js";
import { ensureAuthenticated } from "./users.js";
import { getKeyTitlesList } from "./index.js";
import { v4 as uuidv4 } from "uuid";
import DBG from "debug";

const debug = DBG("notes:notes");

export const router = express.Router();

router.get("/notes/view", ensureAuthenticated, async (req, res, next) => {
    try {
        const { key } = req.query;
        const note = await notes.read(key);
        res.json({
            note: {
                key: note.key,
                title: note.title,
                body: note.body,
                createdAt: note.createdAt,
                updatedAt: note.updatedAt
            }
        });
    } catch (err) {
        next(err);
    }
});

router.post("/notes/save", ensureAuthenticated, async (req, res, next) => {
    try {
        const { doCreate, note } = req.body;
        const noteDate = new Date().toISOString();
        let savedNote;

        if (doCreate === "create") {
            const uuid = uuidv4();
            savedNote = await notes.create(uuid, note.title, note.body, noteDate, noteDate);
        } else {
            savedNote = await notes.update(note.key, note.title, note.body, note.createdAt, noteDate);
        }

        const newNotelist = await getKeyTitlesList();
        res.json({
            success: true,
            notekey: savedNote.key,
            notelist: newNotelist
        });
    } catch (err) {
        res.json({
            success: false,
            msg: err.message
        });
    }
});

router.post("/notes/destroy", ensureAuthenticated, async (req, res, next) => {
    try {
        const { notekey } = req.body;
        await notes.destroy(notekey);
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

        const handleNoteUpdated = (note) => {
            const toemit = {
                key: note.key,
                title: note.title,
                body: note.body
            };
            io.of("/notes").to(note.key).emit("noteupdated", toemit);
            emitNoteTitles();
        }

        const handleNoteDestroyed = (key) => {
            io.of("/notes").to(key).emit("notedestroyed", key);
            emitNoteTitles();
        }

        notes.on("noteupdated", handleNoteUpdated);
        notes.on("notedestroyed", handleNoteDestroyed);

        socket.on("disconnect", () => {
            debug(`${socket.id} disconnected`);
            notes.off("noteupdated", handleNoteUpdated);
            notes.off("notedestroyed", handleNoteDestroyed);
        })
    });
}