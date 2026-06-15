import {Database, verbose} from "sqlite3";

const sqlite3 = verbose();

const openDatabase = (): Promise<Database> => {
  return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(`data.db`, (err: Error) => {
          if (err) {
              console.error(`Connection error: ${err.message}`)
              reject(err)
          }
          console.log("Connection established!")
          resolve(db)
      })
  })
}

const runQuery = (db: Database, sqlStatement: string, params: any[] = []): Promise<any> => {
    return new Promise((resolve, reject) => {
        db.all(sqlStatement, params, (err: Error, rows: any[]) => {
            if (err) {
                console.error(`Error while running query: ${err.message}`)
                reject(err)
            }
            resolve(rows)
        })
    })
}

export const initialiseDatabase = async () => {
    console.debug("Initialising the database with all required tables!")
    const db = await openDatabase()

    await runQuery(db, `
        CREATE TABLE IF NOT EXISTS messdiener (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        )
    `);
}

export const testConnection = async () => {
    const db = await openDatabase()

    const version = await runQuery(db, `
        SELECT sqlite_version();
    `);
    console.log(`Connection valid: ${version}`);
}
