import DBG from "debug";

const debug = DBG("notes:users-store");

let _UsersStore;

export async function useModel(model) {
    try {
        const { default: UsersStoreClass } = await import(`./users-${model}.js`);
        debug(UsersStoreClass);
        _UsersStore = new UsersStoreClass();
        return _UsersStore;
    } catch(err) {
        throw new Error(`No recognized UsersStore in ${model} because ${err}`);
    }
}

export { _UsersStore as UsersStore }