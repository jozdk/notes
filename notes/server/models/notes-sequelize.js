import { AbstractNotesStore } from "./Notes.js";
import { Model, DataTypes } from "sequelize";
import {
    connectDB as connectSeqlz,
    close as closeSeqlz
} from "./sequelize.js";
import bcrypt from "bcrypt";
import util from "util";
import { default as DBG } from "debug";

const debug = DBG("notes:notes-sequelize");

let sequelize;

export class SQNote extends Model { }
export class SQUser extends Model { }

async function connectDB() {
    if (sequelize) {
        return;
    }

    try {
        sequelize = await connectSeqlz();

        SQNote.init({
            notekey: {
                type: DataTypes.STRING,
                primaryKey: true,
                unique: true
            },
            title: {
                type: DataTypes.STRING,
            },
            body: {
                type: DataTypes.TEXT
            }
        }, {
            sequelize,
            modelName: "SQNote"
        });

        await SQNote.sync();
        debug(`The table SQNote was created (if it not already existed)`);

        SQUser.init({
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            username: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false
            }
        }, {
            sequelize,
            modelName: "SQUser"
        });

        await SQUser.sync();
        debug("Table SQUser was created (if it not already existed)");

    } catch (err) {
        console.error(err);
    }

}

class SequelizeNotesStore extends AbstractNotesStore {
    async close() {
        closeSeqlz();
        sequelize = undefined;
    }

    async create(key, title, body) {
        await connectDB();
        const sqnote = await SQNote.create({
            notekey: key,
            title: title,
            body: body
        });
        // const note = sqnote.get();
        const note = { key: sqnote.notekey, title: sqnote.title, body: sqnote.body }
        this.emitCreated(note);
        return note;
    }

    async read(key) {
        await connectDB();
        const note = await SQNote.findOne({ where: { notekey: key } });
        if (!note) {
            throw new Error(`No note found for ${key}`);
        } else {
            // return new Note(note.notekey, note.title, note.body);
            return { key: note.notekey, title: note.title, body: note.body, createdAt: note.createdAt, updatedAt: note.updatedAt };
        }
    }

    async update(key, title, body) {
        await connectDB();
        const note = await SQNote.findOne({ where: { notekey: key } });
        if (!note) {
            throw new Error(`No note found for ${key}`);
        } else {
            await SQNote.update({
                title: title,
                body: body
            }, {
                where: { notekey: key }
            });
            const note = await this.read(key);
            this.emitUpdated(note);
            return note;
        }
    }

    async destroy(key) {
        await connectDB();
        await SQNote.destroy({ where: { notekey: key } });
        debug(`DESTROY ${key}`);
        this.emitDestroyed(key);
    }

    async keylist() {
        await connectDB();
        const notes = await SQNote.findAll({ attributes: ["notekey"] });
        // debug(`keylist: ${util.inspect(notes)}`);
        const notekeys = notes.map((note) => note.notekey);
        return notekeys;
    }

    async count() {
        await connectDB();
        const count = await SQNote.count();
        return count;
    }
}

class SequelizeUsersStore {
    async close() {
        closeSeqlz();
        sequelize = undefined;
    }

    async create(username, password) {
        await connectDB();
        const squser = await SQUser.create({
            username: username,
            password: password
        });
        return {
            id: squser.id,
            username: squser.username,
            createdAt: squser.createdAt,
            updatedAt: squser.updatedAt
        };
    }

    async read(username) {
        await connectDB();
        const squser = await SQUser.findOne({ where: { username: username } });
        if (!squser) {
            throw new Error(`No user found for ${username}`);
        } else {
            return {
                id: squser.id,
                username: squser.username,
                createdAt: squser.createdAt,
                updatedAt: squser.updatedAt
            };
        }
    }

    async update(username, password) {
        await connectDB();
        const squser = await SQUser.findOne({ where: { username: username } });
        if (!squser) {
            throw new Error(`No user found for ${username}`);
        } else {
            await SQUser.update({ password: password }, { where: { username: username } });
            const user = await this.read(username);
            return user;
        }
    }

    async destroy(username) {
        await connectDB();
        await SQUser.destroy({ where: { username: username } });
    }

    async list() {
        await connectDB();
        const usersList = await SQUser.findAll({ attributes: ["id", "username", "createdAt", "updatedAt"] });
        return usersList.map((user) => {
            return {
                id: user.id,
                username: user.username,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            };
        });
    }

    async checkPassword(username, password) {
        await connectDB();
        const squser = await SQUser.findOne({ where: { username: username } });
        debug(squser);
        let checked;
        if (!squser) {
            checked = {
                check: false,
                username,
                message: "User not found"
            };
        } else {
            let pwcheck = false;

            if (squser.username === username) {
                pwcheck = await bcrypt.compare(password, squser.password);
            }

            if (pwcheck) {
                checked = {
                    check: true,
                    username: squser.username
                };
            } else {
                checked = {
                    check: false,
                    username,
                    message: "Incorrect username or password"
                };
            }
        }
        return checked;
    }
}

export {
    SequelizeNotesStore as NotesStoreClass,
    SequelizeUsersStore as UsersStoreClass
}