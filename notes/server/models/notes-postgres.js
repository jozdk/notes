import pg from "pg";
const { Client } = pg;
import { AbstractNotesStore } from "./Notes.js";

import DBG from "debug";
const debug = DBG("notes:notes-postgres");

// Heroku ???
// const connectionString = process.env.DATABASE_URL;

let pgClient;

async function connectDB() {
    if (pgClient) {
        return;
    }

    try {
        pgClient = new Client({
            user: process.env.PG_USER,
            host: 'localhost',
            database: 'notes_project',
            password: process.env.PG_PASSWD,
            port: 5432
        });
        await pgClient.connect();
        debug("PostgreSQL connection established");

        await pgClient.query(`CREATE TABLE IF NOT EXISTS notes (
            key VARCHAR(255) PRIMARY KEY,
            title VARCHAR(255),
            body TEXT,
            created_at VARCHAR(255),
            updated_at VARCHAR(255)
        )`);
        debug("Table notes was created if not already existed");

    } catch (err) {
        console.log(err);
        pgClient = undefined;
    }
}

export default class PostgresNotesStore extends AbstractNotesStore {
    async close() {
        await pgClient.end();
        pgClient = undefined;
    }

    async create(key, title, body, createdAt, updatedAt) {
        await connectDB();
        const text = `INSERT INTO notes (
            key,
            title,
            body,
            created_at,
            updated_at
        ) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
        const values = [key, title, body, createdAt, updatedAt];
        const res = await pgClient.query(text, values);
        const note = res.rows[0];
        debug("created ", note);
        this.emitCreated(note);
        return {
            key: note.key,
            title: note.title,
            body: note.body,
            createdAt: note.created_at,
            updatedAt: note.updated_at
        };
    }

    async read(key) {
        await connectDB();
        const res = await pgClient.query("SELECT * FROM notes WHERE key = $1", [key]);
        const note = res.rows[0];
        if (!note) {
            throw new Error(`No note found for ${key}`);
        } else {
            return {
                key: note.key,
                title: note.title,
                body: note.body,
                createdAt: note.created_at,
                updatedAt: note.updated_at
            };
        }
    }

    async update(key, title, body, createdAt, updatedAt) {
        await connectDB();
        const res = await pgClient.query(`UPDATE notes SET
            title = $1,
            body = $2,
            created_at = $3,
            updated_at = $4
            WHERE key = $5 RETURNING *`,
            [title, body, createdAt, updatedAt, key]
        );
        const note = res.rows[0];
        if (!note) {
            throw new Error(`No note found for ${key}`)
        } else {
            this.emitUpdated(note);
            return {
                key: note.key,
                title: note.title,
                body: note.body,
                createdAt: note.created_at,
                updatedAt: note.updated_at
            };
        }
    }

    async destroy(key) {
        await connectDB();
        await pgClient.query("DELETE FROM notes WHERE key = $1", [key]);
        this.emitDestroyed(key);
    }

    async keylist() {
        await connectDB();
        const res = await pgClient.query("SELECT key FROM notes");
        const notekeys = res.rows.map((row) => row.key);
        return notekeys;
    }

    async count() {
        await connectDB();
        const res = await pgClient.query("SELECT COUNT(*) FROM notes");
        debug("count ", res.rows[0]);
        return res.rows[0];
    }
}