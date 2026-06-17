
import { contextBridge, ipcRenderer } from 'electron';


contextBridge.exposeInMainWorld("electronAPI", {
    getAllMessdiener: () => ipcRenderer.invoke("dialog:getAllMessdiener")
})
