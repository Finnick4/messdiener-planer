import {Messdiener} from "../../shared/general";
import {getDBConnection} from "./main";

let allMessdiener: Messdiener[] = [];

export const getAllMessdiener = async (): Promise<Messdiener[]> => {
    if (allMessdiener.length !== 0) {
        return allMessdiener;
    }
    return getDBConnection().then(db => db.getAllMessdiener().then(messdiener => {
            allMessdiener = messdiener;
            return messdiener;
        })
    )
}
export const createMessdiener = (name: string): Promise<number> => {
    return getDBConnection().then(db => db.createMessdiener(name))
        .then(id => {
            allMessdiener.push({identifier: id, name: name});
            return id;
        })
        .catch(reason => {
            console.error("[STATE] (createMessdiener) Failed to create Messdiener!");
            console.error(reason);
            return -1;
        })
}
export const removeMessdiener = (id: number): Promise<void> => {
    return getDBConnection().then(db => db.removeMessdiener(id)).then(() => {
        allMessdiener = allMessdiener.filter(m => m.identifier != id);
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