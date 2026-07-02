
import { contextBridge, ipcRenderer, IpcRenderer } from 'electron';
import {Church, Family, Messdiener} from "./shared/general";


contextBridge.exposeInMainWorld("electronAPI", {
    getAllMessdiener: (): Promise<Messdiener[]> => ipcRenderer.invoke("dialog:getAllMessdiener"),
    getAllFamilies: (): Promise<Family[]> => ipcRenderer.invoke("dialog:getAllFamilies"),
    getAllChurches: (): Promise<Family[]> => ipcRenderer.invoke("dialog:getAllChurches"),

    createMessdiener: (name: string, family: Family | number): void => ipcRenderer.send("create-messdiener", name, family),
    deleteMessdiener: (id: number): void=> ipcRenderer.send("remove-messdiener", id),
    editMessdiener: (messdiener: Messdiener): void=> ipcRenderer.send("edit-messdiener", messdiener),
    createChurch: (name: string, location?: string): void => ipcRenderer.send("create-church", name, location),
    deleteChurch: (id: number): void=> ipcRenderer.send("remove-church", id),
    editChurch: (church: Church): void=> ipcRenderer.send("edit-church", church),

    onMessdienerUpdate: (callback: (data: Messdiener[]) => void): IpcRenderer => ipcRenderer.on('update-messdiener', (_event, value) => callback(value)),
    onFamiliesUpdate: (callback: (data: Family[]) => void): IpcRenderer => ipcRenderer.on('update-families', (_event, value) => callback(value)),
    onChurchesUpdate: (callback: (data: Church[]) => void): IpcRenderer => ipcRenderer.on('update-churches', (_event, value) => callback(value)),
})
