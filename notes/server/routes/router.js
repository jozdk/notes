import express from "express";
import passport from "passport";
import { NotesStore as notes } from "../models/notes-store.js";
import { ensureAuthenticated } from "./users.js";
import { getKeyTitlesList } from "./index.js";
import { login } from "./users.js";
import DBG from "debug";
import util from "util";
import { UniqueConstraintError } from "sequelize";
import { v4 as uuidv4 } from "uuid";

const debug = DBG("notes:api");

export const router = express.Router();

router.get("/list", async (req, res, next) => {
    try {
        const noteList = await getKeyTitlesList();
        res.json({
            notelist: noteList,
            user: req.user ? req.user : null
        });
    } catch (err) {
        next(err);
    }
});

router.get("/notes/view", async (req, res, next) => {
    try {
        const { key } = req.query;
        const note = await notes.read(key);
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

router.get("/notes/edit", ensureAuthenticated, async (req, res, next) => {
    try {
        const { key } = req.query;
        const note = await notes.read(key);
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

router.get("/notes/destroy", ensureAuthenticated, async (req, res, next) => {
    try {
        const { key } = req.query;
        const note = await notes.read(key);
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

router.post("/notes/save", ensureAuthenticated, async (req, res, next) => {
    try {
        const { doCreate, note } = req.body;
        const uuid = uuidv4();
        let savedNote;

        if (doCreate === "create") {
            savedNote = await notes.create(uuid, note.title, note.body);
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
        debug(err);
        if (err instanceof UniqueConstraintError) {
            err.message = "This note key is already in use";
        }
        res.json({
            success: false,
            msg: err.message
        });
    }
});

router.post("/notes/destroy/confirm", ensureAuthenticated, async (req, res, next) => {
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

router.post("/users/login",
    (req, res, next) => {
        debug(req.body);
        next();
    },
    passport.authenticate("local"),
    (req, res, next) => {
        debug("/users/login requested");
        login(req, res, next);
    }
);

router.post("/users/logout", ensureAuthenticated, (req, res, next) => {
    try {
        req.session.destroy();
        req.logout();
        res.clearCookie(sessionCookieName);
        debug("Logged out user");
        res.status(200).json({
            success: true,
            msg: "Logout successfull"
        });
    } catch (err) {
        next(err);
    }
});

router.post("/auth", (req, res, next) => {
    if (req.isAuthenticated() && req.user) {
        res.json({
            success: true,
            user: {
                id: req.user.id,
                username: req.user.username
            }
        });
    } else {
        res.json({
            success: false
        });
    }
});