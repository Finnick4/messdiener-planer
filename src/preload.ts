
import { contextBridge, ipcRenderer, IpcRenderer } from 'electron';
import {
    Church,
    Family,
    Mass,
    Messdiener,
    MessdienerChurchActivityStatus,
    MessdienerMassAllocation
} from "./shared/general";


contextBridge.exposeInMainWorld("electronAPI", {
    getAllMessdiener: (): Promise<Messdiener[]> => ipcRenderer.invoke("dialog:getAllMessdiener"),
    getAllFamilies: (): Promise<Family[]> => ipcRenderer.invoke("dialog:getAllFamilies"),
    getAllChurches: (): Promise<Family[]> => ipcRenderer.invoke("dialog:getAllChurches"),
    getAllMasses: (): Promise<Mass[]> => ipcRenderer.invoke("dialog:getAllMasses"),

    createMessdiener: (name: string, family: Family | number, churchActivity?: number[]): void => ipcRenderer.send("create-messdiener", name, family, churchActivity),
    deleteMessdiener: (id: number): void=> ipcRenderer.send("remove-messdiener", id),
    editMessdiener: (messdiener: Messdiener): void=> ipcRenderer.send("edit-messdiener", messdiener),
    createChurch: (name: string, location?: string): void => ipcRenderer.send("create-church", name, location),
    deleteChurch: (id: number): void=> ipcRenderer.send("remove-church", id),
    editChurch: (church: Church): void=> ipcRenderer.send("edit-church", church),
    changeMessdienerChurchActivity: (activities: MessdienerChurchActivityStatus[]): void=> ipcRenderer.send("change-messdiener-church-activity", activities),
    createMass: (date: number, churchID: number, note?: string): void => ipcRenderer.send("create-mass", date, churchID, note),
    deleteMass: (id: number): void=> ipcRenderer.send("remove-mass", id),
    editMass: (mass: Mass): void=> ipcRenderer.send("edit-mass", mass),
    changeMessdienerMassAllocation: (activities: MessdienerMassAllocation[]): void=> ipcRenderer.send("change-messdiener-mass-allocation", activities),
    exportPlan: (): void => ipcRenderer.send("export-plan"),

    onMessdienerUpdate: (callback: (data: Messdiener[]) => void): IpcRenderer => ipcRenderer.on('update-messdiener', (_event, value) => callback(value)),
    onFamiliesUpdate: (callback: (data: Family[]) => void): IpcRenderer => ipcRenderer.on('update-families', (_event, value) => callback(value)),
    onChurchesUpdate: (callback: (data: Church[]) => void): IpcRenderer => ipcRenderer.on('update-church', (_event, value) => callback(value)),
    onMassesUpdate: (callback: (data: Mass[]) => void): IpcRenderer => ipcRenderer.on('update-mass', (_event, value) => callback(value)),
})
