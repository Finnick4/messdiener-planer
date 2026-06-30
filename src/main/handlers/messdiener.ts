import {Messdiener} from "../../shared/general";
import {changeMessdienerName, createMessdiener, getAllMessdiener, removeMessdiener} from "../application/state";
import IpcMainEvent = Electron.IpcMainEvent;
import {pingManager} from "./ping-manager";

export const getAllMessdienerHandler = (): Promise<Messdiener[]> => {
    return getAllMessdiener()
}
export const createMessdienerHandler = (_event: IpcMainEvent, name: string): Promise<number> => {
    return new Promise<number>((resolve, reject) => {
        if (name == "" || name == undefined) {
            console.log("[HANDLER] (createMessdiener) Parameter issue: name is empty!");
            reject(-1);
        }
        createMessdiener(name).then((id: number) => {
            pingMessdienerUpdate();
            resolve(id);
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
        Promise.all(waitGroup).then(() => {
            pingMessdienerUpdate();
            resolve();
        })
    })
}


const pingMessdienerUpdate = () => {
    getAllMessdiener().then(messdiener => pingManager.onMessdienerUpdate(messdiener));
}