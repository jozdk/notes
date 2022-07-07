import { Note, User, AbstractNotesStore } from "./Notes.js";
import { Level } from "level";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { default as DBG } from "debug";

const debug = DBG("notes:notes-level");

let db,
    notesLevel,
    usersLevel;

// this does not need to be async
async function connectDB() {
    if (db) {
        return {
            notesLevel,
            usersLevel
        };
    }

    db = new Level(process.env.LEVELDB_LOCATION || "notes.level", {
        valueEncoding: "json"
    });

    notesLevel = db.sublevel("notes", { valueEncoding: "json" });
    usersLevel = db.sublevel("users", { valueEncoding: "json" });

    return {
        notesLevel,
        usersLevel
    };
}

class LevelNotesStore extends AbstractNotesStore {
    async close() {
        const _db = db;
        db = undefined;
        return _db ? _db.close() : undefined;
    }

    async create(key, title, body, createdAt, updatedAt) {
        const note = await createOrUpdateNote(key, title, body, createdAt, updatedAt);
        this.emitCreated(note);
        return note;
    }

    async read(key) {
        debug(`reading ${key}`);
        const { notesLevel } = await connectDB();
        const note = Note.fromJSON(await notesLevel.get(key));
        // debug(`read ${key}: ${util.inspect(note)}`);
        return note;
    }

    async update(key, title, body, createdAt, updatedAt) {
        const note = await createOrUpdateNote(key, title, body, createdAt, updatedAt);
        this.emitUpdated(note);
        return note;
    }

    async destroy(key) {
        const { notesLevel } = await connectDB();
        await notesLevel.del(key);
        this.emitDestroyed(key);
    }

    async keylist() {
        const { notesLevel } = await connectDB();
        const keys = [];
        for await (const key of notesLevel.keys()) {
            keys.push(key);
        }
        return keys;
    }

    async count() {
        const { notesLevel } = await connectDB();
        let total = 0;
        const keys = [];
        for await (const key of notesLevel.keys()) {
            total++;
        }
        return total;
    }

}

async function createOrUpdateNote(key, title, body, createdAt, updatedAt) {
    debug(`createOrUpdate ${key} ${title} ${body} ${createdAt} ${updatedAt}`);
    const { notesLevel } = await connectDB();
    const note = new Note(key, title, body, createdAt, updatedAt);
    await notesLevel.put(key, note.toJSON());
    debug(`createOrUpdate saved ${note.title}`);
    return note;
}

class LevelUsersStore {
    async close() {
        const _db = db;
        db = undefined;
        return _db ? _db.close() : undefined;
    }

    async create(username, password) {
        const { usersLevel } = await connectDB();
        try {
            await usersLevel.get(username);
        } catch (err) {
            if (err.status === 404) {
                const id = uuidv4();
                const date = new Date().toISOString();
                const user = await createOrUpdateUser(id, username, password, date, date);
                return user;
            }
        }
        throw new Error("Username already in use");
    }

    async read(username) {
        const { usersLevel } = await connectDB();
        const user = User.fromJSON(await usersLevel.get(username));
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
        return updatedUser;
    }

    async destroy(username) {
        const { usersLevel } = await connectDB();
        return await usersLevel.del(username);
    }

    async list() {
        const { usersLevel } = await connectDB();
        const usersList = [];
        for await (const entry of usersLevel.values()) {
            const user = User.fromJSON(entry);
            usersList.push({
                id: user.id,
                username: user.username,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            });
        }
        return usersList;
    }

    async checkPassword(username, password) {
        const { usersLevel } = await connectDB();
        const user = User.fromJSON(await usersLevel.get(username));
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

async function createOrUpdateUser(id, username, password, createdAt, updatedAt) {
    const { usersLevel } = await connectDB();
    const user = new User(id, username, password, createdAt, updatedAt);
    await usersLevel.put(username, user.toJSON());
    return { id, username, createdAt, updatedAt };
}

export {
    LevelNotesStore as NotesStoreClass,
    LevelUsersStore as UsersStoreClass
}