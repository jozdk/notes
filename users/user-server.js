import "dotenv/config";
import express from "express";
import basicAuth from "express-basic-auth";
import * as util from "util";
import {
    db, toDB, fromDB, findOneUser, createUser
} from "./users-bettersqlite3.js";

import DBG from "debug";

const log = DBG("users:service");
const error = DBG("users:error");

// Set up REST server

const app = express();

// app.use(basicAuth({ authorizer: checkAuth }));
app.use(basicAuth({
    users: {
        [process.env.API_USER]: process.env.API_KEY
    }
}));
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
        error(`/create-user ${err.stack}`);
        res.status(500).send(`Something went wrong: ${err.message}`);
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
        error(`/find-or-create ${err.stack}`);
        res.status(500).send(`Something went wrong: ${err.message}`);
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
        error(`/find/${req.params.username} ${err.stack}`);
        res.status(500).send(`Something went wrong: ${err.message}`);
    }
});

app.get("/list", (req, res, next) => {
    try {
        let userlist = db.prepare("SELECT * FROM users").all().map((user) => fromDB(user));
        log(`userlist: ${util.inspect(userlist)}`);
        if (!userlist) {
            userlist = [];
        }
        res.json(userlist);
    } catch (err) {
        error(`/list ${err.stack}`);
        res.status(500).send(`Something went wrong: ${err.message}`);
    }
});

app.post("/update-user/:username", (req, res, next) => {
    try {
        const user = toDB(req);

        db.prepare(`UPDATE users SET
            username = $username,
            password = $password,
            provider = $provider,
            familyName = $familyName,
            givenName = $givenName,
            middleName = $middleName,
            emails = $emails,
            photos = $photos 
            WHERE username = ?`).run(user, req.params.username);

        const result = findOneUser(req.params.username);
        res.json(result);
    } catch(err) {
        error(`/update-user/${req.params.username} ${err.stack}`);
        res.status(500).send(`Something went wrong: ${err.message}`);
    }
});

app.delete("/destroy/:username", (req, res, next) => {
    try {
        const user = db.prepare("SELECT * FROM users WHERE username = ?").get(req.params.username);
        if (!user) {
            res.status(404).send(new Error(`${req.params.username} not found for deletion`));
        } else {
            db.prepare("DELETE FROM users WHERE username = ?").run(req.params.username);
            res.json({});
        }
    } catch(err) {
        error(`/destroy/${req.params.username} ${err.stack}`);
        res.status(500).send(`Something went wrong: ${err.message}`);
    }
})

app.post("/password-check", (req, res, next) => {
    try {
        const user = db.prepare("SELECT * FROM users WHERE username = ?").get(req.body.username);
        let checked;
        if (!user) {
            checked = {
                check: false,
                username: req.body.username,
                message: "User not found"
            };
        } else if (user.username === req.body.username && user.password === req.body.password) {
            checked = {
                check: true,
                username: user.username
            };
        } else {
            checked = {
                check: false,
                username: req.body.username,
                message: "Incorrect password"
            };
        }
        res.json(checked);
    } catch(err) {
        error(`/password-check ${err.stack}`);
        res.status(500).send(`Something went wrong: ${err.message}`);
    }
})

// HTTP Basic Auth Check

// const apiKeys = [
//     { user: process.env.API_USER, key: process.env.API_KEY }
// ]

// function checkAuth(authid, authcode) {
//     let found = false;

//     apiKeys.forEach((auth) => {
//         const idMatches = basicAuth.safeCompare(authid, auth.user);
//         const passwordMatches = basicAuth.safeCompare(authcode, auth.key);
//         if (idMatches & passwordMatches) {
//             found = true;
//         }
//     });

//     return found;
// }