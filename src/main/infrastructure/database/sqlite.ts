import {Database, verbose} from "sqlite3";
import {Messdiener} from "../../../shared/general";
import {DatabaseConnection} from "./database";

const sqlite3 = verbose();

export class SQLiteConnection implements DatabaseConnection {
    private db: Database;

    constructor() {
        this.db = new sqlite3.Database(`data.db`, (err: Error) => {
            if (err) {
                console.error(`Connection error: ${err.message}`)
                throw new Error(`Error while establishing connection: ${err.message}`)
            }
            console.log("Connection to database established!")
        })
    }
    private runQuery (sqlStatement: string, params: any[] = []): Promise<any> {
        return new Promise((resolve, reject) => {
            this.db.all(sqlStatement, params, (err: Error, rows: any[]) => {
                if (err) {
                    console.error(`Error while running query: ${err.message}`)
                    reject(err)
                }
                resolve(rows)
            })
        })
    }

    async initialiseDatabase(): Promise<void> {
        await this.runQuery(`
            CREATE TABLE IF NOT EXISTS messdiener (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL
            )
        `);
    }

    async getAllMessdiener(): Promise<Messdiener[]> {
        const rows = await this.runQuery(`
            SELECT id, name FROM Messdiener;
        `)
        const messdiener: Messdiener[] = []

        for (const row of rows) {
            messdiener.push({
                identifier: row.id,
                name: row.name
            })
        }
        return messdiener
    }

    async createMessdiener(name: string): Promise<number> {
        return (await this.runQuery(`
            INSERT INTO messdiener (name) VALUES (?) RETURNING id;
        `, [name]))[0]
    }

    async removeMessdiener(id: number): Promise<void> {
        return await this.runQuery(`
            DELETE FROM messdiener WHERE id = ?;
        `, [id]);
    }

    async changeMessdienerName(id: number, newName: string): Promise<void> {
        return await this.runQuery(`
            UPDATE messdiener SET name = ? WHERE id = ?;
        `, [newName, id]);
    }
}