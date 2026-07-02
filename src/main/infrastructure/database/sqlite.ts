import {Database, verbose} from "sqlite3";
import {Church, Family, Messdiener} from "../../../shared/general";
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
            CREATE TABLE IF NOT EXISTS church
            (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                name          TEXT NOT NULL,
                location      TEXT
            )
        `);
        await this.runQuery(`
            CREATE TABLE IF NOT EXISTS church_activity
            (
                messdiener_id   INTEGER NOT NULL,
                church_id       INTEGER NOT NULL,
                FOREIGN KEY (messdiener_id) REFERENCES messdiener (id) ON DELETE CASCADE,
                FOREIGN KEY (church_id) REFERENCES church (id),
                PRIMARY KEY (messdiener_id, church_id)
            )
        `);

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
                FOREIGN KEY (family_association) REFERENCES family (id) ON DELETE RESTRICT
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

    removeMessdiener(id: number): Promise<void> {
        return this.runQuery(`
            DELETE FROM messdiener WHERE id = ?;
        `, [id]);
    }

    changeMessdienerName(id: number, newName: string): Promise<void> {
        return this.runQuery(`
            UPDATE messdiener SET name = ? WHERE id = ?;
        `, [newName, id]);
    }

    async changeMessdienerFamilyAssociation(messdienerID: number, newFamilyID: number): Promise<void> {
        return this.runQuery(`
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

    /*
    Church related queries
     */

    async createChurch(name: string, location?: string): Promise<number> {
        if (location == undefined) {
            return (await this.getRowQuery(`            
                INSERT INTO church (name) VALUES (?) RETURNING id;
            `, [name])).id;
        }
        return (await this.getRowQuery(`
            INSERT INTO church (name, location) VALUES (?, ?) RETURNING id;
        `, [name, location])).id;
    }

    removeChurch(id: number): Promise<void> {
        return this.runQuery(`
            DELETE FROM church WHERE id = ?;
        `, [id]);
    }

    async getAllChurches(): Promise<Church[]> {
        const rows = await this.getRowsQuery(`
            SELECT 
                church.id AS church_id, 
                church.name AS name, 
                COALESCE(church.location, '') AS location
            FROM church;
        `)
        const churches: Church[] = []

        for (const row of rows) {
            churches.push({
                id: row.church_id,
                name: row.name,
                location: row.location == undefined ? undefined : row.location,
            })
        }
        return churches;
    }


    changeChurchName(id: number, newName: string): Promise<void> {
        return this.runQuery(`
            UPDATE church SET name = ? WHERE id = ?;
        `, [newName, id]);
    }

    addMessdienerToChurch(messdienerID: number, churchID: number): Promise<void> {
        return this.runQuery(`
            INSERT INTO church_activity (messdiener_id, church_id) VALUES (?, ?);
        `, [messdienerID, churchID]);
    }
    removeMessdienerFromChurch(messdienerID: number, churchID: number): Promise<void> {
        return this.runQuery(`
            DELETE FROM church_activity WHERE messdiener_id=? AND church_id=?;
        `, [messdienerID, churchID]);
    }

}