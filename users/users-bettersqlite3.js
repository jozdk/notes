import Database from "better-sqlite3";
import util from "util";

const db = new Database("users", { verbose: console.log });
db.prepare(`CREATE TABLE IF NOT EXISTS users (
    username VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    provider VARCHAR(255),
    familyName VARCHAR(255),
    givenName VARCHAR(255),
    middleName VARCHAR(255),
    emails VARCHAR(255),
    photos VARCHAR(255)
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
    return user;
}

export function createUser(req) {
    const user = userParams(req);
    console.log(`Create user ${util.inspect(user)}`);
    db.prepare("INSERT INTO users ")
    // Binding Parameters
}