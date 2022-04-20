import fs from "fs-extra";
import * as path from "path";
import * as util from "util";
import { approotdir } from "../approotdir.js";
import { Note, AbstractNotesStore } from "./Notes.js";
import { default as DBG } from "debug";

const debug = DBG("notes:notes-fs");
const error = DBG("notes:error-fs");

export default class FSNotesStore extends AbstractNotesStore {
    async close() {

    }

    async create(key, title, body) {
        return createOrUpdate(key, title, body);
    }

    async read(key) {
        const notesdir = await notesDir();
        const note = await readJSON(notesdir, key);
        debug(`READ ${notesdir}/${key} ${util.inspect(note)}`);
        return note;
    }

    async update(key, title, body) {
        return createOrUpdate(key, title, body);
    }

    async destroy(key) {
        const notesdir = await notesDir();
        await fs.unlink(filePath(notesdir, key));
    }

    async keylist() {
        const notesdir = await notesDir();
        let noteFiles = await fs.readdir(notesdir);
        if (!noteFiles) {
            noteFiles = [];
        }
        const notes = noteFiles.map(async (fname) => {
            const key = path.basename(fname, ".json");
            const note = await readJSON(notesdir, key);
            return note.key;
        });

        return Promise.all(notes);
    }

    async count() {
        const notesdir = await notesDir();
        const noteFiles = await fs.readdir(notesdir);
        return noteFiles.length;
    }
}

// Helper functions

async function notesDir() {
    const dir = process.env.NOTES_FS_DIR || path.join(approotdir, "notes-fs-data");
    await fs.ensureDir(dir);
    return dir;
}

const filePath = (notesdir, key) => path.join(notesdir, `${key}.json`);

async function readJSON(notesdir, key) {
    const nFilePath = filePath(notesdir, key);
    const data = await fs.readFile(nFilePath, "utf8");
    debug(`readJSON ${data}`);
    return Note.fromJSON(data);
}

async function createOrUpdate(key, title, body) {
    const notesdir = await notesDir();

    if (key.includes("/")) {
        throw new Error(`Key ${key} cannot contain "/"`);
    }

    const note = new Note(key, title, body);
    const nFilePath = filePath(notesdir, key);
    const jsonNote = note.toJSON();
    debug(`WRITE ${nFilePath} ${jsonNote}`);
    await fs.writeFile(nFilePath, jsonNote, "utf8");
    return note;
}