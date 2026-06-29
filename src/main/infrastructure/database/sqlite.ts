import {Database, verbose} from "sqlite3";
import {Messdiener} from "../../../shared/general";
import {DatabaseConnection} from "./database";

const sqlite3 = verbose();

export class SQLiteConnection implements DatabaseConnection {
    private db: Database;

    constructor() {
        this.db = new sqlite3.Database(`data.db`, (err: Error | null) => {
            if (err) {
                console.error(`Connection error: ${err?.message}`)
                throw new Error(`Error while establishing connection: ${err?.message}`)
            }
            console.log("Connection to database established!")
        })
    }
    private getRowsQuery (sqlStatement: string, params: string[] = []): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.db.all(sqlStatement, params, (err: Error, rows: any[]) => {
                if (err) {
                    console.error(`[SQLITE] (getRowsQuery) Statement was:   ${sqlStatement}!`);
                    console.error(`[SQLITE] (getRowsQuery) Parameters were: ${params}!`);
                    console.error(`[SQLITE] (getRowsQuery) Error: ${err.message}`)
                    reject(err)
                    return;
                }
                resolve(rows)
            })
        })
    }
    private getRowQuery (sqlStatement: string, params: string[] = ["test"]): Promise<any> {
        return new Promise((resolve, reject) => {
            this.db.get(sqlStatement, params, (err: Error, row: any) => {
                if (err) {
                    console.error(`[SQLITE] (getRowQuery) Statement was:   ${sqlStatement}!`);
                    console.error(`[SQLITE] (getRowQuery) Parameters were: ${params}!`);
                    console.error(`[SQLITE] (getRowQuery) Error: ${err.message}`)
                    reject(err)
                    return;
                }
                resolve(row)
            })
        })
    }
    private runQuery (sqlStatement: string, params: string[] = []): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.run(sqlStatement, params, (err: Error) => {
                if (err) {
                    console.error(`[SQLITE] (runQuery) Statement was:   ${sqlStatement}!`);
                    console.error(`[SQLITE] (runQuery) Parameters were: ${params}!`);
                    console.error(`[SQLITE] (runQuery) Error: ${err.message}`)
                    reject(err)
                    return;
                }
                resolve()
            })
        })
    }


    async initialiseDatabase(): Promise<void> {
        await this.runQuery(`
            CREATE TABLE IF NOT EXISTS family
            (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                internal_name TEXT NOT NULL,
                display_name  TEXT
            )
        `);

        await this.runQuery(`
            CREATE TABLE IF NOT EXISTS messdiener
            (
                id                 INTEGER PRIMARY KEY AUTOINCREMENT,
                name               TEXT    NOT NULL,
                family_association INTEGER NOT NULL,
                FOREIGN KEY (family_association) REFERENCES family (id)
            )
        `);
    }

    async getAllMessdiener(): Promise<Messdiener[]> {
        const rows = await this.getRowsQuery(`
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

    async createMessdienerInFamily(name: string, familyID: number): Promise<number> {
        return (await this.getRowQuery(`
            INSERT INTO messdiener (name, family_association) VALUES (?, ?) RETURNING id;
        `, [name, String(familyID)])).id
    }
    async createMessdienerAndFamily(name: string, lastName: string): Promise<number> {
        return (await this.getRowQuery(`            
            INSERT INTO family (internal_name, display_name) VALUES (?, ?) RETURNING id;
        `, [lastName, lastName]).then(row => {
            return this.createMessdienerInFamily(name, row.id);
        }))
    }

    async removeMessdiener(id: number): Promise<void> {
        return await this.runQuery(`
            DELETE FROM messdiener WHERE id = ?;
        `, [id.toString()]);
    }

    async changeMessdienerName(id: number, newName: string): Promise<void> {
        return await this.runQuery(`
            UPDATE messdiener SET name = ? WHERE id = ?;
        `, [newName, id.toString()]);
    }
}