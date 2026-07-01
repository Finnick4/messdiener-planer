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

export const createMessdiener = (name: string, family: Family | number): Promise<number> => {
    let creationPromise: Promise<number>;

    if (typeof family == "number") {
        creationPromise = getDBConnection().then(db => db.createMessdienerInFamily(name, family));
    } else {
        creationPromise = getDBConnection().then(db => db.createMessdienerAndFamily(name, family.lastNameDisplay, family.lastNameInternal, family.shorthand));
    }
    return new Promise<number>((resolve, reject) => {
        creationPromise.then(id => {
            allMessdiener = [];
            allFamilies = [];
            resolve(id);
        })
        creationPromise.catch(reason => {
            console.error("[STATE] (createMessdiener) Failed to create Messdiener!");
            console.error(reason);
            reject(reason);
        })
    })
}
export const removeMessdiener = (id: number): Promise<void> => {
    return getDBConnection().then(db => db.removeMessdiener(id)).then(() => {
        allMessdiener = allMessdiener.filter(m => m.identifier != id);
    })
}
export const changeMessdienerName = (id: number, newName: string): Promise<void> => {
    return getDBConnection().then(db => db.changeMessdienerName(id, newName)).then(() => {
        const index = allMessdiener.findIndex(m => m.identifier == id);
        if (index >= 0) {
            allMessdiener[index].firstName = newName;
        }
    })
}
export const changeMessdienerFamilyAssociation = (id: number, family: Family | number): Promise<void> => {
    let editPromise: Promise<void>;

    if (typeof family == "number") {
        editPromise = getDBConnection().then(db => db.changeMessdienerFamilyAssociation(id, family));
    } else {
        editPromise = getDBConnection().then(db => db.changeMessdienerFamilyAssociationNewFamily(id, family.lastNameDisplay, family.lastNameInternal, family.shorthand));
    }
    return new Promise<void>((resolve, reject) => {
        editPromise.then(() => {
            allMessdiener = [];
            allFamilies = [];
            resolve();
        })
        editPromise.catch(reason => {
            console.error("[STATE] (changeMessdienerFamilyAssociation) Failed to edit Messdiener!");
            console.error(reason);
            reject(reason);
        })
    })
}