import {DatabaseConnection} from "../infrastructure/database/database";
import {SQLiteConnection} from "../infrastructure/database/sqlite";
import {app, dialog, Notification} from "electron"

let db: DatabaseConnection | null;
let isConnectingToDB = false;
let waitingForConnection: ((result: DatabaseConnection) => void)[] = [];


export const getDBConnection = async (): Promise<DatabaseConnection> => {
    if (isConnectingToDB) {
        return new Promise<DatabaseConnection>(resolve => waitingForConnection.push(resolve));
    }
    if (db == null) {
        isConnectingToDB = true;
        db = new SQLiteConnection(await getWorkingDirectoryPath());

        await db.initialiseDatabase();
        console.log("Database has been initialised and is ready to be used!");
        waitingForConnection.forEach(fn => fn(db as DatabaseConnection));
        waitingForConnection = [];
        isConnectingToDB = false;
        return db;
    }
    return db;
}

let workingDirectoryPath: string | null = null;
let isAskingForDirectory = false;
let waitingForPath: ((result: string) => void)[] = [];

export const getWorkingDirectoryPath = async (): Promise<string> => {
    if (isAskingForDirectory) {
        return new Promise<string>(resolve => {
            waitingForPath.push(resolve);
        });
    }

    if (workingDirectoryPath != null) {
        return workingDirectoryPath;
    }
    isAskingForDirectory = true;

    const result = await dialog.showOpenDialog({
        title: "Bitte wähle einen Order aus, in welchem das Programm arbeiten darf.",
        properties: ["openDirectory", "createDirectory", ]
    });
    if (result.canceled) {
        console.info("The user refused to select a directory!");
        new Notification({
            title: "Kein Order ausgewählt",
            body: "Da kein Ordner ausgewählt wurde, in welchem der Messdiener Planer arbeiten und somit auch Dateien ablegen darf, wurde dieser geschlossen!",
            icon: "./assets/icon.png",
        }).show()
        app.quit();
        waitingForPath.forEach(fn => fn(""));
        return "";
    }
    const path = result.filePaths[0];
    workingDirectoryPath = path;

    waitingForPath.forEach(fn => fn(path));
    waitingForPath = [];
    isAskingForDirectory = false;
    return path;
}