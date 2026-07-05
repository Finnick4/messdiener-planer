import {Mass} from "../../shared/general";
import {
    changeMassDate,
    changeMassNote,
    createMass, getAllMasses,
    removeMass
} from "../application/state";
import IpcMainEvent = Electron.IpcMainEvent;
import {pingMassesUpdate} from "./ping-manager";

export const getAllMassesHandler = (): Promise<Mass[]> => {
    return getAllMasses();
}
export const createMassHandler = (_event: IpcMainEvent, date: number, churchID: number, note?: string): Promise<number> => {
    return new Promise<number>((resolve, reject) => {
        if (churchID <= 0 || date <= 0) {
            console.log("[HANDLER] (createMassHandler) Parameter issue: churchID or date is invalid!");
            reject(-1);
            return;
        }

        createMass(date, churchID, note).then((id: number) => {
            pingMassesUpdate();
            resolve(id);
        });
    })
}
export const removeMassHandler = (_event: IpcMainEvent, id: number): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        if (id <= 0) {
            console.log("[HANDLER] (removeMassHandler) Parameter issue: id is <= 0>!");
            reject();
            return;
        }
        removeMass(id).then(() => {
            pingMassesUpdate();
            resolve();
        });
    })
}

export const editMassHandler = (_event: IpcMainEvent, mass: Mass): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        if (mass.id <= 0) {
            reject();
        }
        const waitGroup: Promise<any>[] = [];
        if (mass.date > 0) {
            waitGroup.push(changeMassDate(mass.id, mass.date));
        }
        if (mass.note != undefined) {
            waitGroup.push(changeMassNote(mass.id, mass.note));
        }
        Promise.all(waitGroup).then(() => {
            pingMassesUpdate();
            resolve();
        })
    })
}

