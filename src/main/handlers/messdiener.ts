import {Messdiener} from "../../shared/general";
import {createMessdiener, getAllMessdiener, removeMessdiener} from "../application/state";
import IpcMainEvent = Electron.IpcMainEvent;

export const getAllMessdienerHandler = (): Promise<Messdiener[]> => {
    return getAllMessdiener()
}
export const createMessdienerHandler = async (_event: IpcMainEvent, name: string): Promise<number> => {
    if (name == "" || name == undefined) {
        console.log("[HANDLER] (createMessdiener) Parameter issue: name is empty!");
        return -1;
    }
    return createMessdiener(name);
}
export const removeMessdienerHandler = async (_event: IpcMainEvent, id: number): Promise<void> => {
    return removeMessdiener(id);
}