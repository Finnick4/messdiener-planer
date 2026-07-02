import {Church, Family, Messdiener} from "../shared/general";
import {ipcRenderer, IpcRenderer} from "electron";

declare global {
    interface Window {
        electronAPI: {
            getAllMessdiener: () => Promise<Messdiener[]>;
            getAllFamilies: () => Promise<Family[]>;
            getAllChurches: () => Promise<Church[]>;

            createMessdiener: (name: string, family: Family | number) => void;
            deleteMessdiener: (id: number) => void;
            editMessdiener: (messdiener: Messdiener) => void;
            createChurch: (name: string, location?: string) => void;
            deleteChurch: (id: number) => void;
            editChurch: (church: Church) =>  void;

            onMessdienerUpdate: (callback: (data: Messdiener[]) => void) => IpcRenderer;
            onFamiliesUpdate: (callback: (data: Family[]) => void) => IpcRenderer;
            onChurchesUpdate: (callback: (data: Church[]) => void) => IpcRenderer;
        }
    }
}