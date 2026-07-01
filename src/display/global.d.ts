import {Family, Messdiener} from "../shared/general";
import {IpcRenderer} from "electron";

declare global {
    interface Window {
        electronAPI: {
            getAllMessdiener: () => Promise<Messdiener[]>,
            getAllFamilies: () => Promise<Family[]>,

            createMessdiener: (name: string, family: Family | number) => void,
            deleteMessdiener: (id: number) => void,
            editMessdiener: (messdiener: Messdiener) => void,

            onMessdienerUpdate: (callback: (data: Messdiener[]) => void) => IpcRenderer
            onFamiliesUpdate: (callback: (data: Family[]) => void) => IpcRenderer
        }
    }
}