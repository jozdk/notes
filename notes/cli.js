import { Command } from "commander";
import bcrypt from "bcrypt";
import util from "util";
import dotenv from "dotenv";

dotenv.config();

let users;

const storeOpt = process.argv.findIndex((arg) => arg === "-s" || arg === "--store");

if (storeOpt !== -1 
    && process.argv[storeOpt + 1] !== "fs"
    && process.argv[storeOpt + 1] !== "level"
    && process.argv[storeOpt + 1] !== "sqlite3"
    && process.argv[storeOpt + 1] !== "sequelize"
    && process.argv[storeOpt + 1] !== "postgres"
) {
    console.log("No argument provided for store");
    process.exit(1);
}

if (storeOpt !== -1 && process.argv[storeOpt + 1] === "sequelize") {
    process.env.SEQUELIZE_LOGGING = false;
}

import(`./server/models/notes-${storeOpt !== -1 ? process.argv[storeOpt + 1] : "sqlite3"}.js`)
    .then((store) => {
        const { UsersStoreClass } = store;
        users = new UsersStoreClass();
        console.log("Using", users.constructor.name);
        return main();
    })
    .then(() => {
        users.close();
    })
    .catch((err) => {
        console.log(err.stack);
    });


async function genHash(password) {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    return hashed;
}

const program = new Command();

async function main() {
    // let users;

    program
        .option("-s, --store <store>", "User store to be used", "postgres")

    program
        .command("add <username> <password>")
        .description("Add a user to the database")
        .action(async (username, password) => {
            const saltedHash = await genHash(password);
            try {
                const user = await users.create(username, saltedHash);
                console.log(`Created new user ${JSON.stringify(user, null, 2)}`);
            } catch (err) {
                console.error(err.message);
            }
        });

    program
        .command("find <username>")
        .description("Search for a user on the database")
        .action(async (username) => {
            try {
                const user = await users.read(username);
                if (user) {
                    console.log(`Found ${util.inspect(user)}`);
                } else {
                    console.log(`User ${username} not found`);
                }
            } catch (err) {
                console.error(err.message);
            }
        });

    program
        .command("update <username> <password>")
        .description("Update user information on the database")
        .action(async (username, password) => {
            const saltedHash = await genHash(password);
            try {
                const user = await users.update(username, saltedHash);
                console.log(`Updated ${util.inspect(user)}`);
            } catch (err) {
                console.error(err.message);
            }
        });

    program
        .command("destroy <username>")
        .description("Destroy a user on the database")
        .action(async (username) => {
            try {
                await users.destroy(username);
                console.log(`Deleted ${username}`);
            } catch (err) {
                console.error(err.message);
            }
        });

    program
        .command("list-users")
        .description("List all users on the database")
        .action(async () => {
            try {
                const usersList = await users.list();
                console.log(`Userlist: ${util.inspect(usersList)}`);
            } catch (err) {
                console.error(err.message);
            }
        });

    program
        .command("password-check <username> <password>")
        .description("Check user password")
        .action(async (username, password) => {
            try {
                const result = await users.checkPassword(username, password);
                console.log(`Password check: ${util.inspect(result)}`);
            } catch (err) {
                console.error(err.message);
            }
        });

    await program.parseAsync(process.argv);

    // const { store } = program.opts();

    // try {
    //     console.log(store);
    //     const { default: UsersStoreClass } = await import(`./models/users-${store}.js`);
    //     users = new UsersStoreClass();
    // } catch (err) {
    //     console.error(err.message);
    // }
}

// main();