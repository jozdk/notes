import Database from "better-sqlite3";
import util from "util";

export const db = new Database("users", { verbose: console.log });

db.prepare(`CREATE TABLE IF NOT EXISTS users (
    username TEXT UNIQUE,
    password TEXT,
    provider TEXT,
    familyName TEXT,
    givenName TEXT,
    middleName TEXT,
    emails TEXT,
    photos TEXT
    )`).run();

export function toDB(req) {
    return {
        username: req.body.username,
        password: req.body.password,
        provider: req.body.provider,
        familyName: req.body.familyName,
        givenName: req.body.givenName,
        middleName: req.body.middleName,
        emails: JSON.stringify(req.body.emails),
        photos: JSON.stringify(req.body.photos)
    };
}

export function fromDB(user) {
    // Does not return password
    const ret = {
        id: user.username,
        username: user.username,
        provider: user.provider,
        familyName: user.familyName,
        givenName: user.givenName,
        middleName: user.middleName,
    };

    try {
        ret.emails = JSON.parse(user.emails);
    } catch (err) {
        console.log("Error parsing emails", err);
        ret.emails = [];
    }
    try {
        ret.photos = JSON.parse(user.photos);
    } catch (err) {
        console.log("Error parsing photos", err);
        ret.photos = [];
    }

    return ret;
}

export function findOneUser(username) {
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    return user ? fromDB(user) : undefined;
}

export function createUser(req) {
    const user = toDB(req);
    console.log(`Create user ${util.inspect(user)}`);
    db.prepare(`INSERT INTO users VALUES (
        $username,
        $password,
        $provider,
        $familyName,
        $givenName,
        $middleName,
        $emails,
        $photos
    )`).run(user);
    return findOneUser(req.body.username);
}