import { server, port } from "./app.js";
import * as util from "util";
import { NotesStore } from "./models/notes-store.js";
// import { UsersStore } from "./models/users-store.js";
import { default as DBG } from "debug";

const debug = DBG("notes:debug");
const dbgError = DBG("notes:error");

export function normalizePort(val) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        return val;
    }

    if (port >= 0) {
        return port;
    }

    return false;
}

export function onError(error) {
    dbgError(error);

    if (error.syscall !== "listen") {
        throw error;
    }

    const bind = typeof port === "string"
        ? "Pipe " + port
        : "Port " + port;

    switch (error.code) {
        case "EACCES":
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
        case "ELOGFILEROTATOR":
            console.error(`Log file initialization failure because ${error.error}`);
            process.exit(1);
            break;
        case "ENOTESSTORE":
            console.error(`Notes data store initialization failed because ${error.error}`);
            process.exit(1);
            break;
        default:
            throw error;
    }
}

export function onListening() {
    //const addr = server.address().address;
    const addr = server.address();
    const bind = typeof addr === "string"
        ? "pipe " + addr
        : "port " + addr.port;
    console.log(`Server started listening on ${bind}`);
}

export function handle404(req, res, next) {
    const err = new Error("Not found");
    err.status = 404;
    next(err);
}

export function basicErrorHandler(err, req, res, next) {
    if (res.headersSent) {
        return (next(err));
    }

    dbgError(err);

    err.status === 404
        ? res.status(404).send("404: Not Found")
        : res.status(500).send("500: Internal Server Error");
}

// ???
// process.on("uncaughtException", (err) => {
//     console.error(`The App crashed - ${(err.stack || err)}`);
// });

// process.on("unhandledRejection", (reason, pr) => {
//     console.error(`Unhandled rejection at: ${util.inspect(pr)} reason: ${reason}`);
// });

async function catchProcessExit() {
    try {
        await NotesStore.close();
        server.close();
        process.exit(0);
    } catch (err) {
        console.log(err);
    } finally {
        server.close();
        process.exit(0);
    }
}


process.on("SIGTERM", catchProcessExit);
process.on("SIGINT", catchProcessExit);
process.on("SIGHUP", catchProcessExit);

process.on("exit", () => debug("exiting..."));