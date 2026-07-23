import {app, BrowserWindow, ipcMain} from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import {
    changeMessdienerChurchActivityHandler,
    createMessdienerHandler,
    editMessdienerHandler,
    getAllMessdienerHandler,
    removeMessdienerHandler
} from "./main/handlers/messdiener";
import {createPingDestination, pingManager} from "./main/handlers/ping-manager";
import {getAllFamiliesHandler} from "./main/handlers/families";
import {
    createChurchHandler,
    editChurchHandler,
    getAllChurchesHandler,
    removeChurchHandler
} from "./main/handlers/churches";
import {
    changeMessdienerMassAllocationHandler,
    createMassHandler,
    editMassHandler,
    getAllMassesHandler,
    removeMassHandler
} from "./main/handlers/masses";
import {exportPlanHandler, recentExportSettingsHandler} from "./main/handlers/plans";
import {
    createAbsenceHandler,
    editAbsenceAffectionsHandler,
    editAbsencesHandler,
    getAllAbsencesHandler
} from "./main/handlers/absences";

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
    ipcMain.handle('dialog:getAllFamilies', getAllFamiliesHandler);
    ipcMain.handle('dialog:getAllChurches', getAllChurchesHandler);
    ipcMain.handle('dialog:getAllMasses', getAllMassesHandler);
    ipcMain.handle('dialog:getAllAbsences', getAllAbsencesHandler);
    ipcMain.handle('dialog:getRecentExportSettings', recentExportSettingsHandler);

    ipcMain.on('create-messdiener', createMessdienerHandler);
    ipcMain.on('remove-messdiener', removeMessdienerHandler);
    ipcMain.on('edit-messdiener', editMessdienerHandler);
    ipcMain.on('create-church', createChurchHandler);
    ipcMain.on('remove-church', removeChurchHandler);
    ipcMain.on('edit-church', editChurchHandler);
    ipcMain.on('change-messdiener-church-activity', changeMessdienerChurchActivityHandler);
    ipcMain.on('create-mass', createMassHandler);
    ipcMain.on('remove-mass', removeMassHandler);
    ipcMain.on('edit-mass', editMassHandler);
    ipcMain.on('change-messdiener-mass-allocation', changeMessdienerMassAllocationHandler);
    ipcMain.on('export-plan', exportPlanHandler);
    ipcMain.on('create-absence', createAbsenceHandler);
    ipcMain.on('edit-absence', editAbsencesHandler);
    ipcMain.on('change-absence-messdiener-affection', editAbsenceAffectionsHandler);
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
