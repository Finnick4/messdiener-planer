import {ExportSettings} from "../../shared/general";
import * as fs from "node:fs";

type ExportSettingsStorage = {
    title: string
    version: string
    hint: string
    displayedChurchIDs: number[]
    mainChurchID: number
    otherChurchComment: boolean
    otherChurchCommentUseLocation: boolean
    saveTeXFile: boolean
}

const safeParseJSON = <T>(str: string): T | undefined => {
    try {
        const obj: T = JSON.parse(str);
        return obj;
    } catch {
        return undefined;
    }
}

export const readExportSettings = (directory: string | undefined): Promise<ExportSettings | undefined> => {
    return new Promise<ExportSettings | undefined>((resolve, reject) => {
        const path = directory ? `${directory}/exportSettings.json` : "exportSettings.json";

        fs.readFile(path, (err, result) => {
            if (err) {
                if (err.code == "ENOENT") {
                    console.log("Did not find any saved export settings!");
                    resolve(undefined);
                    return;
                }
                console.error("Error while reading export settings:")
                console.error(err.message);
                reject(err);
                return;
            }
            const settings = safeParseJSON<ExportSettingsStorage>(result.toString());
            if (!settings) {
                resolve(undefined);
                return;
            }
            const converted: ExportSettings = {
                mainChurchID: settings.mainChurchID,
                otherChurchComment: settings.otherChurchComment,
                otherChurchCommentUseLocation: settings.otherChurchCommentUseLocation,
                saveTeXFile: settings.saveTeXFile,
                title: settings.title,
                version: settings.version,
                hint: settings.hint,
                displayedChurchIDs: new Set<number>(settings.displayedChurchIDs)
            };
            resolve(converted);
        })
    })
}

export const writeExportSettings = (settings: ExportSettings, directory: string | undefined): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        const converted: ExportSettingsStorage = {
            mainChurchID: settings.mainChurchID,
            otherChurchComment: settings.otherChurchComment,
            otherChurchCommentUseLocation: settings.otherChurchCommentUseLocation,
            saveTeXFile: settings.saveTeXFile,
            title: settings.title,
            version: settings.version,
            hint: settings.hint,
            displayedChurchIDs: Array.from(settings.displayedChurchIDs)
        }
        const path = directory ? `${directory}/exportSettings.json` : "exportSettings.json";

        fs.writeFile(path, JSON.stringify(converted), err => {
            if (err) {
                console.error("Error while writing export settings:")
                console.error(err.message);
                reject(err);
                return;
            }
            resolve();
        });
    })
}
