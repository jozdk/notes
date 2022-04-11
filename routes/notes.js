import { default as express } from "express";
import { NotesStore } from "../app.js";
export const router = express.Router();

router.get("/add", (req, res, next) => {
    res.render("note-edit", {
        title: "Add a Note",
        docreate: true,
        notekey: "",
        note: undefined
    })
});