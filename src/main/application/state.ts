import {
    Church,
    Family,
    Mass,
    Messdiener,
    MessdienerChurchActivityStatus,
    MessdienerMassAllocation
} from "../../shared/general";
import {getDBConnection} from "./main";

let allMessdiener: Messdiener[] = [];
let allFamilies: Family[] = [];
let allChurches: Church[] = [];
let allMasses: Mass[] = [];

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

export const getAllChurches = async (): Promise<Church[]> => {
    if (allChurches.length !== 0) {
        return allChurches;
    }
    return getDBConnection().then(db => db.getAllChurches().then(churches => {
            allChurches = churches;
            return churches;
        })
    )
}

export const getAllMasses = async (): Promise<Mass[]> => {
    if (allMasses.length !== 0) {
        return allMasses;
    }
    return getDBConnection().then(db => db.getAllMasses().then(masses => {
            allMasses = masses;
            return masses;
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

export const createChurch = (name: string, location?: string): Promise<number> => {
    return getDBConnection().then(db => db.createChurch(name, location)).then(id => {
        allChurches = [];
        return id;
    })
}
export const removeChurch = (id: number): Promise<void> => {
    return getDBConnection().then(db => db.removeChurch(id)).then(() => {
        allChurches = allChurches.filter(c => c.id != id);
    })
}
export const changeChurchName = (id: number, newName: string): Promise<void> => {
    return getDBConnection().then(db => db.changeChurchName(id, newName)).then(() => {
        const index = allChurches.findIndex(c => c.id == id);
        if (index >= 0) {
            allChurches[index].name = newName;
        }
    })
}

export const changeChurchLocation = (id: number, newLocation: string): Promise<void> => {
    return getDBConnection().then(db => db.changeChurchName(id, newLocation)).then(() => {
        const index = allChurches.findIndex(c => c.id == id);
        if (index >= 0) {
            allChurches[index].location = newLocation;
        }
    })
}

export const areValidMessdienerIDs = (toCheck: number[]): Promise<boolean> =>{
    return getAllMessdiener().then(messdiener => {
        for (const id of toCheck) {
            if (id <= 0) {
                return false;
            }
            const index = messdiener.findIndex(m => m.identifier == id);
            if (index == -1) {
                return false;
            }
        }
        return true;
    })
}

export const changeMessdienerChurchActivity = async (activities: MessdienerChurchActivityStatus[]): Promise<void> => {
    return getDBConnection().then(db => {
        return Promise.all(activities.map(activity => {
            if (activity.isActive) {
                return db.addMessdienerToChurch(activity.messdienerID, activity.churchID);
            }
            return db.removeMessdienerFromChurch(activity.messdienerID, activity.churchID);
        }))
    }).then(() => {
        for (const activity of activities) {
            const index = allMessdiener.findIndex(m => m.identifier == activity.messdienerID);
            if (index == -1) {
                continue;
            }
            if (activity.isActive) {
                allMessdiener[index].churchActivity.add(activity.churchID);
            } else {
                allMessdiener[index].churchActivity.delete(activity.churchID);
            }
        }
    })
}


export const createMass = (date: number, churchID: number, note?: string): Promise<number> => {
    return getDBConnection().then(db => db.createMass(date, churchID, note)).then(id => {
        allMasses = [];
        return id;
    })
}
export const removeMass = (id: number): Promise<void> => {
    return getDBConnection().then(db => db.removeMass(id)).then(() => {
        allMasses = allMasses.filter(mass => mass.id != id);
    })
}
export const changeMassNote = (id: number, note?: string): Promise<void> => {
    return getDBConnection().then(db => db.changeMassNote(id, note)).then(() => {
        const index = allMasses.findIndex(mass => mass.id == id);
        if (index >= 0) {
            allMasses[index].note = note;
        }
    })
}

export const changeMassDate = (id: number, newDate: number): Promise<void> => {
    return getDBConnection().then(db => db.changeMassDate(id, newDate)).then(() => {
        const index = allMasses.findIndex(mass => mass.id == id);
        if (index >= 0) {
            allMasses[index].date = newDate;
        }
    })
}

export const changeMessdienerMassAllocation = async (activities: MessdienerMassAllocation[]): Promise<void> => {
    return getDBConnection().then(db => {
        return Promise.all(activities.map(activity => {
            if (activity.isActive) {
                return db.addMessdienerToMass(activity.messdienerID, activity.massID);
            }
            return db.removeMessdienerFromMass(activity.messdienerID, activity.massID);
        }))
    }).then(() => {
        allMasses = [];
    })
}
