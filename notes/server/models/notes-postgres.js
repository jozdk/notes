import pg from "pg";
const { Client } = pg;
import { AbstractNotesStore } from "./Notes.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

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
            database: process.env.PG_DATABASE,
            password: process.env.PG_PASSWD,
            port: 5432
        });
        await pgClient.connect();
        debug("PostgreSQL connection established");

        await pgClient.query(`CREATE TABLE IF NOT EXISTS notes (
            key UUID PRIMARY KEY,
            title VARCHAR(255),
            body TEXT,
            created_at CHAR(24),
            updated_at CHAR(24)
        )`);
        debug("Table notes was created if not already existed");

        await pgClient.query(`CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY,
            username VARCHAR(20) UNIQUE NOT NULL,
            password CHAR(60) NOT NULL,
            created_at CHAR(24),
            updated_at CHAR(24)

        )`);
        debug("Table users was created (if not already existed)");

    } catch (err) {
        console.log(err);
        pgClient = undefined;
    }
}

class PostgresNotesStore extends AbstractNotesStore {
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

class PostgresUsersStore {
    async close() {
        await pgClient.end();
        pgClient = undefined;
    }

    async create(username, password) {
        await connectDB();
        const id = uuidv4();
        const date = new Date().toISOString();
        const res = await pgClient.query(
            `INSERT INTO users (id, username, password, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *`,
            [id, username, password, date, date]
        );
        if (!res) {
            throw new Error(`New user ${username} could not be created`);
        } else {
            const user = res.rows[0];
            debug("Create ", user);
            return {
                id: user.id,
                username: user.username,
                createdAt: user.created_at,
                updatedAt: user.updated_at
            };
        }
    }

    async read(username) {
        await connectDB();
        const res = await pgClient.query("SELECT * FROM users WHERE username = $1", [username]);
        if (res) {
            const user = res.rows[0];
            if (user) {
                return {
                    id: user.id,
                    username: user.username,
                    createdAt: user.created_at,
                    updatedAt: user.updated_at
                };
            } else {
                return undefined;
            }
        } else {
            throw new Error("Error reading ", username);
        }
    }

    async update(username, password) {
        await connectDB();
        const date = new Date().toISOString();
        // const user = await pgClient.read(username);
        const res = await pgClient.query(
            `UPDATE users
                SET password = $1, updated_at = $2
                WHERE username = $3`,
            [password, date, username]
        );
        if (!res) {
            throw new Error(`User ${username} could not be updated`);
        } else {
            debug("Updated ", username);
            return { username };
        }
    }

    async destroy(username) {
        await connectDB();
        const res = await pgClient.query("DELETE FROM users WHERE username = $1", [username]);
        if (!res) {
            throw new Error(`User ${username} could not be deleted`);
        }
    }

    async list() {
        await connectDB();
        const res = await pgClient.query("SELECT * FROM users");
        if (res) {
            let usersList = res.rows.map((row) => {
                return {
                    id: row.id,
                    username: row.username,
                    createdAt: row.created_at,
                    updatedAt: row.updated_at
                };
            });
            if (!usersList) {
                usersList = [];
            }
            return usersList;
        } else {
            throw new Error("Could not list users");
        }
    }

    async checkPassword(username, password) {
        await connectDB();
        const res = await pgClient.query("SELECT * FROM users WHERE username = $1", [username]);
        const user = res.rows[0];
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
    PostgresNotesStore as NotesStoreClass,
    PostgresUsersStore as UsersStoreClass
}