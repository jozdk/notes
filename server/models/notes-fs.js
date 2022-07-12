import fs from "fs-extra";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { approotdir } from "../../approotdir.js";
import { Note, User, AbstractNotesStore } from "./Notes.js";
import { default as DBG } from "debug";

const debug = DBG("notes:notes-fs");
const error = DBG("notes:error-fs");

class FSNotesStore extends AbstractNotesStore {
    async close() {

    }

    async create(key, title, body, createdAt, updatedAt) {
        const note = await createOrUpdateNote(key, title, body, createdAt, updatedAt);
        this.emitCreated(note);
        return note;
    }

    async read(key) {
        const notesDir = await getNotesDir();
        const note = await readNoteFile(notesDir, key);
        // debug(`READ ${dir}/${key} ${util.inspect(note)}`);
        return note;
    }

    async update(key, title, body, createdAt, updatedAt) {
        const note = await createOrUpdateNote(key, title, body, createdAt, updatedAt);
        this.emitUpdated(note);
        return note;
    }

    async destroy(key) {
        const notesDir = await getNotesDir();
        await fs.unlink(getFilePath(notesDir, key));
        this.emitDestroyed(key);
    }

    async keylist() {
        const notesDir = await getNotesDir();
        let noteFiles = await fs.readdir(notesDir);
        if (!noteFiles) {
            noteFiles = [];
        }
        const notes = noteFiles.map(async (fname) => {
            const key = path.basename(fname, ".json");
            const note = await readNoteFile(notesDir, key);
            return note.key;
        });

        return Promise.all(notes);
    }

    async count() {
        const notesDir = await getNotesDir();
        const noteFiles = await fs.readdir(notesDir);
        return noteFiles.length;
    }
}

class FSUsersStore {
    async close() { }

    async create(username, password) {
        const date = new Date().toISOString();
        const id = uuidv4();
        const user = await createOrUpdateUser(id, username, password, date, date);
        return {
            id: user.id,
            username: user.username,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }

    async read(username) {
        const usersDir = await getUsersDir();
        const user = await readUserFile(usersDir, username);
        return {
            id: user.id,
            username: user.username,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }

    async update(username, password) {
        const date = new Date().toISOString();
        const user = await this.read(username);
        const updatedUser = await createOrUpdateUser(user.id, username, password, user.createdAt, date);
        return {
            id: updatedUser.id,
            username: updatedUser.username,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt
        };
    }

    async destroy(username) {
        const usersDir = await getUsersDir();
        await fs.unlink(getFilePath(usersDir, username));
    }

    async list() {
        const usersDir = await getUsersDir();
        let userFiles = await fs.readdir(usersDir);
        if (!userFiles) {
            userFiles = [];
        }
        const users = userFiles.map(async (fname) => {
            const username = path.basename(fname, ".json");
            const user = await readUserFile(usersDir, username);
            return {
                id: user.id,
                username: user.username,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            };
        });
        return Promise.all(users);
    }

    async checkPassword(username, password) {
        const usersDir = await getUsersDir();
        let user;
        try {
            user = await readUserFile(usersDir, username);
        } catch (err) {
            if (err.code === "ENOENT") {
                user = undefined;
            } else {
                throw new Error(err);
            }
        }
        let checked;
        if (!user) {
            checked = {
                check: false,
                username,
                message: "User not found"
            };
        } else {
            let pwcheck = false;

            if (user.username === username) {
                pwcheck = await bcrypt.compare(password, user.password);
            }

            if (pwcheck) {
                checked = {
                    check: true,
                    username: user.username
                };
            } else {
                checked = {
                    check: false,
                    username,
                    message: "Incorrect username or password"
                };
            }
        }
        return checked;
    }
}

// Helper functions

async function getNotesDir() {
    const dir = process.env.NOTES_FS_DIR || path.join(approotdir, "notes-fs-data");
    await fs.ensureDir(dir);
    return dir;
}

async function getUsersDir() {
    const dir = process.env.USERS_FS_DIR || path.join(approotdir, "users-fs-data");
    await fs.ensureDir(dir);
    return dir;
}

const getFilePath = (dir, key) => path.join(dir, `${key}.json`);

async function readNoteFile(notesDir, key) {
    const filePath = getFilePath(notesDir, key);
    const data = await fs.readFile(filePath, "utf8");
    // debug(`readJSON ${data}`);
    return Note.fromJSON(data);
}

async function readUserFile(usersDir, username) {
    const filePath = getFilePath(usersDir, username);
    const data = await fs.readFile(filePath, "utf8");
    return User.fromJSON(data);
}

async function createOrUpdateNote(key, title, body, createdAt, updatedAt) {
    const notesDir = await getNotesDir();

    if (key.includes("/")) {
        throw new Error(`Key ${key} cannot contain "/"`);
    }

    const note = new Note(key, title, body, createdAt, updatedAt);
    const filePath = getFilePath(notesDir, key);
    const jsonNote = note.toJSON();
    debug(`WRITE ${filePath} ${jsonNote}`);
    await fs.writeFile(filePath, jsonNote, "utf8");
    return note;
}

async function createOrUpdateUser(id, username, password, createdAt, updatedAt) {
    const usersDir = await getUsersDir();

    if (username.includes("/")) {
        throw new Error(`Username ${username} cannot contain "/"`);
    }

    const user = new User(id, username, password, createdAt, updatedAt);
    const filePath = getFilePath(usersDir, username);
    const jsonUser = user.toJSON();
    await fs.writeFile(filePath, jsonUser, "utf8");
    return user;
}

export {
    FSNotesStore as NotesStoreClass,
    FSUsersStore as UsersStoreClass
}