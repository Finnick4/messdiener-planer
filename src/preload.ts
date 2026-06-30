
import { contextBridge, ipcRenderer, IpcRenderer } from 'electron';
import {Family, Messdiener} from "./shared/general";


contextBridge.exposeInMainWorld("electronAPI", {
    getAllMessdiener: (): Promise<Messdiener[]> => ipcRenderer.invoke("dialog:getAllMessdiener"),
    getAllFamilies: (): Promise<Family[]> => ipcRenderer.invoke("dialog:getAllFamilies"),

    createMessdiener: (name: string, family: string | number): void => ipcRenderer.send("create-messdiener", name, family),
    deleteMessdiener: (id: number): void=> ipcRenderer.send("remove-messdiener", id),
    editMessdiener: (messdiener: Messdiener): void=> ipcRenderer.send("edit-messdiener", messdiener),

    onMessdienerUpdate: (callback: (data: Messdiener[]) => void): IpcRenderer => ipcRenderer.on('update-messdiener', (_event, value) => callback(value)),
    onFamiliesUpdate: (callback: (data: Family[]) => void): IpcRenderer => ipcRenderer.on('update-families', (_event, value) => callback(value)),
})
