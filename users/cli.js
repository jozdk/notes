import { Command } from "commander";
// ??? Restify-cleint ???
import * as util from "util";

const program = new Command();

let client_port,
    client_host,
    client_version = "*",
    client_protocol,
    authid = process.env.API_ID,
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

    // const client = // provide client

    // basic auth

    // return client;

}

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
    

program.parse(process.argv);
