import {Database, verbose} from "sqlite3";
import {Messdiener} from "../../../shared/general";

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

export const getAllMessdiener = async (): Promise<Messdiener[]> => {
    const db = await openDatabase()

    const rows = await runQuery(db, `
        SELECT id, name FROM Messdiener;
    `);

    const messdiener: Messdiener[] = []

    for (const row of rows) {
        messdiener.push({
            identifier: row.id,
            name: row.name
        })
    }
    return messdiener
}

export const createMessdiener = async (name: string): Promise<number> => {
    const db = await openDatabase()

    const rows = await runQuery(db, `
        INSERT INTO messdiener (name) VALUES (?) RETURNING id;
    `, [name]);

    return rows[0]
}

export const removeMessdiener = async (id: number): Promise<void> => {
    const db = await openDatabase()

    await runQuery(db, `
        DELETE FROM messdiener WHERE id = ?;
    `, [id]);
}

export const changeMessdienerName = async (id: number, newName: string): Promise<void> => {
    const db = await openDatabase()

    await runQuery(db, `
        UPDATE messdiener SET name = ? WHERE id = ?;
    `, [newName, id]);
}
