import {DatabaseConnection} from "../infrastructure/database/database";
import {SQLiteConnection} from "../infrastructure/database/sqlite";

let db: DatabaseConnection = new SQLiteConnection()
db.initialiseDatabase().then(() => {
    console.log("Database ready!")
})

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const getDBConnection = async (): Promise<DatabaseConnection> => {
    if (db == null) {
        db = new SQLiteConnection()
        db.initialiseDatabase().then(() => {
            console.log("Database ready!")
            return db
        })
    } else {
        return db;
    }
}

