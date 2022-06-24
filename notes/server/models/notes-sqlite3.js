import util from "util";
import { Note, AbstractNotesStore } from "./Notes.js";
import { default as sqlite3 } from "sqlite3";
import { default as DBG } from "debug";

const debug = DBG("notes:notes-sqlite3");

let db;

async function connectDB() {
    if (db) {
        return db;
    }

    const dbfile = process.env.SQLITE_FILE || "notes.sqlite3";

    await new Promise((resolve, reject) => {
        db = new sqlite3.Database(
            dbfile,
            sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
            (err) => {
                if (err) return reject(err);
                debug(`Opened SQLite3 database ${dbfile} db=${util.inspect(db)}`);
                console.log("db: ", db);
                resolve(db);
            }
        );
    });
    return db;
}

export default class SQLite3NotesStore extends AbstractNotesStore {
    async close() {
        const _db = db;
        db = undefined;
        return _db ?
            new Promise((resolve, reject) => {
                _db.close((err) => {
                    if (err) {
                        reject(err);
                    }
                    else resolve();
                });
            }) : undefined;
    }

    async create(key, title, body, createdAt, updatedAt) {
        const db = await connectDB();
        const note = new Note(key, title, body, createdAt, updatedAt);
        await new Promise((resolve, reject) => {
            db.run("INSERT INTO notes (notekey, title, body, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)",
                [key, title, body, createdAt, updatedAt],
                (err) => {
                    if (err) {
                        return reject(err);
                    }

                    debug(`CREATE ${util.inspect(note)}`);
                    resolve(note);
                }
            );
        });
        this.emitCreated(note);
        return note;
    }

    async read(key) {
        const db = await connectDB();
        const note = await new Promise((resolve, reject) => {
            db.get("SELECT * FROM notes WHERE notekey = ?",
                [key],
                (err, row) => {
                    if (err) {
                        return reject(err);
                    } else if (!row) {
                        return reject(new Error(`No note found for ${key}`));
                    } else {
                        const note = new Note(row.notekey, row.title, row.body, row.createdAt, row.updatedAt);
                        debug(`READ ${util.inspect(note)}`);
                        resolve(note);
                    }
                }
            );
        });
        return note;
    }

    async update(key, title, body, createdAt, updatedAt) {
        const db = await connectDB();
        const note = new Note(key, title, body, createdAt, updatedAt);
        await new Promise((resolve, reject) => {
            db.run("UPDATE notes SET title = ?, body = ?, createdAt = ?, updatedAt = ? WHERE notekey = ?",
                [title, body, createdAt, updatedAt, key],
                (err) => {
                    if (err) {
                        return reject(err);
                    }
                    debug(`UPDATE ${util.inspect(note)}`);
                    resolve(note);
                }
            );
        });
        this.emitUpdated(note);
        return note;
    }

    async destroy(key) {
        const db = await connectDB();
        return await new Promise((resolve, reject) => {
            db.run("DELETE FROM notes WHERE notekey = ?",
                [key],
                (err) => {
                    if (err) {
                        return reject(err);
                    }
                    debug(`DESTROY ${key}`);
                    this.emitDestroyed(key);
                    resolve();
                }
            );
        });
    }

    async keylist() {
        const db = await connectDB();
        debug(`keylist db=${util.inspect(db)}`);
        const keys = await new Promise((resolve, reject) => {
            db.all("SELECT notekey FROM notes",
                (err, rows) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(rows.map((row) => {
                        return row.notekey;
                    }));
                }
            );
        });
        return keys;
    }

    async count() {
        const db = await connectDB();
        const count = await new Promise((resolve, reject) => {
            db.get("SELECT COUNT(notekey) AS count FROM notes",
                (err, row) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(row.count);
                }
            );
        });
        return count;
    }
}