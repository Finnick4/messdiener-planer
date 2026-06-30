import {Family, Messdiener} from "../../shared/general";
import {getDBConnection} from "./main";

let allMessdiener: Messdiener[] = [];
let allFamilies: Family[] = [];

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

export const getAllFamilies = async (): Promise<Family[]> => {
    if (allFamilies.length !== 0) {
        return allFamilies;
    }
    return getDBConnection().then(db => db.getAllFamilies().then(families => {
            allFamilies = families;
            return families;
        })
    )
}

export const createMessdiener = (name: string): Promise<number> => {
    const familyName = "New Family!";
    return getDBConnection().then(db => db.createMessdienerAndFamily(name, familyName))
        .then(id => {
            allMessdiener = [];
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
        if (index >= 0) {
            allMessdiener[index].firstName = newName;
        }
    })
}