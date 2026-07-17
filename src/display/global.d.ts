import {
    Church,
    Family,
    Mass,
    Messdiener,
    MessdienerChurchActivityStatus,
    MessdienerMassAllocation
} from "../shared/general";
import {IpcRenderer} from "electron";

declare global {
    interface Window {
        electronAPI: {
            getAllMessdiener: () => Promise<Messdiener[]>;
            getAllFamilies: () => Promise<Family[]>;
            getAllChurches: () => Promise<Church[]>;
            getAllMasses: () => Promise<Mass[]>;

            createMessdiener: (name: string, family: Family | number, churchActivity?: number[]) => void;
            deleteMessdiener: (id: number) => void;
            editMessdiener: (messdiener: Messdiener) => void;
            createChurch: (name: string, location?: string) => void;
            deleteChurch: (id: number) => void;
            editChurch: (church: Church) => void;
            changeMessdienerChurchActivity: (activities: MessdienerChurchActivityStatus[]) => void;
            createMass: (date: number, churchID: number, note?: string) => void;
            deleteMass: (id: number) => void;
            editMass: (mass: Mass) => void;
            changeMessdienerMassAllocation: (activities: MessdienerMassAllocation[]) => void;
            exportPlan: () => void;

            onMessdienerUpdate: (callback: (data: Messdiener[]) => void) => IpcRenderer;
            onFamiliesUpdate: (callback: (data: Family[]) => void) => IpcRenderer;
            onChurchesUpdate: (callback: (data: Church[]) => void) => IpcRenderer;
            onMassesUpdate: (callback: (data: Mass[]) => void) => IpcRenderer;
        }
    }
}