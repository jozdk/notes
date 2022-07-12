import { default as express } from "express";
import { NotesStore as notes } from "../models/notes-store.js";
import { io } from "../app.js";
import { ensureAuthenticated } from "./users.js";
import DBG from "debug";

const debug = DBG("notes:home");

export const router = express.Router();

router.get("/notes/list", ensureAuthenticated, async (req, res, next) => {
    try {
        const noteList = await getKeyTitlesList();
        res.json({
            notelist: noteList
        });
    } catch (err) {
        next(err);
    }
});

export async function getKeyTitlesList() {
    const keylist = await notes.keylist();
    const keyPromises = keylist.map((key) => {
        return notes.read(key);
    });
    const noteList = await Promise.all(keyPromises);
    return noteList.map((note) => {
        return {
            key: note.key,
            title: note.title,
            body: note.body,
            date: note.updatedAt
        }
    });
}

export async function emitNoteTitles() {
    const notelist = await getKeyTitlesList();
    io.of("/home").emit("notetitles", { notelist });
}

export function init() {
    io.of("/home").on("connect", (socket) => {
        debug("socketio connection on /home");
    });

    notes.on("notecreated", emitNoteTitles);
    notes.on("noteupdated", emitNoteTitles);
    notes.on("notedestroyed", emitNoteTitles);
}