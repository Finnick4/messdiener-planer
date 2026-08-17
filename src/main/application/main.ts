import {DatabaseConnection} from "../infrastructure/database/database";
import {SQLiteConnection} from "../infrastructure/database/sqlite";
import {dialog} from "electron"

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

let workingDirectoryPath: string | undefined | null = null;
let isAskingForDirectory = false;
let waitingForPath: ((result: string | undefined) => void)[] = [];

export const getWorkingDirectoryPath = (): Promise<string | undefined> => {
    if (isAskingForDirectory) {
        return new Promise<string | undefined>(resolve => {
            waitingForPath.push(resolve);
        });
    }

    return new Promise<string>(resolve => {
        if (workingDirectoryPath != null) {
            resolve(workingDirectoryPath);
            return;
        }
        waitingForPath.push(resolve);
        isAskingForDirectory = true;

        dialog.showOpenDialog({
            title: "Bitte wähle einen Order aus, in welchem das Programm arbeiten darf.",
            properties: ["openDirectory", "createDirectory", ]
        }).then(result => {
            if (result.canceled) {
                workingDirectoryPath = undefined;
                return undefined;
            }
            workingDirectoryPath = result.filePaths[0];
            return workingDirectoryPath;
        }).then(path => {
            workingDirectoryPath = path;
            waitingForPath.forEach(fn => fn(path));
            waitingForPath = [];
            isAskingForDirectory = false;
        });
    });
}