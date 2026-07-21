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

export const readExportSettings = (): Promise<ExportSettings> => {
    return new Promise<ExportSettings>((resolve, reject) => {
        fs.readFile("exportSettings.json", (err, result) => {
            if (err) {
                console.error("Error while reading export settings:")
                console.error(err.message);
                reject(err);
                return;
            }
            const settings: ExportSettingsStorage = JSON.parse(result.toString());
            const converted: ExportSettings = {
                mainChurchID: settings.mainChurchID,
                otherChurchComment: settings.otherChurchComment,
                otherChurchCommentUseLocation: settings.otherChurchCommentUseLocation,
                title: settings.title,
                version: settings.version,
                displayedChurchIDs: new Set<number>(settings.displayedChurchIDs)
            };
            console.log(converted)
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
