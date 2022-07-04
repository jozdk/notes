import { Command } from "commander";
import bcrypt from "bcrypt";
import pg from "pg";
const { Client } = pg;

import DBG from "debug";
const debug = DBG("notes:users-postgres");

let pgClient;

async function genHash(password) {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    return hashed;
}

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
            username VARCHAR(20)
            password VARCHAR(80)
        )`);
        debug("Table users was created (if not already existed)");

    } catch (err) {
        console.log(err);
        pgClient = undefined;
    }
}

const program = new Command();

async function main() {
    program
        .command("add <username>")
        .description("Add a user to the user server")
        .option("--password <password>", "Password for new user")
        .action(async (username, options) => {
            const { password } = options;
            const saltedHash = await genHash(password);
            await connectDB();
            try {
                const res = await pgClient.query(
                    `INSERT INTO users (username, password) VALUES ($1, $2)`,
                    [username, saltedHash]
                );
                if (res) {
                    console.log(`Created new user ${username}`);
                } else {
                    console.log(`New user ${username} could not be created`);
                }
            } catch (err) {
                console.log(err);
            }
        });

        
    
        await program.parseAsync(process.argv);
}