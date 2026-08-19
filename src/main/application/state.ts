import {
    Absence,
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
let allAbsences: Absence[] = [];

export const getAllMessdiener = async (): Promise<Messdiener[]> => {
    if (allMessdiener.length !== 0) {
        return structuredClone(allMessdiener);
    }
    return getDBConnection().then(db => db.getAllMessdiener().then(messdiener => {
            allMessdiener = messdiener;
            return structuredClone(messdiener);
        })
    )
}

export const getAllFamilies = async (): Promise<Family[]> => {
    if (allFamilies.length !== 0) {
        return structuredClone(allFamilies);
    }
    return getDBConnection().then(db => db.getAllFamilies().then(families => {
            allFamilies = families;
            return structuredClone(families);
        })
    )
}

export const getAllChurches = async (): Promise<Church[]> => {
    if (allChurches.length !== 0) {
        return structuredClone(allChurches);
    }
    return getDBConnection().then(db => db.getAllChurches().then(churches => {
            allChurches = churches;
            return structuredClone(churches);
        })
    )
}

export const getAllMasses = async (): Promise<Mass[]> => {
    if (allMasses.length !== 0) {
        return structuredClone(allMasses);
    }
    return getDBConnection().then(db => db.getAllMasses().then(masses => {
            allMasses = masses;
            return structuredClone(masses);
        })
    )
}

export const getAllAbsences = async (): Promise<Absence[]> => {
    if (allAbsences.length !== 0) {
        return structuredClone(allAbsences);
    }
    return getDBConnection().then(db => db.getAllAbsences().then(absences => {
            allAbsences = absences;
            return structuredClone(absences);
        })
    );
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
                return checkIfMessdienerCanBeAllocatedToMass(activity.messdienerID, activity.massID).then(canBeAllocated => {
                    if (!canBeAllocated) {
                        return
                    }
                    db.addMessdienerToMass(activity.messdienerID, activity.massID)
                })
            }
            return db.removeMessdienerFromMass(activity.messdienerID, activity.massID);
        }))
    }).then(() => {
        allMasses = [];
    })
}

export const createAbsence = (startDate: number, endDate: number, affectedMessdiener: number[]): Promise<number> => {
    return getDBConnection().then(db => db.createAbsence(startDate, endDate, affectedMessdiener)).then(id => {
        allAbsences.push({
            affectedMessdiener: new Set<number>(affectedMessdiener),
            endDate: endDate,
            startDate: startDate,
            id: id
        });

        for (const mass of allMasses) {
            if (mass.date < startDate) {
                continue;
            }
            if (mass.date > endDate) {
                break;
            }
            affectedMessdiener.forEach(mID => mass.allocatedMessdiener.delete(mID));
        }
        return id;
    })
}

export const changeAbsenceStartDate = (id: number, newStart: number): Promise<void> => {
    return getDBConnection().then(db => db.changeAbsenceStartDate(id, newStart)).then(() => {
        const index = allAbsences.findIndex(absence => absence.id == id);
        if (index >= 0) {
            allAbsences[index].startDate = newStart;
        }
    })
}

export const changeAbsenceEndDate = (id: number, newEnd: number): Promise<void> => {
    return getDBConnection().then(db => db.changeAbsenceEndDate(id, newEnd)).then(() => {
        const index = allAbsences.findIndex(absence => absence.id == id);
        if (index >= 0) {
            allAbsences[index].endDate = newEnd;
        }
    })
}

export const addMessdienerToAbsence = (absenceID: number, messdiener: number[]): Promise<void> => {
    return getDBConnection()
        .then(db => Promise.all(messdiener.map(mID => db.addMessdienerToAbsence(absenceID, mID))))
        .then(() => {
            const index = allAbsences.findIndex(absence => absence.id == absenceID);
            if (index < 0) {
                allAbsences = [];
                allMasses = [];
                return;
            }
            messdiener.forEach(mID => allAbsences[index].affectedMessdiener.add(mID))

            const absence = allAbsences[index];

            for (const mass of allMasses) {
                if (mass.date < absence.startDate) {
                    continue;
                }
                if (mass.date > absence.endDate) {
                    break;
                }
                messdiener.forEach(mID => mass.allocatedMessdiener.delete(mID));
            }
        });
}

export const removeMessdienerFromAbsence = (absenceID: number, messdiener: number[]): Promise<void> => {
    return getDBConnection()
        .then(db => Promise.all(messdiener.map(mID => db.removeMessdienerFromAbsence(absenceID, mID))))
        .then(() => {
            const index = allAbsences.findIndex(absence => absence.id == absenceID);
            if (index >= 0) {
                messdiener.forEach(mID => allAbsences[index].affectedMessdiener.delete(mID))
            }
        });
}

export const deleteAbsence = (id: number): Promise<void> => {
    return getDBConnection().then(db => db.deleteAbsence(id)).then(() => {
        allAbsences = allAbsences.filter(a => a.id != id);
    })
}

const checkIfMessdienerCanBeAllocatedToMass = (messdienerID: number, massID: number): Promise<boolean> => {
    return getAllMasses().then(masses => {
        const mass = masses.filter(mass => mass.id == massID)[0];

        if (mass == undefined || mass.allocatedMessdiener.has(messdienerID)) {
            return false;
        }

        return checkIfMessdienerIsNotAbsent(messdienerID, mass.date);
    });
}



const checkIfMessdienerIsNotAbsent = (messdienerID: number, date: number): Promise<boolean> => {
    return getAllAbsences().then(absences => {
        for (const absence of absences) {
            if (!absence.affectedMessdiener.has(messdienerID)) {
                continue;
            }
            if (absence.startDate > date) {
                return true;
            }
            if (absence.startDate <= date && date <= absence.endDate) {
                return false;
            }
        }
        return true;
    });
}
