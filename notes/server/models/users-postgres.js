import pg from "pg";
import bcrypt from "bcrypt";
const { Client } = pg;

import DBG from "debug";
const debug = DBG("notes:users-postgres");

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
        debug("PostgreSQL connection for users established");

        await pgClient.query(`CREATE TABLE IF NOT EXISTS users (
            username VARCHAR(20),
            password VARCHAR(80)
        )`);
        debug("Table users was created (if not already existed)");

    } catch (err) {
        console.log(err);
        pgClient = undefined;
    }
}

export default class PostgresUsersStore {
    async close() {
        await pgClient.end();
        pgClient = undefined;
    }

    async create(username, password) {
        await connectDB();
        const res = await pgClient.query(
            `INSERT INTO users (username, password) VALUES ($1, $2) RETURNING username`,
            [username, password]
        );
        if (!res) {
            throw new Error(`New user ${username} could not be created`);
        } else {
            debug("Create ", username);
            return {
                username: res.rows[0].username
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
                    username: user.username
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
        const res = await pgClient.query(
            `UPDATE users
                SET password = $1
                WHERE username = $2`,
            [password, username]
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
        const res = await pgClient.query("SELECT username FROM users");
        if (res) {
            let usersList = res.rows.map((row) => row.username);
            if (!usersList) {
                usersList = [];
            }
            return usersList;
        } else {
            throw new Error("Could not list users");
        }
    }

    async passwordCheck(username, password) {
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

