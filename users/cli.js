import "dotenv/config";
import { Command } from "commander";
import restify from "restify-clients";
import axios from "axios";
import * as util from "util";
import bcrypt from "bcrypt";

const program = new Command();

let client_port,
    client_host,
    client_version = "*",
    client_protocol,
    authid = process.env.API_USER,
    authcode = process.env.API_KEY;

const client = (program) => {
    const { port, host, url } = program.opts();

    if (typeof process.env.PORT === "string") {
        client_port = parseInt(process.env.PORT);
    }
    if (typeof port === "string") {
        client_port = parseInt(port);
    }
    if (typeof host === "string") {
        client_host = host;
    }
    if (typeof url === "string") {
        const purl = new URL(url);
        if (purl.host) {
            client_host = purl.host;
        }
        if (purl.port) {
            client_port = purl.port;
        }
        if (purl.protocol) {
            client_protocol = purl.protocol;
        }
    }

    let connect_url = new URL("http://localhost:5858");

    if (client_protocol) {
        connect_url.protocol = client_protocol;
    }
    if (client_host) {
        connect_url.host = client_host;
    }
    if (client_port) {
        connect_url.port = client_port;
    }

    // restify client:

    // const client = restify.createJSONClient({
    //     url: connect_url.href
    // });

    // client.basicAuth(authid, authcode);

    // return client;

    // axios client:

    const instance = axios.create({
        baseURL: connect_url.href,
        auth: {
            username: authid,
            password: authcode
        }
    });

    return instance;

}

async function genHash(password) {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    return hashed;
}

async function main() {
    program
        .option("-p, --port <port>", "Port number for user server, if using localhost")
        .option("-h, --host <host>", "Host name for user server")
        .option("-u, --url <url>", "Connection URL for user server, if using a remote server");

    program
        .command("add <username>")
        .description("Add a user to the user server")
        .option("--password <password>", "Password for new user")
        .option("--family-name <familyName>", "Family name, or last name, of the user")
        .option("--given-name <givenName>", "Given name, or first name, of the user")
        .option("--middle-name <middleName>", "Middle name of the user")
        .option("--email <email>", "Email address for the user")
        .action(async (username, options) => {
            const { password, familyName, givenName, middleName, email } = options;
            const topost = {
                username,
                password: await genHash(password),
                provider: "local",
                familyName,
                givenName,
                middleName,
                emails: [],
                photos: []
            };
            if (email) {
                topost.emails.push(email);
            }

            // restify:

            // client(program).post("/create-user", topost, (err, req, res, obj) => {
            //     if (err) {
            //         console.error(err.message, err.stack);
            //     } else {
            //         console.log(`Created ${util.inspect(obj)}`);
            //     }
            // });

            // axios:
            try {
                const result = await client(program).post("/create-user", topost);
                console.log(`Created ${util.inspect(result.data)}`);
            } catch (err) {
                console.error(err.message);
            }


        });

    program
        .command("find-or-create <username>")
        .description("Add a user to the user server if not exists")
        .option("--password <password>", "Password for new user")
        .option("--family-name <familyName>", "Family name, or last name, of the user")
        .option("--given-name <givenName>", "Given name, or first name, of the user")
        .option("--middle-name <middleName>", "Middle name of the user")
        .option("--email <email>", "Email address for the user")
        .action(async (username, options) => {
            const { password, familyName, givenName, middleName, email } = options;
            const topost = {
                username,
                password: await genHash(password),
                provider: "local",
                familyName,
                givenName,
                middleName,
                emails: [],
                photos: []
            };
            if (email) {
                topost.emails.push(email);
            }
            // client(program).post("/find-or-create", topost, (err, req, res, obj) => {
            //     if (err) {
            //         console.error(err.message, err.stack);
            //     } else {
            //         console.log(`Found or Created ${util.inspect(obj)}`);
            //     }
            // });

            // axios:
            try {
                const result = await client(program).post("/find-or-create", topost);
                console.log(`Found or created ${util.inspect(result.data)}`);
            } catch (err) {
                console.error(err.message);
            }
        });

    program
        .command("find <username>")
        .description("Search for a user on the user server")
        .action(async (username) => {
            // restify:

            // client(program).get(`/find/${username}`, (err, req, res, obj) => {
            //     if (err) console.error(err.message);
            //     else console.log(`Found ${util.inspect(obj)}`);
            // })

            // axios:

            try {
                const result = await client(program).get(`/find/${username}`);
                console.log(`Found ${util.inspect(result.data)}`);
            } catch(err) {
                console.error(err.message);
            }
        });

    program
        .command("list-users")
        .description("List all users on the user server")
        .action(async () => {
            try {
                const result = await client(program).get("/list");
                console.log(`Userlist: ${util.inspect(result.data)}`);
            } catch(err) {
                console.error(err.message);
            }
        });

    program
        .command("update <username>")
        .description("Update user information on the user server")
        .option("--password <password>", "Password for new user")
        .option("--family-name <familyName>", "Family name, or last name, of the user")
        .option("--given-name <givenName>", "Given name, or first name, of the user")
        .option("--middle-name <middleName>", "Middle name of the user")
        .option("--email <email>", "Email address for the user")
        .action(async (username, options) => {
            const { password, familyName, givenName, middleName, email } = options;
            const topost = {
                username,
                password: await genHash(password),
                provider: "local",
                familyName,
                givenName,
                middleName,
                emails: email ? [email] : [],
                photos: []
            };

            try {
                const result = await client(program).post(`/update-user/${username}`, topost);
                console.log(`Updated ${util.inspect(result.data)}`);
            } catch (err) {
                console.error(err.message);
            }
        }); 
    
    program
        .command("destroy <username>")
        .description("Destroy a user on the user server")
        .action(async (username) => {
            try {
                const result = await client(program).delete(`/destroy/${username}`);
                console.log(`Deleted - result: ${util.inspect(result.data)}`);
            } catch(err) {
                console.error(err.message);
            }
        });

    program
        .command("password-check <username> <password>")
        .description("Check user password")
        .action(async (username, password) => {
            try {
                const result = await client(program).post("/password-check", { username, password });
                console.log(`Password check: ${util.inspect(result.data)}`);
            } catch(err) {
                console.error(err.message);
            }
        });

    await program.parseAsync(process.argv);
}


main();



//program.parse(process.argv);
