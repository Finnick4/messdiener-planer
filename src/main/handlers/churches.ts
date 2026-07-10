import {Church} from "../../shared/general";
import {
    changeChurchLocation,
    changeChurchName,
    createChurch,
    getAllChurches,
    removeChurch
} from "../application/state";
import IpcMainEvent = Electron.IpcMainEvent;
import {pingChurchesUpdate} from "./ping-manager";

export const getAllChurchesHandler = (): Promise<Church[]> => {
    return getAllChurches()
}
export const createChurchHandler = (_event: IpcMainEvent, name: string, location?: string): Promise<number> => {
    return new Promise<number>((resolve, reject) => {
        if (name == "" || name == undefined) {
            console.log("[HANDLER] (createChurchHandler) Parameter issue: name is empty!");
            reject(-1);
            return;
        }

        createChurch(name, location).then((id: number) => {
            pingChurchesUpdate();
            resolve(id);
        });
    })
}
export const removeChurchHandler = (_event: IpcMainEvent, id: number): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        if (id <= 0) {
            console.log("[HANDLER] (removeChurchHandler) Parameter issue: id is <= 0>!");
            reject();
            return;
        }
        removeChurch(id).then(() => {
            pingChurchesUpdate();
            resolve();
        });
    })
}

export const editChurchHandler = (_event: IpcMainEvent, church: Church): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        if (church.id <= 0) {
            reject();
        }
        const waitGroup: Promise<any>[] = [];
        if (church.name != "") {
            waitGroup.push(changeChurchName(church.id, church.name));
        }
        if (church.location != undefined) {
            waitGroup.push(changeChurchLocation(church.id, church.location));
        }
        Promise.all(waitGroup).then(() => {
            pingChurchesUpdate();
            resolve();
        })
    })
}

