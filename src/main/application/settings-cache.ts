import {ExportSettings} from "../../shared/general";
import {readExportSettings, writeExportSettings} from "../infrastructure/settings";

let exportSettings: ExportSettings | undefined = undefined;

export const saveExportSettings = (settings: ExportSettings): Promise<void> => {
    exportSettings = settings;
    return writeExportSettings(settings);
}

export const getExportSettings = (): Promise<ExportSettings | undefined> => {
    return new Promise<ExportSettings | undefined>(resolve => {
        if (exportSettings) {
            resolve(structuredClone(exportSettings));
            return;
        }
        readExportSettings().then(settings => {
            exportSettings = settings;
            resolve(structuredClone(settings));
            return;
        })
    })
}
