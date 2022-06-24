import EventEmitter from "events";

const _note_key = Symbol("key");
const _note_title = Symbol("title");
const _note_body = Symbol("body");
const _created_at = Symbol("createdAt");
const _updated_at = Symbol("updatedAt");

export class Note {
    constructor(key, title, body, createdAt, updatedAt) {
        this[_note_key] = key;
        this[_note_title] = title;
        this[_note_body] = body;
        this[_created_at] = createdAt;
        this[_updated_at] = updatedAt;
    }

    get key() {
        return this[_note_key];
    }
    get title() {
        return this[_note_title];
    }
    set title(newTitle) {
        this[_note_title] = newTitle;
    }
    get body() {
        return this[_note_body];
    }
    set body(newBody) {
        this[_note_body] = newBody;
    }

    get createdAt() {
        return this[_created_at];
    }

    get updatedAt() {
        return this[_updated_at];
    }

    set updatedAt(newDate) {
        this[_updated_at] = newDate;
    }

    toJSON() {
        return JSON.stringify({
            key: this.key,
            title: this.title,
            body: this.body,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        });
    }

    static fromJSON(json) {
        const data = JSON.parse(json);

        if (typeof data !== "object"
            || !data.hasOwnProperty("key")
            || typeof data.key !== "string"
            || !data.hasOwnProperty("title")
            || typeof data.title !== "string"
            || !data.hasOwnProperty("body")
            || typeof data.body !== "string"
            || !data.hasOwnProperty("createdAt")
            || typeof data.createdAt !== "string"
            || !data.hasOwnProperty("updatedAt")
            || typeof data.updatedAt !== "string"
        ) {
            throw new Error(`Not a Note: ${json}`);
        }

        const note = new Note(data.key, data.title, data.body, data.createdAt, data.updatedAt);
        return note;
    }

}

export class AbstractNotesStore extends EventEmitter {
    emitCreated(note) {
        this.emit("notecreated", note);
    }

    emitUpdated(note) {
        this.emit("noteupdated", note);
    }

    emitDestroyed(key) {
        this.emit("notedestroyed", key);
    }
}