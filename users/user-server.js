import express from "express";
import * as util from "util";
import {
    db, userParams, findOneUser, createUser
} from "./users-bettersqlite3.js";

import DBG from "debug";

const log = DBG("users:service");
const error = DBG("users:error");

// Set up REST server

const app = express();

app.use(checkAuth);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("Hello");
})

app.listen(process.env.PORT, () => {
    log(`User-Auth-Server listening on ${process.env.PORT}`);
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

app.post("/create-user", (req, res, next) => {
    try {
        const result = createUser(req);
        res.contentType = "json";
        res.json(result);
    } catch (err) {
        res.status(500).send(`Something went wrong: ${err}`);
    }
});

app.post("/find-or-create", (req, res, next) => {
    try {
        let user = findOneUser(req.body.username);
        if (!user) {
            user = createUser(req);
            if (!user) {
                throw new Error("No user created");
            }
        }
        res.json(user);
    } catch(err) {
        res.status(500).send(`Something went wrong: ${err}`);
    }
});


// Mimic API Key authentication

const apiKeys = [
    { user: process.env.API_USER, key: process.env.API_KEY }
]

function checkAuth(req, res, next) {
    console.log("request headers: ", req.headers.authorization);
    next();
}