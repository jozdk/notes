import { default as superagent } from "superagent";
import DBG from "debug";

const debug = DBG("notes:users-superagent");
const error = DBG("notes:error-superagent");

function reqURL(path) {
    const requrl = new URL(process.env.USER_SERVICE_URL);
    requrl.pathname = path;
    debug("URL: ", requrl.toString());
    return requrl.toString();
}

export async function create(username, password, provider, familyName, givenName, middleName, emails, photos) {
    const res = await superagent
        .post(reqURL("/create-user"))
        .send({
            username, password, provider, familyName,
            givenName, middleName, emails, photos
        })
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .auth(process.env.API_USER, process.env.API_KEY);
    return res.body;
}

export async function update(username, password, provider, familyName, givenName, middleName, emails, photos) {
    const res = await superagent
        .post(reqURL(`/update-user/${username}`))
        .send({
            username, password, provider, familyName,
            givenName, middleName, emails, photos
        })
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .auth(process.env.API_USER, process.env.API_KEY);
    return res.body;
}

export async function find(username) {
    const res = await superagent
        .get(reqURL(`/find/${username}`))
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .auth(process.env.API_USER, process.env.API_KEY);
    return res.body;
}

export async function checkUserPassword(username, password) {
    const res = await superagent
        .post(reqURL("/password-check"))
        .send({ username, password })
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .auth(process.env.API_USER, process.env.API_KEY);
    return res.body;
}

export async function findOrCreate(profile) {
    const res = await superagent
        .post(reqURL("/find-or-create"))
        .send({
            username: profile.id,
            password: profile.password,
            provider: profile.provider,
            familyName: profile.familyName,
            givenName: profile.givenName,
            middleName: profile.middleName,
            emails: profile.emails,
            photos: profile.photos
        })
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .auth(process.env.API_USER, process.env.API_KEY);
    return res.body;
}

export async function listUsers() {
    const res = await superagent
        .get(reqURL("/list"))
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .auth(process.env.API_USER, process.env.API_KEY);
    return res.body;
}