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
        console.log("/create-user: ", util.inspect(result));
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
    } catch (err) {
        res.status(500).send(`Something went wrong: ${err}`);
    }
});

app.get("/find/:username", (req, res, next) => {
    try {
        const user = findOneUser(req.params.username);
        if (!user) {
            res.status(404).send(new Error(`${req.params.username} not found`));
        } else {
            res.json(user);
        }
    } catch (err) {
        res.status(500).send(`Something went wrong: ${err}`);
    }
});

app.get("/list", (req, res, next) => {
    try {
        let userlist = db.prepare("SELECT * FROM users").all();
        log(`userlist: ${util.inspect(userlist)}`);
        if (!userlist) {
            userlist = [];
        }
        res.json(userlist);
    } catch (err) {
        res.status(500).send(`Something went wrong: ${err}`);
    }
});

app.post("/update-user/:username", (req, res, next) => {
    try {
        const toUpdate = userParams(req);
        log("toUpdate: ", util.inspect(toUpdate))

        const user = findOneUser(req.params.username);

        Object.keys(toUpdate).forEach(key => {
            log(`${key} = ${toUpdate[key]}`);
            if (key === "email") {
                user.emails = toUpdate[key];
            } else {
               user[key] = toUpdate[key]; 
            }
        });

        // Object.keys(user).forEach((key) => {
        //     console.log("column to update: ", key);
        //     const info = db.prepare(`UPDATE users SET middleName = $value WHERE username = $username`).run({ column: key, value: user[key], username: req.params.username });
        //     log("updated: ", util.inspect(info));
        // });

        user.emails = JSON.stringify(user.emails);
        user.photos = JSON.stringify(user.photos);

        log(util.inspect(user));

        const info = db.prepare(`UPDATE users SET
            username = $username,
            password = $password,
            provider = $provider,
            familyName = $familyName,
            givenName = $givenName,
            middleName = $middleName,
            emails = $emails,
            photos = $photos 
            WHERE username = $username`).run(user);

        log("info: ", util.inspect(info));

        const result = findOneUser(req.params.username);
        res.json(result);
    } catch(err) {
        console.error(err.stack);
        res.send(`Something went wrong: ${err}`);
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