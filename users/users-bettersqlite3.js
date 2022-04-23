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

export function userParams(req) {
    return {
        username: req.params.username,
        password: req.params.password,
        provider: req.params.provider,
        familyName: req.params.familyName,
        givenName: req.params.givenName,
        middleName: req.params.middleName,
        emails: JSON.stringify(req.params.emails),
        photos: JSON.stringify(req.params.photos)
    };
}

export function findOneUser(username) {
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    
    try {
        user.emails = JSON.parse(user.emails);
    } catch (err) {
        user.emails = [];
    }
    try {
        user.photos = JSON.parse(user.photos);
    } catch (err) {
        user.photos = [];
    }

    return user;
}

export function createUser(req) {
    const user = userParams(req);
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
    return findOneUser(req.params.username);    
}