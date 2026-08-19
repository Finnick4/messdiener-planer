import {Database, verbose} from "sqlite3";
import {Absence, Church, Family, Mass, Messdiener} from "../../../shared/general";
import {DatabaseConnection} from "./database";

const sqlite3 = verbose();

export class SQLiteConnection implements DatabaseConnection {
    private db: Database;

    constructor(directoryPath: string | undefined) {
        const path = directoryPath ? `${directoryPath}/data.db` : "data.db";
        this.db = new sqlite3.Database(path, (err: Error | null) => {
            if (err) {
                console.error(`Connection error: ${err?.message}`);
                throw new Error(`Error while establishing connection: ${err?.message}`);
            }
            console.log("Connection to database established!");
        });
    }
    private getRowsQuery (sqlStatement: string, params: any[] = []): Promise<any[]> {
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
    private getRowQuery (sqlStatement: string, params: any[] = ["test"]): Promise<any> {
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
        console.log("Starting to initialise database!");

        await Promise.all([
            this.runQuery(`
                CREATE TABLE IF NOT EXISTS church
                (
                    id            INTEGER PRIMARY KEY AUTOINCREMENT,
                    name          TEXT NOT NULL,
                    location      TEXT
                )
            `),
            this.runQuery(`
                CREATE TABLE IF NOT EXISTS family
                (
                    id            INTEGER PRIMARY KEY AUTOINCREMENT,
                    internal_name TEXT,
                    display_name  TEXT NOT NULL,
                    shorthand     TEXT
                )
            `),
            this.runQuery(`
                CREATE TABLE IF NOT EXISTS absence
                (
                    id          INTEGER PRIMARY KEY AUTOINCREMENT,
                    start_date  INTEGER NOT NULL,
                    end_date    INTEGER NOT NULL
                )
            `),
        ]);

        await Promise.all([
            this.runQuery(`
                CREATE TABLE IF NOT EXISTS mass
                (
                    id            INTEGER PRIMARY KEY AUTOINCREMENT,
                    date          INTEGER NOT NULL,
                    church_id     INTEGER NOT NULL,
                    note          TEXT,
                    FOREIGN KEY (church_id) REFERENCES church (id) ON DELETE CASCADE
                )
            `),
            this.runQuery(`
                CREATE TABLE IF NOT EXISTS messdiener
                (
                    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
                    name               TEXT    NOT NULL,
                    family_association INTEGER NOT NULL,
                    FOREIGN KEY (family_association) REFERENCES family (id) ON DELETE RESTRICT
                )
            `)
        ]);

        await Promise.all([
            this.runQuery(`
                CREATE TABLE IF NOT EXISTS church_activity
                (
                    messdiener_id   INTEGER NOT NULL,
                    church_id       INTEGER NOT NULL,
                    FOREIGN KEY (messdiener_id) REFERENCES messdiener (id) ON DELETE CASCADE,
                    FOREIGN KEY (church_id) REFERENCES church (id) ON DELETE CASCADE,
                    PRIMARY KEY (messdiener_id, church_id)
                )
            `),
            this.runQuery(`
                CREATE TABLE IF NOT EXISTS mass_messdiener_allocation
                (
                    messdiener_id   INTEGER NOT NULL,
                    mass_id       INTEGER NOT NULL,
                    FOREIGN KEY (messdiener_id) REFERENCES messdiener (id) ON DELETE CASCADE,
                    FOREIGN KEY (mass_id) REFERENCES mass (id) ON DELETE CASCADE,
                    PRIMARY KEY (messdiener_id, mass_id)
                )
            `),
            this.runQuery(`
                CREATE TABLE IF NOT EXISTS absence_affections
                (
                    messdiener_id   INTEGER NOT NULL,
                    absence_id      INTEGER NOT NULL,
                    FOREIGN KEY (messdiener_id) REFERENCES messdiener (id) ON DELETE CASCADE,
                    FOREIGN KEY (absence_id) REFERENCES absence (id) ON DELETE CASCADE,
                    PRIMARY KEY (messdiener_id, absence_id)
                )
            `)
        ]);
        console.log("Database initialised!");
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
                 JOIN family ON family.id = family_association
            ORDER BY messdiener_id ASC;
        `);
        const messdiener: Messdiener[] = [];

        const names = new Set<string>();
        const duplicateNames = new Set<string>();

        for (const row of rows) {
            const firstName = String(row.first_name);
            if (names.has(firstName)) {
                duplicateNames.add(firstName)
            }
            names.add(firstName);
            messdiener.push({
                identifier: row.messdiener_id,
                firstName: firstName,
                lastNameInternal: row.internal_name,
                lastNameDisplay: row.display_name,
                displayShorthand: false,
                lastNameShorthand: row.short == "" ? undefined : row.short,
                familyID: row.fam_id,
                churchActivity: new Set<number>(),
                absences: []
            })
        }

        if (duplicateNames.size > 0) {
            messdiener.forEach((m, i) => {
                if (duplicateNames.has(m.firstName)) {
                    messdiener[i].displayShorthand = true;
                }
            });
        }

        await Promise.all([
            this.getRowsQuery(`
                SELECT
                    messdiener.id AS messdiener_id,
                    church_activity.church_id AS church_id
                FROM messdiener
                         JOIN church_activity ON messdiener.id = church_activity.messdiener_id
                ORDER BY messdiener.id ASC;
            `).then(rows => {
                for (const row of rows) {
                    const index = messdiener.findIndex(m => m.identifier == row.messdiener_id);
                    if (index >= 0) {
                        messdiener[index].churchActivity.add(row.church_id);
                    }
                }
            }),

            this.getRowsQuery(`
                SELECT
                    messdiener.id AS messdiener_id,
                    absence.id AS absence_id,
                    absence.start_date AS start,
                    absence.end_date AS end
                FROM messdiener
                    JOIN absence_affections ON messdiener.id = absence_affections.messdiener_id
                    JOIN absence ON absence_affections.absence_id = absence.id
                ORDER BY messdiener.id ASC;
            `).then(rows => {
                for (const row of rows) {
                    const index = messdiener.findIndex(m => m.identifier == row.messdiener_id);
                    if (index >= 0) {
                        messdiener[index].absences.push({
                            id: row.absence_id,
                            startDate: row.start,
                            endDate: row.end
                        });
                    }
                }
            }),


        ])

        return messdiener;
    }

    async createMessdienerInFamily(name: string, familyID: number): Promise<number> {
        return (await this.getRowQuery(`
            INSERT INTO messdiener (name, family_association) VALUES (?, ?) RETURNING id;
        `, [name, familyID])).id
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

    changeChurchLocation(id: number, newLocation: string): Promise<void> {
        return this.runQuery(`
            UPDATE church SET location = ? WHERE id = ?;
        `, [newLocation, id]);
    }

    addMessdienerToChurch(messdienerID: number, churchID: number): Promise<void> {
        return this.runQuery(`
            INSERT OR IGNORE INTO church_activity (messdiener_id, church_id) VALUES (?, ?);
        `, [messdienerID, churchID]);
    }
    removeMessdienerFromChurch(messdienerID: number, churchID: number): Promise<void> {
        return this.runQuery(`
            DELETE FROM church_activity WHERE messdiener_id=? AND church_id=?;
        `, [messdienerID, churchID]);
    }

    /*
    Mass related queries
     */

    async createMass(date: number, churchID: number, note?: string): Promise<number> {
        if (note == undefined) {
            return (await this.getRowQuery(`            
                INSERT INTO mass (date, church_id) VALUES (?, ?) RETURNING id;
            `, [date, churchID])).id;
        }
        return (await this.getRowQuery(`
            INSERT INTO mass (date, church_id, note) VALUES (?, ?, ?) RETURNING id;
        `, [date, churchID, note])).id;
    }

    async getAllMasses(): Promise<Mass[]> {
        let rows = await this.getRowsQuery(`
            SELECT 
                mass.id AS mass_id, 
                mass.date AS date,
                mass.church_id AS church_id,
                COALESCE(mass.note, '') AS note
            FROM mass;
        `)
        const masses: Mass[] = []

        for (const row of rows) {
            masses.push({
                id: row.mass_id,
                churchID: row.church_id,
                date: row.date,
                note: row.note == "" ? undefined : row.note,
                allocatedMessdiener: new Set<number>(),
            })
        }

        rows = await this.getRowsQuery(`
            SELECT
                mass_messdiener_allocation.messdiener_id AS messdiener_id,
                mass_messdiener_allocation.mass_id AS mass_id
            FROM mass_messdiener_allocation
            ORDER BY messdiener_id ASC;
        `)
        for (const row of rows) {
            const index = masses.findIndex(m => m.id == row.mass_id);
            if (index >= 0) {
                masses[index].allocatedMessdiener.add(row.messdiener_id);
            }
        }

        return masses;
    }

    removeMass(id: number): Promise<void> {
        return this.runQuery(`
            DELETE FROM mass WHERE id = ?;
        `, [id]);
    }

    changeMassNote(id: number, note?: string): Promise<void> {
        if (note == undefined) {
            return this.runQuery(`
                UPDATE mass SET note = NULL WHERE id = ?;
            `, [id]);
        }
        return this.runQuery(`
            UPDATE mass SET note = ? WHERE id = ?;
        `, [note, id]);
    }

    changeMassDate(id: number, date: number): Promise<void> {
        return this.runQuery(`
            UPDATE mass SET date = ? WHERE id = ?;
        `, [date, id]);
    }

    addMessdienerToMass(messdienerID: number, massID: number): Promise<void> {
        return this.runQuery(`
            INSERT OR IGNORE INTO mass_messdiener_allocation (messdiener_id, mass_id) VALUES (?, ?);
        `, [messdienerID, massID]);
    }

    removeMessdienerFromMass(messdienerID: number, massID: number): Promise<void> {
        return this.runQuery(`
            DELETE FROM mass_messdiener_allocation WHERE messdiener_id=? AND mass_id=?;
        `, [messdienerID, massID]);
    }

    /*
    Absence related queries
     */

    async createAbsence(startDate: number, endDate: number, messdienerAffections: number[]): Promise<number> {
        const id: number = (await this.getRowQuery(`
            INSERT INTO absence (start_date, end_date) VALUES (?, ?) RETURNING id;
        `, [startDate, endDate])).id;

        return Promise.all(messdienerAffections.map(mID => this.addMessdienerToAbsence(id, mID)))
            .then(() => id);
    }

    async getAllAbsences(): Promise<Absence[]> {
        let rows = await this.getRowsQuery(`
            SELECT id, start_date, end_date
            FROM absence
            ORDER BY id ASC;
        `);
        const absences: Absence[] = [];

        for (const row of rows) {
            absences.push({
                id: row.id,
                startDate: row.start_date,
                endDate: row.end_date,
                affectedMessdiener: new Set<number>()
            })
        }
        rows = await this.getRowsQuery(`
            SELECT
                messdiener_id,
                absence_id
            FROM absence_affections
        `)
        for (const row of rows) {
            const index = absences.findIndex(a => a.id == row.absence_id);
            if (index >= 0) {
                absences[index].affectedMessdiener.add(row.messdiener_id);
            }
        }
        return absences;
    }

    addMessdienerToAbsence(absenceID: number, messdienerID: number): Promise<void> {
        return Promise.all([
            this.runQuery(`
                INSERT OR IGNORE INTO absence_affections (messdiener_id, absence_id) VALUES (?, ?);
            `, [messdienerID, absenceID]),
            this.runQuery(`
                DELETE FROM mass_messdiener_allocation
                    WHERE messdiener_id = ? 
                        AND EXISTS(
                            SELECT mass.id AS id_of_mass FROM mass
                                JOIN absence ON absence.id = ?
                            WHERE id_of_mass = mass_messdiener_allocation.mass_id
                                AND mass.date >= absence.start_date
                                AND mass.date <= absence.end_date
                        );
            `, [messdienerID, absenceID]),
        ]).then();
    }
    removeMessdienerFromAbsence(absenceID: number, messdienerID: number): Promise<void> {
        return this.runQuery(`
            DELETE FROM absence_affections WHERE messdiener_id = ? AND absence_id = ?;
        `, [messdienerID, absenceID]);
    }

    changeAbsenceStartDate(id: number, date: number): Promise<void> {
        return this.runQuery(`
            UPDATE absence SET start_date = ? WHERE id = ?;
        `, [date, id]);
    }
    changeAbsenceEndDate(id: number, date: number): Promise<void> {
        return this.runQuery(`
            UPDATE absence SET end_date = ? WHERE id = ?;
        `, [date, id]);
    }

    deleteAbsence(id: number): Promise<void> {
        return this.runQuery(`
            DELETE FROM absence WHERE id = ?;
        `, [id]);
    }

}