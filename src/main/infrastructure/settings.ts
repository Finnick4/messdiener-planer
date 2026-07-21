import {ExportSettings} from "../../shared/general";
import * as fs from "node:fs";

type ExportSettingsStorage = {
    title: string
    version: string
    displayedChurchIDs: number[]
    mainChurchID: number
    otherChurchComment: boolean
    otherChurchCommentUseLocation: boolean
}

const safeParseJSON = <T>(str: string): T | undefined => {
    try {
        const obj: T = JSON.parse(str);
        return obj;
    } catch {
        return undefined;
    }
}

export const readExportSettings = (): Promise<ExportSettings | undefined> => {
    return new Promise<ExportSettings | undefined>((resolve, reject) => {
        fs.readFile("exportSettings.json", (err, result) => {
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
                title: settings.title,
                version: settings.version,
                displayedChurchIDs: new Set<number>(settings.displayedChurchIDs)
            };
            resolve(converted);
        })
    })
}

export const writeExportSettings = (settings: ExportSettings): Promise<void> => {
    return new Promise<void>((resolve, reject) => {

        const converted: ExportSettingsStorage = {
            mainChurchID: settings.mainChurchID,
            otherChurchComment: settings.otherChurchComment,
            otherChurchCommentUseLocation: settings.otherChurchCommentUseLocation,
            title: settings.title,
            version: settings.version,
            displayedChurchIDs: Array.from(settings.displayedChurchIDs)
        }
        fs.writeFile("exportSettings.json", JSON.stringify(converted), err => {
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
