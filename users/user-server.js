import restify from "restify";
import * as util from "util";
import {
    db, userParams, findOneUser, createUser
} from "./users-bettersqlite3.js";

import DBG from "debug";

const log = DBG("users:service");
const error = DBG("users:error");

// Set up REST server

const server = restify.createServer({
    name: "user-auth-service",
    version: "0.0.1"
});

server.use(restify.plugins.authorizationParser());
// Mount custom check middleware here
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser({ mapParams: true }));

server.listen(process.env.PORT, "localhost", () => {
    log(`${server.name} listening at ${server.url}`);
});

process.on("uncaughtException", (err) => {
    console.error("UNCAUGHT EXCEPTION - ", (err.stack || err));
    process.exit(1);
})

process.on("unhandledRejection", (reason, pr) => {
    console.error(`UNHANDLED PROMISE REJECTION: ${util.inspect(pr)} reason: ${reason}`);
    process.exit(1);
});

// REST server route handlers

