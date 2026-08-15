import {DatabaseConnection} from "../infrastructure/database/database";
import {SQLiteConnection} from "../infrastructure/database/sqlite";

let db: DatabaseConnection = new SQLiteConnection()
db.initialiseDatabase().then(() => {
    console.log("Database ready!")
})

export const getDBConnection = async (): Promise<DatabaseConnection> => {
    if (db == null) {
        db = new SQLiteConnection()
        db.initialiseDatabase().then(() => {
            console.log("Database ready!")
            return db
        })
    }
    return db;
}

