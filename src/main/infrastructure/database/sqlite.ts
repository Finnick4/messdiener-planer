import {Database, verbose} from "sqlite3";
import {Family, Messdiener} from "../../../shared/general";
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
    private runQuery (sqlStatement: string, params: any[] = []): Promise<void> {
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
                internal_name TEXT,
                display_name  TEXT NOT NULL,
                shorthand     TEXT
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
            SELECT 
                messdiener.id AS messdiener_id, 
                name AS first_name, 
                COALESCE(family.internal_name, family.display_name) AS internal_name, 
                family.display_name as display_name, 
                family.id AS fam_id,
                COALESCE(family.shorthand, '') AS short
            FROM Messdiener
                 JOIN family ON family.id = family_association;
        `)
        const messdiener: Messdiener[] = []

        for (const row of rows) {
            messdiener.push({
                identifier: row.messdiener_id,
                firstName: row.first_name,
                lastNameInternal: row.internal_name,
                lastNameDisplay: row.display_name,
                lastNameShorthand: row.short == "" ? undefined : row.short,
                familyID: row.fam_id
            })
        }
        return messdiener
    }

    async createMessdienerInFamily(name: string, familyID: number): Promise<number> {
        return (await this.getRowQuery(`
            INSERT INTO messdiener (name, family_association) VALUES (?, ?) RETURNING id;
        `, [name, String(familyID)])).id
    }
    async createMessdienerAndFamily(name: string, lastName: string, internal = "", shorthand = ""): Promise<number> {
        return this.createFamily(lastName, internal, shorthand).then(famId => this.createMessdienerInFamily(name, famId))
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

    async changeMessdienerFamilyAssociation(messdienerID: number, newFamilyID: number): Promise<void> {
        return await this.runQuery(`
            UPDATE messdiener SET family_association = ? WHERE id = ?;
        `, [newFamilyID, messdienerID]);
    }
    async changeMessdienerFamilyAssociationNewFamily(messdienerID: number, lastName: string, internal?: string, shorthand?: string): Promise<void> {
        return this.createFamily(lastName, internal, shorthand).then(famId => this.changeMessdienerFamilyAssociation(messdienerID, famId))
    }


    /*
    Family related queries
     */


    async createFamily(lastName: string, internal = "", shorthand = ""): Promise<number> {
        if (shorthand == "") {
            if (internal == "") {
                return (await this.getRowQuery(`            
                    INSERT INTO family (display_name) VALUES (?) RETURNING id;
                `, [lastName])).id;
            }
            return (await this.getRowQuery(`            
                INSERT INTO family (internal_name, display_name) VALUES (?, ?) RETURNING id;
            `, [internal, lastName])).id;
        }
        if (internal == "") {
            return (await this.getRowQuery(`            
                INSERT INTO family (display_name, shorthand) VALUES (?, ?) RETURNING id;
            `, [lastName, shorthand])).id;
        }
        return (await this.getRowQuery(`            
            INSERT INTO family (internal_name, display_name, shorthand) VALUES (?, ?, ?) RETURNING id;
        `, [internal, lastName, shorthand])).id;
    }

    async getAllFamilies(): Promise<Family[]> {
        const rows = await this.getRowsQuery(`
            SELECT
                COALESCE(family.internal_name, family.display_name) AS internal_name,
                family.display_name AS display_name,
                family.id AS fam_id,
                COUNT(main.messdiener.id) AS size,
                COALESCE(family.shorthand, '') AS short
            FROM family
                     LEFT JOIN messdiener ON messdiener.family_association = family.id
            GROUP BY family.internal_name, family.display_name, family.id, short;
        `)
        const families: Family[] = []

        for (const row of rows) {
            families.push({
                lastNameInternal: row.internal_name,
                lastNameDisplay: row.display_name,
                id: row.fam_id,
                memberSize: row.size,
                shorthand: row.short == "" ? undefined : row.short
            })
        }
        return families
    }
}