import util from "util";
import { Note, AbstractNotesStore } from "./Notes.js";
import { Level } from "level";
import { default as DBG } from "debug";

const debug = DBG("notes:notes-level");

let db;

// this does not need to be async
async function connectDB() {
    if (db) {
        return db;
    }

    db = new Level(process.env.LEVELDB_LOCATION || "notes.level", {
        valueEncoding: "json"
    });

    return db;
}

export default class LevelNotesStore extends AbstractNotesStore {
    async close() {
        const _db = db;
        db = undefined;
        return _db ? _db.close() : undefined;
    }

    async create(key, title, body) {
        return createOrUpdate(key, title, body);
    }

    async read(key) {
        debug(`reading ${key}`);
        const db = await connectDB();
        const note = Note.fromJSON(await db.get(key));
        debug(`read ${key}: ${util.inspect(note)}`);
        return note;
    }

    async update(key, title, body) {
        return createOrUpdate(key, title, body);
    }

    async destroy(key) {
        const db = await connectDB();
        await db.del(key);
    }

    async keylist() {
        const db = await connectDB();
        const keys = [];
        for await (const key of db.keys()) {
            keys.push(key);
        }
        return keys;
    }

    async count() {
        const db = await connectDB();
        let total = 0;
        const keys = [];
        for await (const key of db.keys()) {
            total++;
        }
        return total;
    }

}

async function createOrUpdate(key, title, body) {
    debug(`createOrUpdate ${key} ${title} ${body}`);
    const db = await connectDB();
    let note = new Note(key, title, body);
    await db.put(key, note.toJSON());
    debug(`createOrUpdate saved ${util.inspect(note)}`);
    return note;
}