import { Command } from "commander";
import bcrypt from "bcrypt";
import util from "util";
import dotenv from "dotenv";
import path from "path";
// import { useModel as useUsersModel } from "./models/users-store.js";
// import { onError } from "./appsupport.js";
// import { UsersStore as users } from "./models/users-store.js";

dotenv.config();

let users;

if ((process.argv[2] === "--store" || process.argv[2] === "-s") && process.argv[3] === "sequelize") {
    process.env.SEQUELIZE_LOGGING = false;
    // process.env.SEQUELIZE_CONNECT = path.resolve("models/sequelize-sqlite.yaml");
    // process.env.SEQUELIZE_DBFILE = path.resolve("../notes-sequelize.sqlite3");
}

import(`./server/models/notes-${process.argv[2] === "--store" || process.argv[2] === "-s" ? process.argv[3] : "postgres"}.js`)
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
        .command("add <username>")
        .description("Add a user to the database")
        .option("--password <password>", "Password for new user")
        .action(async (username, options) => {
            const { password } = options;
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
        .command("update <username>")
        .description("Update user information on the database")
        .option("--password <password>", "Password for new user")
        .action(async (username, options) => {
            const { password } = options;
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