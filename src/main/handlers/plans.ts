import IpcMainEvent = Electron.IpcMainEvent;
import {bakePDF} from "../application/pdf-export";
import {ExportSettings} from "../../shared/general";
import {getExportSettings} from "../application/settings-cache";
import {shell} from "electron";

export const exportPlanHandler = (event: IpcMainEvent, settings: ExportSettings): Promise<void> => {
    return new Promise<void>(resolve => {
        bakePDF(settings).then(path => {
            shell.showItemInFolder(path);
            event.sender.send("pdf-compiled");
            resolve()
        });
    })
}

export const recentExportSettingsHandler = (): Promise<ExportSettings | undefined> => {
    return getExportSettings();
}
