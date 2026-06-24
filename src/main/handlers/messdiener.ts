import {Messdiener} from "../../shared/general";
import {createMessdiener, getAllMessdiener, removeMessdiener} from "../application/state";
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

const pingMessdienerUpdate = () => {
    getAllMessdiener().then(messdiener => pingManager.onMessdienerUpdate(messdiener));
}