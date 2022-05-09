import { Note, AbstractNotesStore } from "./Notes.js";

const notes = [];

export default class InMemoryNotesStore extends AbstractNotesStore {
    async close() {}

    async create(key, title, body) {
        notes[key] = new Note(key, title, body);
        this.emitCreated(notes[key]);
        return notes[key];
    }

    async read(key) {
        if (notes[key]) {
            return notes[key];
        } else {
            throw new Error(`Note ${key} does not exist`);
        }
    }

    async update(key, title, body) {
        notes[key] = new Note(key, title, body);
        this.emitUpdated(notes[key]);
        return notes[key];
    }

    async destroy(key) {
        if (notes[key]) {
            delete notes[key];
            this.emitDestroyed(key);
        } else {
            throw new Error(`Note ${key} does not exist`);
        }
    }

    async keylist() {
        return Object.keys(notes);
    }

    async count() {
        return notes.length;
    }
}