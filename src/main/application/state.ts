import {Messdiener} from "../../shared/general";
import {getDBConnection} from "./main";

const allMessdiener: Messdiener[] = [];

export const getAllMessdiener = async (): Promise<Messdiener[]> => {
    if (allMessdiener.length !== 0) {
        return allMessdiener;
    }
    return getDBConnection().then(db => db.getAllMessdiener().then(messdiener => {
            messdiener.forEach(m => allMessdiener.push(m));
            return messdiener;
        })
    )
}
export const createMessdiener = (name: string): Promise<number> => {
    return getDBConnection().then(db => db.createMessdiener(name)).then(id => {
        allMessdiener.push({name: name, identifier: id});
        return id;
    })
}
export const removeMessdiener = (id: number): Promise<void> => {
    return getDBConnection().then(db => db.removeMessdiener(id)).then(() => {
        const index = allMessdiener.findIndex(m => m.identifier == id);
        if (index > 0) {
            delete allMessdiener[index];
        }
    })
}
export const changeMessdienerName = (id: number, newName: string): Promise<void> => {
    return getDBConnection().then(db => db.changeMessdienerName(id, newName)). then(() => {
        const index = allMessdiener.findIndex(m => m.identifier == id);
        if (index > 0) {
            allMessdiener[index].name = newName;
        }
    })
}