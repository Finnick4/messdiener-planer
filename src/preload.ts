
import { contextBridge, ipcRenderer } from 'electron';
import {Messdiener} from "./shared/general";


contextBridge.exposeInMainWorld("electronAPI", {
    getAllMessdiener: (): Promise<Messdiener[]> => ipcRenderer.invoke("dialog:getAllMessdiener"),
    createMessdiener: (name: string): void => ipcRenderer.send("create-messdiener", name),
    deleteMessdiener: (id: number): void=> ipcRenderer.send("remove-messdiener", id)
})
