import IpcMainEvent = Electron.IpcMainEvent;
import {texExport} from "../application/pdf-export";
import {ExportSettings} from "../../shared/general";

export const exportPlanHandler = (_event: IpcMainEvent, settings: ExportSettings): Promise<void> => {
    return new Promise<void>(resolve => {
        texExport(settings).then(() => resolve());
    })
}