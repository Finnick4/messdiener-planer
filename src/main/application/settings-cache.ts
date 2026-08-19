import {ExportSettings} from "../../shared/general";
import {readExportSettings, writeExportSettings} from "../infrastructure/settings";
import {getWorkingDirectoryPath} from "./main";

let exportSettings: ExportSettings | undefined = undefined;

export const saveExportSettings = async (settings: ExportSettings): Promise<void> => {
    exportSettings = settings;
    return writeExportSettings(settings, await getWorkingDirectoryPath());
}

export const getExportSettings = (): Promise<ExportSettings | undefined> => {
    return new Promise<ExportSettings | undefined>(resolve => {
        if (exportSettings) {
            resolve(structuredClone(exportSettings));
            return;
        }
        getWorkingDirectoryPath().then(path => {
            readExportSettings(path).then(settings => {
                exportSettings = settings;
                resolve(structuredClone(settings));
                return;
            });
        });
    });
}
