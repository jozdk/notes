import { port } from "./app.js";
import { server } from "./app.js";
import * as util from "util";
import { default as DBG } from "debug";
const debug = DBG("notes:debug");
const dbgerror = DBG("notes:error");

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
    dbgerror(error);

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
    debug(`Listening on ${bind}`);
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

    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    res.status(err.status || 500);
    res.render("error");
}

// ???
process.on("uncaughtException", (err) => {
    console.error(`The App crashed - ${(err.stack || err)}`);
});

process.on("unhandledRejection", (reason, pr) => {
    console.error(`Unhandled rejection at: ${util.inspect(pr)} reason: ${reason}`);
});