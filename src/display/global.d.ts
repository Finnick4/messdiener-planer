import {
    Absence,
    Church,
    ExportSettings,
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
            getAllAbsences: () => Promise<Absence[]>;
            getRecentExportSettings: () => Promise<ExportSettings | undefined>,

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
            exportPlan: (settings: ExportSettings) => void;
            createAbsence: (start: number, end: number, affectedMessdiener: number[]) => void;
            editAbsence: (absence: Absence) => void;
            changeAbsenceAffection: (absenceID: number, addedMessdiener: number[], removedMessdiener: number[]) => void;
            deleteAbsence: (id: number) => void;

            onMessdienerUpdate: (callback: (data: Messdiener[]) => void) => IpcRenderer;
            onFamiliesUpdate: (callback: (data: Family[]) => void) => IpcRenderer;
            onChurchesUpdate: (callback: (data: Church[]) => void) => IpcRenderer;
            onMassesUpdate: (callback: (data: Mass[]) => void) => IpcRenderer;
            onAbsencesUpdate: (callback: (data: Absence[]) => void) => IpcRenderer;
        }
    }
}