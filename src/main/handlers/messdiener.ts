import {Family, Messdiener, MessdienerChurchActivityStatus} from "../../shared/general";
import {
    areValidMessdienerIDs, changeMessdienerChurchActivity,
    changeMessdienerFamilyAssociation,
    changeMessdienerName,
    createMessdiener,
    getAllMessdiener,
    removeMessdiener
} from "../application/state";
import IpcMainEvent = Electron.IpcMainEvent;
import {pingMessdienerUpdate, pingFamiliesUpdate} from "./ping-manager";

export const getAllMessdienerHandler = (): Promise<Messdiener[]> => {
    return getAllMessdiener()
}
export const createMessdienerHandler = (_event: IpcMainEvent, name: string, family: Family | number, churchActivity?: number[]): Promise<number> => {
    return new Promise<number>((resolve, reject) => {
        if (name == "" || name == undefined) {
            console.log("[HANDLER] (createMessdiener) Parameter issue: name is empty!");
            reject(-1);
            return;
        }
        if (family == undefined || (typeof family == "number" && family <= 0)) {
            console.log("[HANDLER] (createMessdiener) Parameter issue: family is invalid!");
            console.log(family)
            reject(-1);
            return
        }
        let validChurchIDs = true;
        churchActivity?.forEach(cID => {
            if (cID <= 0) {
                validChurchIDs = false;
            }
        })
        if (!validChurchIDs) {
            return;
        }


        createMessdiener(name, family).then((id: number) => {
            pingMessdienerUpdate();
            pingFamiliesUpdate();
            resolve(id);

            if (churchActivity == undefined) {
                return;
            }
            const activities: MessdienerChurchActivityStatus[] = churchActivity.map(churchID => {
                return {
                    messdienerID: id,
                    churchID: churchID,
                    isActive: true
                }
            })
            changeMessdienerChurchActivity(activities).then(() => {
                pingMessdienerUpdate();
                pingFamiliesUpdate();
            });
        });
    })
}
export const removeMessdienerHandler = (_event: IpcMainEvent, id: number): Promise<void> => {
    return new Promise<void>(resolve => {
        removeMessdiener(id).then(() => {
            pingMessdienerUpdate();
            resolve();
        });
    })
}

export const editMessdienerHandler = (_event: IpcMainEvent, messdiener: Messdiener): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        if (messdiener.identifier <= 0) {
            reject();
        }
        const waitGroup: Promise<any>[] = [];
        if (messdiener.firstName != "") {
            waitGroup.push(changeMessdienerName(messdiener.identifier, messdiener.firstName));
        }
        if (messdiener.lastNameDisplay != "") {
            waitGroup.push(changeMessdienerFamilyAssociation(messdiener.identifier, {
                lastNameDisplay: messdiener.lastNameDisplay,
                lastNameInternal: messdiener.lastNameInternal,
                shorthand: messdiener.lastNameShorthand,
                id: 0,
                memberSize: 1
            }));
        }

        if (messdiener.familyID != 0) {
            waitGroup.push(changeMessdienerFamilyAssociation(messdiener.identifier, messdiener.familyID));
        }
        Promise.all(waitGroup).then(() => {
            pingMessdienerUpdate();
            if (messdiener.familyID != 0 || messdiener.lastNameDisplay != "") {
                pingFamiliesUpdate()
            }
            resolve();
        })
    })
}
export const changeMessdienerChurchActivityHandler = (_event: IpcMainEvent, activities: MessdienerChurchActivityStatus[]): Promise<void> => {
    return areValidMessdienerIDs(activities.map(a => a.messdienerID)).then(resp => {
        if (!resp) {
            return;
        }
        let validChurchIDs = true;
        activities.forEach(a => {
            if (a.churchID <= 0) {
                validChurchIDs = false;
            }
        })
        if (!validChurchIDs) {
            return;
        }
        return changeMessdienerChurchActivity(activities).then(() => pingMessdienerUpdate());
    })
}


