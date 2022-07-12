import { default as DBG } from "debug";

const debug = DBG("notes:notes-store");
const error = DBG("notes:error-store");

let _NotesStore,
    _UsersStore;

export async function useModel(model) {
    try {
        // const { default: NotesStoreClass } = await import(`./notes-${model}.js`);
        const { NotesStoreClass, UsersStoreClass } = await import(`./notes-${model}.js`);
        debug(NotesStoreClass);
        debug(UsersStoreClass);
        _NotesStore = new NotesStoreClass();
        _UsersStore = new UsersStoreClass();
        // return _NotesStore;
        return {
            notesStore: _NotesStore,
            usersStore: _UsersStore
        }
    } catch(err) {
        throw new Error(`No recognized NotesStore in ${model} because ${err}`);
    }
}

export { _NotesStore as NotesStore, _UsersStore as UsersStore }