import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import {
    createMessdienerHandler,
    editMessdienerHandler,
    getAllMessdienerHandler,
    removeMessdienerHandler
} from "./main/handlers/messdiener";
import {createPingDestination, pingManager} from "./main/handlers/ping-manager";

if (started) {
  app.quit();
}

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    pingManager.addDestination(createPingDestination(mainWindow.webContents))

    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
        mainWindow.loadFile(
            path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
        );
    }

    mainWindow.webContents.openDevTools();
};

app.on('ready', () => {
    createWindow()
    ipcMain.handle('dialog:getAllMessdiener', getAllMessdienerHandler);
    ipcMain.on('create-messdiener', createMessdienerHandler);
    ipcMain.on('remove-messdiener', removeMessdienerHandler);
    ipcMain.on('edit-messdiener', editMessdienerHandler);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
