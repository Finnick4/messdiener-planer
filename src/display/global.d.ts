import {Messdiener} from "../shared/general";
import {IpcRenderer} from "electron";

declare global {
    interface Window {
        electronAPI: {
            getAllMessdiener: () => Promise<Messdiener[]>,
            createMessdiener: (name: string) => void,
            deleteMessdiener: (id: number) => void,

            onMessdienerUpdate: (callback: (data: Messdiener[]) => void) => IpcRenderer
        }
    }
}