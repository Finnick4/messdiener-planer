import IpcMainEvent = Electron.IpcMainEvent;
import {texExport} from "../application/pdf-export";

export const exportPlanHandler = (_event: IpcMainEvent): Promise<void> => {
    return new Promise<void>(resolve => {
        texExport().then(() => resolve());
    })
}