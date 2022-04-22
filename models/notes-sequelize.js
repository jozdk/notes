import { Note, AbstractNotesStore } from "./Notes.js";
import { Model, DataTypes } from "sequelize";
import {
    connectDB as connectSeqlz,
    close as closeSeqlz
} from "./sequelize.js";
import util from "util";
import { default as DBG } from "debug";

const debug = DBG("notes:notes-sequelize");

let sequelize;

export class SQNote extends Model { }

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
    } catch (err) {
        console.error(err);
    }

}

export default class SequelizeNotesStore extends AbstractNotesStore {
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
        return new Note(sqnote.notekey, sqnote.title, sqnote.body);
    }

    async read(key) {
        await connectDB();
        const note = await SQNote.findOne({ where: { notekey: key } });
        if (!note) {
            throw new Error(`No note found for ${key}`);
        } else {
            return new Note(note.notekey, note.title, note.body);
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
            return this.read(key);
        }
    }

    async destroy(key) {
        await connectDB();
        await SQNote.destroy({ where: { notekey: key } });
        debug(`DESTROY ${key}`);
    }

    async keylist() {
        await connectDB();
        const notes = await SQNote.findAll({ attributes: ["notekey"] });
        debug(`keylist: ${util.inspect(notes[0].notekey)}`);
        const notekeys = notes.map((note) => note.notekey);
        return notekeys;
    }

    async count() {
        await connectDB();
        const count = await SQNote.count();
        return count;
    }
}