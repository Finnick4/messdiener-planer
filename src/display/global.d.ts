import {Church, Family, Messdiener, MessdienerChurchActivityStatus} from "../shared/general";
import {IpcRenderer} from "electron";

declare global {
    interface Window {
        electronAPI: {
            getAllMessdiener: () => Promise<Messdiener[]>;
            getAllFamilies: () => Promise<Family[]>;
            getAllChurches: () => Promise<Church[]>;

            createMessdiener: (name: string, family: Family | number, churchActivity?: number[]) => void;
            deleteMessdiener: (id: number) => void;
            editMessdiener: (messdiener: Messdiener) => void;
            createChurch: (name: string, location?: string) => void;
            deleteChurch: (id: number) => void;
            editChurch: (church: Church) => void;
            changeMessdienerChurchActivity: (activities: MessdienerChurchActivityStatus[]) => void;

            onMessdienerUpdate: (callback: (data: Messdiener[]) => void) => IpcRenderer;
            onFamiliesUpdate: (callback: (data: Family[]) => void) => IpcRenderer;
            onChurchesUpdate: (callback: (data: Church[]) => void) => IpcRenderer;
        }
    }
}