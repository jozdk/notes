import util from "util";
import { Note, AbstractNotesStore } from "./Notes.js";
import { default as sqlite3 } from "sqlite3";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
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
                resolve(db);
            }
        );
    });

    await new Promise((resolve, reject) => {
        db.run(
            `CREATE TABLE IF NOT EXISTS notes (
                notekey TEXT PRIMARY KEY,
                title TEXT,
                body TEXT,
                createdAt TEXT,
                updatedAt TEXT
            )`,
            (err) => {
                if (err) {
                    return reject(err);
                }
                debug("Created table notes (if it not already existed)");
                resolve();
            }
        );
    });

    await new Promise((resolve, reject) => {
        db.run(
            `CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE,
                password TEXT,
                createdAt TEXT,
                updatedAt TEXT
            )`,
            (err) => {
                if (err) {
                    return reject(err);
                }
                debug("Created table users (if it not already existed)");
                resolve();
            }
        );
    })

    return db;
}

class SQLite3NotesStore extends AbstractNotesStore {
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
                        // debug(`READ ${util.inspect(note)}`);
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

class SQLite3UsersStore {
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

    async create(username, password) {
        await connectDB();
        const id = uuidv4();
        const date = new Date().toISOString();
        const user = await new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO users (id, username, password, createdAt, updatedAt)
                    VALUES (?, ?, ?, ?, ?)`,
                [id, username, password, date, date],
                function (err) {
                    if (err) {
                        return reject(err);
                    }

                    resolve({
                        id: id,
                        username,
                        createdAt: date,
                        updatedAt: date
                    });
                }
            )
        });
        return user;
    }

    async read(username) {
        await connectDB();
        const user = await new Promise((resolve, reject) => {
            db.get(
                "SELECT * FROM users WHERE username = ?",
                [username],
                (err, row) => {
                    if (err) {
                        return reject(err);
                    } else if (!row) {
                        resolve(row);
                    } else {
                        resolve({
                            id: row.id,
                            username: row.username,
                            createdAt: row.createdAt,
                            updatedAt: row.updatedAt
                        });
                    }


                }
            )
        });
        return user;
    }

    async update(username, password) {
        await connectDB();
        const date = new Date().toISOString();
        await new Promise((resolve, reject) => {
            db.run(
                `UPDATE users
                    SET password = ?, updatedAt = ?
                    WHERE username = ?`,
                [password, date, username],
                function (err) {
                    if (err) {
                        return reject(err);
                    }

                    resolve();
                }
            )
        });
        return await this.read(username);
    }

    async destroy(username) {
        await connectDB();
        return await new Promise((resolve, reject) => {
            db.run(
                "DELETE FROM users WHERE username = ?",
                [username],
                (err) => {
                    if (err) {
                        return reject(err);
                    }

                    debug("DELETED ", username);
                    resolve();
                }
            )
        });
    }

    async list() {
        await connectDB();
        const usersList = await new Promise((resolve, reject) => {
            db.all(
                "SELECT * FROM users",
                (err, rows) => {
                    if (err) {
                        return reject(err);
                    }

                    resolve(rows.map((row) => {
                        return {
                            id: row.id,
                            username: row.username,
                            createdAt: row.createdAt,
                            updatedAt: row.updatedAt
                        };
                    }));
                }
            );
        });
        return usersList;
    }

    async checkPassword(username, password) {
        await connectDB();
        const user = await new Promise((resolve, reject) => {
            db.get(
                "SELECT * FROM users WHERE username = ?",
                [username],
                (err, row) => {
                    if (err) {
                        return reject(err);
                    }

                    resolve(row);
                }
            );
        });

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

export {
    SQLite3NotesStore as NotesStoreClass,
    SQLite3UsersStore as UsersStoreClass
}