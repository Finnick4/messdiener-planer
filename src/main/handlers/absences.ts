import {Absence} from "../../shared/general";
import {
    addMessdienerToAbsence,
    areValidMessdienerIDs, changeAbsenceEndDate, changeAbsenceStartDate,
    createAbsence, deleteAbsence,
    getAllAbsences, removeChurch, removeMessdienerFromAbsence,
} from "../application/state";
import {pingAbsencesUpdate, pingChurchesUpdate, pingMassesUpdate} from "./ping-manager";
import IpcMainEvent = Electron.IpcMainEvent;

export const getAllAbsencesHandler = (): Promise<Absence[]> => {
    return getAllAbsences()
}
export const createAbsenceHandler = (_event: IpcMainEvent, startDate: number, endDate: number, affectedMessdiener: number[]): Promise<number> => {
    return new Promise<number>((resolve, reject) => {
        if (startDate <= 0 || endDate <= 0 || affectedMessdiener.length == 0) {
            console.log("[HANDLER] (createAbsenceHandler) Parameter issue!");
            reject(-1);
            return;
        }
        areValidMessdienerIDs(affectedMessdiener).then(validIDs => {
            if (!validIDs) {
                console.log("[HANDLER] (createAbsenceHandler) Invalid ids!");
                reject(-1);
                return;
            }

            createAbsence(startDate, endDate, affectedMessdiener).then((id: number) => {
                pingAbsencesUpdate();
                pingMassesUpdate();
                resolve(id);
            });
        });
    })
}

export const editAbsencesHandler = (_event: IpcMainEvent, absence: Absence): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        if (absence.id <= 0) {
            reject();
        }
        const waitGroup: Promise<any>[] = [];
        if (absence.startDate != 0) {
            waitGroup.push(changeAbsenceStartDate(absence.id, absence.startDate));
        }
        if (absence.endDate != 0) {
            waitGroup.push(changeAbsenceEndDate(absence.id, absence.endDate));
        }
        Promise.all(waitGroup).then(() => {
            pingAbsencesUpdate();
            resolve();
        })
    })
}

export const editAbsenceAffectionsHandler = (_event: IpcMainEvent, absenceID: number, addMessdiener: number[], removeMessdiener: number[]): Promise<void> => {
    return areValidMessdienerIDs([...addMessdiener, ...removeMessdiener]).then(valid => {
        if (!valid || absenceID <= 0) {
            return
        }

        return Promise.all([
            addMessdienerToAbsence(absenceID, addMessdiener),
            removeMessdienerFromAbsence(absenceID, removeMessdiener),
        ]).then(() => {
            pingAbsencesUpdate();
            pingMassesUpdate();
        });
    });
}

export const deleteAbsenceHandler = (_event: IpcMainEvent, id: number): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        if (id <= 0) {
            console.log("[HANDLER] (deleteAbsenceHandler) Parameter issue: id is <= 0>!");
            reject();
            return;
        }
        deleteAbsence(id).then(() => {
            pingAbsencesUpdate();
            resolve();
        });
    })
}